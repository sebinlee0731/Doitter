import React from 'react';
import styled from 'styled-components';
import type { Task, User, Label } from '../App';

const getMemberName = (email: string, users: User[]) => {
    const user = users.find(u => u.email === email);
    return user ? user.name : email.split('@')[0];
};

export default function TaskListItem({ task, users, onClick }: { task: Task; users: User[]; onClick: () => void; }) {

    const shortDate = task.dueDate
        ? `${task.dueDate.getMonth() + 1}월 ${task.dueDate.getDate()}일`
        : '-';

    const assigneeName = getMemberName(task.assigneeId, users);

    return (
        <Row onClick={onClick}>
            <Cell>
                <TaskTitle>{task.title}</TaskTitle>
                <LabelWrapper>
                    {task.labels.map((label: Label) => (
                        <LabelTag key={label.id} color={label.color}>
                            {label.name}
                        </LabelTag>
                    ))}
                </LabelWrapper>
            </Cell>
            <Cell>
                <StatusTag>{task.status}</StatusTag>
            </Cell>
            <Cell>📅 {shortDate}</Cell>
            <Cell>{assigneeName}</Cell>
            <Cell>💬 {task.comments.length}</Cell>
        </Row>
    );
}

const Row = styled.div`
    display: grid;
    grid-template-columns: 3fr 1fr 1fr 1fr 1fr;
    padding: 16px;
    border-bottom: 1px solid #F3F4F6;
    align-items: center;
    cursor: pointer;

    &:hover {
        background-color: #F9FAFB;
    }

    &:last-child {
        border-bottom: none;
    }
`;

const Cell = styled.div`
    font-size: 14px;
    color: #374151;
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const TaskTitle = styled.span`
    font-weight: 500;
`;

const LabelWrapper = styled.div`
    display: flex;
    gap: 4px;
`;

const LabelTag = styled.span<{ color: string }>`
    font-size: 12px;
    font-weight: 500;
    padding: 2px 6px;
    border-radius: 4px;
    color: #1F2937;
    background-color: ${props => props.color};
`;

const StatusTag = styled.span`
    font-size: 13px;
    font-weight: 500;
    color: #6B7280;
    background-color: #F3F4F6;
    padding: 2px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    width: fit-content;
`;