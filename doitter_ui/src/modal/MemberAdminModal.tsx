import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import type { Project, User } from '../App';
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

const emailRegex = /^[^\s@ㄱ-ㅎ가-힣]+@[^\s@ㄱ-ㅎ가-힣]+\.[^\s@ㄱ-ㅎ가-힣]+$/;

interface MemberAdminModalProps {
    project: Project;
    onClose: () => void;
    onUpdateProject: (
        project: Project,
        addedMembers?: string[],
        removedMembers?: string[],
        changedAdmins?: { email: string; fromAdmin: boolean; toAdmin: boolean }[]
    ) => void;
    isProjectAdmin: boolean;
    currentUserId: string;
    users: User[];
}

export default function MemberAdminModal({
                                             project,
                                             onClose,
                                             onUpdateProject,
                                             isProjectAdmin,
                                             currentUserId,
                                             users
                                         }: MemberAdminModalProps) {

    const [email, setEmail] = useState('');
    const [inviteLink, setInviteLink] = useState('');
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const [admins, setAdmins] = useState<string[]>(project.adminEmails);
    const [members, setMembers] = useState<string[]>(project.memberEmails);
    const [viewers, setViewers] = useState<string[]>(project.viewerEmails);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [removed, setRemoved] = useState<Set<string>>(new Set());

    const originalAdmins = useMemo(() => new Set(project.adminEmails), [project.adminEmails]);

    useEffect(() => {
        setAdmins(project.adminEmails);
        setMembers(project.memberEmails);
        setSelected(new Set());
        setRemoved(new Set());
    }, [project.adminEmails, project.memberEmails]);

    const getMemberName = (email: string) => {
        const user = users.find(u => u.email === email);
        return user ? user.name : email.split('@')[0];
    };

    const isOwner = (email: string) => email === project.ownerId;

    const canTempModify = (email: string) => {
        if (isOwner(email)) return false;

        const originalIsAdmin = project.adminEmails.includes(email);
        const nowIsAdmin = admins.includes(email);

        if (originalIsAdmin && nowIsAdmin) {
            return currentUserId === project.ownerId;
        }

        return isProjectAdmin;
    };

    const canModify = (targetEmail: string) => {

        if (isOwner(targetEmail)) return currentUserId === project.ownerId;
        const targetIsAdminInUI = admins.includes(targetEmail);
        if (targetIsAdminInUI) {
            return currentUserId === project.ownerId;
        }
        return isProjectAdmin;
    };

    const sortedAdmins = [...admins].sort((a, b) => {
        if (isOwner(a)) return -1;
        if (isOwner(b)) return 1;
        if (a === currentUserId) return -1;
        if (b === currentUserId) return 1;
        return 0;
    });

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isProjectAdmin) return;
        if (email && !emailRegex.test(email)) {
            setModalMessage('이메일을 다시 확인해주세요.');
            setShowErrorModal(true);
            return;
        }
        if (!email) return;
        if (email === currentUserId) return;
        if (admins.includes(email) || members.includes(email)) return;
        setViewers(cur => [...cur, email]);
        setEmail('');
    };

    const handleCreateLink = () => {
        const fakeToken = Math.random().toString(36).substring(2, 12);
        setInviteLink(`https://api.doit.example.com/invites/${fakeToken}`);
    };

    const toggleSelect = (email: string) => {
        if (!isProjectAdmin) return;
        if (isOwner(email)) return;
        const next = new Set(selected);
        next.has(email) ? next.delete(email) : next.add(email);
        setSelected(next);
    };

    const handleDeleteFromAll = (emailToRemove: string) => {
        if (!isProjectAdmin) return;
        if (isOwner(emailToRemove)) return;
        setAdmins(cur => cur.filter(e => e !== emailToRemove));
        setMembers(cur => cur.filter(e => e !== emailToRemove));
        setSelected(sel => {
            const next = new Set(sel);
            next.delete(emailToRemove);
            return next;
        });
        setRemoved(prev => new Set(prev).add(emailToRemove));
    };

    const handleToggleRole = () => {
        if (!isProjectAdmin || selected.size === 0) return;
        const toToggle = Array.from(selected).filter(e => !isOwner(e));
        if (toToggle.length === 0) return;

        const nextAdmins = new Set(admins);
        const nextMembers = new Set(members);

        toToggle.forEach(email => {
            if (nextAdmins.has(email)) {
                nextAdmins.delete(email);
                nextMembers.add(email);
            } else if (nextMembers.has(email)) {
                nextMembers.delete(email);
                nextAdmins.add(email);
            }
        });

        setAdmins(Array.from(nextAdmins));
        setMembers(Array.from(nextMembers));
        setSelected(new Set());
    };

    const handleSave = () => {
        const updatedProject: Project = {
            ...project,
            adminEmails: admins,
            memberEmails: members
        };

        const originalAdmins = project.adminEmails;
        const originalMembers = project.memberEmails;
        const originalAll = [...originalAdmins, ...originalMembers];
        const newAll = [...admins, ...members];

        const addedMembers = newAll.filter(e => !originalAll.includes(e));
        const removedByDiff = originalAll.filter(e => !newAll.includes(e));
        const removedMembers = Array.from(new Set([...removedByDiff, ...Array.from(removed)]));

        const changedAdmins: { email: string; fromAdmin: boolean; toAdmin: boolean }[] = [];
        const allEmails = new Set([...originalAll, ...newAll]);
        allEmails.forEach(email => {
            const fromAdmin = originalAdmins.includes(email);
            const toAdmin = admins.includes(email);
            if (fromAdmin !== toAdmin) {
                changedAdmins.push({ email, fromAdmin, toAdmin });
            }
        });

        onUpdateProject(updatedProject, addedMembers, removedMembers, changedAdmins);
        onClose();
    };

    return (
        <>
            <ModalBackdrop>
                <ModalContent onClick={(e) => e.stopPropagation()}>
                    <Title>멤버 관리</Title>

                    {isProjectAdmin && (
                    <Container>
                        <InviteSection>
                            <Form onSubmit={handleInvite}>
                                <Section>
                                    <Label>이메일로 초대</Label>
                                    <Input
                                        type="email"
                                        placeholder="초대할 이메일을 입력하세요"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={!isProjectAdmin}
                                    />
                                    <InviteButton type="submit" disabled={!isProjectAdmin}>초대</InviteButton>
                                </Section>
                            </Form>
                            <OrSeparator>또는</OrSeparator>
                            <Section>
                                <Label>초대 링크로 초대</Label>
                                <InviteButton type="button" onClick={handleCreateLink} disabled={!isProjectAdmin}>
                                    초대 링크 생성
                                </InviteButton>
                                {inviteLink && (
                                    <LinkDisplayInput
                                        type="text"
                                        value={inviteLink}
                                        readOnly
                                        onClick={(e) => {
                                            navigator.clipboard.writeText(e.currentTarget.value);
                                            alert('링크가 복사되었습니다!');
                                        }}
                                    />
                                )}
                            </Section>
                        </InviteSection>
                        <PermissionSection>
                            <LabelRow>
                                <span>멤버 권한</span>
                                <ToggleButton onClick={handleToggleRole} disabled={!isProjectAdmin || selected.size === 0}>
                                    권한 전환
                                </ToggleButton>
                            </LabelRow>

                            <PermissionBox>
                                <RoleTitle>관리자</RoleTitle>
                                <RoleList>
                                    {sortedAdmins
                                        .filter(a => a !== currentUserId)  // 본인은 안보임
                                        .map(adminEmail => {
                                            const isOwnerTarget = isOwner(adminEmail);
                                            const isOriginalAdmin = originalAdmins.has(adminEmail);

                                            const showCheckbox =
                                                !isOwnerTarget &&                  // owner 는 무조건 없음
                                                (!isOriginalAdmin || currentUserId === project.ownerId);
                                            // original admin 은 owner 만 control 가능

                                            const modifiable = showCheckbox && canTempModify(adminEmail);

                                            return (
                                                <MemberChip
                                                    key={adminEmail}
                                                    $clickable={modifiable}
                                                    onClick={() => modifiable && toggleSelect(adminEmail)}
                                                >
                                                    {showCheckbox && (
                                                        <Checkbox
                                                            type="checkbox"
                                                            checked={selected.has(adminEmail)}
                                                            onChange={() => toggleSelect(adminEmail)}
                                                            disabled={!modifiable}
                                                        />
                                                    )}

                                                    <Avatar bgColor={getMemberColor(adminEmail)}>
                                                        <StyledIcRoundPlus />
                                                    </Avatar>
                                                    <span>{getMemberName(adminEmail)} (관리자)</span>
                                                </MemberChip>
                                            )
                                        })}
                                </RoleList>

                                <RoleTitle>멤버</RoleTitle>
                                <RoleList>
                                    {members
                                        .filter(m => m !== currentUserId) // 본인은 안보임
                                        .map(memberEmail => {
                                            const isOwnerTarget = isOwner(memberEmail);

                                            const showCheckbox = !isOwnerTarget; // owner 는 없음

                                            const modifiable = showCheckbox && canTempModify(memberEmail);

                                            return (
                                                <MemberChip
                                                    key={memberEmail}
                                                    $clickable={modifiable}
                                                    onClick={() => modifiable && toggleSelect(memberEmail)}
                                                >
                                                    {showCheckbox && (
                                                        <Checkbox
                                                            type="checkbox"
                                                            checked={selected.has(memberEmail)}
                                                            onChange={() => toggleSelect(memberEmail)}
                                                            disabled={!modifiable}
                                                        />
                                                    )}

                                                    <Avatar bgColor={getMemberColor(memberEmail)}>
                                                        <StyledIcRoundPlus />
                                                    </Avatar>
                                                    <span>{getMemberName(memberEmail)}</span>
                                                </MemberChip>
                                            )
                                        })}
                                </RoleList>
                            </PermissionBox>
                        </PermissionSection>
                    </Container>
                    )}

                    <FullListSection>
                        <ThreeColumnContainer>
                            <Column>
                                <ColumnTitle>관리자 리스트</ColumnTitle>
                                <ColumnScrollArea>
                                    {admins.map(email => {
                                        const isOwnerTarget = isOwner(email);
                                        const isOriginalAdmin = originalAdmins.has(email);

                                        const showRemove =
                                            !isOwnerTarget &&
                                            (!isOriginalAdmin || currentUserId === project.ownerId) &&
                                            canTempModify(email);

                                        return (
                                            <Row key={email} title={getMemberName(email)}>
                                                <Left>
                                                    <Avatar bgColor={getMemberColor(email)}>
                                                        <StyledIcRoundPlus />
                                                    </Avatar>
                                                    <Name>
                                                        {getMemberName(email)} (관리자)
                                                        {email === currentUserId ? ' (본인)' : ''}
                                                    </Name>
                                                </Left>
                                                {showRemove && (
                                                    <RemoveButton
                                                        type="button"
                                                        aria-label="관리자 제거"
                                                        onClick={() => handleDeleteFromAll(email)}
                                                        title="제거"
                                                    >
                                                        ×
                                                    </RemoveButton>
                                                )}
                                            </Row>
                                        )
                                    })}
                                </ColumnScrollArea>
                            </Column>

                            <VerticalDivider />

                            <Column>
                                <ColumnTitle>멤버 리스트</ColumnTitle>
                                <ColumnScrollArea>
                                    {members.map(email => {
                                        const isOwnerTarget = isOwner(email);

                                        const showRemove =
                                            !isOwnerTarget &&
                                            canTempModify(email);

                                        return (
                                            <Row key={email} title={getMemberName(email)}>
                                                <Left>
                                                    <Avatar bgColor={getMemberColor(email)}>
                                                        <StyledIcRoundPlus />
                                                    </Avatar>
                                                    <Name>
                                                        {getMemberName(email)}
                                                        {email === currentUserId ? ' (본인)' : ''}
                                                    </Name>
                                                </Left>
                                                {showRemove && (
                                                    <RoleDownButton onClick={()=>{
                                                        setMembers(m=>m.filter(e=>e!==email))
                                                        setViewers(v=>[...v, email])
                                                    }}>
                                                        관전자로 변경
                                                    </RoleDownButton>
                                                )}
                                                {showRemove && (
                                                    <RemoveButton
                                                        type="button"
                                                        aria-label="멤버 제거"
                                                        onClick={() => handleDeleteFromAll(email)}
                                                        title="제거"
                                                    >
                                                        ×
                                                    </RemoveButton>
                                                )}
                                            </Row>
                                        )
                                    })}
                                </ColumnScrollArea>
                            </Column>
                            <VerticalDivider />
                            <Column>
                                <ColumnTitle>관전자 리스트</ColumnTitle>
                                <ColumnScrollArea>
                                    {viewers.map(email => {
                                        return (
                                            <Row key={email} title={getMemberName(email)}>
                                                <Left>
                                                    <Avatar bgColor={getMemberColor(email)}>
                                                        <StyledIcRoundPlus />
                                                    </Avatar>
                                                    <Name>
                                                        {getMemberName(email)} (관전자)
                                                        {email === currentUserId ? ' (본인)' : ''}
                                                    </Name>
                                                </Left>
                                                <div style={{display:'flex', gap:'6px'}}>
                                                    <RoleBackButton onClick={()=>{
                                                        setViewers(v => v.filter(e=>e !== email))
                                                        setMembers(m=>[...m, email])
                                                    }}>
                                                        멤버로 변경
                                                    </RoleBackButton>
                                                    <RemoveButton onClick={() => handleDeleteFromAll(email)}>×</RemoveButton>
                                                </div>
                                            </Row>
                                        )
                                    })}
                                </ColumnScrollArea>
                            </Column>
                        </ThreeColumnContainer>
                    </FullListSection>

                    <FormActions>
                        {isProjectAdmin ? (
                            <>
                                <CancelButton onClick={onClose}>취소</CancelButton>
                                <SubmitButton onClick={handleSave}>저장</SubmitButton>
                            </>
                        ) : (
                            <SubmitButton onClick={onClose}>닫기</SubmitButton>
                        )}
                    </FormActions>
                </ModalContent>
            </ModalBackdrop>

            {showErrorModal && (
                <ErrorModalWrapper>
                    <Modal message={modalMessage} onClose={() => setShowErrorModal(false)} />
                </ErrorModalWrapper>
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
  z-index: 1001;
`;

const ErrorModalWrapper = styled.div`
  z-index: 2000;
`;

const ModalContent = styled.div`
    padding: 16px;
    background-color: #FFFFFF;
    border: 1px solid #E0E0E0;
    border-radius: 8px;
    width: 760px;
    height: auto;
    max-height: 720px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    overflow: hidden;
    display: flex;
    flex-direction: column;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px 0;
  border-bottom: 1px solid #E0E0E0;
  padding-bottom: 12px;
  flex: 0 0 auto;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
`;

const Container = styled.div`
  display: flex;
  gap: 24px;
  flex: 0 0 auto;
`;

const InviteSection = styled.div`
  flex: 1;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Input = styled.input`
  font-size: 15px;
  padding: 10px 12px;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  background-color: #F9FAFB;
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
  width: 100%;
  box-sizing: border-box;
`;

const OrSeparator = styled.div`
  font-size: 12px;
  color: #6B7280;
  text-align: center;
  margin: 16px 0;
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
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PermissionSection = styled.div`
  flex: 1;
`;

const LabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ToggleButton = styled.button`
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  color: #FFFFFF;
  background-color: #111827;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  &[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PermissionBox = styled.div`
    border: 1px solid #E0E0E0;
    border-radius: 6px;
    padding: 12px;
    background-color: #F9FAFB;
    margin-top: 8px;
    height: 220px;
    display: flex;
    flex-direction: column;
`;

const RoleTitle = styled.h4`
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 10px 0;
`;

const RoleList = styled.div`
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-right: 4px;
    
    &::-webkit-scrollbar { width: 6px; }
    &::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 6px;
    }
`;


const MemberChip = styled.div<{ $clickable?: boolean; $disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #FFFFFF;
  border: 1px solid #D1D5DB;
  padding: 4px 8px;
  border-radius: 16px;
  user-select: none;
  ${(p) => p.$clickable && 'cursor: pointer;'}
  ${(p) => p.$disabled && 'opacity: 0.7;'}
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  border: 1px solid #9CA3AF;
  border-radius: 4px;
  appearance: none;
  display: inline-block;
  position: relative;
  background: #fff;
  cursor: pointer;
  &:checked {
    background: #10B981;
    border-color: #10B981;
  }
  &:checked::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -60%);
    font-size: 14px;
    color: #fff;
  }
`;

const Avatar = styled.div<{ bgColor: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${p => p.bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex: 0 0 auto;
`;

const StyledIcRoundPlus = styled(IcRoundPlus)<{ color?: string }>`
  width: 20px;
  height: 20px;
  color: ${p => p.color || 'white'};
`;

const RemoveButton = styled.button`
  background: transparent;
  border: none;
  color: #6B7280;
  cursor: pointer;
  font-weight: 700;
  padding: 0 2px;
  font-size: 16px;
  flex: 0 0 auto;
  line-height: 1;
  transition: color .15s ease, transform .05s ease;
    &:hover { color: #111827; }
    &:active { transform: scale(0.96); }
`;

const FullListSection = styled.div`
    margin-top: 16px;
    display: flex;
    flex-direction: column;
`;

const ThreeColumnContainer = styled.div`
    margin-top: 8px;
    display: flex;
    gap: 24px;
    height: 300px;
    overflow: hidden;
`;

const Column = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const ColumnTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  padding-bottom: 6px;
  flex: 0 0 auto;
`;

const ColumnScrollArea = styled.div`
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 4px;

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 6px;
  }
`;

const VerticalDivider = styled.div`
  width: 1px;
  background: #E5E7EB;
  flex: 0 0 1px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #F3F4F6;
  padding: 8px 10px;
  border-radius: 10px;
  margin-bottom: 10px;
  min-width: 0;
  transition: background .15s ease;
  &:hover { background: #E5E7EB; }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1 1 auto;
`;

const Name = styled.span`
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #E0E0E0;
  flex: 0 0 auto;
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

const RoleDownButton = styled.button`
  background: #F3F4F6;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 12px;
  padding: 3px 6px;
  cursor: pointer;
`;

const RoleBackButton = styled.button`
  background: #F3F4F6;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 12px;
  padding: 3px 6px;
  cursor: pointer;
`;