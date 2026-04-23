package com.example.doit.repository.project;

import com.example.doit.domain.project.Project;
import com.example.doit.domain.project.ProjectMember;
import com.example.doit.domain.project.ProjectRole;
import com.example.doit.domain.user.User;
import com.example.doit.repository.user.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Slf4j
public class ProjectMemberRepositoryTest {

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private UserRepository userRepository;

    private User savedAdminUser;
    private User savedMemberUser;
    private User savedNonMemberUser;
    private Project savedProject1;
    private Project savedProject2;
    private ProjectMember savedMembership1; // (Admin in P1)

    // 2. 각 테스트 실행 전에 공통 의존 엔티티(User, Project)를 생성
    @BeforeEach
    void setUp() {
        // 테스트용 유저 3명 생성
        savedAdminUser = userRepository.save(User.builder().email("admin@test.com").password("1111").name("Admin User").role(User.Role.USER).build());
        savedMemberUser = userRepository.save(User.builder().email("member@test.com").password("1111").name("Member User").role(User.Role.USER).build());
        savedNonMemberUser = userRepository.save(User.builder().email("non@test.com").password("1111").name("Non-Member").role(User.Role.USER).build());

        // 테스트용 프로젝트 2개 생성
        savedProject1 = projectRepository.save(Project.builder().build());
        savedProject2 = projectRepository.save(Project.builder().build());

        // 테스트용 멤버십 데이터 생성
        // AdminUser는 Project1의 ADMIN
        savedMembership1 = projectMemberRepository.save(ProjectMember.builder()
                .project(savedProject1)
                .user(savedAdminUser)
                .role(ProjectRole.ADMIN)
                .build());

        // MemberUser는 Project1의 MEMBER
        projectMemberRepository.save(ProjectMember.builder()
                .project(savedProject1)
                .user(savedMemberUser)
                .role(ProjectRole.MEMBER)
                .build());

        // AdminUser는 Project2의 MEMBER
        projectMemberRepository.save(ProjectMember.builder()
                .project(savedProject2)
                .user(savedAdminUser)
                .role(ProjectRole.MEMBER)
                .build());
    }

    @Test
    @DisplayName("findMyRole: projectId와 userId로 정확한 Role을 조회한다")
    void testFindMyRole() {
        // When (ADMIN 조회)
        Optional<ProjectRole> adminRole = projectMemberRepository.findMyRole(savedProject1.getId(), savedAdminUser.getId());

        // When (MEMBER 조회)
        Optional<ProjectRole> memberRole = projectMemberRepository.findMyRole(savedProject1.getId(), savedMemberUser.getId());

        // When (멤버가 아닌 유저 조회)
        Optional<ProjectRole> noRole = projectMemberRepository.findMyRole(savedProject1.getId(), savedNonMemberUser.getId());

        // Then (검증)
        assertThat(adminRole).isPresent();
        assertThat(adminRole.get()).isEqualTo(ProjectRole.ADMIN);

        assertThat(memberRole).isPresent();
        assertThat(memberRole.get()).isEqualTo(ProjectRole.MEMBER);

        assertThat(noRole).isEmpty();
    }

    @Test
    @DisplayName("findByProjectIdAndMemberId: projectId와 userId로 ProjectMember 엔티티를 조회한다")
    void testFindByProjectIdAndMemberId() {
        // (참고: Repository의 'memberId' 파라미터는 JPQL상 'userId'를 의미함)

        // When (정상 조회)
        Optional<ProjectMember> found = projectMemberRepository.findByProjectIdAndMemberId(savedProject1.getId(), savedAdminUser.getId());

        // When (잘못된 프로젝트 ID)
        Optional<ProjectMember> notFoundProject = projectMemberRepository.findByProjectIdAndMemberId(savedProject2.getId(), savedMemberUser.getId());

        // Then (검증)
        assertThat(found).isPresent();
        assertThat(found.get().getId()).isEqualTo(savedMembership1.getId());

        assertThat(notFoundProject).isEmpty();
    }

    @Test
    @DisplayName("countAdmin: 특정 프로젝트의 ADMIN 수를 정확히 카운트한다")
    void testCountAdmin() {
        // When
        Long adminCountP1 = projectMemberRepository.countAdmin(savedProject1.getId()); // (setUp에서 1명)
        Long adminCountP2 = projectMemberRepository.countAdmin(savedProject2.getId()); // (setUp에서 0명)

        // Then
        assertThat(adminCountP1).isEqualTo(1L);
        assertThat(adminCountP2).isEqualTo(0L);
    }
}
