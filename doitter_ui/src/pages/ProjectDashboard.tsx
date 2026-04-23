import React, { useState } from 'react';
import styled from 'styled-components';
import { useOutletContext } from 'react-router-dom';
import { ReactComponent as EditFill } from '../icons/Edit_fill.svg';
import { ReactComponent as MdiAccount } from '../icons/mdi_account.svg';
import { ReactComponent as ExitIcon } from '../icons/exit_project.svg';
import ProjectEditModal from '../modal/ProjectEditModal';
import ConfirmModal from "../components/ConfirmModal";
import DelegateAdminForExitModal from "../modal/DelegateAdminForExitModal";
import type { Project, User } from '../App';

interface DashboardContext {
    projects: Project[];
    handleUpdateProjectDetails: (project: Project) => void;
    handleDeleteProject: (projectId: string) => void;
    currentUserId: string;
    users: User[];
}

const EmptyMessage = styled.h2`
    font-size: 24px;
    font-weight: 500;
    color: #6B7280;
    margin-top: 20px;
`;

const ProjectGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
`;

const ProjectCard = styled.div`
    border: 1px solid #E0E0E0;
    border-radius: 8px;
    background-color: #FFFFFF;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const ProjectHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const ProjectColorDot = styled.div`
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: ${props => props.color};
`;

const ProjectTitle = styled.h3`
    font-size: 16px;
    font-weight: 600;
    margin: 0;
`;

const EditButton = styled.button`
    position: absolute;
    top: 16px;
    right: 48px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;

    svg {
        width: 20px;
        height: 20px;
        color: #6B7280;
    }
`;

const ExitButton = styled.button`
    position: absolute;
    top: 16px;
    right: 16px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;

    svg {
        width: 20px;
        height: 20px;
        color: #EF4444;
    }
`;

const ProjectDescription = styled.p`
    font-size: 14px;
    color: #4B5563;
    margin: 0;
    min-height: 1.2em;
`;

const CardFooter = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const TeamMemberSection = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;

    svg {
        width: 20px;
        height: 20px;
        color: #6B7280;
    }

    span {
        font-size: 13px;
        color: #374151;
    }
`;

export default function ProjectDashboard() {
    const { projects, handleUpdateProjectDetails, handleDeleteProject, currentUserId, users } = useOutletContext<DashboardContext>();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [showDelegateModal, setShowDelegateModal] = useState(false);
    const [exitTargetProject, setExitTargetProject] = useState<Project | null>(null);

    const openEditModal = (project: Project) => {
        setSelectedProject(project);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedProject(null);
    };

    // 'handleLeaveProject'는 ExitButton의 onClick 핸들러로 대체되었습니다.
    // (이전 코드의 'handleLeaveProject' 함수는 삭제)

    if (projects.length === 0) {
        return <EmptyMessage>새 프로젝트를 생성해주세요</EmptyMessage>;
    }

    return (
        <>
            <ProjectGrid>
                {projects.map(project => {
                    const cardIsAdmin = project.ownerId === currentUserId || project.adminEmails.includes(currentUserId);

                    return (
                        <ProjectCard key={project.id}>
                            <ProjectHeader>
                                <ProjectColorDot color={project.color} />
                                <ProjectTitle>{project.name}</ProjectTitle>
                            </ProjectHeader>
                            <ProjectDescription>{project.description || ''}</ProjectDescription>

                            <CardFooter>
                                <TeamMemberSection>
                                    <MdiAccount />
                                    <span>팀 멤버 ({project.adminEmails.length + project.memberEmails.length + 1})</span>
                                </TeamMemberSection>
                            </CardFooter>

                            {cardIsAdmin && (
                                <EditButton onClick={() => openEditModal(project)}>
                                    <EditFill />
                                </EditButton>
                            )}

                            <ExitButton
                                onClick={() => {
                                    const iAmOwner = project.ownerId === currentUserId;
                                    const iAmAdmin = project.adminEmails.includes(currentUserId);

                                    const adminCount = project.adminEmails.length;
                                    const memberCount = project.memberEmails.length;
                                    // const viewerCount = project.viewerEmails?.length ?? 0; // viewer는 무시

                                    // 내가 오너이거나 어드민이고, 어드민이 나 혼자이며, 멤버가 1명 이상일 때 위임 필요
                                    const needDelegate =
                                        (iAmOwner || iAmAdmin) &&
                                        adminCount === 1 &&
                                        memberCount >= 1;

                                    setExitTargetProject(project);

                                    if (needDelegate) {
                                        setShowDelegateModal(true);
                                    } else {
                                        setShowExitConfirm(true);
                                    }
                                }}
                            >
                                <ExitIcon />
                            </ExitButton>
                        </ProjectCard>
                    );
                })}
            </ProjectGrid>

            {isEditModalOpen && selectedProject && (
                <ProjectEditModal
                    project={selectedProject}
                    onClose={closeEditModal}
                    onSave={handleUpdateProjectDetails}
                    onDelete={handleDeleteProject}
                    currentUserId={currentUserId}
                    isProjectAdmin={
                        selectedProject.ownerId === currentUserId ||
                        selectedProject.adminEmails.includes(currentUserId)
                    }
                    users={users}
                />
            )}
            {showDelegateModal && exitTargetProject && (
                <DelegateAdminForExitModal
                    project={exitTargetProject}
                    users={users}
                    currentUserId={currentUserId}
                    onApplyProject={(updatedProject) => {
                        handleUpdateProjectDetails(updatedProject);
                    }}
                    onClose={() => {
                        setShowDelegateModal(false);
                        setExitTargetProject(null);
                    }}
                />
            )}

            {showExitConfirm && exitTargetProject && (
                <ConfirmModal
                    message={`정말로 ‘${exitTargetProject.name}’ 프로젝트를 나가시겠습니까?`}
                    confirmText="나가기"
                    cancelText="취소"
                    onConfirm={() => {
                        const p = exitTargetProject;

                        const withoutMe = (arr: string[]) => arr.filter(e => e !== currentUserId);

                        const updated: Project = {
                            ...p,
                            ownerId: p.ownerId === currentUserId ? null : p.ownerId,
                            adminEmails: withoutMe(p.adminEmails),
                            memberEmails: withoutMe(p.memberEmails),
                            viewerEmails: withoutMe(p.viewerEmails ?? []),
                        };

                        handleUpdateProjectDetails(updated);

                        setShowExitConfirm(false);
                        setExitTargetProject(null);
                    }}
                    onCancel={() => {
                        setShowExitConfirm(false);
                        setExitTargetProject(null);
                    }}
                />
            )}
        </>
    );
}