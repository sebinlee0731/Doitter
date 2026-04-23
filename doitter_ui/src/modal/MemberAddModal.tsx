import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from '../components/Modal';

interface MemberAddModalProps {
    onClose: () => void;
    onSave: (email: string) => void;
}

const emailRegex = /^[^\s@ㄱ-ㅎ가-힣]+@[^\s@ㄱ-ㅎ가-힣]+\.[^\s@ㄱ-ㅎ가-힣]+$/;

export default function MemberAddModal({ onClose, onSave }: MemberAddModalProps) {
    const [email, setEmail] = useState('');
    const [inviteLink, setInviteLink] = useState('');

    const [showErrorModal, setShowErrorModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const handleCancel = () => {
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && !emailRegex.test(email)) {
            setModalMessage('이메일을 다시 확인해주세요.');
            setShowErrorModal(true);
            return;
        }
        onSave(email);
    };

    const handleCreateLink = (e: React.MouseEvent) => {
        e.preventDefault();
        const fakeToken = Math.random().toString(36).substring(2, 12);
        setInviteLink(`https://api.doit.example.com/invites/${fakeToken}`);
    };

    const handleLinkClick = (e: React.MouseEvent<HTMLInputElement>) => {
        navigator.clipboard.writeText(e.currentTarget.value);
        alert("링크가 복사되었습니다!");
    };

    return (
        <>
            <ModalBackdrop>
                <ModalContent onClick={(e) => e.stopPropagation()}>
                    <Title>멤버 초대하기</Title>

                    <Form onSubmit={handleSubmit}>
                        <Section>
                            <Label htmlFor="memberEmail">이메일로 초대</Label>
                            <Input
                                id="memberEmail"
                                type="email"
                                placeholder="추가할 멤버의 이메일을 작성하세요"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Section>

                        <OrSeparator>또는</OrSeparator>

                        <Section>
                            <Label>초대 링크로 초대</Label>
                            <InviteButton type="button" onClick={handleCreateLink}>
                                초대 링크 생성
                            </InviteButton>
                            {inviteLink && (
                                <LinkDisplayInput
                                    type="text"
                                    value={inviteLink}
                                    readOnly
                                    onClick={handleLinkClick}
                                />
                            )}
                        </Section>

                        <FormActions>
                            <CancelButton type="button" onClick={handleCancel}>취소</CancelButton>
                            <SubmitButton type="submit">초대하기</SubmitButton>
                        </FormActions>
                    </Form>
                </ModalContent>
            </ModalBackdrop>

            {showErrorModal && (
                <ErrorModalWrapper>
                    <Modal
                        message={modalMessage}
                        onClose={() => setShowErrorModal(false)}
                    />
                </ErrorModalWrapper>
            )}
        </>
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

const ErrorModalWrapper = styled.div`
    z-index: 2000;
`;

const ModalContent = styled.div`
    padding: 16px;
    background-color: #FFFFFF;
    border-radius: 8px;
    width: 400px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const Title = styled.h2`
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 16px 0;
    border-bottom: 1px solid #E0E0E0;
    padding-bottom: 16px;
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

const Input = styled.input`
    flex-grow: 1;
    font-size: 15px;
    padding: 10px 12px;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    background-color: #F9FAFB;

    &::placeholder {
        color: #9CA3AF;
    }
`;

const OrSeparator = styled.div`
    font-size: 12px;
    color: #6B7280;
    text-align: center;
    margin: -8px 0;
`;

const InviteButton = styled.button`
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    color: #FFFFFF;
    background-color: #1F2937;
    border: none;
    border-radius: 6px;
    cursor: pointer;
`;

const LinkDisplayInput = styled.input`
    font-size: 14px;
    padding: 8px 12px;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    background-color: #F9FAFB;
    color: #374151;
    margin-top: 8px;
    width: 100%;
    box-sizing: border-box;
    cursor: pointer;
    overflow-x: auto;
`;

const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 16px;
    padding-top: 16px;
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