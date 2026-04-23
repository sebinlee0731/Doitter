import React from 'react';
import styled from 'styled-components';
import type { Activity, User, Project } from '../App';

const getMemberName = (email: string, users: User[]) => {
    const user = users.find(u => u.email === email);
    return user ? user.name : email.split('@')[0];
};

const getProjectName = (projectId: string, projects: Project[]) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : '삭제된 프로젝트';
};

const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
        case 'TASK': return '📝';
        case 'COMMENT': return '💬';
        case 'PROJECT': return '📁';
        case 'LABEL': return '🏷️';
        case 'MEMBER': return '👥';
        default: return '🔔';
    }
};

const getActivityTitle = (type: Activity['type']) => {
    switch (type) {
        case 'TASK': return '태스크';
        case 'COMMENT': return '코멘트';
        case 'PROJECT': return '프로젝트';
        case 'LABEL': return '라벨';
        case 'MEMBER': return '멤버';
        default: return '알림';
    }
};

interface ActivityLogModalProps {
    onClose: () => void;
    activities: Activity[];
    users: User[];
    projects: Project[];
}

export default function ActivityLogModal({ onClose, activities, users, projects }: ActivityLogModalProps) {
    return (
        <ModalBackdrop>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <Title>알림 <CloseButton onClick={onClose}>X</CloseButton></Title>
                <List>
                    {activities.map(activity => (
                        <ActivityItem key={activity.id}>
                            <Icon>{getActivityIcon(activity.type)}</Icon>
                            <Content>
                                <ActivityHeader>
                                    <ActivityTitle>{getActivityTitle(activity.type)}</ActivityTitle>
                                    <ProjectName>{getProjectName(activity.projectId, projects)}</ProjectName>
                                </ActivityHeader>
                                <Description>
                                    <strong>{getMemberName(activity.authorId, users)}</strong> 님이 {activity.description}
                                </Description>
                                <Timestamp>{activity.createdAt}</Timestamp>
                            </Content>
                        </ActivityItem>
                    ))}
                </List>
            </ModalContent>
        </ModalBackdrop>
    );
}

const ModalBackdrop = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001;
`;

const ModalContent = styled.div`
    padding: 16px;
    background-color: #FFFFFF;
    border-radius: 8px;
    width: 400px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const Title = styled.h2`
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 16px 0;
    padding-bottom: 16px;
    border-bottom: 1px solid #E0E0E0;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const CloseButton = styled.button`
    background: transparent;
    border: none;
    font-size: 20px;
    color: #6B7280;
    cursor: pointer;
`;

const List = styled.div`
    display: flex;
    flex-direction: column;
    max-height: 400px;
    overflow-y: auto;
`;

const ActivityItem = styled.div`
    display: flex;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #F3F4F6;

    &:last-child {
        border-bottom: none;
    }
`;

const Icon = styled.span`
    font-size: 18px;
`;

const Content = styled.div`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
`;

const ActivityHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const ActivityTitle = styled.span`
    font-size: 14px;
    font-weight: 600;
    color: #1F2937;
`;

const ProjectName = styled.span`
    font-size: 12px;
    font-weight: 500;
    color: #6B7280;
    background-color: #F3F4F6;
    padding: 2px 6px;
    border-radius: 4px;
`;

const Description = styled.span`
    font-size: 15px;
    color: #374151;
    margin: 2px 0 4px 0;

    strong {
        font-weight: 600;
    }
`;

const Timestamp = styled.span`
    font-size: 12px;
    color: #6B7280;
`;