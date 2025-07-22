import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import PostItem from "@/components/post-item";
import CreatePostModal from "@/components/create-post-modal";
import RandomMatchModal from "@/components/random-match-modal";
import BottomNavigation from "@/components/bottom-navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getCurrentUser } from "@/lib/auth";
import { Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { PostsResponse } from "@/types/api";

export default function Feed() {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showRandomMatch, setShowRandomMatch] = useState(false);
  const currentUser = getCurrentUser();
  const { t } = useI18n();

  const { data: postsData, isLoading } = useQuery<PostsResponse>({
    queryKey: ["/api/posts"],
    enabled: !!currentUser,
  });

  const posts = postsData?.posts || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">{t('loadingFeed')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-soft max-w-md mx-auto bg-white shadow-xl relative">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-text-primary">{t('feed')}</h1>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button
              onClick={() => setShowCreatePost(true)}
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-full text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('post')}
            </Button>
          </div>
        </header>

        {/* Feed Content */}
        <div className="flex-1 overflow-y-auto pb-20">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-stream text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2">{t('noPosts')}</h3>
              <p className="text-text-secondary mb-4">{t('beFirstToShare')}</p>
              <Button onClick={() => setShowCreatePost(true)} className="bg-primary hover:bg-primary-dark">
                {t('createFirstPost')}
              </Button>
            </div>
          ) : (
            posts.map((post) => (
              <PostItem key={post.id} post={post} />
            ))
          )}
        </div>

        <BottomNavigation 
          currentPage="feed" 
          onRandomMatch={() => setShowRandomMatch(true)}
        />
      </div>

      <CreatePostModal 
        isOpen={showCreatePost} 
        onClose={() => setShowCreatePost(false)} 
      />
      
      <RandomMatchModal 
        isOpen={showRandomMatch} 
        onClose={() => setShowRandomMatch(false)} 
      />
    </div>
  );
}
