import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import type { Project, Task, Comment, Label, EditableTask, User } from '../App';
import { ReactComponent as IcRoundPlus } from '../icons/ic_round-plus.svg';
import { ReactComponent as BackArrowIcon } from '../icons/line-md_arrow-up.svg';
import TaskOptionsModal from '../modal/TaskOptionsModal';
import EditTaskModal from '../modal/EditTaskModal';

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

interface DashboardContext {
    projects: Project[];
    allTasks: Task[];
    labels: Label[];
    users: User[];
    handleDeleteTask: (taskId: string, projectId: string) => void;
    handleAddComment: (taskId: string, commentBody: string, projectId: string) => void;
    handleUpdateTask: (taskId: string, updates: Partial<Task>, projectId: string) => void;
    currentUserId: string;
    isProjectAdmin: boolean;
    handleAddActivity: (type: 'TASK'|'COMMENT'|'PROJECT'|'LABEL'|'MEMBER', description: string, authorId: string, projectId: string) => void;
}

export default function TaskDetailPage() {
    const { taskId, projectId } = useParams();
    const navigate = useNavigate();
    const {
        projects,
        allTasks,
        labels,
        users,
        handleDeleteTask,
        handleAddComment,
        handleUpdateTask,
        handleAddActivity,
        currentUserId,
        isProjectAdmin
    } = useOutletContext<DashboardContext>();

    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newComment, setNewComment] = useState('');

    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');

    const task = allTasks.find(t => t.id === taskId);
    const currentProject = projects.find(p => p.id === projectId);

    const allMembers = currentProject
        ? [currentUserId, ...currentProject.adminEmails, ...currentProject.memberEmails]
        : [currentUserId];

    const getMemberName = (email: string) => {
        const user = users.find(u => u.email === email);
        return user ? user.name : email.split('@')[0];
    };

    const handleDelete = () => {
        if (!task || !projectId) return;
        if (window.confirm("이 작업을 삭제하시겠습니까?")) {
            handleDeleteTask(task.id, projectId);
            navigate(`/main/projects/${projectId}/board`);
        }
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!task || !projectId) return;
        if (newComment.trim()) {
            handleAddComment(task.id, newComment.trim(), projectId);
            setNewComment('');
        }
    };

    const handleSaveOptions = (taskId: string, newDescription: string, newLabelIds: string[], newStatus: Task['status']) => {
        if (!projectId) return;
        const newLabels = labels.filter(l => newLabelIds.includes(l.id));
        handleUpdateTask(taskId, {
            description: newDescription,
            labels: newLabels,
            status: newStatus
        }, projectId);
    };

    const handleSaveEdit = (taskId: string, updatedTaskData: EditableTask) => {
        if (!projectId) return;
        handleUpdateTask(taskId, updatedTaskData, projectId);
    };

    if (!task || !projectId) {
        return <div>태스크를 찾을 수 없습니다.</div>;
    }

    const formattedDate = task.dueDate
        ? new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(task.dueDate)
        : '마감일 없음';

    const isOwnerUser = currentUserId === currentProject?.ownerId;
    const isAdminUser = currentProject?.adminEmails.includes(currentUserId);

    const canEditComment = (commentAuthor: string) => {
        return commentAuthor === currentUserId;
    };

    const canDeleteComment = (commentAuthor: string) => {
        if (commentAuthor === currentUserId) return true;

        if (isOwnerUser) return true;

        if (isAdminUser) {
            const authorIsAdmin = currentProject?.adminEmails.includes(commentAuthor)
                || commentAuthor === currentProject?.ownerId;
            if (authorIsAdmin) return false;
            return true;
        }

        return false;
    };

    const projectLabels = labels.filter(l => l.projectId === projectId || l.projectId === 'default');

    const isAssignee = task.assigneeId === currentUserId;
    const canEditTask = isProjectAdmin || isAssignee;
    const canDeleteTask = isProjectAdmin || isAssignee;

    const isOwnerMe = !!(currentProject && currentProject.ownerId === currentUserId);
    const isAdminMe = !!(currentProject && currentProject.adminEmails.includes(currentUserId));
    const isOwnerEmail = (email: string) => currentProject ? currentProject.ownerId === email : false;
    const isAdminEmail = (email: string) => currentProject ? currentProject.adminEmails.includes(email) : false;
    const isMemberEmail = (email: string) =>
        currentProject ? currentProject.memberEmails.includes(email) : false;

    const startEditComment = (c: Comment) => {
        if (!canEditComment(c.author)) return;
        setEditingCommentId(c.id);
        setEditText(c.body);
    };

    const cancelEditComment = () => {
        setEditingCommentId(null);
        setEditText('');
    };

    const saveEditComment = () => {
        if (!projectId || !editingCommentId) return;
        const updated = task.comments.map(c =>
            c.id === editingCommentId ? { ...c, body: editText } : c
        );
        handleUpdateTask(task.id, { comments: updated }, projectId);
        handleAddActivity('COMMENT', `태스크 '${task.title}'에 코멘트를 수정했습니다.`, currentUserId, projectId);
        setEditingCommentId(null);
        setEditText('');
    };

    const deleteComment = (commentId: string) => {
        if (!projectId) return;
        const target = task.comments.find(c => c.id === commentId);
        if (!target || !canDeleteComment(target.author)) return;

        if (window.confirm('코멘트를 삭제하시겠습니까?')) {
            const updated = task.comments.filter(c => c.id !== commentId);
            handleUpdateTask(task.id, { comments: updated }, projectId);
            handleAddActivity('COMMENT', `태스크 '${task.title}'에 코멘트를 삭제했습니다.`, currentUserId, projectId);
        }
    };

    return (
        <>
            <PageWrapper>
                <BackButton onClick={() => navigate(-1)}>
                    <BackArrowIcon /> 뒤로가기
                </BackButton>

                <TaskContent>
                    <TaskHeader>
                        <Title>{task.title}</Title>
                        <Actions>
                            {canEditTask && (
                                <Button onClick={() => setIsOptionsModalOpen(true)}>추가 옵션</Button>
                            )}
                            {canEditTask && (
                                <Button onClick={() => setIsEditModalOpen(true)}>수정</Button>
                            )}
                            {canDeleteTask && (
                                <DeleteButton onClick={handleDelete}>삭제</DeleteButton>
                            )}
                        </Actions>
                    </TaskHeader>

                    <TagWrapper>
                        {task.labels.map((label: Label) => (
                            <LabelTag key={label.id} color={label.color}>{label.name}</LabelTag>
                        ))}
                        <StatusTag>{task.status}</StatusTag>
                    </TagWrapper>

                    <Description>{task.description || '설명이 없습니다.'}</Description>

                    <InfoGrid>
                        <InfoBox>
                            <InfoLabel>담당자</InfoLabel>
                            <AssigneeInfo>
                                <Avatar bgColor={getMemberColor(task.assigneeId)}>
                                    <StyledIcRoundPlus />
                                </Avatar>
                                {getMemberName(task.assigneeId)}
                            </AssigneeInfo>
                        </InfoBox>
                        <InfoBox>
                            <InfoLabel>마감일자</InfoLabel>
                            {formattedDate}
                        </InfoBox>
                    </InfoGrid>

                    <CommentSection>
                        <Label>코멘트 {task.comments.length}</Label>
                        <Form onSubmit={handleCommentSubmit}>
                            <CommentInput
                                placeholder="코멘트를 입력해주세요 !"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <SubmitButton type="submit">등록</SubmitButton>
                        </Form>
                        <CommentList>
                            {task.comments.map((comment: Comment) => {
                                const editable = canEditComment(comment.author);
                                const deletable = canDeleteComment(comment.author);
                                const isEditing = editingCommentId === comment.id;

                                return (
                                    <CommentItem key={comment.id}>
                                        <Avatar bgColor={getMemberColor(comment.author)}>
                                            <StyledIcRoundPlus />
                                        </Avatar>

                                        <CommentBody>
                                            <CommentHeaderRow>
                                                <strong>{getMemberName(comment.author)}</strong>
                                                <CommentActions>
                                                    {editable && !isEditing && (
                                                        <SmallButton type="button" onClick={() => startEditComment(comment)}>
                                                            수정
                                                        </SmallButton>
                                                    )}
                                                    {deletable && (
                                                        <DangerSmallButton
                                                            type="button"
                                                            onClick={() => deleteComment(comment.id)}
                                                        >
                                                            삭제
                                                        </DangerSmallButton>
                                                    )}
                                                </CommentActions>
                                            </CommentHeaderRow>

                                            {!isEditing ? (
                                                <span>{comment.body}</span>
                                            ) : (
                                                <EditRow>
                                                    <EditInput
                                                        value={editText}
                                                        onChange={(e) => setEditText(e.target.value)}
                                                        placeholder="코멘트를 수정하세요"
                                                    />
                                                    <SmallButton type="button" onClick={saveEditComment}>저장</SmallButton>
                                                    <PlainSmallButton type="button" onClick={cancelEditComment}>취소</PlainSmallButton>
                                                </EditRow>
                                            )}
                                            <CommentDate>{comment.createdAt}</CommentDate>
                                        </CommentBody>
                                    </CommentItem>
                                );
                            })}
                        </CommentList>
                    </CommentSection>

                </TaskContent>
            </PageWrapper>

            {isOptionsModalOpen && (
                <TaskOptionsModal
                    task={task}
                    allLabels={projectLabels}
                    onClose={() => setIsOptionsModalOpen(false)}
                    onSave={handleSaveOptions}
                />
            )}

            {isEditModalOpen && (
                <EditTaskModal
                    task={task}
                    onClose={() => setIsEditModalOpen(false)}
                    onEditTask={handleSaveEdit}
                    allMembers={allMembers}
                    users={users}
                    isProjectAdmin={!!(currentProject && (currentProject.ownerId === currentUserId || currentProject.adminEmails.includes(currentUserId)))}
                    currentUserId={currentUserId}
                />
            )}
        </>
    );
}

