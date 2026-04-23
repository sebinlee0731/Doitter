import React from 'react';
import styled from 'styled-components';
import type { Task, User, Label } from '../App';
import { ReactComponent as IcRoundPlus } from '../icons/ic_round-plus.svg';

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

const getMemberName = (email: string, users: User[]) => {
    const user = users.find(u => u.email === email);
    return user ? user.name : email.split('@')[0];
};

export default function KanbanCard({ task, onCardClick, users }: { task: Task; onCardClick: () => void; users: User[] }) {
    const shortDate = task.dueDate
        ? `${task.dueDate.getMonth() + 1}월 ${task.dueDate.getDate()}일`
        : null;

    const assigneeName = getMemberName(task.assigneeId, users);

    return (
        <CardWrapper onClick={onCardClick}>
            <CardTitle>{task.title}</CardTitle>
            <AssigneeName>
                <Avatar bgColor={getMemberColor(task.assigneeId)}>
                    <StyledIcRoundPlus />
                </Avatar>
                {assigneeName}
            </AssigneeName>
            <CardFooter>
                <LeftFooter>
                    <LabelWrapper>
                        {task.labels.map(label => (
                            <LabelTag key={label.id} color={label.color}>
                                {label.name}
                            </LabelTag>
                        ))}
                    </LabelWrapper>
                    <PriorityTag priority={task.priority}>{task.priority}</PriorityTag>
                </LeftFooter>
                {shortDate && <DueDate>📅 {shortDate}</DueDate>}
            </CardFooter>
        </CardWrapper>
    );
}

const CardWrapper = styled.div`
    background-color: #FFFFFF;
    border-radius: 6px;
    border: 1px solid #E0E0E0;
    padding: 12px;
    margin-bottom: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    cursor: grab;
`;

const CardTitle = styled.h3`
    font-size: 15px;
    font-weight: 500;
    margin: 0 0 8px 0;
`;

const AssigneeName = styled.div`
    font-size: 13px;
    color: #6B7280;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 12px;
`;

const Avatar = styled.div<{ bgColor: string }>`
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background-color: ${props => props.bgColor};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
`;

const StyledIcRoundPlus = styled(IcRoundPlus)`
    width: 18px;
    height: 18px;
    color: white;
`;

const CardFooter = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const LeftFooter = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
`;

const LabelWrapper = styled.div`
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
`;

const LabelTag = styled.span<{ color: string }>`
  font-size: 12px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  color: #1F2937;
  background-color: ${props => props.color};
`;

const PriorityTag = styled.span<{ priority: string }>`
  font-size: 12px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  color: ${props =>
    props.priority === 'HIGH' ? '#991B1B' :
        props.priority === 'MEDIUM' ? '#9A3412' : '#166534'};
  background-color: ${props =>
    props.priority === 'HIGH' ? '#FEE2E2' :
        props.priority === 'MEDIUM' ? '#FFEDD5' : '#DCFCE7'};
`;

const DueDate = styled.span`
  font-size: 12px;
  color: #6B7280;
  flex-shrink: 0;
`;