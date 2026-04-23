package com.example.doit.service.project;

import com.example.doit.domain.project.Project;
import com.example.doit.dto.project.ProjectCreateDto;
import com.example.doit.dto.project.ProjectResponseDto;
import com.example.doit.dto.project.ProjectUpdateDto;
import com.example.doit.repository.project.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.data.domain.*;

import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private ProjectService projectService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createProject() {
        // given
        ProjectCreateDto dto = ProjectCreateDto.builder()
                .id(1L)
                .name("Test Project")
                .description("Test Description")
                .visibility("PUBLIC")
                .status("ACTIVE")
                .build();

        Project savedProject = Project.builder()
                .id(1L)
                .name(dto.getName())
                .description(dto.getDescription())
                .visibility(dto.getVisibility())
                .status(dto.getStatus())
                .build();

        when(projectRepository.save(any(Project.class))).thenReturn(savedProject);

        // when
        Project result = projectService.create(dto);

        // then
        assertThat(result.getName()).isEqualTo("Test Project");
        verify(projectRepository, times(1)).save(any(Project.class));
    }

    @Test
    void readOneProject() {
        // given
        Project project = Project.builder()
                .id(1L)
                .name("Read Project")
                .description("Read Desc")
                .visibility("PRIVATE")
                .status("IN_PROGRESS")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        // when
        ProjectResponseDto dto = projectService.readOne(1L);

        // then
        assertThat(dto.getName()).isEqualTo("Read Project");
        verify(projectRepository).findById(1L);
    }

    @Test
    void updateProject() {
        // given
        Project project = Project.builder()
                .id(1L)
                .name("Old Name")
                .description("Old Desc")
                .visibility("PRIVATE")
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        ProjectUpdateDto updateDto = ProjectUpdateDto.builder()
                .name("New Name")
                .description("New Desc")
                .visibility("PUBLIC")
                .build();

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        // when
        ProjectResponseDto updated = projectService.update(1L, updateDto);

        // then
        assertThat(updated.getName()).isEqualTo("New Name");
        verify(projectRepository).findById(1L);
    }

    @Test
    void deleteProject() {
        // given
        Long id = 1L;

        // when
        projectService.delete(id);

        // then
        verify(projectRepository, times(1)).deleteById(id);
    }

    @Test
    void readPageProjects() {
        // given
        Long userId = 1L;
        Pageable pageable = PageRequest.of(0, 5);
        Project project = Project.builder()
                .id(1L)
                .name("Paged Project")
                .description("Desc")
                .visibility("PUBLIC")
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        List<Project> projects = List.of(project);
        Page<Project> projectPage = new PageImpl<>(projects, pageable, projects.size());

        when(projectRepository.findProjectsByUserId(userId, pageable)).thenReturn(projectPage);

        // when
        Page<ProjectResponseDto> result = projectService.readPage(userId, pageable);

        // then
        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Paged Project");
        verify(projectRepository).findProjectsByUserId(userId, pageable);
    }
}





//package com.example.doit.service;

//import com.example.doit.domain.project.Project;
//import com.example.doit.dto.project.ProjectCreateDto;
//import com.example.doit.dto.project.ProjectResponseDto;
//import com.example.doit.dto.project.ProjectUpdateDto;
//import lombok.extern.slf4j.Slf4j;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.data.domain.Pageable;
//
//import java.util.Optional;

//@SpringBootTest
//@Slf4j
//public class ProjectServiceTest {
//
//    @Autowired
//    private ProjectService projectService;
//
//    @Test
//    public void create() {
//        for (int i = 1; i <= 120; i++) {
//            ProjectCreateDto projectCreateDto = ProjectCreateDto.builder()
//                    .name("프로젝트 "+i)
//                    .description("프로젝트 설명입니다")
//                    .visibility("모두공개")
//                    .status("프로젝트의 상태")
//                    .build();
//
//            Project project = projectService.create(projectCreateDto);
//            log.info(project.toString());
//        }
//    }
//
//    @Test
//    public void readOneTest() {
//        Long id = 1L;
//        ProjectResponseDto dto = projectService.readOne(id);
//
//        log.info(dto.toString());
//    }
//
//    @Test
//    public void updateTest(){
//        Long id = 1L;
//        ProjectUpdateDto projectUpdateDto = ProjectUpdateDto.builder()
//                .name("변경된 이름")
//                .description("변경된 설명")
//                .visibility("변경된 상태")
//                .build();
//        ProjectResponseDto dto = projectService.update(id, projectUpdateDto);
//
//        log.info(dto.toString());
//    }
//
//    @Test
//    public void deleteTest(){
//        Long id = 1L;
//        log.info("------");
//    }
//
//    @Test
//    public void testReadPage(){
//        Long id = 1L;
//        Pageable pageable = PageRequest.of(0, 5);
//
//       Page<ProjectResponseDto> dto = projectService.readPage(id, pageable);
//
//       log.info(dto.getContent().toString());
//    }
//}
