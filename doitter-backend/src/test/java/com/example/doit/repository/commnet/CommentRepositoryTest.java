package com.example.doit.repository.commnet;

import com.example.doit.domain.comment.Comment;
import com.example.doit.domain.project.Project;
import com.example.doit.domain.task.Task;
import com.example.doit.domain.task.TaskPriority;
import com.example.doit.domain.task.TaskState;
import com.example.doit.domain.user.User;
import com.example.doit.repository.comment.CommentRepository;
import com.example.doit.repository.project.ProjectRepository;
import com.example.doit.repository.task.TaskRepository;
import com.example.doit.repository.user.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Slf4j
public class CommentRepositoryTest {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private UserRepository userRepository;

    private User savedUser;
    private Project savedProject;
    private Task savedTask1;
    private Task savedTask2;
    private Comment savedComment;

    @BeforeEach
    void setUp() {

        User user = User.builder().email("test@test.com").password("1111").name("testUser").role(User.Role.USER).build();
        savedUser = userRepository.save(user);

        Project project = Project.builder().build();
        savedProject = projectRepository.save(project);


        Task task1 = Task.builder().project(savedProject).user(savedUser).title("Task Test 1").dueDate(LocalDateTime.now()).priority(TaskPriority.MEDIUM).state(TaskState.TODO).orderIndex(1).build();
        savedTask1 = taskRepository.save(task1);

        Task task2 = Task.builder().project(savedProject).user(savedUser).title("Task Test 2").dueDate(LocalDateTime.now()).priority(TaskPriority.HIGH).state(TaskState.DOING).orderIndex(1).build();
        savedTask2 = taskRepository.save(task2);

        // findById 테스트를 위한 코멘트 1개 미리 생성
        savedComment = commentRepository.save(Comment.builder()
                .body("Test Comment 1")
                .task(savedTask1)
                .author(savedUser)
                .build());
    }

    @Test
    @DisplayName("findByTaskId: 특정 태스크의 모든 코멘트를 페이징하여 조회한다")
    void testFindByTaskId() {

        // Given (준비): "Task 1"에 19개의 코멘트를 '추가'로 저장 (setUp의 1개 + 19개 = 총 20개)
        for (int i = 0; i < 19; i++) {
            commentRepository.save(Comment.builder()
                    .body("Sub Comment " + i)
                    .task(savedTask1)
                    .author(savedUser)
                    .build());
        }

        // When (실행): "Task 1"의 코멘트를 0번 페이지, 5개씩, '최신순(ID 내림차순)'으로 조회
        Pageable pageable = PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "id"));
        Page<Comment> commentPage = commentRepository.findByTaskId(savedTask1.getId(), pageable);

        // Then (검증)
        assertThat(commentPage).isNotNull();
        assertThat(commentPage.getTotalElements()).isEqualTo(20); // ⭐️ 총 20개인지
        assertThat(commentPage.getContent().size()).isEqualTo(5); // ⭐️ 현재 페이지에 5개인지
        assertThat(commentPage.getContent().get(0).getBody()).isEqualTo("Sub Comment 18"); // ⭐️ 최신순 정렬 확인
    }

    @Test
    @DisplayName("findByTaskId: 코멘트가 없는 태스크는 빈 페이지를 반환한다")
    void testFindByTaskId_WhenEmpty() {

        // Given (준비): "Task 2"는 setUp에서 생성되었지만 코멘트가 없음

        // When (실행): "Task 2"의 코멘트를 조회
        Pageable pageable = PageRequest.of(0, 5);
        Page<Comment> commentPage = commentRepository.findByTaskId(savedTask2.getId(), pageable);

        // Then (검증)
        assertThat(commentPage).isNotNull();
        assertThat(commentPage.getTotalElements()).isEqualTo(0); // ⭐️ 0개여야 함
        assertThat(commentPage.getContent()).isEmpty(); // ⭐️ 리스트가 비어있어야 함
    }

    @Test
    @DisplayName("findById (Override): @EntityGraph가 N+1 없이 엔티티를 잘 가져오는지 확인")
    void testFindById_WithEntityGraph() {
        // Given (준비): 'savedComment'이 setUp에서 생성됨

        // When (실행):
        Optional<Comment> foundComment = commentRepository.findById(savedComment.getId());

        // Then (검증):
        assertThat(foundComment).isPresent();
        assertThat(foundComment.get().getId()).isEqualTo(savedComment.getId());

        // ⭐️ @EntityGraph(attributePaths = {"author", "task", "task.project"}) 검증
        //    (실제로는 @DataJpaTest의 열린 세션 때문에 LAZY 로딩이 되겠지만,
        //     프록시가 아닌 실제 객체에 접근 가능한지 확인)
        log.info("조회된 코멘트의 작성자: {}", foundComment.get().getAuthor().getName());
        log.info("조회된 코멘트의 태스크: {}", foundComment.get().getTask().getTitle());
        log.info("조회된 코멘트의 프로젝트: {}", foundComment.get().getTask().getProject().getId());

        assertThat(foundComment.get().getAuthor()).isNotNull();
        assertThat(foundComment.get().getTask()).isNotNull();
        assertThat(foundComment.get().getTask().getProject()).isNotNull();
    }
}
