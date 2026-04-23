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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class) // 1. Mockito 사용
class ProjectMemberServiceTest {

    @Mock private ProjectMemberRepository projectMemberRepository;
    @Mock private UserRepository userRepository;
    @Mock private ProjectRepository projectRepository;

    @InjectMocks // 2. Mock들을 Service에 주입
    private ProjectMemberService projectMemberService;

    // --- 테스트용 공통 더미 데이터 ---
    private User mockUser;
    private User mockMemberUser;
    private Project mockProject;
    private ProjectMember mockAdminMember;
    private ProjectMember mockMemberMember;
    private final Long projectId = 1L;
    private final Long userId = 10L;
    private final Long memberUserId = 10L;
    private final Long adminMemberId = 100L; // ProjectMember의 ID
    private final Long memberMemberId = 101L;

    @BeforeEach
    void setUp() {
        mockUser = User.builder().name("Test User").build();
        ReflectionTestUtils.setField(mockUser, "id", userId);

        mockProject = Project.builder().build();
        ReflectionTestUtils.setField(mockProject, "id", projectId);

        mockAdminMember = ProjectMember.builder()
                .project(mockProject)
                .user(mockUser)
                .role(ProjectRole.ADMIN)
                .build();
        ReflectionTestUtils.setField(mockAdminMember, "id", adminMemberId);

        mockMemberMember = ProjectMember.builder()
                .project(mockProject)
                .user(mockMemberUser)
                .role(ProjectRole.MEMBER)
                .build();
        ReflectionTestUtils.setField(mockMemberMember, "id", memberMemberId);
    }

    @Test
    @DisplayName("addInitialAdmin: 프로젝트 생성시 ADMIN을 성공적으로 추가한다")
    void testAddInitialAdmin() {
        // Given (준비)
        given(userRepository.getReferenceById(userId)).willReturn(mockUser);

        // save에 전달될 객체를 캡처하기 위한 ArgumentCaptor
        ArgumentCaptor<ProjectMember> captor = ArgumentCaptor.forClass(ProjectMember.class);

        // When (실행)
        projectMemberService.addInitialAdmin(mockProject, userId);

        // Then (검증)
        // 1. ⭐️ 'save'가 호출되었는지,
        // 2. ⭐️ 전달된 객체의 'role'이 ADMIN인지, 'joinedAt'이 null이 아닌지 검증
        verify(projectMemberRepository).save(captor.capture());
        assertThat(captor.getValue().getRole()).isEqualTo(ProjectRole.ADMIN);
        assertThat(captor.getValue().getJoinedAt()).isNotNull();
    }

    @Test
    @DisplayName("readMyRole: 멤버의 Role을 정확히 반환한다")
    void testReadMyRoleSuccess() {
        // Given
        given(projectMemberRepository.findMyRole(projectId, userId)).willReturn(Optional.of(ProjectRole.ADMIN));

        // When
        ProjectRole role = projectMemberService.readMyRole(projectId, userId);

        // Then
        assertThat(role).isEqualTo(ProjectRole.ADMIN);
    }