const PageWrapper = styled.div`
    max-width: 800px;
    margin: 0 auto;
`;

const BackButton = styled.button`
    font-size: 16px;
    font-weight: 500;
    color: #374151;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 8px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 4px;

    svg {
        width: 20px;
        height: 20px;
    }

    &:hover {
        background-color: #F3F4F6;
        border-radius: 6px;
    }
`;

const TaskContent = styled.div`
    padding: 24px;
    background-color: #FFFFFF;
    border-radius: 8px;
    border: 1px solid #E0E0E0;
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const TaskHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
`;

const Title = styled.h2`
    font-size: 22px;
    font-weight: 600;
    margin: 0;
    flex-grow: 1;
`;

const TagWrapper = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
    margin-top: -12px;
`;

const LabelTag = styled.span<{ color: string }>`
    font-size: 13px;
    font-weight: 500;
    color: #1F2937;
    background-color: ${props => props.color};
    padding: 2px 8px;
    border-radius: 4px;
`;

const StatusTag = styled.span`
    font-size: 13px;
    font-weight: 500;
    color: #6B7280;
    background-color: #F3F4F6;
    padding: 2px 8px;
    border-radius: 4px;
    text-transform: uppercase;
`;

const Description = styled.p`
    font-size: 15px;
    color: #374151;
    margin: 0;
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
`;

const InfoBox = styled.div`
    background-color: #F9FAFB;
    border-radius: 6px;
    padding: 12px;
