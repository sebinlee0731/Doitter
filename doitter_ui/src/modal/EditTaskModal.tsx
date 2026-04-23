import React, { useState } from 'react';
import styled from 'styled-components';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import type { Task, EditableTask, User } from '../App';

interface EditTaskModalProps {
    onClose: () => void;
    onEditTask: (taskId: string, updatedTaskData: EditableTask) => void;
    allMembers: string[];
    task: Task;
    users: User[];
    isProjectAdmin: boolean;
    currentUserId: string;
}

const getMemberName = (email: string, users: User[]) => {
    const user = users.find(u => u.email === email);
    return user ? user.name : email.split('@')[0];
};

export default function EditTaskModal({ onClose, onEditTask, allMembers, task, users, isProjectAdmin, currentUserId }: EditTaskModalProps) {
    const [title, setTitle] = useState(task.title);
    const [assigneeId, setAssigneeId] = useState(task.assigneeId);
    const [priority, setPriority] = useState(task.priority);
    const [dueDate, setDueDate] = useState<Date | null>(task.dueDate);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) {
            alert('작업 제목을 입력해주세요!');
            return;
        }
        onEditTask(task.id, {
            title,
            assigneeId,
            priority,
            dueDate,
            description: task.description
        });
        onClose();
    };

    return (
        <ModalBackdrop>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <Title>작업 수정 <CloseButton onClick={onClose}>X</CloseButton></Title>
                <Form onSubmit={handleSubmit}>
                    <Section>
                        <Label>작업제목</Label>
                        <Input
                            type="text"
                            placeholder="작업 제목을 입력해주세요 !"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Section>

                    <Row>
                        <Section>
                            <Label>담당자</Label>
                            <Select
                                value={assigneeId}
                                onChange={(e) => setAssigneeId(e.target.value)}
                                disabled={!isProjectAdmin}
                            >
                                {(isProjectAdmin
                                        ? allMembers
                                        : [currentUserId]
                                ).map(memberEmail => (
                                    <option key={memberEmail} value={memberEmail}>
                                        {getMemberName(memberEmail, users)}
                                    </option>
                                ))}
                            </Select>
                        </Section>
                        <Section>
                            <Label>마감일자</Label>
                            <DatePickerWrapper>
                                <DatePicker
                                    selected={dueDate}
                                    onChange={(date) => setDueDate(date)}
                                    placeholderText="마감일자 입력"
                                    dateFormat="MM/dd"
                                />
                            </DatePickerWrapper>
                        </Section>
                    </Row>

                    <Section>
                        <Label>우선순위</Label>
                        <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </Select>
                    </Section>

                    <FormActions>
                        <CancelButton type="button" onClick={onClose}>취소</CancelButton>
                        <SubmitButton type="submit">생성</SubmitButton>
                    </FormActions>
                </Form>
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
    margin: 0 0 24px 0;
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

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const Section = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
`;

const Label = styled.label`
    font-size: 14px;
    font-weight: 500;
    color: #374151;
`;

const Input = styled.input`
    font-size: 15px;
    padding: 10px 12px;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    background-color: #F9FAFB;
`;

const Row = styled.div`
    display: flex;
    gap: 16px;
`;

const Select = styled.select`
    font-size: 15px;
    padding: 10px 12px;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    background-color: #F9FAFB;
`;

const DatePickerWrapper = styled.div`
    .react-datepicker-wrapper {
        width: 100%;
    }
    .react-datepicker__input-container input {
        font-size: 15px;
        padding: 10px 12px;
        border: 1px solid #D1D5DB;
        border-radius: 6px;
        background-color: #F9FAFB;
        width: 100%;
        box-sizing: border-box;
    }
`;

const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
`;

const CancelButton = styled.button`
    padding: 6px 12px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    background-color: #FFFFFF;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    cursor: pointer;
`;

const SubmitButton = styled.button`
    padding: 6px 12px;
    font-size: 14px;
    font-weight: 500;
    color: #FFFFFF;
    background-color: #1F2937;
    border: none;
    border-radius: 6px;
    cursor: pointer;
`;