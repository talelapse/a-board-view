import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/bottom-navigation";
import { getCurrentUser } from "@/lib/auth";
import { Plus, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { useI18n } from "@/lib/i18n";
import type { MatchesResponse } from "@/types/api";

export default function ChatsList() {
  const [, setLocation] = useLocation();
  const currentUser = getCurrentUser();
  const { t } = useI18n();

  const { data: matchesData, isLoading } = useQuery<MatchesResponse>({
    queryKey: ["/api/matches", currentUser?.id],
    enabled: !!currentUser,
  });

  const matches = matchesData?.matches || [];

  if (!currentUser) {
    setLocation("/register");
    return null;
  }

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto shadow-xl relative">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-text-primary">{t('chats')}</h1>
          <Button
            onClick={() => setLocation("/feed")}
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary-dark p-0"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </header>

        {/* Active Chats */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2">{t('noChats')}</h3>
              <p className="text-text-secondary mb-4">{t('startRandomMatch')}</p>
              <Button
                onClick={() => setLocation("/feed")}
                className="bg-primary hover:bg-primary-dark"
              >
                {t('findSomeone')}
              </Button>
            </div>
          ) : (
            matches.map((match) => {
              const partner = match.user1Id === currentUser.id ? match.user2 : match.user1;
              return (
                <div
                  key={match.id}
                  className="border-b border-gray-100 p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setLocation(`/chat/${match.id}`)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-gray-500"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-text-primary">
                          {t('born')} {partner.birthYear}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${partner.gender === 'a' ? 'bg-gender-a' : 'bg-gender-b'}`}></div>
                        <span className="text-xs text-text-secondary">
                          {format(new Date(match.createdAt), 'MMM d')}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary truncate">
                        {t('matched')} {format(new Date(match.createdAt), 'h:mm a')}
                      </p>
                    </div>
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <BottomNavigation currentPage="chats" />
      </div>
    </div>
  );
}
