# 🧩 Contributing Guidelines

## 📌 Commit Message Rules
- 형식: `type(scope): subject`
- 50자 이내, 끝에 마침표 금지
- Body(본문)는 *무엇을, 왜* 중심으로 작성 (선택)
- Footer(푸터)는 이슈번호나 참고내용 (선택)

---

## 🧱 Commit Type
| Type | 설명 |
|------|------|
| feat | 새로운 기능 추가 |
| fix | 버그 수정 |
| refactor | 코드 리팩토링 |
| style | 코드 스타일 변경 (로직 영향 없음) |
| test | 테스트 코드 추가/수정 |
| docs | 문서 수정 |
| chore | 빌드/환경설정 등 기타 작업 |

예시 👇  
```
feat(task): implement task CRUD API
```
```
fix(auth): resolve JWT token refresh bug
```

---

## 🌿 Branch Naming Rules
- main : 배포용 안정 버전  
- dev : 통합 테스트 브랜치  
- feature/<기능명> : 새로운 기능 (예: feature/task-create)  
- fix/<수정내용> : 버그 수정  
- refactor/<리팩토링내용> : 코드 개선  

---

## 💻 Code Convention 요약
- UTF-8 인코딩  
- @Slf4j / LoggerFactory 로깅 (`System.out.println` 금지)  
- 클래스명: PascalCase / 메서드명: camelCase  
- 테스트 클래스는 `*Test` 로 끝남  
- 한 줄에 하나의 변수 선언  
- 중괄호는 K&R 스타일  
- 최대 줄 길이 120자  

---

## 🔄 Pull Request (PR) Rules
- 제목: 커밋 컨벤션 형식 사용  
- 본문: “무엇을, 왜” 간단히 설명  
- PR 대상: `base → dev` (main 직접 금지)  
- main 브랜치는 팀장 리뷰 승인 후 merge  
