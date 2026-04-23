package com.example.doit.controller.project;

import com.example.doit.domain.project.ProjectRole;
import com.example.doit.dto.common.ApiResponseDTO;
import com.example.doit.dto.project.ProjectMemberAddDTO;
import com.example.doit.dto.project.ProjectMemberPatchDTO;
import com.example.doit.service.project.ProjectMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/rest/v1/")
@RequiredArgsConstructor
@Slf4j
public class ProjectMemberController {

    private final ProjectMemberService projectMemberService;

    // AU-04-01 내 권한 조회
    // @PreAuthorize("@projectAuthService.checkViewAccess(#projectId, #userId)") 내부 로직에서 검증하기에 불필요
    @GetMapping("projects/{projectId}/roles/me")
    public ResponseEntity<ApiResponseDTO<ProjectRole>> readMyRole(
            @PathVariable Long projectId,
            @AuthenticationPrincipal(expression = "userId") Long userId) {

        ProjectRole role = projectMemberService.readMyRole(projectId, userId);

        ApiResponseDTO<ProjectRole> response = ApiResponseDTO.success("내 권한 조회", role);

        return ResponseEntity.ok(response);
    }

    // AU-04-02 멤버추가 ( 권한 부여 )
    // 멤버 추가는 invite 실행시 실행되도록 트랜잭션 ?
    @PreAuthorize("@projectAuthService.checkAdmin(#projectId, principal.userId)")
    @PostMapping("projects/{projectId}/members")
    public ResponseEntity<ApiResponseDTO<Long>> addMember(
            @PathVariable Long projectId,
            @Valid @RequestBody ProjectMemberAddDTO addDTO
    ) {

        Long resultId = projectMemberService.addMember(projectId, addDTO);

        ApiResponseDTO<Long> response = ApiResponseDTO.success("멤버 추가", resultId);

        return ResponseEntity.ok(response);
    }


    // AU-04-03 멤버 권한 변경/제거
    @PreAuthorize("@projectAuthService.checkAdmin(#projectId, principal.userId)")
    @PatchMapping("projects/{projectId}/members/{memberId}")
    public ResponseEntity<ApiResponseDTO<Long>> updateRole(
            @PathVariable Long projectId,
            @PathVariable Long memberId,
            @Valid @RequestBody ProjectMemberPatchDTO patchDTO) {

        Long changedMemberId = projectMemberService.updateRole(projectId, memberId, patchDTO);

        ApiResponseDTO<Long> response = ApiResponseDTO.success("멤버 권한 변경", changedMemberId);

        return ResponseEntity.ok(response);
    }

    // AU-04-04 멤버 제거
    @PreAuthorize("@projectAuthService.checkAdmin(#projectId, principal.userId)")
    @DeleteMapping("projects/{projectId}/members/{memberId}")
    public ResponseEntity<ApiResponseDTO<Void>> delete(
            @PathVariable Long projectId,
            @PathVariable Long memberId) {

        projectMemberService.delete(projectId, memberId);

        ApiResponseDTO<Void> response = ApiResponseDTO.success("멤버 제거");

        return ResponseEntity.ok(response);
    }
}
