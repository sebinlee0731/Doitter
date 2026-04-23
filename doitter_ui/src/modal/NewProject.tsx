import React, { useState } from 'react';
import styled from 'styled-components';
import MemberAddModal from './MemberAddModal';
import ColorPickerModal from './ColorPickerModal';
import type { Project } from '../App';

interface NewProjectProps {
    onClose: () => void;
    onSaveProject: (project: Project) => void;
    currentUserId: string;
}

export default function NewProject({ onClose, onSaveProject, currentUserId }: NewProjectProps) {
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [isColorModalOpen, setIsColorModalOpen] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [memberEmails, setMemberEmails] = useState<string[]>([]);
    const [projectColor, setProjectColor] = useState('#E53E3E');

    const handleCancel = () => {
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newProject: Project = {
            id: Date.now().toString(),
            name: title,
            description: description,
            color: projectColor,
            ownerId: currentUserId,
            adminEmails: [],
            memberEmails: memberEmails,
            viewerEmails: []
        };
        onSaveProject(newProject);
        onClose();
    };

    const handleMemberAddClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsMemberModalOpen(true);
    };

    const handleColorAddClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsColorModalOpen(true);
    };

    const handleColorSave = (newColor: string) => {
        setProjectColor(newColor);
        setIsColorModalOpen(false);
    };

    const handleMemberSave = (email: string) => {
        if (email && !memberEmails.includes(email) && email !== currentUserId) {
            setMemberEmails(currentEmails => [...currentEmails, email]);
        }
        setIsMemberModalOpen(false);
    };

    const handleRemoveEmail = (emailToRemove: string) => {
        setMemberEmails(currentEmails => currentEmails.filter(email => email !== emailToRemove));
    };

    return (
        <ModalBackdrop>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <Title>새 프로젝트 만들기</Title>

                <Form onSubmit={handleSubmit}>
                    <Section>
                        <Label htmlFor="projectTitle">프로젝트 제목</Label>
                        <Input
                            id="projectTitle"
                            type="text"
                            placeholder="프로젝트 제목을 입력해주세요"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </Section>

                    <Section>
                        <Label htmlFor="projectDescription">설명</Label>
                        <TextArea
                            id="projectDescription"
                            placeholder="프로젝트에 대한 자세한 설명을 입력해주세요"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Section>

                    <Section>
                        <Label>멤버</Label>
                        <MemberAddButton type="button" onClick={handleMemberAddClick}>
                        </MemberAddButton>

                        {memberEmails.length > 0 && (
                            <InvitedMembersSection>
                                <InvitedLabel>초대한 멤버 :</InvitedLabel>
                                <EmailList>
                                    {memberEmails.map(email => (
                                        <EmailDisplay key={email}>
                                            <span>{email}</span>
                                            <RemoveEmailButton type="button" onClick={() => handleRemoveEmail(email)}>X</RemoveEmailButton>
                                        </EmailDisplay>
                                    ))}
                                </EmailList>
                            </InvitedMembersSection>
                        )}
                    </Section>

                    <Section>
                        <Label>색상</Label>
                        <ColorOptions>
                            <ColorDot color={projectColor} />
                            <AddColorButton type="button" onClick={handleColorAddClick}>+</AddColorButton>
                        </ColorOptions>
                    </Section>

                    <FormActions>
                        <CancelButton type="button" onClick={handleCancel}>취소</CancelButton>
                        <SubmitButton type="submit">저장</SubmitButton>
                    </FormActions>
                </Form>
            </ModalContent>

            {isMemberModalOpen && (
                <MemberAddModal
                    onClose={() => setIsMemberModalOpen(false)}
                    onSave={handleMemberSave}
                />
            )}
            {isColorModalOpen && (
                <ColorPickerModal
                    initialColor={projectColor}
                    onClose={() => setIsColorModalOpen(false)}
                    onSave={handleColorSave}
                />
            )}
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

    &::placeholder {
        color: #9CA3AF;
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

    &::placeholder {
        color: #9CA3AF;
    }
`;

const MemberAddButton = styled.button`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 2px dashed #D1D5DB;
    background-color: #F9FAFB;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    svg {
        width: 24px;
        height: 24px;
        color: #6B7280;
    }

    &:hover {
        background-color: #F3F4F6;
    }
`;

const InvitedMembersSection = styled.div`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    margin-top: 12px;
    gap: 8px;
`;

const InvitedLabel = styled.span`
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    flex-shrink: 0;
    margin-top: 4px;
`;

const EmailList = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
`;

const EmailDisplay = styled.div`
    font-size: 14px;
    color: #374151;
    background-color: #F3F4F6;
    padding: 4px 8px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
`;

const RemoveEmailButton = styled.button`
    background: transparent;
    border: none;
    color: #9CA3AF;
    cursor: pointer;
    font-weight: bold;
    padding: 0;
    line-height: 1;

    &:hover {
        color: #1F2937;
    }
`;

const ColorOptions = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const ColorDot = styled.div`
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: ${props => props.color};
    cursor: pointer;
    border: 2px solid #FFFFFF;
    box-shadow: 0 0 0 1px #D1D5DB;
`;

const AddColorButton = styled.button`
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1px dashed #9CA3AF;
    background-color: #F3F4F6;
    color: #6B7280;
    font-size: 16px;
    cursor: pointer;
`;

const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 32px;
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

    &:hover {
        background-color: #F9FAFB;
    }
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

    &:hover {
        background-color: #374151;
    }
`;