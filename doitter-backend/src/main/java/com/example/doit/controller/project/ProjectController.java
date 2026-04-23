package com.example.doit.controller.project;

import com.example.doit.domain.project.Project;
import com.example.doit.dto.project.ProjectCreateDto;
import com.example.doit.dto.project.ProjectResponseDto;
import com.example.doit.dto.project.ProjectUpdateDto;
import com.example.doit.dto.common.ApiResponseDTO;
import com.example.doit.service.project.ProjectMemberService;
import com.example.doit.service.project.ProjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("/rest/v1")
@Slf4j
public class ProjectController {

    private final ProjectService projectService;
    private final ProjectMemberService projectMemberService;

    @PostMapping("projects")
    public ResponseEntity<ApiResponseDTO<Project>> resister(@RequestBody ProjectCreateDto projectCreateDto) {
        Project project = projectService.create(projectCreateDto);
        ApiResponseDTO<Project> response = ApiResponseDTO.success("새 프로젝트 생성", project);
        return ResponseEntity.ok(response);

    }

    @GetMapping("projects/{projectId}")
    public ResponseEntity<ApiResponseDTO<ProjectResponseDto>> readOne(@PathVariable("projectId") Long projectId) {
        ProjectResponseDto projectResponseDto = projectService.readOne(projectId);
        ApiResponseDTO<ProjectResponseDto> response = ApiResponseDTO.success("프로젝트 상세 내용", projectResponseDto);
        return ResponseEntity.ok(response);
    }

    @PutMapping("projects/{projectId}")
    public ResponseEntity<ApiResponseDTO<ProjectResponseDto>> update(@PathVariable("projectId") Long projectId, @RequestBody ProjectUpdateDto projectUpdateDto) {
        ProjectResponseDto projectResponseDto = projectService.update(projectId, projectUpdateDto);
        ApiResponseDTO<ProjectResponseDto> response = ApiResponseDTO.success("수정된 내용", projectResponseDto);
        return ResponseEntity.ok(response);
    }


    // 프로젝트를 생성하면, 생성 유저의 id값으로 admin이 되도록 최초로 생성한다.
    @DeleteMapping("projects/{projectId}")
    public ResponseEntity<ApiResponseDTO<Void>> delete(@PathVariable("projectId") Long projectId) {
        projectService.delete(projectId);
        ApiResponseDTO<Void> response = ApiResponseDTO.success("삭제된 내용입니다");
        return ResponseEntity.ok(response);
    }


    @GetMapping("projects/userId/{userId}")
    public ResponseEntity<ApiResponseDTO<List<ProjectResponseDto>>> readPage(
            @PathVariable("userId") Long userId,
            @PageableDefault(page = 0, size = 5, direction = Sort.Direction.DESC, sort = "id") Pageable pageable)

    {
        Page<ProjectResponseDto> dto = projectService.readPage(userId, pageable);

        ApiResponseDTO<List<ProjectResponseDto>> response = ApiResponseDTO.success("페이지 결과", dto);

        return ResponseEntity.ok(response);
    }

}

