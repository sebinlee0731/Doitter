package com.example.doit.repository.task;

import com.example.doit.domain.task.Task;
import com.example.doit.domain.task.TaskState;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {

    @EntityGraph(attributePaths = {"user", "project"})
    @Query("SELECT t FROM Task t WHERE t.project.id = :projectId")
    Page<Task> readPage(@Param("projectId") Long projectId, Pageable pageable);

    @Query("SELECT MAX(t.orderIndex) FROM Task t WHERE t.project.id = :projectId AND t.state = :state")
    Optional<Integer> findMaxOrderIndex(@Param("projectId")Long projectId,@Param("state") TaskState state);

    @Override
    @EntityGraph(attributePaths = {"user", "project"})
    Optional<Task> findById(Long taskId);
}