import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Outlet, NavLink, useParams, useNavigate } from 'react-router-dom';
import NewProject from '../modal/NewProject';
import MemberAdminModal from '../modal/MemberAdminModal';
import ActivityLogModal from '../modal/ActivityLogModal';
import SettingsModal from '../modal/SettingsModal';
import DelegateAdminModal from "../modal/DelegateAdminModal";
import ConfirmModal from "../components/ConfirmModal";
import { ReactComponent as MdiAccount } from '../icons/mdi_account.svg';
import { ReactComponent as IcRoundPlus } from '../icons/ic_round-plus.svg';
import { ReactComponent as TablerBell } from '../icons/tabler_bell.svg';
import type { Project, User, Activity } from '../App';

function apiDeleteUser(email: string) {
    return new Promise(resolve => setTimeout(resolve, 300));
}

const PREDEFINED_COLORS = [
    '#FF6B6B','#FF8B6B','#FFAA88','#FFCF56','#F7B733','#FEC771',
    '#4ECDC4','#26A69A','#45B7D1','#5AA9E6','#77A1D3','#A18CD1',
    '#B2CC83','#9ED28F','#C6E377','#D4E157','#A0D468','#7CC576',
    '#FD9644','#F57C00','#E684AE','#D63384','#C2185B','#9C27B0',
];

const getMemberColor = (id: string) => {
    const key = id[0]?.toLowerCase() || 'x';
    const code = key.charCodeAt(0);

    if (code >= 97 && code <= 122) {
        const idx = code - 97;
        return PREDEFINED_COLORS[idx % PREDEFINED_COLORS.length];
    }

    if (code >= 48 && code <= 57) {
        const idx = code - 48;
        return PREDEFINED_COLORS[idx % PREDEFINED_COLORS.length];
    }

    return '#999999';
};

