package com.example.doit.controller.comment;

import com.example.doit.dto.common.ApiResponseDTO;
import com.example.doit.dto.comment.CommentCreateDTO;
import com.example.doit.dto.comment.CommentResponseDTO;
import com.example.doit.dto.comment.CommentUpdateDTO;
import com.example.doit.service.comment.CommentService;
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
public class CommentController {

    private final CommentService commentService;

    // CM-01-01 코멘트 생성
    @PreAuthorize("@projectAuthService.checkWriteAccess(#projectId, #loggedInUserId)")
    @PostMapping("/projects/{projectId}/tasks/{taskId}/comments")
    public ResponseEntity<ApiResponseDTO<Long>> create(
            @AuthenticationPrincipal(expression = "userId") Long loggedInUserId,
            @PathVariable Long projectId,
            @PathVariable Long taskId,
            @Valid @RequestBody CommentCreateDTO commentCreateDTO) {

        Long CommentId = commentService.create(loggedInUserId, taskId, commentCreateDTO);

        ApiResponseDTO<Long> response = ApiResponseDTO.success("코멘트 작성 완료", CommentId);

        return ResponseEntity.ok(response);
    }

    // CM-01-02 코멘트 목록
    @PreAuthorize("@projectAuthService.checkViewAccess(#projectId, principal.userId)")
    @GetMapping("projects/{projectId}/tasks/{taskId}/comments")
    public ResponseEntity<ApiResponseDTO<List<CommentResponseDTO>>> readList(
            @PathVariable("projectId") Long projectId,
            @PathVariable("taskId") Long taskId,
            @PageableDefault(
                    page = 0, size = 10,
                    sort = "createdAt", direction = Sort.Direction.DESC
            ) Pageable pageable) {

        Page<CommentResponseDTO> commentDTOPage = commentService.readList(taskId, pageable);

        ApiResponseDTO<List<CommentResponseDTO>> response = ApiResponseDTO.success("코멘트 목록", commentDTOPage);

        return ResponseEntity.ok(response);
    }

    // CM-01-03 코멘트 수정
    @PatchMapping("comments/{commentId}")
    public ResponseEntity<ApiResponseDTO<Long>> update(
            @AuthenticationPrincipal(expression = "userId") Long loggedInUserId,
            @PathVariable("commentId") Long commentId,
            @Valid @RequestBody CommentUpdateDTO commentUpdateDTO) {

        Long changedCommentId = commentService.update(loggedInUserId, commentId, commentUpdateDTO);

        ApiResponseDTO<Long> response = ApiResponseDTO.success("코멘트 수정 완료", changedCommentId);

        return ResponseEntity.ok(response);
    }

    // CM-01-04 코멘트 삭제
    @DeleteMapping("comments/{commentId}")
    public ResponseEntity<ApiResponseDTO<Void>> delete(
            @AuthenticationPrincipal(expression = "userId") Long loggedInUserId,
            @PathVariable("commentId") Long commentId) {

        commentService.delete(loggedInUserId, commentId);

        ApiResponseDTO<Void> response = ApiResponseDTO.success("코멘트 삭제");

        return ResponseEntity.ok(response);
    }
}
