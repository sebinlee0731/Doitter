import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import type { Project, User } from '../App';
import ConfirmModal from '../components/ConfirmModal';

interface DelegateAdminForExitModalProps {
    project: Project;
    users: User[];
    currentUserId: string;
    onApplyProject: (updated: Project) => void;
    onClose: () => void;
}

export default function DelegateAdminForExitModal({
                                                      project,
                                                      users,
                                                      currentUserId,
                                                      onApplyProject,
                                                      onClose,
                                                  }: DelegateAdminForExitModalProps) {
    const candidates = useMemo(() => {
        const memberEmails = project.memberEmails ?? [];
        return memberEmails.filter((e) => e !== currentUserId);
    }, [project.memberEmails, currentUserId]);

    const [selected, setSelected] = useState<Set<string>>(new Set());
    const toggle = (email: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(email) ? next.delete(email) : next.add(email);
            return next;
        });
    };

    const [showConfirmExit, setShowConfirmExit] = useState(false);

    const canExit = selected.size > 0 && candidates.length > 0;

    const getUserName = (email: string) => {
        const u = users.find((x) => x.email === email);
        return u ? u.name : (email.split('@')[0] || email);
    };

    const applyDelegationAndExit = () => {
        const sel = Array.from(selected);
        const prevAdmins = project.adminEmails ?? [];
        const prevMembers = project.memberEmails ?? [];
        const prevViewers = project.viewerEmails ?? [];

        const newAdmins = Array.from(new Set([...prevAdmins, ...sel].filter(Boolean)));

        const withoutMe = (arr: string[]) => arr.filter((e) => e !== currentUserId);

        const updated: Project = {
            ...project,
            ownerId: project.ownerId === currentUserId ? null : project.ownerId,
            adminEmails: withoutMe(newAdmins),
            memberEmails: withoutMe(prevMembers),
            viewerEmails: withoutMe(prevViewers),
        };

        onApplyProject(updated);
        onClose();
    };

    return (
        <>
            <Backdrop>
                <Sheet onClick={(e) => e.stopPropagation()}>
                    <HeaderRow>
                        <Title>현재 이 프로젝트에서 당신이 유일한 관리자입니다.</Title>
                        <Hint>나가기 전에 다른 멤버에게 관리자 권한을 위임해주세요.</Hint>
                    </HeaderRow>

                    <Body>
                        <SectionTitle>{project.name} · 위임할 멤버 선택</SectionTitle>

                        <MemberList>
                            {candidates.length === 0 ? (
                                <EmptyInfo>위임 가능한 멤버가 없습니다.</EmptyInfo>
                            ) : (
                                candidates.map((email) => {
                                    const checked = selected.has(email);
                                    return (
                                        <MemberRow key={email} onClick={() => toggle(email)}>
                                            <Left>
                                                <Avatar aria-hidden />
                                                <Name title={getUserName(email)}>
                                                    {getUserName(email)}
                                                    <Email> · {email}</Email>
                                                </Name>
                                            </Left>
                                            <Checkbox
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => toggle(email)}
                                                aria-label={`${getUserName(email)} 선택`}
                                            />
                                        </MemberRow>
                                    );
                                })
                            )}
                        </MemberList>
                    </Body>

                    <Footer>
                        <LeftBtns>
                            <GhostBtn type="button" onClick={onClose}>취소</GhostBtn>
                        </LeftBtns>
                        <RightBtns>
                            <ExitBtn
                                type="button"
                                disabled={!canExit}
                                onClick={() => setShowConfirmExit(true)}
                            >
                                프로젝트 나가기
                            </ExitBtn>
                        </RightBtns>
                    </Footer>
                </Sheet>
            </Backdrop>

            {showConfirmExit && (
                <ConfirmModal
                    message={`정말로 ‘${project.name}’ 프로젝트를 나가시겠습니까?`}
                    confirmText="나가기"
                    cancelText="취소"
                    onConfirm={() => {
                        setShowConfirmExit(false);
                        applyDelegationAndExit();
                    }}
                    onCancel={() => setShowConfirmExit(false)}
                />
            )}
        </>
    );
}

const Backdrop = styled.div`
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex; align-items: center; justify-content: center;
    z-index: 2001;
`;

const Sheet = styled.div`
    width: 640px; max-width: 90vw; max-height: 80vh;
    background: #fff; border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
    display: flex; flex-direction: column;
    overflow: hidden;
`;

const HeaderRow = styled.div`
    padding: 16px 20px 10px;
    border-bottom: 1px solid #E5E7EB;
`;

const Title = styled.h2`
    margin: 0 0 6px 0;
    font-size: 18px; font-weight: 700; color: #111827;
`;

const Hint = styled.div`
    font-size: 13px; color: #6B7280;
`;

const Body = styled.div`
    padding: 14px 16px;
    display: flex; flex-direction: column; gap: 10px;
`;

const SectionTitle = styled.div`
    font-size: 13px; font-weight: 700; color: #374151;
`;

const MemberList = styled.div`
    display: flex; flex-direction: column; gap: 8px;
    max-height: 320px; overflow-y: auto;
`;

const MemberRow = styled.label`
    display: flex; align-items: center; justify-content: space-between;
    background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 8px;
    padding: 8px 10px; cursor: pointer;
`;

const Left = styled.div`
    display: flex; align-items: center; gap: 10px; min-width: 0;
`;

const Avatar = styled.div`
    width: 24px; height: 24px; border-radius: 50%;
    background: #E5E7EB; flex: 0 0 auto;
`;

const Name = styled.div`
    font-size: 14px; color: #111827;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`;

const Email = styled.span`
    color: #6B7280; font-size: 12px;
`;

const Checkbox = styled.input`
    width: 18px; height: 18px; cursor: pointer;
`;

const Footer = styled.div`
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 16px; border-top: 1px solid #E5E7EB;
`;

const LeftBtns = styled.div` display: flex; gap: 8px; `;
const RightBtns = styled.div` display: flex; gap: 8px; `;

const GhostBtn = styled.button`
    padding: 8px 14px; border: 1px solid #D1D5DB; border-radius: 6px;
    background: #fff; color: #374151; font-size: 14px; cursor: pointer;
`;

const ExitBtn = styled.button<{disabled?: boolean}>`
    padding: 8px 16px; border-radius: 6px; border: none;
    font-size: 14px; color: #fff; background: #DC2626; cursor: pointer;
    opacity: ${(p) => (p.disabled ? 0.5 : 1)};
    pointer-events: ${(p) => (p.disabled ? 'none' : 'auto')};
`;

const EmptyInfo = styled.div`
    font-size: 13px; color: #9CA3AF; padding: 12px; text-align: center;
`;