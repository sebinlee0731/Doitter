import React, { useState } from 'react';
import styled from 'styled-components';
import { ReactComponent as IcRoundPlus } from '../icons/ic_round-plus.svg';
import Modal from '../components/Modal';

const PREDEFINED_COLORS = [
    '#FF6B6B','#FF8B6B','#FFAA88','#FFCF56','#F7B733','#FEC771',
    '#4ECDC4','#26A69A','#45B7D1','#5AA9E6','#77A1D3','#A18CD1',
    '#B2CC83','#9ED28F','#C6E377','#D4E157','#A0D468','#7CC576',
    '#FD9644','#F57C00','#E684AE','#D63384','#C2185B','#9C27B0',
];

const getMemberColor = (id: string) => {
    const key = id[0]?.toLowerCase() || 'x';
    const code = key.charCodeAt(0);
    if (code >= 97 && code <= 122) return PREDEFINED_COLORS[(code - 97) % PREDEFINED_COLORS.length];
    if (code >= 48 && code <= 57) return PREDEFINED_COLORS[(code - 48) % PREDEFINED_COLORS.length];
    return '#999999';
};

interface SettingsModalProps {
    onClose: () => void;
    onLogout: () => void;
    onDeleteAccount: () => void;
    currentUserName: string;
    currentUserEmail: string;
    onUpdateUser: (userId: string, updates: { name?: string; password?: string }) => void;
}

export default function SettingsModal({ onClose, onLogout, onDeleteAccount, currentUserName, currentUserEmail, onUpdateUser }: SettingsModalProps) {
    const [name, setName] = useState(currentUserName);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const onlyEnglishNumberSpecial = (text: string) => {
        return text.replace(/[^A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g, '');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updates: { name?: string; password?: string } = {};
        if (password) {
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
            if (!passwordRegex.test(password)) {
                setModalMessage('비밀번호는 영문, 숫자, 특수기호 포함 8자리 이상이어야 합니다.');
                setShowErrorModal(true);
                return;
            }
            if (password !== confirmPassword) {
                setModalMessage('비밀번호가 일치하지 않습니다.');
                setShowErrorModal(true);
                return;
            }
            updates.password = password;
        }
        if (name !== currentUserName) updates.name = name;
        if (Object.keys(updates).length > 0) onUpdateUser(currentUserEmail, updates);
        onClose();
    };

    return (
        <>
            <ModalBackdrop>
                <ModalContent onClick={(e) => e.stopPropagation()}>
                    <Title>설정</Title>
                    <Form onSubmit={handleSubmit}>
                        <MainContent>
                            <LeftPanel>
                                <Section>
                                    <Label>이메일</Label>
                                    <Input type="email" value={currentUserEmail} readOnly />
                                </Section>
                                <Section>
                                    <Label>새 비밀번호</Label>
                                    <Input
                                        type="password"
                                        placeholder="새 비밀번호"
                                        value={password}
                                        inputMode="text"
                                        autoComplete="new-password"
                                        onChange={(e) => setPassword(onlyEnglishNumberSpecial(e.target.value))}
                                    />
                                </Section>
                                <Section>
                                    <Label>새 비밀번호 확인</Label>
                                    <Input
                                        type="password"
                                        placeholder="새 비밀번호 확인"
                                        value={confirmPassword}
                                        inputMode="text"
                                        autoComplete="new-password"
                                        onChange={(e) => setConfirmPassword(onlyEnglishNumberSpecial(e.target.value))}
                                    />
                                </Section>
                            </LeftPanel>

                            <RightPanel>
                                <ProfileAvatar bgColor={getMemberColor(currentUserEmail)}>
                                    <StyledIcRoundPlus />
                                </ProfileAvatar>
                                <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                            </RightPanel>
                        </MainContent>

                        <FormActions>
                            <LeftGroup>
                                <DeleteAccountButton type="button" onClick={onDeleteAccount}>계정 삭제</DeleteAccountButton>
                                <LogoutButton type="button" onClick={onLogout}>로그아웃</LogoutButton>
                            </LeftGroup>

                            <RightGroup>
                                <CancelButton type="button" onClick={onClose}>취소</CancelButton>
                                <SubmitButton type="submit">저장</SubmitButton>
                            </RightGroup>
                        </FormActions>
                    </Form>
                </ModalContent>
            </ModalBackdrop>

            {showErrorModal && (
                <Modal message={modalMessage} onClose={() => setShowErrorModal(false)} />
            )}
        </>
    );
}

const ModalBackdrop = styled.div`
    position: fixed;
    inset: 0;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    padding: 24px;
    background-color: #FFFFFF;
    border-radius: 8px;
    width: 600px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
`;

const Title = styled.h2`
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 24px 0;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
`;

const MainContent = styled.div`
    display: flex;
    gap: 24px;
`;

const LeftPanel = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const RightPanel = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
`;

const ProfileAvatar = styled.div<{ bgColor: string }>`
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background-color: ${props => props.bgColor};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
`;

const StyledIcRoundPlus = styled(IcRoundPlus)`
    width: 100px;
    height: 100px;
    color: white;
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

const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 32px;
    padding-top: 20px;
    border-top: 1px solid #E0E0E0;
`;

const LogoutButton = styled.button`
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #EF4444;
    background-color: #FFFFFF;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    cursor: pointer;
    margin-right: auto;
`;

const DeleteButton = styled.button`
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #DC2626;
    background-color: #FFFFFF;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    cursor: pointer;
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

const ConfirmBackdrop = styled.div`
    position: fixed;
    inset: 0;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
`;

const ConfirmBox = styled.div`
    background-color: #FFFFFF;
    padding: 32px;
    border-radius: 10px;
    width: 450px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
`;

const ConfirmText = styled.div`
    font-size: 18px;
    font-weight: 600;
`;

const ConfirmButtons = styled.div`
    display: flex;
    gap: 16px;
`;

const ConfirmCancel = styled.button`
    padding: 8px 24px;
    font-size: 14px;
    font-weight: 500;
    background-color: #6B7280;
    color: #FFFFFF;
    border-radius: 6px;
    border: none;
    cursor: pointer;
`;

const ConfirmDelete = styled.button`
    padding: 8px 24px;
    font-size: 14px;
    font-weight: 500;
    background-color: #DC2626;
    color: #FFFFFF;
    border-radius: 6px;
    border: none;
    cursor: pointer;
`;

const DeleteAccountButton = styled.button`
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #EF4444;
    background-color: #FFFFFF;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    cursor: pointer;
    margin-right: auto;
`;

const LeftGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-right: auto;
`;

const RightGroup = styled.div`
  display: flex;
  gap: 8px;
`;