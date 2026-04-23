package com.example.doit.controller.label;

import com.example.doit.dto.common.ApiResponseDTO;
import com.example.doit.dto.label.LabelCreateDTO;
import com.example.doit.dto.label.LabelResponseDTO;
import com.example.doit.dto.label.LabelUpdateDTO;
import com.example.doit.service.label.LabelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/rest/v1/")
@Slf4j
public class LabelController {

    private final LabelService labelService;

    // LB-01-01 라벨 생성
    @PreAuthorize("@projectAuthService.checkAdmin(#projectId, principal.userId)")
    @PostMapping("projects/{projectId}/labels")
    public ResponseEntity<ApiResponseDTO<Long>> create(
            @PathVariable("projectId") Long projectId,
            @Valid @RequestBody LabelCreateDTO labelCreateDTO){

        Long labelId = labelService.create(projectId, labelCreateDTO);

        ApiResponseDTO<Long> response = ApiResponseDTO.success("라벨 생성 완료", labelId);

        return ResponseEntity.ok(response);
    }

    // LB-01-02 라벨 목록
    @PreAuthorize("@projectAuthService.checkViewAccess(#projectId, principal.userId)")
    @GetMapping("projects/{projectId}/labels")
    public ResponseEntity<ApiResponseDTO<List<LabelResponseDTO>>> readList(
            @PathVariable("projectId") Long projectId){

        List<LabelResponseDTO> labelResponseDTOList = labelService.readList(projectId);

        ApiResponseDTO<List<LabelResponseDTO>> response = ApiResponseDTO.success("라벨 목록 조회", labelResponseDTOList);

        return ResponseEntity.ok(response);
    }

    //LB-01-03 라벨 수정 // 받을값 : id값, 이름, 색
    @PreAuthorize("@projectAuthService.checkAdmin(#projectId, principal.userId)")
    @PatchMapping("projects/{projectId}/labels/{labelId}")
    public ResponseEntity<ApiResponseDTO<Long>> update(
            @PathVariable("projectId") Long projectId,
            @PathVariable("labelId") Long labelId,
            @Valid @RequestBody LabelUpdateDTO labelUpdateDTO){

        Long LabelId = labelService.update(labelId, labelUpdateDTO);

        ApiResponseDTO<Long> response = ApiResponseDTO.success("라벨 수정", LabelId);

        return ResponseEntity.ok(response);
    }

    //LB-01-04 라벨 삭제
    @PreAuthorize("@projectAuthService.checkAdmin(#projectId, principal.userId)")
    @DeleteMapping("projects/{projectId}/labels/{labelId}")
    public ResponseEntity<ApiResponseDTO<Void>> delete(
            @PathVariable("projectId") Long projectId,
            @PathVariable("labelId") Long labelId){

        labelService.delete(projectId, labelId);

        ApiResponseDTO<Void> response = ApiResponseDTO.success("라벨 삭제");

        return ResponseEntity.ok(response);
    }

}
