import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import LabelAdminModal from '../modal/LabelAdminModal';
import NewTaskModal from '../modal/NewTaskModal';
import KanbanCard from './KanbanCard';
import ActivityLogModal from '../modal/ActivityLogModal';
import TaskListView from './TaskListView';
import type { Project, Label, Task, NewTask, User, Activity } from '../App';

interface DashboardContext {
    projects: Project[];
    labels: Label[];
    todoTasks: Task[];
    doingTasks: Task[];
    doneTasks: Task[];
    allTasks: Task[];
    currentUserId: string;
    users: User[];
    activities: Activity[];
    viewMode: 'KANBAN' | 'LIST';
    setViewMode: (mode: 'KANBAN' | 'LIST') => void;
    handleAddLabel: (name: string, color: string, projectId: string) => void;
    handleEditLabel: (id: string, name: string, color: string, projectId: string) => void;
    handleDeleteLabel: (id: string, projectId: string) => void;
    handleAddTask: (newTaskData: NewTask, projectId: string) => void;
}

interface KanbanColumnProps {
    title: string;
    color: string;
    tasks: Task[];
    onCardClick: (task: Task) => void;
    users: User[];
}

const KanbanColumn = ({ title, color, tasks, onCardClick, users }: KanbanColumnProps) => {
    return (
        <ColumnWrapper>
            <ColumnTitle color={color}>{title}</ColumnTitle>
            <CardList>
                {tasks.map(task => (
                    <KanbanCard key={task.id} task={task} onCardClick={() => onCardClick(task)} users={users} />
                ))}
            </CardList>
        </ColumnWrapper>
    );
};

export default function KanbanBoard() {
    const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isActivityLogModalOpen, setIsActivityLogModalOpen] = useState(false);

    const { projectId } = useParams();
    const navigate = useNavigate();
    const {
        projects,
        labels,
        todoTasks,
        doingTasks,
        doneTasks,
        allTasks,
        currentUserId,
        users,
        activities,
        viewMode,
        setViewMode,
        handleAddLabel,
        handleEditLabel,
        handleDeleteLabel,
        handleAddTask
    } = useOutletContext<DashboardContext>();

    const currentProject = projects.find(p => p.id === projectId);

    const isProjectAdmin =
        currentProject &&
        (currentProject.ownerId === currentUserId ||
            currentProject.adminEmails.includes(currentUserId));


    if (!projectId) return <div>잘못된 접근입니다.</div>;

    const projectLabels = labels.filter(l => l.projectId === projectId || l.projectId === 'default');

    const projectTodoTasks = todoTasks.filter(t => t.projectId === projectId);
    const projectDoingTasks = doingTasks.filter(t => t.projectId === projectId);
    const projectDoneTasks = doneTasks.filter(t => t.projectId === projectId);
    const projectAllTasks = allTasks.filter(t => t.projectId === projectId);
    const projectActivities = activities.filter(a => a.projectId === projectId);

    const handleCardClick = (task: Task) => {
        navigate(`/main/projects/${projectId}/tasks/${task.id}`);
    };

    const allMembers = currentProject
        ? [currentUserId, ...currentProject.adminEmails, ...currentProject.memberEmails]
        : [currentUserId];

    return (
        <BoardWrapper>
            <BoardHeader>
                <Button onClick={() => setIsTaskModalOpen(true)}>+ 새 태스크</Button>

                {isProjectAdmin && (
                    <Button onClick={() => setIsLabelModalOpen(true)}>라벨 관리</Button>
                )}

                <Button onClick={() => navigate(`/main/projects/${projectId}/activity`)}>활동 로그</Button>

                <RightHeaderItems>
                    <ViewToggleWrapper>
                        <ToggleButton
                            className={viewMode === 'KANBAN' ? 'active' : ''}
                            onClick={() => setViewMode('KANBAN')}
                        >
                            칸반
                        </ToggleButton>
                        <ToggleButton
                            className={viewMode === 'LIST' ? 'active' : ''}
                            onClick={() => setViewMode('LIST')}
                        >
                            목록
                        </ToggleButton>
                    </ViewToggleWrapper>
                </RightHeaderItems>
            </BoardHeader>

            {viewMode === 'KANBAN' ? (
                <ColumnsContainer>
                    <KanbanColumn title="To-Do" color="#FF453A" tasks={projectTodoTasks} onCardClick={handleCardClick} users={users} />
                    <KanbanColumn title="Doing" color="#FFD60A" tasks={projectDoingTasks} onCardClick={handleCardClick} users={users} />
                    <KanbanColumn title="Done" color="#30D158" tasks={projectDoneTasks} onCardClick={handleCardClick} users={users} />
                </ColumnsContainer>
            ) : (
                <TaskListView
                    tasks={projectAllTasks}
                    users={users}
                    onTaskClick={handleCardClick}
                />
            )}

            {isLabelModalOpen && (
                <LabelAdminModal
                    onClose={() => setIsLabelModalOpen(false)}
                    labels={projectLabels}
                    onAdd={(name: string, color: string) => handleAddLabel(name, color, projectId)}
                    onEdit={(id: string, name: string, color: string) => handleEditLabel(id, name, color, projectId)}
                    onDelete={(id: string) => handleDeleteLabel(id, projectId)}
                />
            )}

            {isTaskModalOpen && (
                <NewTaskModal
                    onClose={() => setIsTaskModalOpen(false)}
                    onAddTask={(taskData) => handleAddTask(taskData, projectId)}
                    allMembers={allMembers}
                    currentUserId={currentUserId}
                    users={users}
                    isProjectAdmin={!!(currentProject && (currentProject.ownerId === currentUserId || currentProject.adminEmails.includes(currentUserId)))}
                />
            )}
        </BoardWrapper>
    );
}

const BoardWrapper = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 20px;
`;

const BoardHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const Button = styled.button`
    padding: 6px 12px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    background-color: #FFFFFF;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    cursor: pointer;

    &:hover {
        background-color: #F9FAFB;
    }
`;

const RightHeaderItems = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    margin-left: auto;
`;

const ViewToggleWrapper = styled.div`
    display: flex;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    overflow: hidden;
`;

const ToggleButton = styled.button`
    padding: 6px 12px;
    font-size: 14px;
    font-weight: 500;
    background-color: #FFFFFF;
    border: none;
    border-left: 1px solid #D1D5DB;
    color: #6B7280;
    cursor: pointer;

    &:first-child {
        border-left: none;
    }

    &.active {
        background-color: #E5E7EB;
        color: #1F2937;
    }
`;

const ColumnsContainer = styled.div`
    display: flex;
    gap: 16px;
    flex-grow: 1;
`;

const ColumnWrapper = styled.div`
    width: 300px;
    flex-shrink: 0;
    height: 100%;
    background-color: #F9FAFB;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
`;

const ColumnTitle = styled.h2`
    font-size: 16px;
    font-weight: 600;
    padding: 16px;
    margin: 0;
    border-bottom: 1px solid #E0E0E0;
    display: flex;
    align-items: center;
    gap: 8px;

    &::before {
        content: '';
        width: 4px;
        height: 16px;
        border-radius: 2px;
        background-color: ${props => props.color};
    }
`;

const CardList = styled.div`
    padding: 8px;
    flex-grow: 1;
    overflow-y: auto;
`;