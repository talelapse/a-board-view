import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWebSocket } from "@/hooks/use-websocket";
import { getCurrentUser } from "@/lib/auth";
import { ArrowLeft, X, Send } from "lucide-react";
import { format } from "date-fns";

export default function Chat() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const matchId = parseInt(params.matchId!);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = getCurrentUser();
  
  const { sendMessage, messages } = useWebSocket(matchId);

  const { data: matchData } = useQuery({
    queryKey: ["/api/matches", matchId, "messages"],
    enabled: !!matchId,
  });

  const { data: matchInfo } = useQuery({
    queryKey: ["/api/matches", currentUser?.id],
    enabled: !!currentUser,
  });

  const match = matchInfo?.matches?.find((m) => m.id === matchId);
  const partner = match ? (match.user1Id === currentUser?.id ? match.user2 : match.user1) : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && currentUser) {
      sendMessage(message);
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
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/chats")}
            className="text-text-secondary hover:text-text-primary p-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <i className="fas fa-user text-gray-500 text-sm"></i>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-text-primary">
                    Born {partner?.birthYear}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${partner?.gender === 'a' ? 'bg-gender-a' : 'bg-gender-b'}`}></div>
                </div>
                <span className="text-xs text-green-500">Online</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/chats")}
            className="text-red-500 hover:text-red-600 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-2 ${msg.senderId === currentUser.id ? 'justify-end' : ''}`}
            >
              {msg.senderId !== currentUser.id && (
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-user text-gray-500 text-xs"></i>
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-2 max-w-xs ${
                  msg.senderId === currentUser.id
                    ? 'bg-primary text-white rounded-tr-sm'
                    : 'bg-gray-100 text-text-primary rounded-tl-sm'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <span className={`text-xs ${msg.senderId === currentUser.id ? 'text-blue-200' : 'text-text-secondary'}`}>
                  {format(new Date(msg.createdAt), 'h:mm a')}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
            <Input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 rounded-full"
            />
            <Button
              type="submit"
              size="sm"
              className="bg-primary hover:bg-primary-dark rounded-full p-2"
              disabled={!message.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
