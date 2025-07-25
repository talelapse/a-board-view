import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, UserPlus, MessageCircle, Search, Settings } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface BottomNavigationProps {
  currentPage: string;
  onRandomMatch?: () => void;
}

export default function BottomNavigation({ 
  currentPage, 
  onRandomMatch 
}: BottomNavigationProps) {
  const [, setLocation] = useLocation();
  const { t } = useI18n();

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200">
      <div className="flex items-center justify-around">
        <Button
          variant="ghost"
          onClick={() => setLocation("/feed")}
          className={`flex flex-col items-center py-8 px-4 flex-1 rounded-none hover:bg-gray-50 ${currentPage === 'feed' ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs mt-0.5">{t('feed')}</span>
        </Button>
        <Button
          variant="ghost"
          onClick={onRandomMatch}
          className="flex flex-col items-center py-8 px-4 flex-1 rounded-none hover:bg-gray-50 text-text-secondary hover:text-primary"
        >
          <Search className="w-5 h-5" />
          <span className="text-xs mt-0.5">{t('match')}</span>
        </Button>
        <Button
          variant="ghost"
          onClick={() => setLocation("/chats")}
          className={`flex flex-col items-center py-8 px-4 flex-1 rounded-none hover:bg-gray-50 ${currentPage === 'chats' ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs mt-0.5">{t('chats')}</span>
        </Button>
        <Button
          variant="ghost"
          onClick={() => setLocation("/settings")}
          className={`flex flex-col items-center py-8 px-4 flex-1 rounded-none hover:bg-gray-50 ${currentPage === 'settings' ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-xs mt-0.5">설정</span>
        </Button>
      </div>
    </nav>
  );
}
