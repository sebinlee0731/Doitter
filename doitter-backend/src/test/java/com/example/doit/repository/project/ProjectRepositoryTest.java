package com.example.doit.repository.project;

import com.example.doit.domain.project.Project;
import com.example.doit.domain.project.ProjectMember;
import com.example.doit.domain.project.ProjectRole;
import com.example.doit.domain.user.User;
import com.example.doit.repository.user.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.*;

import java.util.List;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
class ProjectRepositoryTest {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;

    @Test
    @DisplayName("사용자 ID로 프로젝트 페이지 조회")
    void findProjectsByUserId() {
        // given
        User user = User.builder().email("admin@test.com").password("1111").name("Admin User").role(User.Role.USER).build();
        userRepository.save(user);

        Project project1 = Project.builder().name("Project A").build();
        Project project2 = Project.builder().name("Project B").build();
        projectRepository.saveAll(List.of(project1, project2));

        ProjectMember pm1 = ProjectMember.builder().user(user).project(project1).role(ProjectRole.MEMBER).build();
        ProjectMember pm2 = ProjectMember.builder().user(user).project(project2).role(ProjectRole.MEMBER).build();
        projectMemberRepository.saveAll(List.of(pm1, pm2));

        Pageable pageable = PageRequest.of(0, 10);

        // when
        Page<Project> result = projectRepository.findProjectsByUserId(user.getId(), pageable);

        // then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent()).extracting("name").containsExactlyInAnyOrder("Project A", "Project B");
    }
}




//package com.example.doit.repository;
//
//import com.example.doit.domain.project.Project;
//import lombok.extern.slf4j.Slf4j;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.data.domain.Pageable;
//
//@SpringBootTest
//@Slf4j
//
//public class ProjectRepositoryTest {
//    @Autowired
//    private ProjectRepository projectRepository;
//    @Test
//    public void testinsert(){
//        Project project=Project.builder()
//                .name("")
//                .description("")
//                .visibility("")
//                .status("")
//                .build();
//
//        Project resultproject = projectRepository.save(project); //세이브=저장된 객체값 다시 반환
//        log.info(resultproject.toString());
//    }
//
//    @Test
//    public void testFindPage(){
//        Long userId = 1L;
//        Pageable pageable = PageRequest.of(0, 5);
//        Page<Project> projectPage = projectRepository.findProjectsByUserId(userId, pageable );
//
//        log.info(projectPage.getContent().toString());
//
//    }
//}
