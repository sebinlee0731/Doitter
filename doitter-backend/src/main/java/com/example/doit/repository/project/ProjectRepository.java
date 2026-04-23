package com.example.doit.repository.project;

import com.example.doit.domain.project.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query("SELECT pm.project FROM ProjectMember pm WHERE pm.user.id = :userId")
    Page<Project> findProjectsByUserId(@Param("userId") Long userId, Pageable pageable);
}
