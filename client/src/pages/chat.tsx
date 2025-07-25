import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWebSocket } from "@/hooks/use-websocket";
import { getCurrentUser } from "@/lib/auth";
import { ArrowLeft, X, Send, UserPlus, Bot, User } from "lucide-react";
import { format } from "date-fns";
import { t } from "@/lib/i18n";
import { fetchEventSource } from '@microsoft/fetch-event-source';

// AI 봇 관련 타입 정의
interface StreamEvent {
  type: 'tool_call' | 'tool_response' | 'final_response' | 'error';
  content: any;
}

interface AIMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  isLoading?: boolean;
}

export default function Chat() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const matchIdParam = params.matchId!;
  const isAIBot = matchIdParam === 'ai-bot';
  const matchId = isAIBot ? null : parseInt(matchIdParam);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = getCurrentUser();
  
  // AI 봇 관련 상태
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);
  
  // 기존 웹소켓 (일반 채팅용)
  const { sendMessage: sendWebSocketMessage, messages: webSocketMessages } = useWebSocket(matchId || 0);
  
  // 메시지는 AI 봇이면 aiMessages, 아니면 webSocketMessages 사용
  const messages = isAIBot ? aiMessages : webSocketMessages;

  const { data: matchData } = useQuery({
    queryKey: ["/api/matches", matchId, "messages"],
    enabled: !!matchId && !isAIBot,
  });

  const { data: matchInfo } = useQuery({
    queryKey: ["/api/matches", currentUser?.id],
    enabled: !!currentUser && !isAIBot,
  });

  const match = !isAIBot && (matchInfo as any)?.matches?.find((m: any) => m.id === matchId) || null;
  const partner = match ? (match.user1Id === currentUser?.id ? match.user2 : match.user1) : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // AI 봇 메시지 전송 함수
  const sendAIMessage = async (messageText: string) => {
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      senderId: currentUser!.id.toString(),
      content: messageText,
      createdAt: new Date().toISOString(),
    };

    const loadingMessage: AIMessage = {
      id: (Date.now() + 1).toString(),
      senderId: 'ai-bot',
      content: '',
      createdAt: new Date().toISOString(),
      isLoading: true,
    };

    setAiMessages(prev => [...prev, userMessage, loadingMessage]);
    setIsAILoading(true);

    const ctrl = new AbortController();

    try {
      await fetchEventSource('http://localhost:8000/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          user_id: currentUser!.id,
          session_id: `session_${currentUser!.id}_${Date.now()}`,
        }),
        signal: ctrl.signal,
        
        onmessage(ev) {
          const parsedData: StreamEvent = JSON.parse(ev.data);

          if (parsedData.type === 'final_response') {
            setAiMessages(prev => {
              const newMessages = [...prev];
              const lastMessageIndex = newMessages.length - 1;
              if (newMessages[lastMessageIndex]?.isLoading) {
                newMessages[lastMessageIndex] = {
                  ...newMessages[lastMessageIndex],
                  content: parsedData.content,
                  isLoading: false,
                };
              }
              return newMessages;
            });
            ctrl.abort();
            setIsAILoading(false);
          } else if (parsedData.type === 'error') {
            setAiMessages(prev => {
              const newMessages = [...prev];
              const lastMessageIndex = newMessages.length - 1;
              if (newMessages[lastMessageIndex]?.isLoading) {
                newMessages[lastMessageIndex] = {
                  ...newMessages[lastMessageIndex],
                  content: '죄송합니다. 오류가 발생했습니다.',
                  isLoading: false,
                };
              }
              return newMessages;
            });
            ctrl.abort();
            setIsAILoading(false);
          }
        },
        
        onclose() {
          setIsAILoading(false);
        },
        
        onerror(err) {
          console.error('EventSource failed:', err);
          setAiMessages(prev => {
            const newMessages = [...prev];
            const lastMessageIndex = newMessages.length - 1;
            if (newMessages[lastMessageIndex]?.isLoading) {
              newMessages[lastMessageIndex] = {
                ...newMessages[lastMessageIndex],
                content: '연결에 실패했습니다. 다시 시도해주세요.',
                isLoading: false,
              };
            }
            return newMessages;
          });
          setIsAILoading(false);
          throw err;
        },
      });
    } catch (err) {
      console.error('Request failed:', err);
      setIsAILoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && currentUser) {
      if (isAIBot) {
        sendAIMessage(message);
      } else {
        sendWebSocketMessage(message);
      }
      setMessage("");
    }
  };

  if (!currentUser) {
    setLocation("/register");
    return null;
  }

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto shadow-xl relative">
      <div className="flex flex-col h-screen">
        {/* Chat Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center space-x-3 h-16">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation(isAIBot ? "/feed" : "/chats")}
            className="text-text-secondary hover:text-text-primary p-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              {isAIBot ? (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-gray-500 text-sm"></i>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-text-primary">
                  {isAIBot ? 'AI 챗봇' : t('chat')}
                </span>
                {isAIBot && (
                  <p className="text-xs text-text-secondary">Tale Agent</p>
                )}
              </div>
            </div>
          </div>
          {!isAIBot && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {/* TODO: Send friend request */}}
                className="text-blue-500 hover:text-blue-600 p-0 mr-2"
              >
                <UserPlus className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/chats")}
                className="text-red-500 hover:text-red-600 p-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </>
          )}
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && isAIBot && (
            <div className="text-center text-text-secondary py-8">
              <Bot className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <p className="text-sm">안녕하세요! Tale Agent입니다.</p>
              <p className="text-sm">무엇을 도와드릴까요?</p>
            </div>
          )}
          
          {messages.map((msg) => {
            const isUserMessage = isAIBot ? msg.senderId === currentUser.id.toString() : msg.senderId === currentUser.id;
            
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-2 ${isUserMessage ? 'justify-end' : ''}`}
              >
                {!isUserMessage && (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isAIBot ? 'bg-blue-100' : 'bg-gray-200'
                  }`}>
                    {isAIBot ? (
                      <Bot className="w-3 h-3 text-blue-600" />
                    ) : (
                      <i className="fas fa-user text-gray-500 text-xs"></i>
                    )}
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-2 max-w-xs ${
                    isUserMessage
                      ? 'bg-primary text-white rounded-tr-sm'
                      : 'bg-gray-100 text-text-primary rounded-tl-sm'
                  }`}
                >
                  {isAIBot && (msg as AIMessage).isLoading ? (
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <span className={`text-xs ${isUserMessage ? 'text-blue-200' : 'text-text-secondary'}`}>
                        {format(new Date(msg.createdAt), 'h:mm a')}
                      </span>
                    </>
                  )}
                </div>
                {isUserMessage && (
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-3 h-3 text-gray-600" />
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
            <Input
              type="text"
              placeholder={isAIBot ? "AI에게 메시지를 보내보세요..." : t('typeMessage')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 rounded-full"
              disabled={isAIBot ? isAILoading : false}
            />
            <Button
              type="submit"
              size="sm"
              className="bg-primary hover:bg-primary-dark rounded-full p-2"
              disabled={!message.trim() || (isAIBot && isAILoading)}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
