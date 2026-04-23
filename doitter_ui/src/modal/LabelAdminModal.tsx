import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { SketchPicker, ColorResult } from 'react-color';
import type { Label as LabelType } from '../App';
import { ReactComponent as LabelEdit } from '../icons/label_edit.svg';
import { ReactComponent as LabelDelete } from '../icons/label_delete.svg';

interface LabelAdminModalProps {
    onClose: () => void;
    labels: LabelType[];
    onAdd: (name: string, color: string, projectId: string) => void;
    onEdit: (id: string, name: string, color: string, projectId: string) => void;
    onDelete: (id: string, projectId: string) => void;
}

export default function LabelAdminModal({ onClose, labels, onAdd, onEdit, onDelete }: LabelAdminModalProps) {
    const [newLabelName, setNewLabelName] = useState('');
    const [newLabelColor, setNewLabelColor] = useState('#000000');

    const [editingLabel, setEditingLabel] = useState<LabelType | null>(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('#000000');

    useEffect(() => {
        if (editingLabel) {
            setEditName(editingLabel.name);
            setEditColor(editingLabel.color);
        }
    }, [editingLabel]);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newLabelName) {
            // projectId는 현재 로직에서 접근할 수 없으므로, onAdd 호출 시 빈 문자열을 임시로 사용합니다.
            onAdd(newLabelName, newLabelColor, '');
            setNewLabelName('');
            setNewLabelColor('#000000');
        }
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingLabel && editName) {
            // projectId는 현재 로직에서 접근할 수 없으므로, onEdit 호출 시 빈 문자열을 임시로 사용합니다.
            onEdit(editingLabel.id, editName, editColor, editingLabel.projectId);
            setEditingLabel(null);
        }
    };

    return (
        <ModalBackdrop>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <Title>라벨 관리 <CloseButton onClick={onClose}>X</CloseButton></Title>

                {editingLabel ? (
                    <Form onSubmit={handleUpdate}>
                        <Section>
                            <Label>라벨 수정</Label>
                            <Input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                        </Section>
                        <Section>
                            <Label>새 라벨 생성</Label>
                            <StyledSketchPicker
                                color={editColor}
                                onChange={(color: ColorResult) => setEditColor(color.hex)}
                                disableAlpha={true}
                                presetColors={[]}
                            />
                        </Section>
                        <FormActions>
                            <CancelButton type="button" onClick={() => setEditingLabel(null)}>취소</CancelButton>
                            <SubmitButton type="submit">수정</SubmitButton>
                        </FormActions>
                    </Form>
                ) : (
                    <Form onSubmit={handleCreate}>
                        <Section>
                            <Label>새 라벨 생성</Label>
                            <Input
                                type="text"
                                placeholder="라벨 이름을 입력해주세요 !"
                                value={newLabelName}
                                onChange={(e) => setNewLabelName(e.target.value)}
                            />
                        </Section>
                        <Section>
                            <Label>색상 코드 입력하세요</Label>
                            <StyledSketchPicker
                                color={newLabelColor}
                                onChange={(color: ColorResult) => setNewLabelColor(color.hex)}
                                disableAlpha={true}
                                presetColors={[]}
                            />
                        </Section>
                        <SubmitButton type="submit">생성</SubmitButton>
                    </Form>
                )}

                <ListSection>
                    <Label>기존 라벨</Label>
                    <LabelList>
                        {labels.map(label => (
                            <LabelItem key={label.id}>
                                <LabelTag color={label.color}>{label.name}</LabelTag>
                                <IconButtons>
                                    <IconButton onClick={() => setEditingLabel(label)}>
                                        <LabelEdit />
                                    </IconButton>
                                    <IconButton onClick={() => onDelete(label.id, label.projectId)}>
                                        <LabelDelete />
                                    </IconButton>
                                </IconButtons>
                            </LabelItem>
                        ))}
                    </LabelList>
                </ListSection>

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
  background-color: #F9FAFB;
  border-radius: 6px;
  padding: 12px;
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
  background-color: #FFFFFF;
`;

const StyledSketchPicker = styled(SketchPicker)`
  box-shadow: none !important;
  border: 1px solid #D1D5DB !important;
  width: 100% !important;
  padding: 0 !important;
  box-sizing: border-box;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
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

const ListSection = styled.div`
  margin-top: 24px;
`;

const LabelList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
`;

const LabelItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #F9FAFB;
  padding: 8px 12px;
  border-radius: 6px;
`;

const LabelTag = styled.span<{ color: string }>`
  font-size: 13px;
  font-weight: 500;
  color: #1F2937;
  background-color: ${props => props.color};
  padding: 2px 8px;
  border-radius: 4px;
`;

const IconButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  
  svg {
    width: 16px;
    height: 16px;
    color: #6B7280;
  }
`;