package com.example.doit.repository.label;

import com.example.doit.domain.label.Label;
import com.example.doit.domain.project.Project;
import com.example.doit.repository.project.ProjectRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Slf4j
public class LabelRepositoryTest {

    @Autowired
    private LabelRepository labelRepository;

    @Autowired
    private ProjectRepository projectRepository; // 2. 'Label'이 의존하는 Project를 세팅하기 위해 주입

    private Project savedProject1;
    private Project savedProject2;
    private Label savedLabel1;

    // 3. 각 테스트 실행 전에, 테스트용 프로젝트와 라벨 데이터를 미리 생성
    @BeforeEach
    void setUp() {
        // 테스트용 프로젝트 2개 생성
        Project p1 = Project.builder().build();
        savedProject1 = projectRepository.save(p1);

        Project p2 = Project.builder().build();
        savedProject2 = projectRepository.save(p2);

        // 'Project A'에 라벨 2개, 'Project B'에 라벨 1개 저장
        savedLabel1 = labelRepository.save(Label.builder().name("Bug").color("#FF0000").project(savedProject1).build());
        labelRepository.save(Label.builder().name("Feature").color("#00FF00").project(savedProject1).build());
        labelRepository.save(Label.builder().name("Backend").color("#0000FF").project(savedProject2).build());
    }

    @Test
    @DisplayName("findByProjectId: 특정 프로젝트의 모든 라벨을 조회한다")
    void testFindByProjectId() {
        // Given (준비): setUp()에서 Project 1에 라벨 2개, Project 2에 라벨 1개 저장

        // When (실행): 'Project 1'의 라벨을 조회
        List<Label> labels = labelRepository.findByProjectId(savedProject1.getId());

        // Then (검증)
        assertThat(labels).isNotNull();
        assertThat(labels.size()).isEqualTo(2); // ⭐️ 2개가 나와야 함
        assertThat(labels.get(0).getName()).isEqualTo("Bug");
        assertThat(labels.get(1).getName()).isEqualTo("Feature");

        // When (실행): 'Project 2'의 라벨을 조회
        List<Label> labelsP2 = labelRepository.findByProjectId(savedProject2.getId());

        // Then (검증)
        assertThat(labelsP2.size()).isEqualTo(1); // ⭐️ 1개가 나와야 함
        assertThat(labelsP2.get(0).getName()).isEqualTo("Backend");
    }

    @Test
    @DisplayName("existsByProjectIdAndName: 프로젝트 내 이름 중복을 확인한다")
    void testExistsByProjectIdAndName() {
        // Given (준비): "Project A"에 "Bug" 라벨이 있음

        // When (실행)
        boolean shouldBeTrue = labelRepository.existsByProjectIdAndName(savedProject1.getId(), "Bug");
        boolean shouldBeFalse_WrongName = labelRepository.existsByProjectIdAndName(savedProject1.getId(), "Documentation");
        boolean shouldBeFalse_WrongProject = labelRepository.existsByProjectIdAndName(savedProject2.getId(), "Bug");

        // Then (검증)
        assertThat(shouldBeTrue).isTrue();
        assertThat(shouldBeFalse_WrongName).isFalse();
        assertThat(shouldBeFalse_WrongProject).isFalse();
    }

    @Test
    @DisplayName("findByIdAndProjectId: 라벨 ID와 프로젝트 ID로 라벨을 조회한다")
    void testFindByIdAndProjectId() {
        // Given (준비): 'savedLabel1'은 'Project 1' 소속

        // When (실행)
        Optional<Label> found = labelRepository.findByIdAndProjectId(savedLabel1.getId(), savedProject1.getId());
        Optional<Label> notFound_WrongProject = labelRepository.findByIdAndProjectId(savedLabel1.getId(), savedProject2.getId());
        Optional<Label> notFound_WrongId = labelRepository.findByIdAndProjectId(9999L, savedProject1.getId());

        // Then (검증)
        assertThat(found).isPresent(); // ⭐️ 반드시 찾아야 함
        assertThat(found.get().getName()).isEqualTo("Bug");

        assertThat(notFound_WrongProject).isEmpty(); // ⭐️ 프로젝트 ID가 틀리면 찾으면 안 됨
        assertThat(notFound_WrongId).isEmpty();      // ⭐️ 라벨 ID가 틀리면 찾으면 안 됨
    }
}
