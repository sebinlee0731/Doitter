package com.example.doit.service.comment;

import com.example.doit.domain.comment.Comment;
import com.example.doit.domain.project.Project;
import com.example.doit.domain.project.ProjectRole;
import com.example.doit.domain.task.Task;
import com.example.doit.domain.user.User;
import com.example.doit.dto.comment.CommentCreateDTO;
import com.example.doit.dto.comment.CommentResponseDTO;
import com.example.doit.dto.comment.CommentUpdateDTO;
import com.example.doit.repository.comment.CommentRepository;
import com.example.doit.repository.project.ProjectMemberRepository;
import com.example.doit.repository.task.TaskRepository;
import com.example.doit.repository.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class) // 1. Mockito 사용
class CommentServiceTest {

    @Mock private CommentRepository commentRepository;
    @Mock private TaskRepository taskRepository;
    @Mock private UserRepository userRepository;
    @Mock private ProjectMemberRepository projectMemberRepository;

    @InjectMocks // 2. Mock들을 Service에 주입
    private CommentService commentService;

    // --- 테스트용 공통 더미 데이터 ---
    private User mockAuthor; // "작성자" (10L)
    private User mockAdmin;  // "관리자" (1L)
    private Project mockProject;
    private Task mockTask;
    private Comment mockComment;
    private final Long authorId = 10L;
    private final Long adminId = 1L;
    private final Long taskId = 100L;
    private final Long commentId = 1000L;
    private final Long projectId = 1L;

    @BeforeEach
    void setUp() {
        // 공통 유저, 프로젝트, 태스크, 코멘트 설정
        mockAuthor = User.builder().name("Author").build();
        ReflectionTestUtils.setField(mockAuthor, "id", authorId);

        mockAdmin = User.builder().name("Admin").build();
        ReflectionTestUtils.setField(mockAdmin, "id", adminId);

        mockProject = Project.builder().build();
        ReflectionTestUtils.setField(mockProject, "id", projectId);

        mockTask = Task.builder().project(mockProject).build();
        ReflectionTestUtils.setField(mockTask, "id", taskId);

        mockComment = Comment.builder()
                .author(mockAuthor)
                .task(mockTask)
                .body("Original Body")
                .build();
        ReflectionTestUtils.setField(mockComment, "id", commentId);
        // ⭐️ 'isEdited' 검증을 위해 생성/수정 시간 설정
        LocalDateTime timeStamp = LocalDateTime.now().minusDays(1);

        ReflectionTestUtils.setField(mockComment, "createdAt", timeStamp);
        ReflectionTestUtils.setField(mockComment, "updatedAt", timeStamp);
    }

    @Test
    @DisplayName("create: 코멘트를 성공적으로 생성한다")
    void testCreateSuccess() {
        // Given (준비)
        CommentCreateDTO dto = CommentCreateDTO.builder().body("New Comment").build();

        // 1. [Mocking] 'getReferenceById'는 'mockAuthor'를 반환
        given(userRepository.getReferenceById(authorId)).willReturn(mockAuthor);

        // 2. [Mocking] 'findById'는 'mockTask'를 반환
        given(taskRepository.findById(taskId)).willReturn(Optional.of(mockTask));

        // 3. [Mocking] 'save'가 호출되면, ID 1001L을 가진 객체를 반환
        given(commentRepository.save(any(Comment.class))).willAnswer(invocation -> {
            Comment c = invocation.getArgument(0);
            ReflectionTestUtils.setField(c, "id", 1001L);
            return c;
        });

        // When (실행)
        Long newCommentId = commentService.create(authorId, taskId, dto);

        // Then (검증)
        assertThat(newCommentId).isEqualTo(1001L);
        verify(commentRepository).save(any(Comment.class));
    }

    @Test
    @DisplayName("create: 태스크가 존재하지 않으면 404 예외를 던진다")
    void testCreateFailTaskNotFound() {
        // Given
        CommentCreateDTO dto = CommentCreateDTO.builder().body("New Comment").build();

        given(userRepository.getReferenceById(authorId)).willReturn(mockAuthor);
        // 1. ⭐️ [Mocking] 'findById'가 빈 Optional을 반환
        given(taskRepository.findById(taskId)).willReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> commentService.create(authorId, taskId, dto))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    @DisplayName("readList: 코멘트 목록을 DTO로 변환하고, 'isEdited'가 false인지 확인한다")
    void testReadListSuccessNotEdited() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        // 1. [Mocking] 'findByTaskId'는 'mockComment'가 담긴 Page를 반환
        Page<Comment> commentPage = new PageImpl<>(List.of(mockComment), pageable, 1);
        given(commentRepository.findByTaskId(taskId, pageable)).willReturn(commentPage);

        // When
        Page<CommentResponseDTO> resultPage = commentService.readList(taskId, pageable);

        // Then
        assertThat(resultPage.getTotalElements()).isEqualTo(1);
        CommentResponseDTO dto = resultPage.getContent().get(0);