`;

const InfoLabel = styled.div`
    font-size: 13px;
    font-weight: 500;
    color: #6B7280;
    margin-bottom: 8px;
`;

const AssigneeInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 500;
`;

const Avatar = styled.div<{ bgColor: string }>`
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: ${props => props.bgColor};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
`;

const StyledIcRoundPlus = styled(IcRoundPlus)`
    width: 24px;
    height: 24px;
    color: white;
`;

const Actions = styled.div`
    display: flex;
    gap: 8px;
    flex-shrink: 0;
`;

const Button = styled.button`
    padding: 6px 12px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    background-color: #F3F4F6;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    cursor: pointer;
`;

const DeleteButton = styled(Button)`
    color: #EF4444;
`;

const CommentSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const Label = styled.label`
    font-size: 14px;
    font-weight: 500;
    color: #374151;
`;

const Form = styled.form`
    display: flex;
    gap: 8px;
`;

const CommentInput = styled.input`
    font-size: 15px;
    padding: 10px 12px;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    background-color: #F9FAFB;
    flex-grow: 1;
`;

const SubmitButton = styled.button`
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #FFFFFF;
    background-color: #1F2937;
    border: none;
    border-radius: 6px;
    cursor: pointer;
`;

const CommentList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 200px;
    overflow-y: auto;
`;

const CommentItem = styled.div`
    display: flex;
    gap: 10px;
`;

const CommentBody = styled.div`
    display: flex;
    flex-direction: column;
    background-color: #F9FAFB;
    padding: 8px 12px;
    border-radius: 6px;
    flex-grow: 1;

    strong {
        font-size: 14px;
        font-weight: 600;
    }

    span {
        font-size: 15px;
    }
`;

const CommentDate = styled.span`
    font-size: 12px !important;
    color: #6B7280;
    margin-top: 4px;
`;

const CommentHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CommentActions = styled.div`
  display: flex;
  gap: 6px;
`;

const SmallButton = styled.button`
  padding: 4px 8px;
  font-size: 12px;
  color: #374151;
  background-color: #F3F4F6;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  cursor: pointer;
`;

const PlainSmallButton = styled(SmallButton)`
  background: transparent;
`;

const DangerSmallButton = styled(SmallButton)`
  color: #EF4444;
`;

const EditRow = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 6px;
`;

const EditInput = styled.input`
  flex: 1;
  font-size: 14px;
  padding: 8px 10px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  background-color: #FFFFFF;
`;