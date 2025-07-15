import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Plus, UserPlus, MessageCircle } from "lucide-react";

interface BottomNavigationProps {
  currentPage: string;
  onCreatePost?: () => void;
  onRandomMatch?: () => void;
}

export default function BottomNavigation({ 
  currentPage, 
  onCreatePost, 
  onRandomMatch 
}: BottomNavigationProps) {
  const [, setLocation] = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200">
      <div className="flex items-center justify-around py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/feed")}
          className={`p-2 ${currentPage === 'feed' ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}
        >
          <Home className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCreatePost}
          className="p-2 text-text-secondary hover:text-primary"
        >
          <Plus className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRandomMatch}
          className="p-2 text-text-secondary hover:text-primary"
        >
          <UserPlus className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/chats")}
          className={`p-2 ${currentPage === 'chats' ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}
        >
          <MessageCircle className="w-5 h-5" />
        </Button>
      </div>
    </nav>
  );
}
