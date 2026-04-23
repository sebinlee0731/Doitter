package com.example.doit.controller.task;

import com.example.doit.domain.task.TaskLabelId;
import com.example.doit.dto.common.ApiResponseDTO;
import com.example.doit.dto.label.LabelIdRequestDTO;
import com.example.doit.dto.task.*;
import com.example.doit.service.task.TaskLabelService;
import com.example.doit.service.task.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rest/v1/")
@RequiredArgsConstructor
@Slf4j
public class TaskController {

    private final TaskService taskService;
    private final TaskLabelService taskLabelService;

    //TS-01-01 태스크 생성
    @PreAuthorize("@projectAuthService.checkWriteAccess(#projectId, principal.userId)")// principal.id 로 대체?
    @PostMapping("projects/{projectId}/tasks")
    public ResponseEntity<ApiResponseDTO<Long>> create(
            @PathVariable("projectId") Long projectId,
            @Valid @RequestBody TaskCreateDTO taskCreateDTO) {

        Long taskId = taskService.create(projectId, taskCreateDTO);

        ApiResponseDTO<Long> response = ApiResponseDTO.success("테스크 생성 완료", taskId);

        return ResponseEntity.ok(response);
    }

    //TS-01-02 태스크 상세
    @PreAuthorize("@projectAuthService.checkViewAccess(#projectId, principal.userId)")
    @GetMapping("/projects/{projectId}/tasks/{taskId}")
    public ResponseEntity<ApiResponseDTO<TaskDetailResponseDTO>> readDetail(
            @PathVariable("projectId") Long projectId,
            @PathVariable("taskId") Long taskId) {

        TaskDetailResponseDTO taskDTO = taskService.getTaskWithLabels(taskId);

        ApiResponseDTO<TaskDetailResponseDTO> response = ApiResponseDTO.success("태스트 상세보기", taskDTO);

        return ResponseEntity.ok(response);
    }

    //TS-01-03 태스크 수정
    @PatchMapping("tasks/{taskId}")
    public ResponseEntity<ApiResponseDTO<Long>> update(
            @AuthenticationPrincipal(expression = "userId") Long loggedInUserId,
            @PathVariable("taskId") Long taskId,
            @Valid @RequestBody TaskUpdateDTO taskUpdateDTO) {

        Long changedTaskId = taskService.update(loggedInUserId, taskId, taskUpdateDTO);

        ApiResponseDTO<Long> response = ApiResponseDTO.success("수정 완료", changedTaskId);

        return ResponseEntity.ok(response);
    }

    //TS-01-04 태스크 삭제
    @DeleteMapping("tasks/{taskId}")
    public ResponseEntity<ApiResponseDTO<Void>> delete(
            @AuthenticationPrincipal(expression = "userId") Long loggedInUserId,
            @PathVariable("taskId") Long taskId) {

        taskService.delete(loggedInUserId, taskId);

        ApiResponseDTO<Void> response = ApiResponseDTO.success("태스크 삭제");

        return ResponseEntity.ok(response);
    }

    //TS-02-01 태스크 목록(칸반/보드)
    @PreAuthorize("@projectAuthService.checkViewAccess(#projectId, principal.userId)")
    @GetMapping("projects/{projectId}/tasks")
    public ResponseEntity<ApiResponseDTO<List<TaskResponseDTO>>> readPage(
            @PathVariable("projectId") Long projectId,
            @PageableDefault(
                    page = 0, size = 10,
                    sort = "createdAt", direction = Sort.Direction.DESC
            ) Pageable pageable) {

        Page<TaskResponseDTO> TaskDTOPage = taskService.readPage(projectId, pageable);

        ApiResponseDTO<List<TaskResponseDTO>> response = ApiResponseDTO.success("태스크 목록 페이지 조회", TaskDTOPage);

        return ResponseEntity.ok(response);
    }

    //TS-02-02 태스크 상태 순서 변경
    @PreAuthorize("@projectAuthService.checkWriteAccess(#projectId, principal.userId)")
    @PatchMapping("projects/{projectId}/tasks/status")
    public ResponseEntity<ApiResponseDTO<Void>> updateStatus(
            @PathVariable("projectId") Long projectId,
            @Valid @RequestBody List<TaskPatchDTO> taskPatchDTOList) {

        taskService.patchState(taskPatchDTOList);

        ApiResponseDTO<Void> response = ApiResponseDTO.success("상태 변경 완료");

        return ResponseEntity.ok(response);
    }

    // LB-01-05 태스크 라벨 세팅
    @PreAuthorize("@projectAuthService.checkWriteAccess(#projectId, principal.userId)")
    @PostMapping("projects/{projectId}/tasks/{taskId}/labels")
    public ResponseEntity<ApiResponseDTO<List<TaskLabelId>>> setLabel(
            @PathVariable("projectId") Long projectId,
            @PathVariable("taskId") Long taskId,
            @RequestBody LabelIdRequestDTO labelIds) {

        List<TaskLabelId> result = taskLabelService.setLabel(taskId, labelIds);

        ApiResponseDTO<List<TaskLabelId>> response = ApiResponseDTO.success("라벨이 적용되었습니다.", result);

        return ResponseEntity.ok(response);
    }
}
