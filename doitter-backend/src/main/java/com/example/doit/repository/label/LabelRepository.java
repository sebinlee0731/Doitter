package com.example.doit.repository.label;

import com.example.doit.domain.label.Label;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LabelRepository extends JpaRepository<Label, Long> {

    @Query( "SELECT l FROM Label l WHERE l.project.id = :projectId")
    List<Label> findByProjectId(@Param("projectId")Long projectId);

    boolean existsByProjectIdAndName(Long projectId, String name);

    Optional<Label> findByIdAndProjectId(Long labelId, Long projectId);
}
