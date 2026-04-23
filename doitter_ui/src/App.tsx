import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './pages/MainLayout';
import ProjectDashboard from './pages/ProjectDashboard';
import KanbanBoard from './pages/KanbanBoard';
import TaskDetailPage from './pages/TaskDetailPage';
import ActivityLogPage from './pages/ActivityLogPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import FindPasswordPage from './pages/FindPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

export interface Label {
    id: string;
    name: string;
    color: string;
    projectId: string;
}

export interface Comment {
    id: string;
    author: string;
    body: string;
    createdAt: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    assigneeId: string;
    priority: string;
    dueDate: Date | null;
    status: 'TODO' | 'DOING' | 'DONE';
    labels: Label[];
    comments: Comment[];
    projectId: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    color: string;
    ownerId: string | null;
    adminEmails: string[];
    memberEmails: string[];
    viewerEmails: string[];
}

export interface Activity {
    id: string;
    type: 'TASK' | 'COMMENT' | 'PROJECT' | 'LABEL' | 'MEMBER';
    description: string;
    authorId: string;
    createdAt: string;
    projectId: string;
}

export type NewTask = Omit<Task, 'id' | 'status' | 'labels' | 'projectId'>;
export type EditableTask = Pick<Task, 'title' | 'assigneeId' | 'priority' | 'dueDate' | 'description'>;

export interface User {
    email: string;
    password: string;
    name: string;
}

