package com.example.doit.repository.stub;

import com.example.doit.domain.project.Project;
import com.example.doit.repository.project.ProjectRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Slf4j
public class ProjectRepositoryTest {

    // 해당 파일은 임시파일임으로 병합시 무시해주세요.

    @Autowired
    private ProjectRepository projectRepository;

    @Test
    public void testInsert() {

//        Project


        for (int i = 1; i < 20; i++) {

            Project project = Project.builder().build();

            Project resultProject = projectRepository.save(project);
        }
    }
}
