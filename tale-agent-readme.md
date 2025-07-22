# Tale Agent

이 프로젝트는 FastAPI를 사용하여 구축된 에이전트 API 서버입니다. 사용자의 메시지를 받아 처리하고 응답을 반환하는 기능을 제공합니다.

## 주요 디렉토리 구조

-   **/api**: FastAPI 애플리케이션의 핵심 로직이 포함되어 있습니다.
-   **/saju**: 사주 관련 로직이 포함된 디렉토리입니다.
-   **/coordinator_gpt45, /coordinator_sonnet**: 여러 에이전트 또는 모델 간의 상호작용을 조정하는 코디네이터 로직을 포함합니다.
-   **Makefile**: 프로젝트 설치, 서버 실행, 코드 린팅 등 자주 사용하는 명령어를 포함합니다.
-   **pyproject.toml**: 프로젝트의 의존성 및 빌드 구성을 정의합니다.

---

## API (`/api` 디렉토리)

API 서버는 사용자의 메시지를 처리하기 위한 FastAPI 기반의 애플리케이션입니다.

### 환경 설정

#### 로컬 개발 환경

로컬에서 테스트할 때는 프로젝트 루트에 `.env` 파일을 생성하고 다음 변수만 설정하면 됩니다.

```dotenv
# 실행 환경을 'local'로 설정하여 인증을 건너뛰고 InMemory 서비스를 사용합니다.
APP_ENV=local
```

#### 프로덕션 (Google Cloud) 환경

Vertex AI에 배포하여 운영할 때는 다음 사전 설정이 필요합니다.

**1. Google Cloud 프로젝트 설정**

-   **API 활성화**: `gcloud services enable aiplatform.googleapis.com --project=<your-gcp-project-id>` 명령어로 Vertex AI API를 활성화합니다.
-   **인증**: `gcloud auth application-default login` 명령어로 로컬 또는 서비스 계정 인증을 완료합니다.

**2. Vertex AI Memory Bank 생성**

`VertexAiMemoryBankService`가 사용할 실제 메모리 저장소를 생성합니다.

-   **생성 명령어**:
    ```bash
    gcloud beta ai memory-banks create \
      --display-name="tale-agent-memory" \
      --description="Memory for the Tale Agent application" \
      --embedding-size=768 \
      --project=<your-gcp-project-id> \
      --location=<your-gcp-region>
    ```
-   **ID 확인**: 명령 실행 후 출력되는 `name` 필드의 마지막 부분(`projects/.../memoryBanks/<MEMORY_BANK_ID>`)이 Memory Bank ID입니다.

**3. IAM 권한 설정**

API를 실행할 서비스 계정에 다음 역할을 부여해야 합니다.

-   `Vertex AI User` (`roles/aiplatform.user`)
-   `Memory Bank Admin` (`roles/aiplatform.memorybankAdmin`)

**4. `.env` 파일 설정**

위 설정을 완료한 후, 프로덕션용 `.env` 파일을 다음과 같이 구성합니다.

```dotenv
# 실행 환경을 'production'으로 설정하여 실제 인증 및 Vertex AI 서비스를 사용합니다.
APP_ENV=production

# 사용자 인증을 위한 a-board API 서버 주소
A_BOARD_API_URL=https://your-a-board-api.com

# Google Cloud 설정
GOOGLE_CLOUD_PROJECT=<your-gcp-project-id>
GOOGLE_CLOUD_LOCATION=<your-gcp-region> # 예: us-central1
MEMORY_BANK_ID=<your-memory-bank-id>   # 2단계에서 확인한 ID
```

### 설치

프로젝트를 실행하기 전에 필요한 패키지를 설치해야 합니다. `uv`를 사용하여 의존성을 설치합니다.

```bash
make install
```

### 서버 실행

다음 명령어를 사용하여 개발용 API 서버를 실행할 수 있습니다. 서버는 `http://0.0.0.0:8000`에서 실행되며, 코드 변경 시 자동으로 재시작됩니다.

```bash
make server
```

또는 `uv`를 직접 사용할 수도 있습니다.

```bash
uv run python api/server.py
```

### API 엔드포인트

-   `GET /`
    -   **설명**: API 서버가 실행 중인지 확인하는 기본 엔드포인트입니다.
    -   **응답**:
        ```json
        {
            "message": "Tale Agent API Server is running"
        }
        ```

-   `GET /health`
    -   **설명**: 서버의 상태를 확인하는 헬스 체크 엔드포인트입니다.
    -   **응답**:
        ```json
        {
            "status": "healthy"
        }
        ```

