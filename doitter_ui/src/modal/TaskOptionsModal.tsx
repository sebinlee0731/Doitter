import React, { useState } from 'react';
import styled from 'styled-components';
import type { Task, Label } from '../App';

interface TaskOptionsModalProps {
    task: Task;
    allLabels: Label[];
    onClose: () => void;
    onSave: (taskId: string, newDescription: string, newLabelIds: string[], newStatus: Task['status']) => void;
}

export default function TaskOptionsModal({ task, allLabels, onClose, onSave }: TaskOptionsModalProps) {
    const [description, setDescription] = useState(task.description);
    const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>(task.labels.map((l: Label) => l.id));
    const [status, setStatus] = useState<Task['status']>(task.status);

    const handleAddLabel = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const labelIdToAdd = e.target.value;
        if (labelIdToAdd && !selectedLabelIds.includes(labelIdToAdd)) {
            setSelectedLabelIds(currentIds => [...currentIds, labelIdToAdd]);
        }
        e.target.value = "";
    };

    const handleRemoveLabel = (labelIdToRemove: string) => {
        setSelectedLabelIds(currentIds => currentIds.filter(id => id !== labelIdToRemove));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(task.id, description, selectedLabelIds, status);
        onClose();
    };

    const availableLabels = allLabels.filter(l => !selectedLabelIds.includes(l.id));
    const selectedLabels = allLabels.filter(l => selectedLabelIds.includes(l.id));

    return (
        <ModalBackdrop>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <Title>추가 옵션 <CloseButton onClick={onClose}>X</CloseButton></Title>
                <Form onSubmit={handleSubmit}>
                    <Section>
                        <Label>라벨 선택</Label>
                        <Select onChange={handleAddLabel} value="">
                            <option value="" disabled>라벨을 선택하세요...</option>
                            {availableLabels.map(label => (
                                <option key={label.id} value={label.id}>
                                    {label.name}
                                </option>
                            ))}
                        </Select>
                        <SelectedLabelsList>
                            {selectedLabels.map(label => (
                                <LabelTag key={label.id} color={label.color}>
                                    {label.name}
                                    <RemoveButton type="button" onClick={() => handleRemoveLabel(label.id)}>X</RemoveButton>
                                </LabelTag>
                            ))}
                        </SelectedLabelsList>
                    </Section>

                    <Section>
                        <Label>상태</Label>
                        <Select value={status} onChange={(e) => setStatus(e.target.value as Task['status'])}>
                            <option value="TODO">To-Do</option>
                            <option value="DOING">Doing</option>
                            <option value="DONE">Done</option>
                        </Select>
                    </Section>

                    <Section>
                        <Label>설명</Label>
                        <TextArea
                            placeholder="설명을 입력해주세요"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Section>

                    <FormActions>
                        <CancelButton type="button" onClick={onClose}>취소</CancelButton>
                        <SubmitButton type="submit">저장</SubmitButton>
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
    z-index: 1002;
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
`;

const Label = styled.label`
    font-size: 14px;
    font-weight: 500;
    color: #374151;
`;

const Select = styled.select`
    font-size: 15px;
    padding: 10px 12px;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    background-color: #F9FAFB;

    option {
        padding: 8px;
    }
`;

const SelectedLabelsList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
`;

const LabelTag = styled.div<{ color: string }>`
    font-size: 13px;
    font-weight: 500;
    color: #1F2937;
    background-color: ${props => props.color};
    padding: 4px 8px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 6px;
`;

const RemoveButton = styled.button`
    background: transparent;
    border: none;
    color: #1F2937;
    opacity: 0.5;
    cursor: pointer;
    font-weight: bold;
    padding: 0;
    line-height: 1;

    &:hover {
        opacity: 1;
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