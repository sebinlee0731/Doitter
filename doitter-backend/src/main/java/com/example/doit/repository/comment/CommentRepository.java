package com.example.doit.repository.comment;

import com.example.doit.domain.comment.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query("SELECT c FROM Comment c WHERE c.task.id = :taskId")
    Page<Comment> findByTaskId(@Param("taskId") Long taskId, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"author", "task", "task.project"})
    Optional<Comment> findById(Long commentId);
}