    @Test
    @DisplayName("readMyRole: 멤버가 아닐 경우 403 예외를 던진다")
    void testReadMyRoleFailNotMember() {
        // Given
        given(projectMemberRepository.findMyRole(projectId, userId)).willReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> projectMemberService.readMyRole(projectId, userId))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("멤버가 아닙니다");
    }

    @Test
    @DisplayName("addMember: 새 멤버(VIEWER)를 성공적으로 추가한다")
    void testAddMemberSuccess() {
        // Given
        Long newMemberId = 20L;
        ProjectMemberAddDTO dto = ProjectMemberAddDTO.builder().memberId(newMemberId).build();
        User newMockUser = User.builder().name("New Member").build();
        ReflectionTestUtils.setField(newMockUser, "id", newMemberId);

        given(projectRepository.getReferenceById(projectId)).willReturn(mockProject);
        given(userRepository.findById(newMemberId)).willReturn(Optional.of(newMockUser));

        // 'save'가 호출되면 ID(101L)를 반환하도록 가정
        given(projectMemberRepository.save(any(ProjectMember.class))).willAnswer(invocation -> {
            ProjectMember pm = invocation.getArgument(0);
            ReflectionTestUtils.setField(pm, "id", 101L);
            return pm;
        });

        // 'save'에 전달된 객체 캡처
        ArgumentCaptor<ProjectMember> captor = ArgumentCaptor.forClass(ProjectMember.class);

        // When
        Long newPmId = projectMemberService.addMember(projectId, dto);

        // Then
        assertThat(newPmId).isEqualTo(101L);
        // ⭐️ 'addMember' 로직에 따라 'VIEWER'로 저장되었는지 검증
        verify(projectMemberRepository).save(captor.capture());
        assertThat(captor.getValue().getRole()).isEqualTo(ProjectRole.VIEWER);
    }

    @Test
    @DisplayName("addMember: 초대할 유저가 존재하지 않으면 404 예외를 던진다")
    void testAddMemberFailUserNotFound() {
        // Given
        ProjectMemberAddDTO dto = ProjectMemberAddDTO.builder().memberId(999L).build();

        // ⭐️ 'userRepository.findById'가 빈 Optional 반환
        given(userRepository.findById(999L)).willReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> projectMemberService.addMember(projectId, dto))
                .isInstanceOf(EntityNotFoundException.class);

        // ⭐️ 'save'는 절대 호출되면 안 됨
        verify(projectMemberRepository, never()).save(any(ProjectMember.class));
    }

    @Test
    @DisplayName("updateRole: 멤버의 역할을 성공적으로 변경한다 (더티 체킹)")
    void testUpdateRoleSuccess() {
        // Given
        ProjectMemberPatchDTO dto = ProjectMemberPatchDTO.builder().role(ProjectRole.MEMBER).build();

        // 1. ⭐️ 'findByProjectIdAndMemberId'가 'mockAdminMember' (기존 ADMIN) 반환
        given(projectMemberRepository.findByProjectIdAndMemberId(projectId, adminMemberId)).willReturn(Optional.of(mockAdminMember));

        // 2. ⭐️ 'countAdmin'은 1명 이상(예: 2명)이라고 가정
        given(projectMemberRepository.countAdmin(projectId)).willReturn(2L);

        // When
        Long updatedId = projectMemberService.updateRole(projectId, adminMemberId, dto);

        // Then
        assertThat(updatedId).isEqualTo(adminMemberId);
        // 3. ⭐️ 'mockAdminMember' 객체의 'role'이 MEMBER로 변경되었는지 (더티 체킹 검증)
        assertThat(mockAdminMember.getRole()).isEqualTo(ProjectRole.MEMBER);
    }

    @Test
    @DisplayName("updateRole: 마지막 ADMIN을 강등시키려 하면 400 예외를 던진다")
    void testUpdateRoleFailLastAdmin() {
        // Given
        ProjectMemberPatchDTO dto = ProjectMemberPatchDTO.builder().role(ProjectRole.MEMBER).build(); // ⭐️ 강등 시도

        given(projectMemberRepository.findByProjectIdAndMemberId(projectId, adminMemberId)).willReturn(Optional.of(mockAdminMember));

        // 1. ⭐️ 'countAdmin'이 1명이라고 '가정'
        given(projectMemberRepository.countAdmin(projectId)).willReturn(1L);

        // When & Then
        // 2. ⭐️ 'IllegalArgumentException' 예외 검증
        assertThatThrownBy(() -> projectMemberService.updateRole(projectId, adminMemberId, dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("최소한 한명의 ADMIN");

        // 3. ⭐️ 객체의 'role'이 변경되지 않았는지 검증
        assertThat(mockAdminMember.getRole()).isEqualTo(ProjectRole.ADMIN);
    }

    @Test
    @DisplayName("updateRole: 'MEMBER'를 'VIEWER'로 변경할 땐 countAdmin을 호출하지 않는다")
    void testUpdateRoleSuccessNoAdminCheck() {
        // Given
        // 1. ⭐️ 'ADMIN'이 아닌 'MEMBER'로 Role 변경
        ReflectionTestUtils.setField(mockAdminMember, "role", ProjectRole.MEMBER);
        ProjectMemberPatchDTO dto = ProjectMemberPatchDTO.builder().role(ProjectRole.VIEWER).build();

        given(projectMemberRepository.findByProjectIdAndMemberId(projectId, adminMemberId)).willReturn(Optional.of(mockAdminMember));

        // (countAdmin Mocking 불필요)

        // When
        projectMemberService.updateRole(projectId, adminMemberId, dto);

        // Then
        // 2. ⭐️ 'countAdmin'이 '절대' 호출되지 않았는지 검증 (if문 분기 검증)
        verify(projectMemberRepository, never()).countAdmin(anyLong());
        assertThat(mockAdminMember.getRole()).isEqualTo(ProjectRole.VIEWER);
    }

    @Test
    @DisplayName("delete: 멤버(MEMBER)를 성공적으로 삭제한다")
    void testDeleteSuccessAsMember() {
        // Given (준비)
        // 1. [Mocking] 'findByProjectIdAndMemberId'가 'mockMemberMember'를 반환하도록 '가정'
        //    (주의: findByProjectIdAndMemberId의 2번째 파라미터가 ProjectMember PK라고 가정)
        given(projectMemberRepository.findByProjectIdAndMemberId(projectId, memberMemberId))
                .willReturn(Optional.of(mockMemberMember));

        // When (실행)
        projectMemberService.delete(projectId, memberMemberId);

        // Then (검증)
        // 2. ⭐️ [검증] 'if (targetMember.getRole() == ADMIN)' 분기(if문)를 건너뛰었으므로,
        //    'countAdmin'은 '절대' 호출되면 안 됨
        verify(projectMemberRepository, never()).countAdmin(anyLong());

        // 3. ⭐️ [검증] 'delete'가 'mockMemberMember' 객체로 1번 호출되었는지
        verify(projectMemberRepository).delete(mockMemberMember);
    }

    @Test
    @DisplayName("delete: 여러 ADMIN 중 한 명을 성공적으로 삭제한다")
    void testDeleteSuccessAsAdminWhenNotLast() {
        // Given (준비)
        // 1. [Mocking] 'findByProjectIdAndMemberId'가 'mockAdminMember'를 반환
        given(projectMemberRepository.findByProjectIdAndMemberId(projectId, adminMemberId))
                .willReturn(Optional.of(mockAdminMember));

        // 2. ⭐️ [Mocking] 'countAdmin'이 1명 이상(예: 2명)을 반환
        given(projectMemberRepository.countAdmin(projectId)).willReturn(2L);

        // When (실행)
        projectMemberService.delete(projectId, adminMemberId);

        // Then (검증)
        // 3. ⭐️ [검증] 'countAdmin'이 호출되었는지
        verify(projectMemberRepository).countAdmin(projectId);

        // 4. ⭐️ [검증] 'delete'가 성공적으로 호출되었는지
        verify(projectMemberRepository).delete(mockAdminMember);
    }

    @Test
    @DisplayName("delete: 마지막 ADMIN을 삭제하려 하면 400 예외를 던진다")
    void testDeleteFailWhenLastAdmin() {
        // Given (준비)
        // 1. [Mocking] 'findByProjectIdAndMemberId'가 'mockAdminMember'를 반환
        given(projectMemberRepository.findByProjectIdAndMemberId(projectId, adminMemberId))
                .willReturn(Optional.of(mockAdminMember));

        // 2. ⭐️ [Mocking] 'countAdmin'이 1명을 반환
        given(projectMemberRepository.countAdmin(projectId)).willReturn(1L);

        // When & Then (실행 및 검증)
        // 3. ⭐️ [검증] 'IllegalArgumentException' 예외가 발생하는지
        assertThatThrownBy(() -> projectMemberService.delete(projectId, adminMemberId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("최소한 한명의 ADMIN이 필요합니다.");

        // 4. ⭐️ [검증] 'delete'는 절대 호출되면 안 됨
        verify(projectMemberRepository, never()).delete(any(ProjectMember.class));
    }

    @Test
    @DisplayName("delete: 존재하지 않는 멤버를 삭제하려 하면 404 예외를 던진다")
    void testDeleteFailWhenMemberNotFound() {
        // Given (준비)
        Long invalidMemberId = 999L;

        // 1. ⭐️ [Mocking] 'findByProjectIdAndMemberId'가 빈 Optional을 반환
        given(projectMemberRepository.findByProjectIdAndMemberId(projectId, invalidMemberId))
                .willReturn(Optional.empty());

        // When & Then (실행 및 검증)
        // 2. ⭐️ [검증] 'EntityNotFoundException' 예외가 발생하는지
        assertThatThrownBy(() -> projectMemberService.delete(projectId, invalidMemberId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("존재하지 않는 멤버입니다.");
    }
}