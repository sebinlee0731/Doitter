import React from 'react';
import styled from 'styled-components';
import type { Task, User } from '../App';
import TaskListItem from '../components/TaskListItem';

interface TaskListViewProps {
    tasks: Task[];
    users: User[];
    onTaskClick: (task: Task) => void;
}

export default function TaskListView({ tasks, users, onTaskClick }: TaskListViewProps) {
    return (
        <ListContainer>
            <ListHeader>
                <HeaderItem>태스크</HeaderItem>
                <HeaderItem>상태</HeaderItem>
                <HeaderItem>마감일</HeaderItem>
                <HeaderItem>담당자</HeaderItem>
                <HeaderItem>코멘트</HeaderItem>
            </ListHeader>
            <ListBody>
                {tasks.map(task => (
                    <TaskListItem
                        key={task.id}
                        task={task}
                        users={users}
                        onClick={() => onTaskClick(task)}
                    />
                ))}
            </ListBody>
        </ListContainer>
    );
}

const ListContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: #FFFFFF;
    border: 1px solid #E0E0E0;
    border-radius: 8px;
`;

const ListHeader = styled.div`
    display: grid;
    grid-template-columns: 3fr 1fr 1fr 1fr 1fr;
    padding: 12px 16px;
    border-bottom: 1px solid #E0E0E0;
    background-color: #F9FAFB;
`;

const HeaderItem = styled.div`
    font-size: 13px;
    font-weight: 500;
    color: #6B7280;
    text-align: left;
`;

const ListBody = styled.div`
    display: flex;
    flex-direction: column;
`;