package com.example.doit.service.project;

import com.example.doit.domain.project.Project;
import com.example.doit.domain.project.ProjectMember;
import com.example.doit.domain.project.ProjectRole;
import com.example.doit.domain.user.User;
import com.example.doit.dto.project.ProjectMemberAddDTO;
import com.example.doit.dto.project.ProjectMemberPatchDTO;
import com.example.doit.repository.project.ProjectMemberRepository;
import com.example.doit.repository.project.ProjectRepository;
import com.example.doit.repository.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;

@Service
@Transactional
@RequiredArgsConstructor
public class ProjectMemberService {

    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    // ProjectService에서 프로젝트 생성 된 후 실행.
    public void addInitialAdmin(Project project, Long userId) {

        User userReference = userRepository.getReferenceById(userId);

        ProjectMember projectMember = ProjectMember.builder()
                .user(userReference)
                .project(project)
                .role(ProjectRole.ADMIN)
                .joinedAt(LocalDateTime.now())
                .build();

        projectMemberRepository.save(projectMember);
    }

    public ProjectRole readMyRole(Long projectId, Long userId) {

        return projectMemberRepository.findMyRole(projectId, userId)
                .orElseThrow(() -> new AccessDeniedException("프로젝트 멤버가 아닙니다."));
    }

    public Long addMember(Long projectId, ProjectMemberAddDTO addDTO) {

        // [조회] projectId 인가 단계에서 실체 확인
        Project projectReference = projectRepository.getReferenceById(projectId);
        User user = userRepository.findById(addDTO.getMemberId())
                .orElseThrow(EntityNotFoundException::new);

        // [실행]
        ProjectMember pm = ProjectMember.builder()
                .project(projectReference)
                .user(user)
                .role(ProjectRole.VIEWER)
                .build();

        return projectMemberRepository.save(pm).getId();
    }

    public Long updateRole(Long projectId, Long memberId, ProjectMemberPatchDTO patchDTO) {

        // [조회]
        ProjectMember targetMember = projectMemberRepository.findByProjectIdAndMemberId(projectId, memberId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 유저입니다."));

        // [검증] 기존의 어드민을 강등시킬때 <- 변경할 Role이 Admin이 아니고, 타깃이 Admin 일때
        if (patchDTO.getRole() != ProjectRole.ADMIN && targetMember.getRole() == ProjectRole.ADMIN) {
            Long adminCount = projectMemberRepository.countAdmin(projectId);
            if (adminCount == 1) {
                throw new IllegalArgumentException("프로젝트에 최소한 한명의 ADMIN이 필요합니다.");
            }
        }

        // [실헹]
        targetMember.changeRole(patchDTO.getRole());

        return targetMember.getId();
    }

    public void delete(Long projectId, Long memberId) {

        // [조회]
        ProjectMember targetMember = projectMemberRepository.findByProjectIdAndMemberId(projectId, memberId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 멤버입니다."));

        // [검증] 삭제 대상이 ADMIN 일때
        if (targetMember.getRole() == ProjectRole.ADMIN) {
            Long adminCount = projectMemberRepository.countAdmin(projectId);
            if (adminCount == 1) {
                throw new IllegalArgumentException("프로젝트에 최소한 한명의 ADMIN이 필요합니다.");
            }
        }

        // [실행]
        projectMemberRepository.delete(targetMember);
    }
}
