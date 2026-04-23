# 🚀 Doitter

> 팀 협업을 위한 프로젝트 & 태스크 관리 웹 애플리케이션

---

## 📌 프로젝트 소개

DoItTer는 팀 프로젝트에서 필요한 **프로젝트 관리, 태스크 관리, 커뮤니케이션 기능**을 통합한 협업 서비스입니다.
단순한 TODO 앱이 아니라, **권한 기반 협업 시스템 + 태스크 중심 소통 구조**를 목표로 설계되었습니다.

---

## 🎯 개발 목적

- 협업 시 발생하는 역할/권한 문제 해결
- 태스크 단위 커뮤니케이션 구조 설계
- 실제 백엔드 API와 연동되는 서비스 구현 경험

---

## 🙋 담당 역할

| 영역 | 내용 |
|------|------|
| Frontend | React + TypeScript 기반 UI 구현 |
| API 연동 | Axios를 활용한 REST API 연결 및 응답 처리 |
| 인증 흐름 | JWT 토큰 기반 로그인 / 회원가입 / 비밀번호 재설정 구현 |
| 권한 처리 | Owner / Admin / Member / Viewer 역할 분기 및 위임 로직 구현 |

---

## 🛠️ 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React, TypeScript, styled-components, React Router v6 |
| API 통신 | Axios |
| 인증 | JWT (accessToken / refreshToken, LocalStorage 관리) |
| Backend | REST API (Spring Boot / Node.js) |

---

## 🏗️ 아키텍처

```
React (UI)
  ↓
API Layer (Axios)
  ↓
Backend REST API
  ↓
Database
```

---

## 📂 프로젝트 구조

```
src/
 ├── components/        # 공통 UI 컴포넌트
 ├── modal/             # 모달 관련 컴포넌트
 ├── pages/             # 페이지 단위 컴포넌트
 ├── lib/               # axios 설정 (api.ts)
 ├── types/             # 타입 정의
 ├── styles/            # 스타일 파일
 └── App.tsx            # 라우팅
```

---

## ✨ 주요 기능

### 📁 프로젝트 관리
- 프로젝트 생성 / 수정 / 삭제
- 프로젝트 목록 조회
- 색상 및 설명 설정

### 🔐 권한 시스템
- Owner / Admin / Member / Viewer 역할 구분
- 멤버 초대, 역할 변경, 멤버 삭제
- 관리자 위임 기능

### 🚪 프로젝트 나가기 처리 흐름
1. 나가기 버튼 클릭
2. 유일 Admin 여부 체크
3. 필요 시 관리자 위임 모달 표시
4. 위임 후 프로젝트 나가기 진행

### ✅ 태스크 관리
- 태스크 생성 / 수정 / 삭제
- 라벨 기반 분류
- 프로젝트별 태스크 분리

### 💬 댓글 기능
- 태스크 단위 댓글 작성 / 수정 / 삭제
- 작성자 기준 권한 제어

### 👤 사용자 기능
- 사용자 정보 수정
- 비밀번호 변경
- 계정 삭제

---

## 🔗 API 명세

### Auth
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/auth/login` | 로그인 |
| POST | `/auth/register` | 회원가입 |
| POST | `/auth/password/reset/send` | 비밀번호 재설정 메일 발송 |
| POST | `/auth/password/reset/confirm` | 비밀번호 재설정 확인 |

### 프로젝트
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/projects` | 프로젝트 목록 조회 |
| POST | `/projects` | 프로젝트 생성 |
| PATCH | `/projects/:id` | 프로젝트 수정 |
| DELETE | `/projects/:id` | 프로젝트 삭제 |
| DELETE | `/projects/:id/leave` | 프로젝트 탈퇴 |

### 권한
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/projects/:id/delegate-admin` | 관리자 위임 |
| PATCH | `/projects/:id/members/role` | 역할 변경 |

### 태스크
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/projects/{projectId}/tasks` | 태스크 목록 조회 |
| POST | `/projects/{projectId}/tasks` | 태스크 생성 |

### 댓글
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/projects/{projectId}/tasks/{taskId}/comments` | 댓글 목록 조회 |
| POST | `/projects/{projectId}/tasks/{taskId}/comments` | 댓글 작성 |

---

## 🧩 주요 타입

```ts
export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  ownerId: string | null;
  adminEmails: string[];
  memberEmails: string[];
  viewerEmails: string[];
}
```

---

## ⚙️ 실행 방법

```bash
git clone https://github.com/your-repo/doitter.git
cd doitter
npm install
npm start
```

### 환경변수

```env
REACT_APP_API_URL=your_api_url
```

---

## ⚠️ 트러블슈팅

### 1. 타입 불일치 문제 (TypeScript)

**문제**
컴포넌트 간 props 타입 불일치 발생. 특히 `onUpdateUser` 함수에서 파라미터 구조 충돌.

**해결**
모든 컴포넌트에서 함수 시그니처를 `(userId, updates)` 형태로 통일하여 일관성 유지.

---

### 2. API 응답 구조 불일치

**문제**
일부 API는 `content`로 감싸진 구조, 일부는 배열을 직접 반환.

**해결**
Fallback 처리로 두 구조를 모두 안전하게 처리.

```ts
res.data.data.content ?? res.data.data
```

---

### 3. 권한 처리 로직 — 마지막 관리자 탈퇴 문제

**문제**
프로젝트 탈퇴 시 관리자가 1명만 남은 경우 처리 미흡.

**해결**
관리자 위임 로직 추가. 유일한 관리자일 경우 위임을 강제한 후 탈퇴 진행.

---

## 📈 개선 예정

- 실시간 알림 (WebSocket)
- 칸반 보드 (Drag & Drop)
- 파일 첨부 기능
- UI/UX 개선
- Activity Log 연동
- 성능 최적화

---

## 👨‍💻 개발자

**세빈** — Frontend / API 연동

---

## 📄 License

MIT License
