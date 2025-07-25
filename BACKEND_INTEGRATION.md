# 백엔드 API 통합 가이드

이 프로젝트는 두 가지 방식으로 백엔드 API를 사용할 수 있습니다.

## 1. 프록시 방식 (기본값)

Express 서버가 중간에서 프록시 역할을 합니다.

```bash
npm run dev
```

- 프론트엔드: http://localhost:5001
- 백엔드 API는 `/api/backend/*` 경로를 통해 접근
- CORS 문제 없음

## 2. 직접 연결 방식

프론트엔드에서 백엔드로 직접 연결합니다.

```bash
npm run dev:direct
```

- 프론트엔드: http://localhost:5001  
- 백엔드에 직접 연결: http://localhost:8080
- **주의**: 백엔드에서 CORS 설정 필요

## 3. 테스트 환경

```bash
npm run test:backend
```

## 환경변수 설정

### `.env.development` (개발환경)
```
VITE_USE_DIRECT_BACKEND=false  # 프록시 사용
VITE_BACKEND_URL=http://localhost:8080
```

### `.env.test` (테스트환경)  
```
VITE_USE_DIRECT_BACKEND=true   # 직접 연결
VITE_BACKEND_URL=http://localhost:8080
```

## API 엔드포인트

### 인증
- `POST /auth/signup` - 회원가입
- `POST /auth/verify` - 이메일 인증  
- `POST /auth/token` - 로그인
- `POST /auth/resend-verification` - 인증 재발송

### 사용자
- `GET /users` - 사용자 목록
- `GET /users/{id}` - 사용자 조회

### 게시물
- `GET /posts` - 게시물 목록
- `POST /posts` - 게시물 생성
- `GET /posts/{id}` - 게시물 조회
- `POST /posts/{id}/comments` - 댓글 작성
- `POST /posts/{id}/like` - 좋아요

## 테스트 계정

- 이메일: test@test.com
- 비밀번호: password
- 인증코드: 123456

## CORS 설정 (백엔드 측)

직접 연결 시 백엔드에서 다음 도메인을 허용해야 합니다:
- http://localhost:5001
- http://localhost:3000

## 문제 해결

### CORS 에러
- 프록시 방식(`npm run dev`) 사용 권장
- 또는 백엔드 CORS 설정 수정

### 연결 에러  
- 백엔드 서버가 8080포트에서 실행 중인지 확인
- `curl http://localhost:8080/users` 테스트