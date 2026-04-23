import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import type { Project, User } from '../App';
import ConfirmModal from '../components/ConfirmModal';
import { ReactComponent as CheckboxIcon } from '../icons/checkbox.svg';

interface DelegateAdminModalProps {
    projects: Project[];
    users: User[];
    currentUserId: string;
    onApplyProjects: (updatedProjects: Project[]) => void;
    onConfirmDeleteUser: () => void;
    onClose: () => void;
}

export default function DelegateAdminModal({
                                               projects,
                                               users,
                                               currentUserId,
                                               onApplyProjects,
                                               onConfirmDeleteUser,
                                               onClose,
                                           }: DelegateAdminModalProps) {
    const requiresDelegation = (p: Project): boolean => {
        const owner = p.ownerId;
        const admins = p.adminEmails ?? [];
        const members = p.memberEmails ?? [];

        const iAmOwner = owner === currentUserId;
        const iAmAdmin = admins.includes(currentUserId);

        const othersInProject = new Set<string>([
            ...admins.filter(e => e !== currentUserId),
            ...members.filter(e => e !== currentUserId),
            ...(owner && owner !== currentUserId ? [owner] : []),
        ]);

        if (othersInProject.size === 0) return false;

        const candidates = members.filter(e => e !== currentUserId);
        if (candidates.length === 0) return false;

        if (iAmOwner && admins.filter(a => a !== currentUserId).length === 0) return true;

        if (iAmAdmin && !owner && admins.length === 1 && admins[0] === currentUserId) return true;

        return false;
    };

    const needProjects = useMemo(
        () => projects.filter(requiresDelegation),
        [projects, currentUserId]
    );

    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

    const [tempDelegations, setTempDelegations] = useState<Record<string, Set<string>>>({});

    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (needProjects.length > 0 && !activeProjectId) {
            setActiveProjectId(needProjects[0].id);
        }
    }, [needProjects, activeProjectId]);

    const candidateMembers = (p: Project): string[] =>
        (p.memberEmails ?? []).filter(email => email !== currentUserId);

    const isProjectComplete = (p: Project): boolean => {
        const selected = tempDelegations[p.id];
        return !!selected && selected.size >= 1;
    };

    const allComplete = needProjects.length > 0 && needProjects.every(isProjectComplete);

    const activeProject = needProjects.find(p => p.id === activeProjectId) || null;

    const toggleCandidate = (projectId: string, email: string) => {
        setTempDelegations(prev => {
            const next = { ...prev };
            const curr = new Set(next[projectId] ?? new Set<string>());
            if (curr.has(email)) curr.delete(email);
            else curr.add(email);
            next[projectId] = curr;
            return next;
        });
    };

    const getUserName = (email: string) => {
        const u = users.find(x => x.email === email);
        return u ? u.name : (email.split('@')[0] || email);
    };

    const handleConfirmDelete = () => {
        const updated = projects.map(p => {
            const selected = tempDelegations[p.id];
            if (!selected || selected.size === 0) return p;
            const union = Array.from(new Set([...(p.adminEmails ?? []), ...Array.from(selected)]));
            return { ...p, adminEmails: union };
        });

        onApplyProjects(updated);
        onConfirmDeleteUser();
    };

    return (
        <>
            <Backdrop>
                <Sheet onClick={e => e.stopPropagation()}>
                    <HeaderRow>
                        <Title>관리자 위임 필요</Title>
                        <Hint>현재 당신이 유일한 관리자인 프로젝트가 있습니다. 계정을 삭제하려면 아래에서 관리자 권한을 위임하세요.</Hint>
                    </HeaderRow>

                    <Body>
                        <TopPane>
                            {needProjects.length === 0 ? (
                                <EmptyInfo>위임이 필요한 프로젝트가 없습니다.</EmptyInfo>
                            ) : (
                                <ProjectList>
                                    {needProjects.map(p => {
                                        const complete = isProjectComplete(p);
                                        const active = activeProjectId === p.id;
                                        return (
                                            <ProjectItem
                                                key={p.id}
                                                $active={active}
                                                onClick={() => setActiveProjectId(p.id)}
                                            >
                                                <ProjectName title={p.name}>{p.name}</ProjectName>
                                                <StatusRight>
                                                    {complete ? <DoneMark /> : <NotDoneDot />}
                                                </StatusRight>
                                            </ProjectItem>
                                        );
                                    })}
                                </ProjectList>
                            )}
                        </TopPane>

                        <BottomPane>
                            {activeProject ? (
                                <>
                                    <SectionTitle>{activeProject.name} · 위임 후보</SectionTitle>
                                    <MemberList>
                                        {candidateMembers(activeProject).length === 0 ? (
                                            <EmptyInfo>위임 가능한 멤버가 없습니다.</EmptyInfo>
                                        ) : (
                                            candidateMembers(activeProject).map(email => {
                                                const sel = tempDelegations[activeProject.id]?.has(email) ?? false;
                                                return (
                                                    <MemberRow key={email}>
                                                        <MemberName title={getUserName(email)}>
                                                            {getUserName(email)}
                                                            <MemberEmail> · {email}</MemberEmail>
                                                        </MemberName>
                                                        <CheckBox
                                                            type="checkbox"
                                                            checked={sel}
                                                            onChange={() => toggleCandidate(activeProject.id, email)}
                                                        />
                                                    </MemberRow>
                                                );
                                            })
                                        )}
                                    </MemberList>
                                </>
                            ) : (
                                <EmptyInfo>프로젝트를 선택하세요.</EmptyInfo>
                            )}
                        </BottomPane>
                    </Body>

                    <Footer>
                        <LeftBtns>
                            <CancelBtn type="button" onClick={onClose}>취소</CancelBtn>
                        </LeftBtns>
                        <RightBtns>
                            <DeleteBtn
                                type="button"
                                disabled={!allComplete}
                                onClick={() => setShowConfirm(true)}
                            >
                                삭제
                            </DeleteBtn>
                        </RightBtns>
                    </Footer>
                </Sheet>
            </Backdrop>

            {showConfirm && (
                <ConfirmModal
                    message="정말로 계정을 삭제하시겠습니까?"
                    confirmText="삭제"
                    cancelText="취소"
                    onConfirm={() => {
                        setShowConfirm(false);
                        handleConfirmDelete();
                    }}
                    onCancel={() => setShowConfirm(false)}
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
  width: 760px; height: 600px;
  background: #fff; border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  display: flex; flex-direction: column;
  overflow: hidden;
`;

const HeaderRow = styled.div`
  padding: 16px 20px 8px;
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
    flex: 1;
    overflow: auto;
    display: grid;
    grid-template-rows: 220px 1fr;
    gap: 12px;
    padding: 12px 16px;
`;

const TopPane = styled.div`
  border: 1px solid #E5E7EB; background: #F9FAFB; border-radius: 8px;
  padding: 10px; overflow: auto;
`;

const BottomPane = styled.div`
  border: 1px solid #E5E7EB; background: #FDFDFE; border-radius: 8px;
  padding: 10px; overflow: auto;
`;

const SectionTitle = styled.div`
  font-size: 13px; font-weight: 700; color: #374151;
  margin: 0 0 8px 0;
`;

const ProjectList = styled.div`
  display: flex; flex-direction: column; gap: 8px;
`;

const ProjectItem = styled.button<{ $active?: boolean }>`
  display: flex; align-items: center; justify-content: space-between;
  width: 100%;
  background: #fff;
  border: 1px solid ${({ $active }) => ($active ? '#6366F1' : '#E5E7EB')};
  outline: none;
  border-radius: 8px;
  padding: 10px 12px;
  cursor: pointer;
  transition: box-shadow .12s ease, border-color .12s ease, transform .02s ease;
  &:hover { box-shadow: 0 1px 0 rgba(0,0,0,0.05); }
  &:active { transform: translateY(1px); }
`;

const ProjectName = styled.div`
  font-size: 14px; color: #111827;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  padding-right: 10px;
`;

const StatusRight = styled.div`
  display: flex; align-items: center; gap: 8px; flex: 0 0 auto;
`;

const DoneMark = styled(CheckboxIcon)`
  width: 18px; height: 18px;
  color: #10B981;
`;

const NotDoneDot = styled.div`
  width: 10px; height: 10px; border-radius: 50%;
  background: #D1D5DB;
`;

const MemberList = styled.div`
    display: flex; flex-direction: column; gap: 8px;
    max-height: 180px;
    overflow-y: auto;
`;

const MemberRow = styled.label`
  display: flex; align-items: center; justify-content: space-between;
  background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 8px;
  padding: 8px 10px;
`;

const MemberName = styled.div`
  font-size: 14px; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`;

const MemberEmail = styled.span`
  color: #6B7280; font-size: 12px;
`;

const CheckBox = styled.input`
  width: 18px; height: 18px; cursor: pointer;
`;

const Footer = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; border-top: 1px solid #E5E7EB;
`;

const LeftBtns = styled.div`
  display: flex; gap: 8px;
`;

const RightBtns = styled.div`
  display: flex; gap: 8px;
`;

const CancelBtn = styled.button`
  padding: 8px 14px; border: 1px solid #D1D5DB; border-radius: 6px;
  background: #fff; color: #374151; font-size: 14px; cursor: pointer;
`;

const DeleteBtn = styled.button`
  padding: 8px 16px; border-radius: 6px; border: none;
  font-size: 14px; color: #fff; background: #DC2626; cursor: pointer;
  opacity: ${(p) => (p.disabled ? 0.5 : 1)};
  pointer-events: ${(p) => (p.disabled ? 'none' : 'auto')};
`;

const EmptyInfo = styled.div`
  font-size: 13px; color: #9CA3AF; padding: 12px; text-align: center;
`;