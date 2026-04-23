package com.example.doit.repository.project;

import com.example.doit.domain.project.ProjectMember;
import com.example.doit.domain.project.ProjectRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    @Query("SELECT pm.role FROM ProjectMember pm WHERE pm.project.id = :projectId AND pm.user.id = :userId")
    Optional<ProjectRole> findMyRole(@Param("projectId")Long projectId,@Param("userId") Long userId);

    @Query("SELECT pm FROM ProjectMember pm WHERE pm.project.id = :projectId AND pm.user.id = :memberId")
    Optional<ProjectMember> findByProjectIdAndMemberId(@Param("projectId")Long projectId, @Param("memberId")Long memberId);

    @Query("SELECT COUNT(pm) FROM ProjectMember pm WHERE pm.project.id = :projectId AND pm.role = 'ADMIN'")
    Long countAdmin(@Param("projectId")Long projectId);
}
