# A Board View API Documentation

이 문서는 A Board View 프로젝트의 프론트엔드와 백엔드 서버 간의 API 통신 명세를 정의합니다.

## WebSocket API (실시간 채팅)

실시간 채팅 기능은 WebSocket을 통해 구현됩니다.

- **Endpoint:** `ws://<server_address>/ws`

### 메시지 타입

#### 1. 인증 (`auth`)

클라이언트가 WebSocket에 연결된 직후, 사용자 인증을 위해 전송해야 합니다.

- **방향:** Client -> Server
- **페이로드:**
  ```json
  {
    "type": "auth",
    "userId": 123
  }
  ```

#### 2. 채팅 메시지 (`chat_message`)

사용자가 채팅 메시지를 보내거나 받을 때 사용됩니다.

- **방향:** Client -> Server (메시지 전송)
- **페이로드:**
  ```json
  {
    "type": "chat_message",
    "matchId": 1,
    "content": "안녕하세요!"
  }
  ```

- **방향:** Server -> Client (메시지 수신)
- **페이로드:**
  ```json
  {
    "type": "chat_message",
    "message": {
      "id": 1,
      "matchId": 1,
      "senderId": 123,
      "content": "안녕하세요!",
      "createdAt": "2023-10-27T10:00:00.000Z"
    },
    "sender": {
      "id": 123,
      "username": "user1",
      "isBot": false
    }
  }
  ```

---

## REST API

### 1. 인증 (Auth)

#### `POST /api/auth/register`

- **설명:** 새로운 사용자를 등록합니다.
- **요청 본문:**
  ```json
  {
    "username": "새로운유저"
  }
  ```
- **성공 응답 (200 OK):**
  ```json
  {
    "user": {
      "id": 1,
      "username": "새로운유저",
      "isBot": false
    }
  }
  ```

#### `GET /api/auth/user/:id`

- **설명:** 특정 ID를 가진 사용자 정보를 조회합니다.
- **성공 응답 (200 OK):**
  ```json
  {
    "user": {
      "id": 1,
      "username": "user1",
      "isBot": false
    }
  }
  ```

### 2. 게시글 (Posts)

#### `GET /api/posts`

- **설명:** 전체 게시글 목록을 조회합니다.
- **성공 응답 (200 OK):**
  ```json
  {
    "posts": [
      {
        "id": 1,
        "authorId": 1,
        "title": "첫 번째 게시글",
        "content": "내용입니다.",
        "createdAt": "...",
        "author": { "id": 1, "username": "user1" },
        "comments": [ ... ],
        "likes": [ ... ]
      }
    ]
  }
  ```

#### `POST /api/posts`

- **설명:** 새로운 게시글을 작성합니다.
- **요청 본문:**
  ```json
  {
    "userId": 1,
    "title": "새로운 게시글",
    "content": "게시글 내용입니다."
  }
  ```
- **성공 응답 (200 OK):**
  ```json
  {
    "post": { ... } // 생성된 게시글 객체
  }
  ```

#### `POST /api/posts/:id/like`

- **설명:** 특정 게시글에 '좋아요'를 추가하거나 취소합니다(토글).
- **요청 본문:**
  ```json
  {
    "userId": 1
  }
  ```
- **성공 응답 (200 OK):**
  ```json
  {
    "success": true
  }
  ```

#### `GET /api/posts/:id/likes`

- **설명:** 특정 게시글에 '좋아요'를 누른 사용자 목록을 조회합니다.
- **성공 응답 (200 OK):**
  ```json
  {
    "likes": [
      { "userId": 1, "postId": 1 },
      { "userId": 2, "postId": 1 }
    ]
  }
  ```

### 3. 댓글 (Comments)

#### `GET /api/posts/:id/comments`

- **설명:** 특정 게시글의 댓글 목록을 조회합니다.
- **성공 응답 (200 OK):**
  ```json
  {
    "comments": [
      {
        "id": 1,
        "postId": 1,
        "authorId": 2,
        "content": "좋은 글이네요!",
        "createdAt": "...",
        "author": { "id": 2, "username": "user2" }
      }
    ]
  }
  ```

#### `POST /api/posts/:id/comments`

- **설명:** 특정 게시글에 댓글을 작성합니다.
- **요청 본문:**
  ```json
  {
    "userId": 2,
    "content": "댓글 내용입니다."
  }
  ```
- **성공 응답 (200 OK):**
  ```json
  {
    "comment": { ... } // 생성된 댓글 객체
  }
  ```

### 4. 채팅 매칭 (Matching)

#### `POST /api/matches/find`

- **설명:** 대화할 상대를 무작위로 찾습니다. 매칭 가능한 유저가 없으면 봇과 매칭됩니다.
- **요청 본문:**
  ```json
  {
    "userId": 1
  }
  ```
- **성공 응답 (200 OK):**
  ```json
  {
    "match": {
      "id": 1,
      "user1Id": 1,
      "user2Id": 2,
      "createdAt": "...",
      "partner": { "id": 2, "username": "user2", "isBot": false }
    }
  }
  ```

#### `GET /api/matches/:userId`

- **설명:** 특정 사용자가 참여하고 있는 모든 채팅 목록을 조회합니다.
- **성공 응답 (200 OK):**
  ```json
  {
    "matches": [ ... ] // 매치 객체 배열
  }
  ```

#### `GET /api/matches/:matchId/messages`

- **설명:** 특정 채팅방의 모든 메시지 내역을 조회합니다.
- **성공 응답 (200 OK):**
  ```json
  {
    "messages": [
      {
        "id": 1,
        "matchId": 1,
        "senderId": 1,
        "content": "안녕하세요.",
        "createdAt": "...",
        "sender": { "id": 1, "username": "user1" }
      }
    ]
  }
  ```
