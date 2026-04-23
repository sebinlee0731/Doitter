package com.example.doit.repository.task;

import com.example.doit.domain.task.TaskLabel;
import com.example.doit.domain.task.TaskLabelId;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TaskLabelRepository extends JpaRepository<TaskLabel, TaskLabelId> {

    @EntityGraph(attributePaths = {"label"})
    @Query("SELECT tl FROM TaskLabel tl WHERE tl.task.id = :taskId")
    List<TaskLabel> findListByTaskId(@Param("taskId") Long taskId);

    @EntityGraph(attributePaths = {"label"})
    @Query("SELECT tl FROM TaskLabel tl WHERE tl.task.id IN :taskIdList")
    List<TaskLabel> findByTaskIdList(@Param("taskIdList") List<Long> taskIdList);

    @Modifying
    @Query("DELETE FROM TaskLabel tl WHERE tl.task.id = :taskId")
    void deleteByTaskId(@Param("taskId") Long taskId);
}
