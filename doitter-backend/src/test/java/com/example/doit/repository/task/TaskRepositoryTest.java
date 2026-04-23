package com.example.doit.repository.task;

import com.example.doit.domain.project.Project;
import com.example.doit.domain.task.Task;
import com.example.doit.domain.task.TaskPriority;
import com.example.doit.domain.task.TaskState;
import com.example.doit.domain.user.User;
import com.example.doit.repository.project.ProjectRepository;
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

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Slf4j
class TaskRepositoryTest
{

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProjectRepository projectRepository;

    private User savedUser;
    private Project savedProject;

    @BeforeEach
    void setUp() {
        User user = User.builder().email("test@test.com").password("1111").name("testUser").role(User.Role.USER).build();
        savedUser = userRepository.save(user);

        Project project = Project.builder().build();
        savedProject = projectRepository.save(project);
    }

    @Test
    @DisplayName("readPage: 프로젝트의 태스크 목록 페이징 조회")
    void testReadPage() {
        // Given (준비): 20개의 태스크를 저장
        for (int i = 0; i < 20; i++) {
            taskRepository.save(Task.builder()
                    .title("Test Task " + i)
                    .project(savedProject)
                    .user(savedUser)
                    .state(TaskState.TODO)
                    .dueDate(LocalDateTime.now())
                    .priority(TaskPriority.MEDIUM)
                    .orderIndex(i)
                    .build());
        }

        // When (실행): 0번 페이지, 5개씩 조회
        Pageable pageable = PageRequest.of(0, 5);
        Page<Task> taskPage = taskRepository.readPage(savedProject.getId(), pageable);

        // Then (검증)
        assertThat(taskPage).isNotNull();
        assertThat(taskPage.getTotalElements()).isEqualTo(20); // ⭐️ 총 20개인지
        assertThat(taskPage.getContent().size()).isEqualTo(5); // ⭐️ 현재 페이지에 5개인지
        log.info("조회된 Task의 User 이메일 (EntityGraph 테스트): {}", taskPage.getContent().get(0).getUser().getEmail());
        assertThat(taskPage.getContent().get(0).getUser()).isNotNull(); // ⭐️ @EntityGraph(user) 작동 확인
    }

    @Test
    @DisplayName("findMaxOrderIndex: 특정 상태의 최대 orderIndex를 조회한다")
    void testFindMaxOrderIndex() {
        // Given (준비)
        taskRepository.save(Task.builder().project(savedProject).user(savedUser).title("Task Test").dueDate(LocalDateTime.now()).priority(TaskPriority.MEDIUM)
                .state(TaskState.TODO).orderIndex(1).build());
        taskRepository.save(Task.builder().project(savedProject).user(savedUser).title("Task Test").dueDate(LocalDateTime.now()).priority(TaskPriority.MEDIUM)
                .state(TaskState.TODO).orderIndex(2).build());
        taskRepository.save(Task.builder().project(savedProject).user(savedUser).title("Task Test").dueDate(LocalDateTime.now()).priority(TaskPriority.MEDIUM)
                .state(TaskState.DOING).orderIndex(10).build());

        // When (실행): "TODO" 상태의 Max Index를 조회
        Optional<Integer> maxIndexOpt = taskRepository.findMaxOrderIndex(savedProject.getId(), TaskState.TODO);

        // Then (검증)
        assertThat(maxIndexOpt).isPresent();
        assertThat(maxIndexOpt.get()).isEqualTo(2); // ⭐️ 10이 아닌 2가 나와야 함
    }

    @Test
    @DisplayName("findById (Override): @EntityGraph가 정상 작동하는지 확인")
    void testFindById() {
        // Given (준비)
        Task savedTask =  taskRepository.save(Task.builder().project(savedProject).user(savedUser).title("Task Test").dueDate(LocalDateTime.now()).priority(TaskPriority.MEDIUM).state(TaskState.TODO).orderIndex(1).build());

        // When (실행)
        // ⭐️ @DataJpaTest는 기본이 @Transactional이라 영속성 컨텍스트(1차 캐시)가 작동함
        //    'findById'가 쿼리를 날리지 않고 1차 캐시에서 가져올 수 있음.
        //    (JPA 동작 원리상 @EntityGraph가 쿼리 단에서 작동했는지 '검증'은 어려움)
        Optional<Task> foundTask = taskRepository.findById(savedTask.getId());

        // Then (검증): 데이터가 잘 조회되었는지 확인
        assertThat(foundTask).isPresent();
        assertThat(foundTask.get().getId()).isEqualTo(savedTask.getId());
    }
}