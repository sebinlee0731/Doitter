package com.example.doit.service.task;

import com.example.doit.domain.label.Label;
import com.example.doit.domain.project.Project;
import com.example.doit.domain.project.ProjectRole;
import com.example.doit.domain.task.Task;
import com.example.doit.domain.task.TaskLabel;
import com.example.doit.domain.task.TaskPriority;
import com.example.doit.domain.task.TaskState;
import com.example.doit.domain.user.User;
import com.example.doit.dto.task.*;
import com.example.doit.repository.project.ProjectMemberRepository;
import com.example.doit.repository.project.ProjectRepository;
import com.example.doit.repository.task.TaskLabelRepository;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock private TaskRepository taskRepository;
    @Mock private TaskLabelRepository taskLabelRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private UserRepository userRepository;
    @Mock private ProjectMemberRepository projectMemberRepository;

    @InjectMocks
    private TaskService taskService;

    // ⭐️ 공통으로 쓸 변수들을 필드로 선언
    private final Long projectId = 1L;
    private final Long assigneeId = 10L;
    private final Long adminId = 1L;
    private final Long taskId = 100L;
    private Project mockProject;
    private User mockAssignee;
    private Task mockTask;

    @BeforeEach
    void setUp() {

        // ⭐️ 각 테스트 실행 전에 공통 데이터를 '리셋'
        mockProject = Project.builder().build();
        ReflectionTestUtils.setField(mockProject, "id", projectId);

        mockAssignee = User.builder().email("test@test.com").password("1111").role(User.Role.USER).name("Tester").build();
        ReflectionTestUtils.setField(mockAssignee, "id", assigneeId);

        mockTask = Task.builder()
                .title("Common Task")
                .project(mockProject)
                .user(mockAssignee)
                .state(TaskState.TODO)
                .orderIndex(1)
                .build();
        ReflectionTestUtils.setField(mockTask, "id", taskId);
    }

    @Test
    @DisplayName("create: 태스크를 생성하고 ID를 반환한다")
    void testCreate() {

        // Given
        TaskCreateDTO dto = TaskCreateDTO.builder()
                .title("New Task")
                .userId(assigneeId)
                .state(TaskState.TODO)
                .build();

        // ⭐️ 필드에 있는 mockProject, mockAssignee 사용 (코드 중복 제거)
        given(projectRepository.getReferenceById(projectId)).willReturn(mockProject);
        given(userRepository.findById(assigneeId)).willReturn(Optional.of(mockAssignee));
        given(taskRepository.findMaxOrderIndex(projectId, TaskState.TODO)).willReturn(Optional.of(5));

        // save()가 호출되면, 인자로 들어온 Task 객체를 그대로 반환하도록 설정
        given(taskRepository.save(any(Task.class))).willAnswer(invocation -> {
            Task t = invocation.getArgument(0);
            ReflectionTestUtils.setField(t, "id", taskId); // ID 생성 흉내
            return t;
        });

        // When
        Long savedId = taskService.create(projectId, dto);

        // Then
        assertThat(savedId).isEqualTo(taskId);
    }

    @Test
    @DisplayName("update: 담당자(Assignee)는 태스크를 수정할 수 있다")
    void tetsUpdate() {
        // Given
        TaskUpdateDTO dto = TaskUpdateDTO.builder().userId(20L).title("Updated").dueDate(LocalDateTime.now()).priority(TaskPriority.HIGH).build();
        User newAssignee = User.builder().build(); // (새 담당자)

        given(userRepository.findById(dto.getUserId())).willReturn(Optional.of(newAssignee));

        // ⭐️ setUp에서 만든 'mockTask' 재사용
        given(taskRepository.findById(100L)).willReturn(Optional.of(mockTask));

        // ADMIN 검사 -> MEMBER
        given(projectMemberRepository.findMyRole(projectId, assigneeId)).willReturn(Optional.of(ProjectRole.MEMBER));

        // When
        // (mockTask의 user.id가 assigneeId(10L)이므로 본인 확인 통과)
        Long updatedId = taskService.update(assigneeId, 100L, dto);

        // Then
        assertThat(updatedId).isEqualTo(100L);
        assertThat(mockTask.getTitle()).isEqualTo("Updated");
    }

    @Test
    @DisplayName("delete: ADMIN은 태스크를 삭제할 수 있다")
    void DeleteSuccessAsAdmin() {

        // Given
        // 1. 'findById'는 mockTask (담당자 10번)를 반환하도록 '가정'
        given(taskRepository.findById(taskId)).willReturn(Optional.of(mockTask));

        // 2. 'isAdmin' 검사 시, 'ADMIN' 역할을 반환하도록 '가정'
        // (로그인한 유저(1L)는 ADMIN)
        given(projectMemberRepository.findMyRole(projectId, adminId)).willReturn(Optional.of(ProjectRole.ADMIN));

        // When
        taskService.delete(adminId, taskId);

        // Then
        // 3. 'delete'가 성공적으로 호출되었는지 '검증'
        verify(taskRepository).delete(mockTask);
    }

    @Test
    @DisplayName("delete: 담당자(Assignee)는 태스크를 삭제할 수 있다")
    void testDeleteSuccessAsAssignee() {
        // Given
        // 1. 'findById'는 mockTask (담당자 10번)를 반환
        given(taskRepository.findById(taskId)).willReturn(Optional.of(mockTask));

        // 2. 'isAdmin' 검사 시, 'MEMBER' 역할을 반환 (ADMIN 아님)
        given(projectMemberRepository.findMyRole(projectId, assigneeId)).willReturn(Optional.of(ProjectRole.MEMBER));

        // 3. 'isAssignee' 검사는 (10L == 10L) -> true

        // When
        taskService.delete(assigneeId, taskId);

        // Then
        // 4. 'delete'가 성공적으로 호출되었는지 '검증'
        verify(taskRepository).delete(mockTask);
    }

    @Test
    @DisplayName("delete: 제3자는 태스크를 삭제할 수 없다 (403)")
    void testDeleteFailAccessDenied() {
        // Given
        Long strangerId = 99L; // ADMIN도, 담당자도 아닌 유저

        given(taskRepository.findById(taskId)).willReturn(Optional.of(mockTask));

        // 1. 'isAdmin' 검사 시, 'MEMBER' 역할을 반환 (ADMIN 아님)
        given(projectMemberRepository.findMyRole(projectId, strangerId)).willReturn(Optional.of(ProjectRole.MEMBER));

        // 2. 'isAssignee' 검사는 (10L == 99L) -> false

        // When & Then
        assertThatThrownBy(() -> taskService.delete(strangerId, taskId))
                .isInstanceOf(AccessDeniedException.class) // ⭐️ 403 예외가 발생하는지 '검증'
                .hasMessageContaining("권한이 없습니다");

        // 3. ⭐️ 'delete' 메서드가 '절대' 호출되지 않았는지 '검증'
        verify(taskRepository, never()).delete(any(Task.class));
    }

    @Test
    @DisplayName("delete: 존재하지 않는 태스크 삭제 시 (404)")
    void testDeleteFailNotFound() {
        // Given
        // 1. 'findById'가 빈 Optional을 반환하도록 '가정'
        given(taskRepository.findById(anyLong())).willReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> taskService.delete(adminId, 999L))
                .isInstanceOf(EntityNotFoundException.class); // ⭐️ 404 예외가 발생하는지 '검증'
    }

    @Test
    @DisplayName("readPage: 태스크 목록과 라벨 개수를 N+1 없이 DTO로 조합한다")
    void testReadPageMapsLabelsCorrectly() {

        // Given
        Pageable pageable = PageRequest.of(0, 10);

        // 1. 'Task 2' 생성 (라벨 없음)
        Task mockTask2 = Task.builder().title("Common Task").project(mockProject).user(mockAssignee)
                .state(TaskState.TODO).orderIndex(1).build();
        ReflectionTestUtils.setField(mockTask2, "id", 101L);

        // 2. 'Label 1' 생성
        Label mockLabel1 = Label.builder().project(mockProject).name("Bug").color("Red").build();
        ReflectionTestUtils.setField(mockLabel1, "id", 10L);

        // 3. 'Task 1'에만 'Label 1'을 연결
        TaskLabel mockTaskLabel = TaskLabel.builder().task(mockTask).label(mockLabel1).build();

        // 4. [Mocking] 'readPage'는 2개의 Task 페이지를 반환하도록 '가정'
        Page<Task> taskPage = new PageImpl<>(List.of(mockTask, mockTask2), pageable, 2);
        given(taskRepository.readPage(projectId, pageable)).willReturn(taskPage);

        // 5. [Mocking] 'findByTaskIdList'는 Task 1의 라벨(1개)만 반환하도록 '가정'
        List<Long> taskIds = List.of(100L, 101L);
        given(taskLabelRepository.findByTaskIdList(taskIds)).willReturn(List.of(mockTaskLabel));

        // When
        Page<TaskResponseDTO> resultPage = taskService.readPage(projectId, pageable);

        // Then
        assertThat(resultPage.getContent()).hasSize(2);

        // 6. [검증] Task 1 (100L)은 Label이 1개여야 함
        TaskResponseDTO dto1 = resultPage.getContent().get(0);
        assertThat(dto1.getTaskId()).isEqualTo(100L);
        assertThat(dto1.getLabels()).hasSize(1);
        assertThat(dto1.getLabels().get(0).getName()).isEqualTo("Bug");

        // 7. [검증] Task 2 (101L)는 Label이 0개여야 함
        TaskResponseDTO dto2 = resultPage.getContent().get(1);
        assertThat(dto2.getTaskId()).isEqualTo(101L);
        assertThat(dto2.getLabels()).isEmpty();
    }

    @Test
    @DisplayName("patchState: 태스크 상태와 순서를 성공적으로 변경한다")
    void testPatchStateSuccess() {
        // Given
        // 1. ⭐️ 101L ID를 가진 'Task 2' 생성 (setUp의 mockTask(100L)와 함께 사용)
        Task mockTask2 = Task.builder()
                .title("Task 2")
                .project(mockProject)
                .user(mockAssignee)
                .state(TaskState.TODO)
                .orderIndex(2)
                .build();
        ReflectionTestUtils.setField(mockTask2, "id", 101L);

        // 2. ⭐️ DTO 리스트 준비
        // Task 1(100L): DOING (1 -> 1)
        // Task 2(101L): DOING (2 -> 2)
        List<TaskPatchDTO> dtos = List.of(
                TaskPatchDTO.builder().taskId(100L).state(TaskState.DOING).orderIndex(1).build(),
                TaskPatchDTO.builder().taskId(101L).state(TaskState.DOING).orderIndex(2).build()
        );

        List<Long> taskIdList = List.of(100L, 101L);

        // 3. ⭐️ [Mocking] findAllById가 두 Task를 반환하도록 '가정'
        given(taskRepository.findAllById(taskIdList)).willReturn(List.of(mockTask, mockTask2));

        // When
        taskService.patchState(dtos);

        // Then
        // 4. ⭐️ [검증] 'mockTask'와 'mockTask2'의 '상태'가 DTO대로 변경되었는지 확인
        //    (JPA의 더티 체킹이 이 변경된 값을 감지하여 UPDATE 쿼리를 날릴 것임)
        assertThat(mockTask.getState()).isEqualTo(TaskState.DOING);
        assertThat(mockTask.getOrderIndex()).isEqualTo(1);

        assertThat(mockTask2.getState()).isEqualTo(TaskState.DOING);
        assertThat(mockTask2.getOrderIndex()).isEqualTo(2);
    }

    @Test
    @DisplayName("patchState: 존재하지 않는 태스크 ID가 포함되면 404 예외를 던진다")
    void testPatchStateFailNotFound() {
        // Given
        // 1. ⭐️ 999L (존재하지 않는 ID) 포함
        List<TaskPatchDTO> dtos = List.of(
                TaskPatchDTO.builder().taskId(100L).state(TaskState.DOING).build(),
                TaskPatchDTO.builder().taskId(999L).state(TaskState.TODO).build()
        );
        List<Long> taskIdList = List.of(100L, 999L);

        // 2. ⭐️ [Mocking] findAllById는 '존재하는' mockTask(100L)만 반환
        given(taskRepository.findAllById(taskIdList)).willReturn(List.of(mockTask));

        // When & Then
        // 3. ⭐️ 999L에 해당하는 Task가 'null'이므로, 'EntityNotFoundException'이 발생
        assertThatThrownBy(() -> taskService.patchState(dtos))
                .isInstanceOf(EntityNotFoundException.class);
    }

    // ==========================================================
    // ⭐️ [신규] 4. 'getTaskWithLabels' 메서드 테스트
    // ==========================================================

    @Test
    @DisplayName("getTaskWithLabels: 태스크 상세 정보와 라벨 목록을 DTO로 반환한다")
    void testGetTaskWithLabelsSuccess() {
        // Given
        // 1. ⭐️ 라벨 2개와 TaskLabel 연결 2개 생성
        Label label1 = Label.builder().name("Bug").color("Red").build();
        ReflectionTestUtils.setField(label1, "id", 10L);
        Label label2 = Label.builder().name("Feature").color("Blue").build();
        ReflectionTestUtils.setField(label2, "id", 11L);

        TaskLabel tl1 = TaskLabel.builder().task(mockTask).label(label1).build();
        TaskLabel tl2 = TaskLabel.builder().task(mockTask).label(label2).build();

        // 2. ⭐️ [Mocking] 'findById'는 mockTask를 반환
        given(taskRepository.findById(taskId)).willReturn(Optional.of(mockTask));

        // 3. ⭐️ [Mocking] 'findListByTaskId'는 라벨 연결 2개를 반환
        given(taskLabelRepository.findListByTaskId(taskId)).willReturn(List.of(tl1, tl2));

        // When
        TaskDetailResponseDTO resultDTO = taskService.getTaskWithLabels(taskId);

        // Then
        // 4. ⭐️ [검증] Task 정보가 잘 매핑되었는지
        assertThat(resultDTO).isNotNull();
        assertThat(resultDTO.getTaskId()).isEqualTo(taskId);
        assertThat(resultDTO.getTitle()).isEqualTo("Common Task");

        // 5. ⭐️ [검증] Label 정보가 잘 매핑되었는지
        assertThat(resultDTO.getLabels()).hasSize(2);
        assertThat(resultDTO.getLabels().get(0).getName()).isEqualTo("Bug");
        assertThat(resultDTO.getLabels().get(1).getName()).isEqualTo("Feature");
    }

    @Test
    @DisplayName("getTaskWithLabels: 존재하지 않는 태스크 ID는 404 예외를 던진다")
    void testGetTaskWithLabelsFailNotFound() {
        // Given
        // 1. ⭐️ [Mocking] 'findById'가 빈 Optional을 반환
        given(taskRepository.findById(999L)).willReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> taskService.getTaskWithLabels(999L))
                .isInstanceOf(EntityNotFoundException.class);

        // 2. ⭐️ 'findById'가 실패했으므로 'findListByTaskId'는 호출조차 되면 안 됨
        verify(taskLabelRepository, never()).findListByTaskId(anyLong());
    }
}