export default function MainLayout({ username, userId, onLogout, outletContext }: { username: string; userId: string; onLogout: () => void; outletContext: any; }) {
    const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [isActivityLogModalOpen, setIsActivityLogModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isProjectAdmin, setIsProjectAdmin] = useState(false);

    const [isDelegateAdminModalOpen, setIsDelegateAdminModalOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const { projectId } = useParams();
    const { projects, handleUpdateProjectMembers, users, activities, handleUpdateUser, setUsers, setProjects } = outletContext

    const currentProject = projects.find((p: Project) => p.id === projectId);

    const navigate = useNavigate();

    const handleRequestDeleteAccount = () => {

        const requiresDelegation = (p: Project): boolean => {
            const owner = p.ownerId;
            const admins = p.adminEmails ?? [];
            const members = p.memberEmails ?? [];

            const iAmOwner = owner === userId;
            const iAmAdmin = admins.includes(userId);

            const others = new Set([
                ...admins.filter(e => e !== userId),
                ...members.filter(e => e !== userId),
                ...(owner && owner !== userId ? [owner] : [])
            ]);
            if (others.size === 0) return false;

            const candidates = members.filter(e => e !== userId);
            if (candidates.length === 0) return false;

            if (iAmOwner && admins.filter(a => a !== userId).length === 0) return true;
            if (iAmAdmin && !owner && admins.length === 1 && admins[0] === userId) return true;

            return false;
        };

        const need = projects.filter(requiresDelegation);

        if (need.length > 0) {
            setIsDelegateAdminModalOpen(true);
        } else {
            setShowDeleteConfirm(true);
        }
    };

    const handleDeleteAccount = async () => {
        setUsers((prev: User[]) => prev.filter((u: User) => u.email !== userId));

        setProjects((prev: Project[]) => prev.map((p: Project) => ({
            ...p,
            adminEmails: p.adminEmails.filter((e: string) => e !== userId),
            memberEmails: p.memberEmails.filter((e: string) => e !== userId),
            ownerId: p.ownerId === userId ? null : p.ownerId
        })));

        navigate('/login');
    }

    useEffect(() => {
        if (currentProject) {
            const isAdmin = currentProject.ownerId === userId ||
                currentProject.adminEmails.includes(userId);
            setIsProjectAdmin(isAdmin);
        } else {
            setIsProjectAdmin(false);
        }
    }, [currentProject, userId]);

    const memberCount = (currentProject?.adminEmails.length || 0) + (currentProject?.memberEmails.length || 0) + 1;

    const updatedOutletContext = {
        ...outletContext,
        isProjectAdmin: isProjectAdmin
    };

    return (
        <LayoutWrapper>

            <SidebarWrapper>
                <UserInfo>
                    <ProfileButton onClick={() => setIsSettingsModalOpen(true)}>
                        <Avatar bgColor={getMemberColor(userId)}>
                            <StyledIcRoundPlus />
                        </Avatar>
                    </ProfileButton>
                    <UserName>{username}</UserName>
                    <IconButtons>
                        <NotificationButton onClick={(e) => { e.stopPropagation(); setIsActivityLogModalOpen(true); }}>
                            <TablerBell />
                        </NotificationButton>
                    </IconButtons>
                </UserInfo>

                <NavSection>
                    <SectionTitle>워크스페이스</SectionTitle>
                    <NavItem to="/main" end>
                        <span>홈</span>
                    </NavItem>
                </NavSection>

                <ProjectSection>
                    <SectionTitle>
                        프로젝트
                        <AddButton onClick={() => setIsNewProjectModalOpen(true)}>+</AddButton>
                    </SectionTitle>
                    <ProjectList>
                        {projects.map((project: Project) => (
                            <ProjectItem
                                key={project.id}
                                to={`/main/projects/${project.id}/board`}
                                activecolor={project.color}
                            >
                                <ProjectColorDot />
                                <span>{project.name}</span>
                            </ProjectItem>
                        ))}
                    </ProjectList>
                </ProjectSection>
            </SidebarWrapper>

            <MainContentArea>
                <ContentHeader>
                    <div>
                        <Title>프로젝트 대시보드</Title>
                        <Description>팀의 모든 프로젝트를 한눈에 확인하고 관리하세요</Description>
                    </div>
                    <HeaderActions>
                        {currentProject && (
                            <MemberButton onClick={() => setIsMemberModalOpen(true)}>
                                <MdiAccount />
                                <span>{memberCount}</span>
                            </MemberButton>
                        )}
                    </HeaderActions>
                </ContentHeader>

                <ContentBody>
                    <Outlet context={updatedOutletContext} />
                </ContentBody>
            </MainContentArea>

            {isNewProjectModalOpen && (
                <NewProject
                    onClose={() => setIsNewProjectModalOpen(false)}
                    onSaveProject={outletContext.addProject}
                    currentUserId={userId}
                />
            )}

            {isMemberModalOpen && currentProject && (
                <MemberAdminModal
                    project={currentProject}
                    onClose={() => setIsMemberModalOpen(false)}
                    onUpdateProject={handleUpdateProjectMembers}
                    isProjectAdmin={isProjectAdmin}
                    currentUserId={userId}
                    users={users}
                />
            )}

            {isActivityLogModalOpen && (
                <ActivityLogModal
                    onClose={() => setIsActivityLogModalOpen(false)}
                    activities={activities}
                    users={users}
                    projects={projects}
                />
            )}

            {isSettingsModalOpen && (
                <SettingsModal
                    onClose={() => setIsSettingsModalOpen(false)}
                    onLogout={onLogout}
                    currentUserName={username}
                    currentUserEmail={userId}
                    onUpdateUser={handleUpdateUser}
                    onDeleteAccount={handleRequestDeleteAccount}
                />
            )}

            {isDelegateAdminModalOpen && (
                <DelegateAdminModal
                    projects={projects}
                    users={users}
                    currentUserId={userId}
                    onApplyProjects={(updatedProjects) => {
                        setProjects(updatedProjects)
                        setIsDelegateAdminModalOpen(false)
                        setShowDeleteConfirm(true)
                    }}
                    onConfirmDeleteUser={() => {
                        setIsDelegateAdminModalOpen(false)
                        handleDeleteAccount()
                    }}
                    onClose={() => setIsDelegateAdminModalOpen(false)}
                />
            )}

            {showDeleteConfirm && (
                <ConfirmModal
                    message="정말로 계정을 삭제하시겠습니까?"
                    confirmText="삭제"
                    cancelText="취소"
                    onConfirm={() => {
                        setShowDeleteConfirm(false)
                        handleDeleteAccount()
                    }}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            )}
        </LayoutWrapper>
    );
}

const LayoutWrapper = styled.div`
    display: flex;
    height: 100vh;
    background-color: #FFFFFF;
    position: relative;
`;

const SidebarWrapper = styled.aside`
    width: 240px;
    flex-shrink: 0;
    background-color: #F7F7F7;
    border-right: 1px solid #E0E0E0;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const UserInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px;
    border-radius: 6px;
`;

const ProfileButton = styled.button`
    background: transparent;
    border: none;
    padding: 0;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        opacity: 0.8;
    }
`;

const Avatar = styled.div<{ bgColor: string }>`
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background-color: ${props => props.bgColor};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
`;

const StyledIcRoundPlus = styled(IcRoundPlus)<{ color?: string }>`
    width: 28px;
    height: 28px;
    color: ${props => props.color || 'white'};
`;

const UserName = styled.span`
    font-size: 15px;
    font-weight: 600;
    margin-right: auto;
`;

const IconButtons = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const NotificationButton = styled.button`
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;

    svg {
        width: 20px;
        height: 20px;
        color: #4B5563;
    }
`;

const LogoutButton = styled.button`
    background: transparent;
    border: 1px solid #D1D5DB;
    border-radius: 4px;
    padding: 4px 6px;
    font-size: 12px;
    color: #6B7280;
    cursor: pointer;
`;

const NavSection = styled.nav`
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const SectionTitle = styled.h3`
    font-size: 12px;
    font-weight: 500;
    color: #6B7280;
    padding: 0 8px 8px 8px;
    margin: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const NavItem = styled(NavLink)`
    font-size: 15px;
    color: #111827;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 10px;

    svg {
        width: 20px;
        height: 20px;
    }

    &.active {
        background-color: #E5E7EB;
        font-weight: 500;
    }

    &:hover {
        background-color: #E5E7EB;
    }
`;

const ProjectSection = styled.div`
    display: flex;
    flex-direction: column;
`;

const AddButton = styled.button`
    width: 20px;
    height: 20px;
    border: none;
    border-radius: 4px;
    background-color: transparent;
    color: #6B7280;
    cursor: pointer;
    font-size: 16px;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background-color: #E5E7EB;
    }
`;

const ProjectList = styled.ul`
    margin: 0;
    padding: 0;
    list-style: none;
`;

const ProjectColorDot = styled.div`
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #D1D5DB;
`;

const ProjectItem = styled(NavLink)<{ activecolor: string }>`
    font-size: 15px;
    color: #6B7280;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;

    &.active {
        background-color: #E0E7FF;
        font-weight: 500;
        color: #111827;

        ${ProjectColorDot} {
            background-color: ${props => props.activecolor};
        }
    }

    &:hover {
        background-color: #E5E7EB;
    }
`;

const MainContentArea = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
`;

const ContentHeader = styled.header`
    height: 90px;
    flex-shrink: 0;
    background-color: #FFFFFF;
    border-bottom: 1px solid #E0E0E0;
    padding: 20px 24px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;

const Title = styled.h1`
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    color: #111827;
`;

const Description = styled.span`
    font-size: 14px;
    color: #6B7280;
    margin: 4px 0 0 0;
`;

const HeaderActions = styled.div`
    display: flex;
`;

const MemberButton = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    background-color: #F3F4F6;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    padding: 4px 8px;
    cursor: pointer;

    svg {
        width: 20px;
        height: 20px;
        color: #4B5563;
    }

    span {
        font-size: 14px;
        font-weight: 500;
    }
`;

const ContentBody = styled.main`
    flex-grow: 1;
    padding: 24px;
    background-color: #FAFBFC;
    overflow-y: auto;
`;