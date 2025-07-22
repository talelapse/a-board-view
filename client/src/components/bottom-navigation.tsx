import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, UserPlus, MessageCircle, Search } from "lucide-react";
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
      <div className="flex items-center justify-around py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/feed")}
          className={`flex flex-col items-center p-2 ${currentPage === 'feed' ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs mt-1">{t('feed')}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRandomMatch}
          className="flex flex-col items-center p-2 text-text-secondary hover:text-primary"
        >
          <Search className="w-5 h-5" />
          <span className="text-xs mt-1">{t('match')}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/chats")}
          className={`flex flex-col items-center p-2 ${currentPage === 'chats' ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs mt-1">{t('chats')}</span>
        </Button>
      </div>
    </nav>
  );
}
