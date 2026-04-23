package com.example.doit.service.project;

import com.example.doit.domain.project.ProjectRole;
import com.example.doit.repository.project.ProjectMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("projectAuthService")
@Transactional(readOnly = true) // 읽기 전용이므로
@RequiredArgsConstructor
@Slf4j
public class ProjectAuthService {

    private final ProjectMemberRepository projectMemberRepository;

    /**
     * [VIEWER 이상] 읽기 권한(ADMIN, MEMBER, VIEWER) 확인
     */
    public void checkViewAccess(Long projectId, Long userId) {

        getMyRoleOrThrow(projectId, userId);
    }


    /**
     * [MEMBER 이상] 쓰기 권한(MEMBER, ADMIN) 확인
     */
    public void checkWriteAccess(Long projectId, Long userId) {
        ProjectRole myRole = getMyRoleOrThrow(projectId, userId);

        if (myRole == ProjectRole.VIEWER) {
            throw new AccessDeniedException("읽기 전용(VIEWER) 권한으로는 이 작업을 수행할 수 없습니다.");
        }
    }

    /**
     * [ADMIN 전용] 관리자(ADMIN) 확인
     */
    public void checkAdmin(Long projectId, Long userId) {
        ProjectRole myRole = getMyRoleOrThrow(projectId, userId);

        if (myRole != ProjectRole.ADMIN) {
            throw new AccessDeniedException("프로젝트 ADMIN만 작업을 수행할 수 있습니다.");
        }
    }

    /**
     * Role을 조회하고, 멤버가 아니면 403 예외 발생
     */
    private ProjectRole getMyRoleOrThrow(Long projectId, Long userId) {

        log.info("{} {}", projectId, userId);

        return projectMemberRepository.findMyRole(projectId, userId)
                .orElseThrow(() -> new AccessDeniedException("이 프로젝트의 멤버가 아닙니다."));
    }
}