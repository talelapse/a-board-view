import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { queryClient } from "@/lib/queryClient";
import { backendAPI } from "@/lib/api";
import { getCurrentUser, getCurrentBackendUser, isBackendAuthenticated } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Camera, X } from "lucide-react";
import { t } from "@/lib/i18n";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const currentUser = getCurrentUser();
  const backendUser = getCurrentBackendUser();
  const { toast } = useToast();

  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string; imageUrl?: string }) => {
      // Always use backend API
      return await backendAPI.createPost({
        text: postData.content,
        attachments: postData.imageUrl ? [{
          id: Date.now().toString(),
          url: postData.imageUrl,
          type: 'image',
          name: 'uploaded_image'
        }] : undefined
      });
    },
    onSuccess: () => {
      // Invalidate backend posts queries
      queryClient.invalidateQueries({ queryKey: ["backend-posts"] });
      setContent("");
      setImageUrl("");
      onClose();
      toast({
        title: t('postCreated'),
        description: t('postShared'),
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast({
        title: t('pleaseWriteSomething'),
        description: t('postContentEmpty'),
        variant: "destructive",
      });
      return;
    }
    createPostMutation.mutate({ content, imageUrl: imageUrl || undefined });
  };

  const handleClose = () => {
    setContent("");
    setImageUrl("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {t('createPost')}
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder={t('whatsOnYourMind')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] resize-none"
            maxLength={500}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Camera className="w-4 h-4 text-text-secondary" />
              <span className="text-sm text-text-secondary">{t('photoUrl')}</span>
            </div>
            <span className="text-xs text-text-secondary">
              {content.length}/500
            </span>
          </div>

          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark"
            disabled={!content.trim() || createPostMutation.isPending}
          >
            {createPostMutation.isPending ? t('sharing') : t('shareAnonymously')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