        assertThat(dto.getCommentId()).isEqualTo(commentId);
        assertThat(dto.getAuthorName()).isEqualTo("Author");
        // 2. ⭐️ [검증] createdAt과 updatedAt이 같으므로 'isEdited'는 false
        assertThat(dto.isEdited()).isFalse();
    }

    @Test
    @DisplayName("readList: 수정된 코멘트의 'isEdited'가 true인지 확인한다")
    void testReadListSuccessIsEdited() {
        // Given
        // 1. [수정] 'updatedAt'을 'createdAt'과 다르게 설정
        ReflectionTestUtils.setField(mockComment, "updatedAt", LocalDateTime.now());

        Pageable pageable = PageRequest.of(0, 10);
        Page<Comment> commentPage = new PageImpl<>(List.of(mockComment), pageable, 1);
        given(commentRepository.findByTaskId(taskId, pageable)).willReturn(commentPage);

        // When
        Page<CommentResponseDTO> resultPage = commentService.readList(taskId, pageable);

        // Then
        // 2. ⭐️ [검증] 'isEdited'는 true
        assertThat(resultPage.getContent().get(0).isEdited()).isTrue();
    }

    @Test
    @DisplayName("update: 작성자(Author)는 코멘트를 수정할 수 있다")
    void testUpdateSuccessAsAuthor() {
        // Given
        CommentUpdateDTO dto = CommentUpdateDTO.builder().body("Updated Body").build();

        // 1. [Mocking] 'findById'는 'mockComment' (작성자 10L) 반환
        given(commentRepository.findById(commentId)).willReturn(Optional.of(mockComment));

        // 2. [Mocking] 'findMyRole'는 ADMIN이 아닌 'MEMBER' 반환
        given(projectMemberRepository.findMyRole(projectId, authorId)).willReturn(Optional.of(ProjectRole.MEMBER));

        // When
        Long updatedId = commentService.update(authorId, commentId, dto); // ⭐️ (authorId(10L)로 호출)

        // Then
        // 3. ⭐️ [검증] 'mockComment'의 body가 'Updated Body'로 변경되었는지 (더티 체킹)
        assertThat(updatedId).isEqualTo(commentId);
        assertThat(mockComment.getBody()).isEqualTo("Updated Body");
    }

    @Test
    @DisplayName("update: ADMIN은 코멘트를 수정할 수 있다")
    void testUpdateSuccessAsAdmin() {
        // Given
        CommentUpdateDTO dto = CommentUpdateDTO.builder().body("Updated By Admin").build();

        given(commentRepository.findById(commentId)).willReturn(Optional.of(mockComment));

        // 1. ⭐️ [Mocking] 'findMyRole'는 'ADMIN' 반환
        given(projectMemberRepository.findMyRole(projectId, adminId)).willReturn(Optional.of(ProjectRole.ADMIN));

        // When
        Long updatedId = commentService.update(adminId, commentId, dto); // ⭐️ (adminId(1L)로 호출)

        // Then
        // 2. [검증] 작성자가 아니지만 ADMIN이므로 통과
        assertThat(updatedId).isEqualTo(commentId);
        assertThat(mockComment.getBody()).isEqualTo("Updated By Admin");
    }

    @Test
    @DisplayName("update: 제3자는 코멘트를 수정할 수 없다 (403)")
    void testUpdateFailAccessDenied() {
        // Given
        Long strangerId = 99L;
        CommentUpdateDTO dto = new CommentUpdateDTO("Hacked");

        given(commentRepository.findById(commentId)).willReturn(Optional.of(mockComment));

        // 1. ⭐️ [Mocking] 제3자는 ADMIN이 아님
        given(projectMemberRepository.findMyRole(projectId, strangerId)).willReturn(Optional.of(ProjectRole.MEMBER));

        // 2. (isAuthor 검사: 10L != 99L -> false)

        // When & Then
        // 3. ⭐️ [검증] 403 예외 발생
        assertThatThrownBy(() -> commentService.update(strangerId, commentId, dto))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("권한이 없습니다.");
    }

    @Test
    @DisplayName("delete: 작성자(Author)는 코멘트를 삭제할 수 있다")
    void testDeleteSuccessAsAuthor() {
        // Given
        given(commentRepository.findById(commentId)).willReturn(Optional.of(mockComment));
        given(projectMemberRepository.findMyRole(projectId, authorId)).willReturn(Optional.of(ProjectRole.MEMBER));

        // When
        commentService.delete(authorId, commentId);

        // Then
        // 1. ⭐️ [검증] 'deleteById'가 1번 호출되었는지
        verify(commentRepository).deleteById(commentId);
    }

    @Test
    @DisplayName("delete: ADMIN은 코멘트를 삭제할 수 있다")
    void testDeleteSuccessAsAdmin() {
        // Given
        given(commentRepository.findById(commentId)).willReturn(Optional.of(mockComment));
        given(projectMemberRepository.findMyRole(projectId, adminId)).willReturn(Optional.of(ProjectRole.ADMIN));

        // When
        commentService.delete(adminId, commentId);

        // Then
        verify(commentRepository).deleteById(commentId);
    }

    @Test
    @DisplayName("delete: 제3자는 코멘트를 삭제할 수 없다 (403)")
    void testDeleteFailAccessDenied() {
        // Given
        Long strangerId = 99L;
        given(commentRepository.findById(commentId)).willReturn(Optional.of(mockComment));
        given(projectMemberRepository.findMyRole(projectId, strangerId)).willReturn(Optional.of(ProjectRole.MEMBER));

        // When & Then
        assertThatThrownBy(() -> commentService.delete(strangerId, commentId))
                .isInstanceOf(AccessDeniedException.class);

        // 1. ⭐️ [검증] 'deleteById'가 '절대' 호출되지 않았는지
        verify(commentRepository, never()).deleteById(anyLong());
    }
}