export default function App() {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);

    const [labels, setLabels] = useState<Label[]>([
        { id: '1', name: '기능 개선', color: '#FEF08A', projectId: 'default' },
        { id: '2', name: '리팩토링', color: '#BEF264', projectId: 'default' },
        { id: '3', name: '버그 수정', color: '#F87171', projectId: 'default' },
    ]);

    const [todoTasks, setTodoTasks] = useState<Task[]>([]);
    const [doingTasks, setDoingTasks] = useState<Task[]>([]);
    const [doneTasks, setDoneTasks] = useState<Task[]>([]);

    const [activities, setActivities] = useState<Activity[]>([]);
    const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');

    const handleRegister = (user: User) => {
        setUsers(currentUsers => [...currentUsers, user]);
    };

    const handleLogin = (email: string, password: string): User | null => {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            setCurrentUser(user);
            return user;
        }
        return null;
    };

    const handleLogout = () => {
        setCurrentUser(null);
    };

    const handleUpdateUser = (userId: string, updates: { name?: string; password?: string }) => {
        let updatedUserName = currentUser?.name || '';
        setUsers(currentUsers =>
            currentUsers.map(u => {
                if (u.email === userId) {
                    if (updates.name) updatedUserName = updates.name;
                    return { ...u, ...updates };
                }
                return u;
            })
        );
        if (currentUser && currentUser.email === userId) {
            setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
        }
    };

    const getMemberName = (email: string) => {
        const user = users.find(u => u.email === email);
        return user ? user.name : email.split('@')[0];
    };

    const handleAddActivity = (type: Activity['type'], description: string, authorId: string, projectId: string) => {
        const newActivity: Activity = {
            id: Date.now().toString(),
            type,
            description,
            authorId,
            createdAt: new Date().toISOString(),
            projectId
        };
        setActivities(current => [newActivity, ...current]);
    };

    const addProject = (newProject: Project) => {
        setProjects(currentProjects => [...currentProjects, newProject]);
        if (currentUser) {
            handleAddActivity('PROJECT', `'${newProject.name}' 프로젝트를 생성했습니다.`, currentUser.email, newProject.id);
        }
    };

    const handleUpdateProjectDetails = (updatedProject: Project) => {
        const oldProject = projects.find(p => p.id === updatedProject.id);
        setProjects(currentProjects =>
            currentProjects.map(p =>
                p.id === updatedProject.id ? updatedProject : p
            )
        );
        if (!currentUser || !oldProject) return;
        const changes: string[] = [];
        const oldOwnerName = oldProject.ownerId ? getMemberName(oldProject.ownerId) : "담당자 없음";
        const newOwnerName = updatedProject.ownerId ? getMemberName(updatedProject.ownerId) : "담당자 없음";
        if (updatedProject.name !== oldProject.name) changes.push(`프로젝트 이름을 '${oldProject.name}'에서 '${updatedProject.name}'로 변경했습니다.`);
        if (updatedProject.description !== oldProject.description) changes.push(`프로젝트 설명을 수정했습니다.`);
        if (updatedProject.ownerId !== oldProject.ownerId) {
            changes.push(`프로젝트 담당자를 '${oldOwnerName}'에서 '${newOwnerName}'로 변경했습니다.`);
        }
        if (changes.length) {
            handleAddActivity('PROJECT', `${getMemberName(currentUser.email)} 님이 '${updatedProject.name}' 프로젝트 ${changes.join(' ')}`, currentUser.email, updatedProject.id);
        }
    };

    const handleUpdateProjectMembers = (
        updatedProject: Project,
        addedMembers?: string[],
        removedMembers?: string[],
        changedAdmins?: { email: string; fromAdmin: boolean; toAdmin: boolean }[]
    ) => {
        setProjects(currentProjects =>
            currentProjects.map(p =>
                p.id === updatedProject.id ? updatedProject : p
            )
        );
        if (!currentUser) return;
        if (addedMembers && addedMembers.length) {
            handleAddActivity(
                'MEMBER',
                `멤버 '${addedMembers.map(getMemberName).join(', ')}'을(를) 프로젝트에 추가했습니다.`,
                currentUser.email,
                updatedProject.id
            );
        }
        if (removedMembers && removedMembers.length) {
            handleAddActivity(
                'MEMBER',
                `멤버 '${removedMembers.map(getMemberName).join(', ')}'을(를) 프로젝트에서 제거했습니다.`,
                currentUser.email,
                updatedProject.id
            );
        }
        if (changedAdmins && changedAdmins.length) {
            changedAdmins.forEach(change => {
                const memberName = getMemberName(change.email);
                if (change.fromAdmin !== change.toAdmin) {
                    const action = change.toAdmin ? '관리자로 변경' : '멤버로 변경';
                    handleAddActivity(
                        'MEMBER',
                        `멤버 '${memberName}'을(를) ${action}했습니다.`,
                        currentUser.email,
                        updatedProject.id
                    );
                }
            });
        }
    };

    const handleDeleteProject = (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (currentUser && project) {
            handleAddActivity('PROJECT', `'${project.name}' 프로젝트를 삭제했습니다.`, currentUser.email, projectId);
        }
        setProjects(currentProjects =>
            currentProjects.filter(p => p.id !== projectId)
        );
    };

    const handleAddLabel = (name: string, color: string, projectId: string) => {
        const newLabel: Label = { id: Date.now().toString(), name, color, projectId };
        setLabels(current => [...current, newLabel]);
        if (currentUser) {
            handleAddActivity('LABEL', `라벨 '${name}'을(를) 생성했습니다.`, currentUser.email, projectId);
        }
    };

    const handleEditLabel = (id: string, name: string, color: string, projectId: string) => {
        const oldLabel = labels.find(l => l.id === id);
        setLabels(current =>
            current.map(label =>
                label.id === id ? { ...label, name, color } : label
            )
        );
        if (currentUser && oldLabel) {
            handleAddActivity('LABEL', `라벨 '${oldLabel.name}'을(를) '${name}'으로 수정했습니다.`, currentUser.email, projectId);
        }
    };

    const handleDeleteLabel = (id: string, projectId: string) => {
        const label = labels.find(l => l.id === id);
        setLabels(current => current.filter(label => label.id !== id));
        if (currentUser && label) {
            handleAddActivity('LABEL', `라벨 '${label.name}'을(를) 삭제했습니다.`, currentUser.email, projectId);
        }
    };

    const handleAddTask = (newTaskData: NewTask, projectId: string) => {
        if (!currentUser) return;
        const newTask: Task = { ...newTaskData, id: Date.now().toString(), status: 'TODO', labels: [], projectId };
        setTodoTasks(current => [...current, newTask]);
        handleAddActivity('TASK', `새 태스크 "${newTask.title}"을(를) 생성했습니다.`, currentUser.email, projectId);
    };

    const handleDeleteTask = (taskId: string, projectId: string) => {
        const task = allTasks.find(t => t.id === taskId);
        setTodoTasks(current => current.filter(t => t.id !== taskId));
        setDoingTasks(current => current.filter(t => t.id !== taskId));
        setDoneTasks(current => current.filter(t => t.id !== taskId));
        if (currentUser && task) {
            handleAddActivity('TASK', `태스크 '${task.title}'을(를) 삭제했습니다.`, currentUser.email, projectId);
        }
    };

    const handleAddComment = (taskId: string, commentBody: string, projectId: string) => {
        if (!currentUser) return;
        const task = allTasks.find(t => t.id === taskId);
        const snippet = commentBody.length > 15 ? commentBody.slice(0, 15) + '…' : commentBody;
        const newComment: Comment = { id: Date.now().toString(), author: currentUser.email, body: commentBody, createdAt: new Date().toISOString() };
        const updateTaskComments = (tasks: Task[]) => tasks.map(t => t.id === taskId ? { ...t, comments: [...t.comments, newComment] } : t);
        setTodoTasks(updateTaskComments);
        setDoingTasks(updateTaskComments);
        setDoneTasks(updateTaskComments);
        if (task) {
            handleAddActivity('COMMENT', `태스크 '${task.title}'에 코멘트를 추가했습니다: "${snippet}"`, currentUser.email, projectId);
        }
    };

    const handleUpdateTask = (taskId: string, updates: Partial<Task>, projectId: string) => {
        let taskToMove: Task | undefined;
        let sourceList: 'TODO' | 'DOING' | 'DONE' | null = null;
        const originalTask = allTasks.find(t => t.id === taskId);
        const findAndUpdate = (tasks: Task[]) => tasks.map(t => {
            if (t.id === taskId) {
                taskToMove = { ...t, ...updates };
                sourceList = t.status;
                return taskToMove;
            }
            return t;
        });
        setTodoTasks(findAndUpdate);
        setDoingTasks(findAndUpdate);
        setDoneTasks(findAndUpdate);
        if (!taskToMove || !originalTask || !currentUser) return;

        if (taskToMove.status !== sourceList) {
            if (sourceList === 'TODO') setTodoTasks(tasks => tasks.filter(t => t.id !== taskId));
            if (sourceList === 'DOING') setDoingTasks(tasks => tasks.filter(t => t.id !== taskId));
            if (sourceList === 'DONE') setDoneTasks(tasks => tasks.filter(t => t.id !== taskId));
            if (taskToMove.status === 'TODO') setTodoTasks(tasks => [...tasks, taskToMove!]);
            if (taskToMove.status === 'DOING') setDoingTasks(tasks => [...tasks, taskToMove!]);
            if (taskToMove.status === 'DONE') setDoneTasks(tasks => [...tasks, taskToMove!]);
            handleAddActivity('TASK', `태스크 '${originalTask.title}'의 상태를 ${originalTask.status}에서 ${taskToMove.status}로 변경했습니다.`, currentUser.email, projectId);
        }

        if (updates.assigneeId && updates.assigneeId !== originalTask.assigneeId) {
            handleAddActivity(
                'TASK',
                `태스크 '${originalTask.title}'의 담당자를 '${getMemberName(originalTask.assigneeId)}'에서 '${getMemberName(updates.assigneeId)}'로 변경했습니다.`,
                currentUser.email,
                projectId
            );
        }

        const changes: string[] = [];
        if (updates.title && updates.title !== originalTask.title) changes.push(`제목을 '${originalTask.title}'에서 '${updates.title}'로 변경했습니다.`);
        if (updates.priority && updates.priority !== originalTask.priority) changes.push(`우선순위를 '${originalTask.priority}'에서 '${updates.priority}'로 변경했습니다.`);
        if (updates.dueDate && updates.dueDate !== originalTask.dueDate) {
            const oldDate = originalTask.dueDate ? originalTask.dueDate.toLocaleDateString() : '없음';
            const newDate = updates.dueDate ? updates.dueDate.toLocaleDateString() : '없음';
            changes.push(`마감일을 '${oldDate}'에서 '${newDate}'로 변경했습니다.`);
        }
        if (updates.description && updates.description !== originalTask.description) changes.push(`설명을 수정했습니다.`);
        if (updates.labels) {
            const oldLabels = originalTask.labels.map(l => l.name);
            const newLabels = updates.labels.map(l => l.name);
            const added = newLabels.filter(l => !oldLabels.includes(l));
            const removed = oldLabels.filter(l => !newLabels.includes(l));
            if (added.length) changes.push(`라벨 '${added.join(', ')}'을(를) 추가했습니다.`);
            if (removed.length) changes.push(`라벨 '${removed.join(', ')}'을(를) 삭제했습니다.`);
        }
        if (changes.length) {
            handleAddActivity('TASK', `태스크 '${originalTask.title}'의 변경 사항: ${changes.join(' ')}`, currentUser.email, projectId);
        }
    };

    const allTasks = [...todoTasks, ...doingTasks, ...doneTasks];

    const outletContext = {
        users,
        setUsers,
        projects,
        setProjects,
        addProject,
        handleUpdateProjectDetails,
        handleUpdateProjectMembers,
        handleDeleteProject,
        currentUserId: currentUser?.email || '',
        labels, handleAddLabel, handleEditLabel, handleDeleteLabel,
        allTasks, todoTasks, doingTasks, doneTasks,
        handleAddTask, handleDeleteTask, handleAddComment, handleUpdateTask, handleAddActivity,
        activities,
        handleUpdateUser,
        viewMode, setViewMode
    };
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                <Route path="/signup" element={<SignUpPage onRegister={handleRegister} />} />
                <Route path="/find-password" element={<FindPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                <Route
                    path="/main/*"
                    element={
                        currentUser ? (
                            <Routes>
                                <Route path="/" element={<MainLayout username={currentUser.name} userId={currentUser.email} onLogout={handleLogout} outletContext={outletContext} />}>
                                    <Route index element={<ProjectDashboard />} />
                                    <Route path="projects/:projectId/board" element={<KanbanBoard />} />
                                    <Route path="projects/:projectId/tasks/:taskId" element={<TaskDetailPage />} />
                                    <Route path="projects/:projectId/activity" element={<ActivityLogPage />} />
                                </Route>
                            </Routes>
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route path="/*" element={currentUser ? <Navigate to="/main" /> : <Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}