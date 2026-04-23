package com.example.doit.service.project;

import com.example.doit.domain.project.Project;
import com.example.doit.dto.project.ProjectCreateDto;
import com.example.doit.dto.project.ProjectResponseDto;
import com.example.doit.dto.project.ProjectUpdateDto;
import com.example.doit.repository.project.ProjectRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j

public class ProjectService {

    // 해당 파일은 임시파일임으로 병합시 무시해주세요.

    private final ProjectRepository projectRepository;
    private final ProjectMemberService projectMemberService;

    public Project create(ProjectCreateDto projectCreateDto) {
        Project project = Project.builder()
                .id(projectCreateDto.getId())
                .name(projectCreateDto.getName())
                .description(projectCreateDto.getDescription())
                .visibility(projectCreateDto.getVisibility())
                .status(projectCreateDto.getStatus())
                .build();

        Project resultProject = projectRepository.save(project);
        return resultProject;
    }

    public ProjectResponseDto readOne(Long id) {
        Optional<Project> projectOptional = projectRepository.findById(id);
        Project project = projectOptional.orElseThrow();

        ProjectResponseDto dto = ProjectResponseDto.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .visibility(project.getVisibility())
                .status(project.getStatus())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();

        return dto;
    }

    public ProjectResponseDto update(Long id, ProjectUpdateDto projectUpdateDto) {
        Optional<Project> project = projectRepository.findById(id);
        Project updateProject = project.orElseThrow(EntityNotFoundException::new);
        updateProject.changeName(projectUpdateDto.getName());
        updateProject.changeDescription(projectUpdateDto.getDescription());
        updateProject.changeVisibility(projectUpdateDto.getVisibility());

        ProjectResponseDto projectResponseDto = ProjectResponseDto.builder()
                .id(updateProject.getId())
                .name(updateProject.getName())
                .description(updateProject.getDescription())
                .visibility(updateProject.getVisibility())
                .status(updateProject.getStatus())
                .createdAt(updateProject.getCreatedAt())
                .updatedAt(updateProject.getUpdatedAt())
                .build();
        return projectResponseDto;
    }


    public void delete(Long id) {
        projectRepository.deleteById(id);
    }

    public Page<ProjectResponseDto> readPage(Long userId, Pageable pageable) {
        Page<Project> projectPage = projectRepository.findProjectsByUserId(userId, pageable);

        Page<ProjectResponseDto> dtoPage = projectPage.map(project -> ProjectResponseDto.builder()
                .id(project.getId())
                .updatedAt(project.getUpdatedAt())
                .visibility(project.getVisibility())
                .status(project.getStatus())
                .name(project.getName())
                .createdAt(project.getCreatedAt())
                .description(project.getDescription())
                .build());

        return dtoPage;
    }
}
