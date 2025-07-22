import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import CommentItem from "./comment-item";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getCurrentUser } from "@/lib/auth";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { useI18n } from "@/lib/i18n";
import type { PostWithUser } from "@shared/schema";
import type { CommentsResponse, LikesResponse } from "@/types/api";

// Generate anonymous ID based on user ID
function generateAnonymousId(userId: number): string {
  const anonymousIds = ['익명A', '익명B', '익명C', '익명D', '익명E', '익명F', '익명G', '익명H', '익명I', '익명J'];
  return anonymousIds[userId % anonymousIds.length];
}

interface PostItemProps {
  post: PostWithUser;
}

export default function PostItem({ post }: PostItemProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showAuthorInfo, setShowAuthorInfo] = useState(false);
  const currentUser = getCurrentUser();
  const { t } = useI18n();

  const { data: commentsData } = useQuery<CommentsResponse>({
    queryKey: ["/api/posts", post.id, "comments"],
    enabled: showComments,
  });

  const { data: likesData } = useQuery<LikesResponse>({
    queryKey: ["/api/posts", post.id, "likes"],
  });

  const comments = commentsData?.comments || [];
  const likes = likesData?.likes || [];
  const isLiked = likes.some((like) => like.userId === currentUser?.id);

  const likeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/posts/${post.id}/like`, { userId: currentUser?.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", post.id, "likes"] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/posts/${post.id}/comments`, {
        content,
        userId: currentUser?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", post.id, "comments"] });
      setNewComment("");
    },
  });

  const handleLike = () => {
    if (currentUser) {
      likeMutation.mutate();
    }
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && currentUser) {
      commentMutation.mutate(newComment);
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
                  <span className="text-sm text-text-secondary">{generateAnonymousId(post.user.id)}</span>
                  <div className={`w-2 h-2 rounded-full ${post.user.gender === 'a' ? 'bg-gender-a' : 'bg-gender-b'}`}></div>
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

      <div className="mb-3">
        <p className="text-text-primary">{post.content}</p>
      </div>

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post image"
          className="w-full h-48 object-cover rounded-lg mb-3"
        />
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
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 text-text-secondary hover:text-primary"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{comments.length} {t('comments')}</span>
        </Button>
      </div>

      {showComments && (
        <div className="mt-4 space-y-3">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
          
          {currentUser && (
            <form onSubmit={handleComment} className="mt-4">
              <Textarea
                placeholder={t('writeComment')}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-2 min-h-[60px]"
              />
              <Button
                type="submit"
                size="sm"
                className="bg-primary hover:bg-primary-dark"
                disabled={!newComment.trim() || commentMutation.isPending}
              >
                {commentMutation.isPending ? t('posting') : t('postComment')}
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
