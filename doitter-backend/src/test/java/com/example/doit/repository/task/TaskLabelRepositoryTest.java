package com.example.doit.repository.task;

import com.example.doit.domain.label.Label;
import com.example.doit.domain.project.Project;
import com.example.doit.domain.task.Task;
import com.example.doit.domain.task.TaskLabel;
import com.example.doit.domain.task.TaskPriority;
import com.example.doit.domain.task.TaskState;
import com.example.doit.domain.user.User;
import com.example.doit.repository.label.LabelRepository;
import com.example.doit.repository.project.ProjectRepository;
import com.example.doit.repository.user.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Slf4j
public class TaskLabelRepositoryTest {

    @Autowired
    private TaskLabelRepository taskLabelRepository;

    // --- 의존 엔티티 설정을 위한 Repository 주입 ---
    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private LabelRepository labelRepository;
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private UserRepository userRepository;

    // --- 테스트용 공통 엔티티 ---
    private User savedUser;
    private Project savedProject;
    private Task savedTask1;
    private Task savedTask2;

    // 2. 각 테스트 전에 공통 의존 엔티티(User, Project, Task, Label)를 생성
    @BeforeEach
    void setUp() {

        savedUser = userRepository.save(User.builder().email("user@test.com").name("Test User").password("1111").role(User.Role.USER).build());
        savedProject = projectRepository.save(Project.builder().build());

        Label savedLabel1 = labelRepository.save(Label.builder().name("Bug").project(savedProject).color("#FF0000").build());
        Label savedLabel2 = labelRepository.save(Label.builder().name("Feature").project(savedProject).color("#00FF00").build());

        savedTask1 = taskRepository.save(Task.builder().project(savedProject).user(savedUser).title("Task Test 1").dueDate(LocalDateTime.now()).priority(TaskPriority.MEDIUM).state(TaskState.TODO).orderIndex(1).build());
        savedTask2 = taskRepository.save(Task.builder().project(savedProject).user(savedUser).title("Task Test 2").dueDate(LocalDateTime.now()).priority(TaskPriority.HIGH).state(TaskState.DOING).orderIndex(1).build());

        // [테스트 데이터 세팅]
        // Task 1은 2개의 라벨 (Bug, Feature)을 가짐
        taskLabelRepository.save(TaskLabel.builder().task(savedTask1).label(savedLabel1).build());
        taskLabelRepository.save(TaskLabel.builder().task(savedTask1).label(savedLabel2).build());

        // Task 2는 1개의 라벨 (Bug)을 가짐
        taskLabelRepository.save(TaskLabel.builder().task(savedTask2).label(savedLabel1).build());
    }

    @Test
    @DisplayName("findListByTaskId: 특정 태스크의 모든 라벨 연결을 조회한다")
    void testFindListByTaskId() {

        // When (실행): Task 1 (라벨 2개) 조회
        List<TaskLabel> task1Labels = taskLabelRepository.findListByTaskId(savedTask1.getId());

        // When (실행): Task 2 (라벨 1개) 조회
        List<TaskLabel> task2Labels = taskLabelRepository.findListByTaskId(savedTask2.getId());

        // Then (검증)
        assertThat(task1Labels).hasSize(2);
        assertThat(task2Labels).hasSize(1);

        // ⭐️ @EntityGraph(label) 검증: LAZY 로딩 없이 라벨 이름에 접근 가능한지 확인
        log.info("Task 1의 첫번째 라벨 이름: {}", task1Labels.get(0).getLabel().getName());
        assertThat(task1Labels.get(0).getLabel().getName()).isEqualTo("Bug");
    }

    @Test
    @DisplayName("findListByTaskId: 라벨이 없는 태스크는 빈 리스트를 반환한다")
    void testFindListByTaskId_WhenEmpty() {

        // Given (준비): 라벨이 없는 새 태스크 생성
        Task task3 = taskRepository.save(Task.builder().project(savedProject).user(savedUser).title("Task Test 1").dueDate(LocalDateTime.now()).priority(TaskPriority.MEDIUM).state(TaskState.TODO).orderIndex(1).build());

        // When (실행)
        List<TaskLabel> task3Labels = taskLabelRepository.findListByTaskId(task3.getId());

        // Then (검증)
        assertThat(task3Labels).isEmpty();
    }

    @Test
    @DisplayName("findByTaskIdList: 여러 태스크의 모든 라벨 연결을 한 번에 조회한다")
    void testFindByTaskIdList() {

        // Given (준비): Task 1 (라벨 2개), Task 2 (라벨 1개)
        List<Long> taskIds = List.of(savedTask1.getId(), savedTask2.getId());

        // When (실행)
        List<TaskLabel> allLabels = taskLabelRepository.findByTaskIdList(taskIds);

        // Then (검증)
        assertThat(allLabels).hasSize(3); // ⭐️ 2 + 1 = 3개
    }

    @Test
    @DisplayName("deleteByTaskId: 특정 태스크의 모든 라벨 연결을 삭제한다")
    void testDeleteByTaskId() {

        // Given (준비): Task 1 (라벨 2개), Task 2 (라벨 1개). 총 3개의 TaskLabel
        long initialCount = taskLabelRepository.count();
        assertThat(initialCount).isEqualTo(3);
        assertThat(taskLabelRepository.findListByTaskId(savedTask1.getId())).hasSize(2);

        // When (실행): Task 1의 라벨 연결 (2개)을 모두 삭제
        taskLabelRepository.deleteByTaskId(savedTask1.getId());

        // ⭐️ @Modifying 쿼리는 @Transactional 범위 내에서 flush()가 필요할 수 있으나,
        //    @DataJpaTest가 관리하므로 count()로 검증 가능

        // Then (검증)
        assertThat(taskLabelRepository.count()).isEqualTo(initialCount - 2); // ⭐️ 3 - 2 = 1개
        assertThat(taskLabelRepository.findListByTaskId(savedTask1.getId())).isEmpty(); // ⭐️ Task 1의 라벨은 0개
        assertThat(taskLabelRepository.findListByTaskId(savedTask2.getId())).hasSize(1); // ⭐️ Task 2는 영향 없음
    }
}
