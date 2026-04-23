package com.example.doit.service.comment;

import com.example.doit.domain.comment.Comment;
import com.example.doit.domain.project.ProjectRole;
import com.example.doit.domain.task.Task;
import com.example.doit.domain.user.User;
import com.example.doit.dto.comment.CommentCreateDTO;
import com.example.doit.dto.comment.CommentResponseDTO;
import com.example.doit.dto.comment.CommentUpdateDTO;
import com.example.doit.repository.comment.CommentRepository;
import com.example.doit.repository.project.ProjectMemberRepository;
import com.example.doit.repository.task.TaskRepository;
import com.example.doit.repository.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;

    public Long create(Long loggedInUserId, Long taskId, CommentCreateDTO commentCreateDTO) {

        // [조회]
        User AuthorReference = userRepository.getReferenceById(loggedInUserId);
        Task taskReference = taskRepository.findById(taskId)
                .orElseThrow(EntityNotFoundException::new);

        // [실행]
        Comment comment = Comment.builder()
                .author(AuthorReference)
                .body(commentCreateDTO.getBody())
                .task(taskReference)
                .build();

        return commentRepository.save(comment).getId();
    }

    public Page<CommentResponseDTO> readList(Long taskId, Pageable pageable) {

        // [조회]
        Page<Comment> commentPage = commentRepository.findByTaskId(taskId, pageable);

        // [실행]
        return commentPage.map(comment -> {

            boolean edited = !comment.getCreatedAt().equals(comment.getUpdatedAt());

            return CommentResponseDTO.builder()
                    .commentId(comment.getId())
                    .body(comment.getBody())
                    .authorId(comment.getAuthor().getId())
                    .authorName(comment.getAuthor().getName())
                    .createdAt(comment.getCreatedAt())
                    .updatedAt(comment.getUpdatedAt())
                    .isEdited(edited)
                    .build();
        });
    }

    public Long update(Long loggedInUserId, Long commentId, CommentUpdateDTO commentUpdateDTO) {

        // [조회]
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(EntityNotFoundException::new);

        // [검증]
        boolean isAdmin = isAdmin(comment.getTask().getProject().getId(), loggedInUserId);
        boolean isAuthor = comment.getAuthor().getId().equals(loggedInUserId);

        if (!isAdmin && !isAuthor) {
            throw new AccessDeniedException("권한이 없습니다.");
        }

        // [실행]
        comment.changeBody(commentUpdateDTO.getBody());

        return comment.getId();
    }

    public void delete(Long loggedInUserId, Long commentId) {

        // [조회] 삭제할 코멘트를 DB에서 조회합니다.
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("삭제할 코멘트가 존재하지 않습니다."));

        // [검증]
        boolean isAdmin = isAdmin(comment.getTask().getProject().getId(), loggedInUserId);
        boolean isAuthor = comment.getAuthor().getId().equals(loggedInUserId);

        if (!isAdmin && !isAuthor) {
            throw new AccessDeniedException("권한이 없습니다.");
        }

        // [실행]
        commentRepository.deleteById(commentId);
    }

    private boolean isAdmin(Long projectId, Long loggedInUserId) {
        ProjectRole myRole = projectMemberRepository.findMyRole(projectId, loggedInUserId)
                .orElse(null);
        return myRole == ProjectRole.ADMIN;
    }
}