-   `POST /message`
    -   **설명**: 사용자의 메시지를 받아 에이전트의 **최종 응답**을 한 번에 반환합니다.
    -   **인증**:
        -   `APP_ENV=production` (기본값): `Authorization: Bearer <TOKEN>` 헤더에 유효한 토큰이 필요합니다.
        -   `APP_ENV=local`: 인증을 건너뛰고, 모의 사용자(`local_test_user`)로 요청을 처리합니다.
    -   **요청 본문 (`application/json`)**:
        ```json
        {
            "message": "안녕하세요!",
            "user_id": "user123",
            "session_id": "session456"
        }
        ```
    -   **성공 응답**:
        ```json
        {
            "response": "에이전트의 최종 답변입니다.",
            "status": "success",
            "error": null
        }
        ```

-   `POST /stream`
    -   **설명**: 사용자의 메시지를 받아 에이전트의 처리 과정을 **실시간으로 스트리밍**합니다 (Server-Sent Events).
    -   **인증**: `/message`와 동일합니다.
    -   **요청 본문**: `/message`와 동일합니다.
    -   **스트리밍 응답 (`text/event-stream`)**:
        -   연결이 활성화된 동안 `data: <json_string>\n\n` 형식의 메시지가 계속 전송됩니다.
        -   각 JSON 객체는 `type`과 `content` 필드를 가집니다.
        -   **`type` 종류**: `tool_call`, `tool_response`, `final_response`, `error`
        -   **예시**:
            ```
            data: {"type": "tool_call", "content": [{"name": "google_search", "args": {"query": "오늘 날씨"}}]}

            data: {"type": "tool_response", "content": [{"name": "google_search", "response": "오늘 날씨는 맑습니다."}]}

            data: {"type": "final_response", "content": "오늘은 날씨가 맑습니다."}
            ```
    -   **`curl` 테스트 방법**:
        ```bash
        # -N 옵션은 버퍼링을 비활성화하여 실시간으로 스트림을 확인하게 합니다.
        curl -N -X POST "http://localhost:8000/stream" \
        -H "Content-Type: application/json" \
        -d '{"message": "오늘 날씨 어때?"}'
        ```

### React/TypeScript 클라이언트 예제

React와 TypeScript 환경에서 `/stream` 엔드포인트를 사용하는 방법입니다. 표준 `EventSource` API는 POST 요청이나 커스텀 헤더를 지원하지 않으므로, `@microsoft/fetch-event-source` 라이브러리를 사용하는 것을 권장합니다.

**1. 라이브러리 설치**

```bash
npm install @microsoft/fetch-event-source
```

**2. React 컴포넌트 예제 (`ChatComponent.tsx`)**

```typescript
import React, { useState, useEffect } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';

// 스트림에서 받는 이벤트 데이터의 타입 정의
interface StreamEvent {
  type: 'tool_call' | 'tool_response' | 'final_response' | 'error';
  content: any;
}

const ChatComponent: React.FC = () => {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || isLoading) return;

    setIsLoading(true);
    setEvents([]); // 이전 이벤트 기록 초기화

    const ctrl = new AbortController();

    try {
      await fetchEventSource('http://localhost:8000/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 프로덕션 환경에서는 실제 토큰을 여기에 추가합니다.
          // 'Authorization': `Bearer YOUR_JWT_TOKEN`,
        },
        body: JSON.stringify({
          message: message,
          // 필요한 경우 user_id와 session_id를 지정
          // user_id: 'user123',
          // session_id: 'session456',
        }),
        signal: ctrl.signal,
        
        onmessage(ev) {
          // 서버에서 보낸 data 필드를 파싱합니다.
          const parsedData: StreamEvent = JSON.parse(ev.data);
          setEvents((prevEvents) => [...prevEvents, parsedData]);

          // 최종 응답을 받으면 연결을 종료합니다.
          if (parsedData.type === 'final_response' || parsedData.type === 'error') {
            ctrl.abort(); // 컨트롤러를 통해 연결 종료
            setIsLoading(false);
          }
        },
        
        onclose() {
          console.log('Connection closed by the server.');
          setIsLoading(false);
        },
        
        onerror(err) {
          console.error('EventSource failed:', err);
          setIsLoading(false);
          // 에러 발생 시 연결을 중단해야 합니다.
          throw err;
        },
      });
    } catch (err) {
      console.error('Request failed:', err);
    }
  };

  return (
    <div>
      <h1>Tale Agent Chat</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? '전송 중...' : '전송'}
        </button>
      </form>

      <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
        <h2>스트리밍 로그:</h2>
        <ul>
          {events.map((event, index) => (
            <li key={index}>
              <strong>{event.type}:</strong>
              <pre>{JSON.stringify(event.content, null, 2)}</pre>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChatComponent;
```

---

## 코드 품질 검사

```

```

프로젝트의 코드 품질을 확인하려면 다음 명령어를 실행하세요.

```bash
make lint
```
