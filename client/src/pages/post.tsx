import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import CommentItem from "@/components/comment-item";
import { getCurrentUser } from "@/lib/auth";
import { backendAPI } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { ArrowLeft, Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { useI18n } from "@/lib/i18n";
import type { BackendPost } from "@/lib/api";

// Generate anonymous ID based on user ID  
function generateAnonymousId(userId: string | undefined): string {
  const anonymousIds = ['익명A', '익명B', '익명C', '익명D', '익명E', '익명F', '익명G', '익명H', '익명I', '익명J'];
  if (!userId) return '익명';
  const numericId = parseInt(userId) || userId.length;
  return anonymousIds[numericId % anonymousIds.length];
}

export default function PostPage() {
  const [, params] = useRoute("/post/:id");
  const [, setLocation] = useLocation();
  const [newComment, setNewComment] = useState("");
  const [showAuthorInfo, setShowAuthorInfo] = useState(false);
  const currentUser = getCurrentUser();
  const { t } = useI18n();

  const postId = params?.id;

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["backend-post", postId],
    queryFn: async () => {
      if (!postId) throw new Error("Post ID is required");
      console.log('Fetching post with ID:', postId);
      const result = await backendAPI.getPost(postId);
      console.log('Post query result:', result);
      return result;
    },
    enabled: !!postId,
    retry: 1,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!postId) throw new Error("Post ID is required");
      await backendAPI.toggleLike(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backend-post", postId] });
      queryClient.invalidateQueries({ queryKey: ["backend-posts"] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!postId) throw new Error("Post ID is required");
      await backendAPI.addComment(postId, { text: content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backend-post", postId] });
      queryClient.invalidateQueries({ queryKey: ["backend-posts"] });
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">게시물을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    console.log('Error or no post:', { error, post, postId });
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary mb-2">게시물을 찾을 수 없습니다.</p>
          {error && <p className="text-red-500 text-sm mb-4">{error.message}</p>}
          <p className="text-gray-400 text-xs mb-4">Post ID: {postId}</p>
          <Button onClick={() => setLocation("/feed")}>피드로 돌아가기</Button>
        </div>
      </div>
    );
  }

  const comments = post.comments || [];
  const likes = post.likes || [];
  const isLiked = likes.some((like) => like.userId === currentUser?.id);

  return (
    <div className="min-h-screen bg-bg-soft max-w-md mx-auto bg-white shadow-xl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center h-16">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/feed")}
          className="mr-3 p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold text-text-primary">게시물</h1>
      </header>

      <div className="flex flex-col">
        {/* Post Content */}
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

          <div className="mb-3">
            <p className="text-text-primary text-base leading-relaxed">{post.text}</p>
          </div>

          {post.attachments && post.attachments.length > 0 && (
            <div className="space-y-2 mb-3">
              {post.attachments.map((attachment) => (
                attachment.type.startsWith('image/') ? (
                  <img
                    key={attachment.id}
                    src={attachment.url}
                    alt={attachment.name}
                    className="w-full h-64 object-cover rounded-lg"
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

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center space-x-2 ${isLiked ? 'text-gender-a' : 'text-text-secondary hover:text-gender-a'}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likes.length}</span>
            </Button>
            <div className="flex items-center space-x-2 text-text-secondary">
              <MessageCircle className="w-4 h-4" />
              <span>{comments.length} {t('comments')}</span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white p-4">
          <h3 className="text-sm font-medium text-text-primary mb-3">
            댓글 {comments.length}개
          </h3>
          
          {/* Comments List */}
          <div className="space-y-3 mb-4">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-secondary">아직 댓글이 없습니다.</p>
                <p className="text-text-secondary text-sm">첫 번째 댓글을 작성해보세요!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))
            )}
          </div>

          {/* Comment Form */}
          {currentUser && (
            <form onSubmit={handleComment} className="border-t pt-4">
              <Textarea
                placeholder={t('writeComment')}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-2 min-h-[80px]"
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
      </div>
    </div>
  );
}