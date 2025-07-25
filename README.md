# A Board View

"A Board View"는 익명 사용자들을 위한 소셜 보드 애플리케이션입니다. 사용자들은 게시물을 작성하고, 댓글을 달며, 다른 사용자와 익명으로 채팅할 수 있습니다.

## 주요 기능

- 익명 사용자 등록
- 게시물 피드 (글, 이미지)
- 게시물 작성, 댓글 및 좋아요 기능
- 다른 사용자와의 랜덤 매칭 및 1:1 채팅
- 친구 추가 기능

## 기술 스택

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query
- **Backend**: Node.js, Express.js, TypeScript (+ Kotlin Spring Boot API 서버 통합)
- **Database**: PostgreSQL + JSON Storage
- **ORM**: Drizzle ORM
- **Real-time**: WebSockets (`ws`)
- **API Integration**: 8080포트 백엔드 API 서버와 통합

## 프로젝트 구조

```
/
├── client/         # React 프론트엔드 소스 코드
│   ├── src/
│   └── ...
├── server/         # Express 백엔드 소스 코드
│   ├── index.ts
│   └── ...
├── shared/         # 클라이언트와 서버가 공유하는 Drizzle 스키마
│   └── schema.ts
├── package.json    # 프로젝트 의존성 및 스크립트
└── ...
```

## 시작하기

### 요구사항

- Node.js (v20.x 이상 권장)
- npm
- PostgreSQL 데이터베이스

### 설치 및 실행

1.  **의존성 설치:**

    ```bash
    npm install
    ```

2.  **환경 변수 설정:**

    프로젝트 루트에 `.env` 파일을 생성하고, 데이터베이스 연결을 위한 `DATABASE_URL`을 설정해야 합니다. `drizzle.config.ts` 파일을 참고하세요.

    ```
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
    ```

3.  **데이터베이스 마이그레이션:**

    Drizzle 스키마를 데이터베이스에 적용합니다.

    ```bash
    npm run db:push
    ```

4.  **개발 서버 실행:**

    프론트엔드와 백엔드 개발 서버를 동시에 시작합니다.

    ```bash
    npm run dev
    ```

    서버는 `http://localhost:5001`에서 실행됩니다.

### 주요 스크립트

- `npm run dev`: 개발 서버를 시작합니다 (프록시 방식).
- `npm run dev:direct`: 백엔드 직접 연결 방식으로 개발 서버를 시작합니다.
- `npm run test:backend`: 테스트 환경에서 백엔드 연결 테스트를 실행합니다.
- `npm run build`: 프로덕션용으로 프론트엔드와 백엔드를 빌드합니다.
- `npm run start`: 프로덕션 빌드를 실행합니다.
- `npm run db:push`: 데이터베이스 스키마를 푸시합니다.
- `npm run check`: TypeScript 타입 체크를 실행합니다.

## 백엔드 API 통합

이 프로젝트는 8080포트의 Kotlin Spring Boot API 서버와 통합되어 있습니다.

### 실행 방법

#### 1. 프록시 방식 (기본값, 권장)
```bash
npm run dev
```
- Express 서버가 프록시 역할을 하여 CORS 문제 없음
- 프론트엔드: http://localhost:5001
- 백엔드 API: `/api/backend/*` 경로를 통해 접근

#### 2. 직접 연결 방식
```bash
npm run dev:direct
```
- 프론트엔드에서 백엔드로 직접 연결
- 백엔드에서 CORS 설정 필요

### 테스트 계정
- **이메일**: test@test.com
- **비밀번호**: password
- **인증코드**: 123456

### API 엔드포인트
- `POST /auth/signup` - 회원가입
- `POST /auth/verify` - 이메일 인증
- `POST /auth/token` - 로그인
- `GET /users` - 사용자 목록
- `GET /posts` - 게시물 목록
- `POST /posts` - 게시물 생성

자세한 백엔드 통합 가이드는 [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)를 참고하세요.
