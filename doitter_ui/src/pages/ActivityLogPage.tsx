import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import type { Project, Activity, User } from '../App';
import { ReactComponent as BackArrowIcon } from '../icons/line-md_arrow-up.svg';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const getMemberName = (email: string, users: User[]) => {
    const user = users.find(u => u.email === email);
    return user ? user.name : email.split('@')[0];
};

const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
        case 'TASK': return '📝';
        case 'COMMENT': return '💬';
        case 'PROJECT': return '📁';
        case 'LABEL': return '🏷️';
        case 'MEMBER': return '👥';
        default: return '🔔';
    }
};

interface DashboardContext {
    activities: Activity[];
    users: User[];
    currentUserId: string;
    projects: Project[];
}

type DateFilterMode = 'all' | 'today' | 'last7days' | 'custom';

export default function ActivityLogPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { projects, activities, users, currentUserId } = useOutletContext<DashboardContext>();

    const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>('all');
    const [selectedMember, setSelectedMember] = useState('all');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const currentProject = projects.find(p => p.id === projectId);

    const allMembers = currentProject
        ? [currentUserId, ...currentProject.adminEmails, ...currentProject.memberEmails]
        : [currentUserId];

    const projectActivities = activities.filter(a => a.projectId === projectId);

    const filteredActivities = projectActivities.filter(activity => {
        const activityDate = new Date(activity.createdAt).getTime();

        if (selectedMember !== 'all' && activity.authorId !== selectedMember) {
            return false;
        }

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();

        if (dateFilterMode === 'today') {
            return activityDate >= todayStart && activityDate <= todayEnd;
        }

        if (dateFilterMode === 'last7days') {
            const sevenDaysAgo = todayStart - 6 * 24 * 60 * 60 * 1000; // 오늘 포함 7일
            return activityDate >= sevenDaysAgo && activityDate <= todayEnd;
        }

        if (dateFilterMode === 'custom') {
            const start = startDate ? new Date(startDate).setHours(0,0,0,0) : -Infinity;
            const end = endDate ? new Date(endDate).setHours(23,59,59,999) : Infinity;
            return activityDate >= start && activityDate <= end;
        }

        return true;
    });

    return (
        <PageWrapper>
            <BackButton onClick={() => navigate(-1)}>
                <BackArrowIcon /> 뒤로가기
            </BackButton>

            <LogContent>
                <FilterSection>
                    <FilterGroup>
                        <span>🗂️ 필터</span>
                        <Select value={dateFilterMode} onChange={(e) => setDateFilterMode(e.target.value as DateFilterMode)}>
                            <option value="all">전체 기간</option>
                            <option value="today">오늘</option>
                            <option value="last7days">최근 1주일</option>
                            <option value="custom">사용자 정의 기간</option>
                        </Select>
                        <Select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)}>
                            <option value="all">모든 팀원</option>
                            {allMembers.map(email => (
                                <option key={email} value={email}>
                                    {getMemberName(email, users)}
                                </option>
                            ))}
                        </Select>
                    </FilterGroup>

                    {dateFilterMode === 'custom' && (
                        <FilterGroup>
                            <span>사용자 정의 기간:</span>
                            <DatePickerWrapper>
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    placeholderText="시작일"
                                />
                            </DatePickerWrapper>
                            <span>~</span>
                            <DatePickerWrapper>
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    placeholderText="종료일"
                                />
                            </DatePickerWrapper>
                        </FilterGroup>
                    )}
                </FilterSection>

                <List>
                    {filteredActivities.map(activity => (
                        <ActivityItem key={activity.id}>
                            <Icon>{getActivityIcon(activity.type)}</Icon>
                            <Content>
                                <Description>
                                    <strong>{getMemberName(activity.authorId, users)}</strong> 님이 {activity.description}
                                </Description>
                            </Content>
                            <Timestamp>{new Date(activity.createdAt).toLocaleString('ko-KR')}</Timestamp>
                        </ActivityItem>
                    ))}
                </List>
            </LogContent>
        </PageWrapper>
    );
}

const PageWrapper = styled.div`
    max-width: 800px;
    margin: 0 auto;
`;

const BackButton = styled.button`
    font-size: 16px;
    font-weight: 500;
    color: #374151;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 8px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 4px;

    svg {
        width: 20px;
        height: 20px;
    }

    &:hover {
        background-color: #F3F4F6;
        border-radius: 6px;
    }
`;

const LogContent = styled.div`
    padding: 24px;
    background-color: #FFFFFF;
    border-radius: 8px;
    border: 1px solid #E0E0E0;
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const FilterSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-bottom: 16px;
    border-bottom: 1px solid #E0E0E0;
`;

const FilterGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #374151;
`;

const Select = styled.select`
    font-size: 14px;
    padding: 4px 8px;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    background-color: #F9FAFB;
`;

const DatePickerWrapper = styled.div`
    .react-datepicker-wrapper {
        width: 100%;
    }
    .react-datepicker__input-container input {
        font-size: 14px;
        padding: 4px 8px;
        border: 1px solid #D1D5DB;
        border-radius: 6px;
        background-color: #F9FAFB;
        width: 100px;
        box-sizing: border-box;
    }
`;

const List = styled.div`
    display: flex;
    flex-direction: column;
    max-height: 60vh;
    overflow-y: auto;
`;

const ActivityItem = styled.div`
    display: flex;
    gap: 12px;
    padding: 16px 8px;
    border-bottom: 1px solid #F3F4F6;
    align-items: center;

    &:last-child {
        border-bottom: none;
    }
`;

const Icon = styled.span`
    font-size: 18px;
`;

const Content = styled.div`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
`;

const Description = styled.span`
    font-size: 15px;
    color: #374151;

    strong {
        font-weight: 600;
    }
`;

const Timestamp = styled.span`
    font-size: 12px;
    color: #6B7280;
    flex-shrink: 0;
`;