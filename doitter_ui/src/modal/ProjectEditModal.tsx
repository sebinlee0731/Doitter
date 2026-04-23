import React, { useState } from 'react';
import styled from 'styled-components';
import type { Project, User } from '../App';
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

interface ProjectEditModalProps {
    project: Project;
    onClose: () => void;
    onSave: (project: Project) => void;
    onDelete: (projectId: string) => void;
    currentUserId: string;
    isProjectAdmin: boolean;
    users: User[];
}

export default function ProjectEditModal({ project, onClose, onSave, onDelete, currentUserId, isProjectAdmin, users }: ProjectEditModalProps) {
    const [title, setTitle] = useState(project.name);
    const [description, setDescription] = useState(project.description);
    const [adminEmails, setAdminEmails] = useState(project.adminEmails);
    const [memberEmails, setMemberEmails] = useState(project.memberEmails);

    const getMemberName = (email: string) => {
        const user = users.find(u => u.email === email);
        return user ? user.name : email.split('@')[0];
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedProject: Project = {
            ...project,
            name: title,
            description: description,
            adminEmails: adminEmails,
            memberEmails: memberEmails,
        };
        onSave(updatedProject);
        onClose();
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        if (window.confirm(`'${project.name}' 프로젝트를 정말 삭제하시겠습니까?`)) {
            onDelete(project.id);
            onClose();
        }
    };

    const isOwner = project.ownerId === currentUserId;
    const currentUserName = getMemberName(currentUserId);

    return (
        <ModalBackdrop>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <Title>프로젝트 편집</Title>
                <Form onSubmit={handleSave}>
                    <Section>
                        <Label htmlFor="projectTitle">프로젝트 제목</Label>
                        <Input
                            id="projectTitle"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            readOnly={!isProjectAdmin}
                        />
                    </Section>

                    <Section>
                        <Label htmlFor="projectDescription">설명</Label>
                        <TextArea
                            id="projectDescription"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            readOnly={!isProjectAdmin}
                        />
                    </Section>

                    <Section>
                        <Label>멤버</Label>
                        <MemberList>
                            <MemberItem>
                                <Avatar bgColor={getMemberColor(currentUserId)}>
                                    <StyledIcRoundPlus />
                                </Avatar>
                                <span>{currentUserName} {isOwner ? '(관리자)' : ''}</span>
                            </MemberItem>
                            {adminEmails.map((email: string) => (
                                <MemberItem key={email}>
                                    <Avatar bgColor={getMemberColor(email)}>
                                        <StyledIcRoundPlus />
                                    </Avatar>
                                    <span>{getMemberName(email)} (관리자)</span>
                                </MemberItem>
                            ))}
                            {memberEmails.map((email: string) => (
                                <MemberItem key={email}>
                                    <Avatar bgColor={getMemberColor(email)}>
                                        <StyledIcRoundPlus />
                                    </Avatar>
                                    <span>{getMemberName(email)}</span>
                                </MemberItem>
                            ))}
                        </MemberList>
                    </Section>

                    <FormActions>
                        <CancelButton type="button" onClick={onClose}>취소</CancelButton>
                        {isProjectAdmin && (
                            <>
                                <DeleteButton type="button" onClick={handleDelete}>삭제</DeleteButton>
                                <SubmitButton type="submit">저장</SubmitButton>
                            </>
                        )}
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
    z-index: 1000;
`;

const ModalContent = styled.div`
    padding: 16px;
    background-color: #FFFFFF;
    border: 1px solid #E0E0E0;
    border-radius: 8px;
    max-width: 800px;
    width: 90%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const Title = styled.h2`
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 24px 0;
    border-bottom: 1px solid #E0E0E0;
    padding-bottom: 16px;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 800px;
`;

const Section = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
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

    &:read-only {
        background-color: #E5E7EB;
        cursor: not-allowed;
    }
`;

const TextArea = styled.textarea`
    font-size: 15px;
    padding: 10px 12px;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    background-color: #F9FAFB;
    resize: vertical;
    font-family: inherit;

    &:read-only {
        background-color: #E5E7EB;
        cursor: not-allowed;
    }
`;

const MemberList = styled.div`
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
`;

const MemberItem = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #F3F4F6;
    padding: 4px 8px;
    border-radius: 6px;
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

const StyledIcRoundPlus = styled(IcRoundPlus)<{ color?: string }>`
    width: 24px;
    height: 24px;
    color: ${props => props.color || 'white'};
`;

const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 16px;
    padding-top: 20px;
    border-top: 1px solid #E0E0E0;
`;

const CancelButton = styled.button`
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    background-color: #FFFFFF;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    cursor: pointer;
`;

const DeleteButton = styled.button`
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #FFFFFF;
    background-color: #EF4444;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin-right: auto;
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