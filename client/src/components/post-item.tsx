import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";
import { getCurrentUser } from "@/lib/auth";
import { backendAPI } from "@/lib/api";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { useI18n } from "@/lib/i18n";
import type { BackendPost } from "@/lib/api";

// Generate anonymous ID based on user ID  
function generateAnonymousId(userId: string | undefined): string {
  const anonymousIds = ['익명A', '익명B', '익명C', '익명D', '익명E', '익명F', '익명G', '익명H', '익명I', '익명J'];
  if (!userId) return '익명';
  // Convert string ID to number for consistent mapping
  const numericId = parseInt(userId) || userId.length;
  return anonymousIds[numericId % anonymousIds.length];
}

interface PostItemProps {
  post: BackendPost;
}

export default function PostItem({ post }: PostItemProps) {
  const [showAuthorInfo, setShowAuthorInfo] = useState(false);
  const [, setLocation] = useLocation();
  const currentUser = getCurrentUser();
  const { t } = useI18n();

  // Use backend post data directly instead of separate API calls
  const comments = post.comments || [];
  const likes = post.likes || [];
  const isLiked = likes.some((like) => like.userId === currentUser?.id);

  const likeMutation = useMutation({
    mutationFn: async () => {
      await backendAPI.toggleLike(post.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backend-posts"] });
    },
  });

  const handleLike = () => {
    if (currentUser) {
      likeMutation.mutate();
    }
  };

  return (
    <div className="bg-white border-b border-gray-100 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <i className="fas fa-user text-gray-500"></i>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-text-secondary">
                {format(new Date(post.createdAt), 'h:mm a')}
              </span>
              {showAuthorInfo && (
                <>
                  <span className="text-sm text-text-secondary">{post.anonymousId ? post.anonymousId.slice(-8) : generateAnonymousId(post.anonymousId)}</span>
                  <div className={`w-2 h-2 rounded-full ${post.gender === 'male' ? 'bg-gender-a' : 'bg-gender-b'}`}></div>
                </>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAuthorInfo(!showAuthorInfo)}
          className="text-text-secondary hover:text-text-primary p-1"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      <div 
        className="mb-3 cursor-pointer hover:bg-gray-50 -mx-4 px-4 py-2 rounded transition-colors"
        onClick={() => setLocation(`/post/${post.id}`)}
      >
        <p className="text-text-primary">{post.text}</p>
      </div>

      {post.attachments && post.attachments.length > 0 && (
        <div className="space-y-2 mb-3">
          {post.attachments.map((attachment) => (
            attachment.type.startsWith('image/') ? (
              <img
                key={attachment.id}
                src={attachment.url}
                alt={attachment.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            ) : (
              <div key={attachment.id} className="p-2 bg-gray-100 rounded border">
                <a 
                  href={attachment.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {attachment.name}
                </a>
              </div>
            )
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`flex items-center space-x-2 ${isLiked ? 'text-gender-a' : 'text-text-secondary hover:text-gender-a'}`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likes.length}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation(`/post/${post.id}`)}
          className="flex items-center space-x-2 text-text-secondary hover:text-primary"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{comments.length} {t('comments')}</span>
        </Button>
      </div>

    </div>
  );
}
