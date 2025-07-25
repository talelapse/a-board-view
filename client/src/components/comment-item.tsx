import { format } from "date-fns";
import type { BackendComment } from "@/lib/api";

interface CommentItemProps {
  comment: BackendComment;
}

// Generate anonymous ID based on user ID
function generateAnonymousId(userId: string | undefined): string {
  const anonymousIds = ['익명A', '익명B', '익명C', '익명D', '익명E', '익명F', '익명G', '익명H', '익명I', '익명J'];
  if (!userId) return '익명';
  const numericId = parseInt(userId) || userId.length;
  return anonymousIds[numericId % anonymousIds.length];
}

export default function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center space-x-2 mb-1">
        <span className="text-xs text-text-secondary">{comment.anonymousId ? comment.anonymousId.slice(-8) : generateAnonymousId(comment.anonymousId)}</span>
        <span className="text-xs text-text-secondary">
          {format(new Date(comment.createdAt), 'h:mm a')}
        </span>
      </div>
      <p className="text-sm text-text-primary">{comment.text}</p>
      
      {comment.attachments && comment.attachments.length > 0 && (
        <div className="mt-2 space-y-1">
          {comment.attachments.map((attachment) => (
            attachment.type.startsWith('image/') ? (
              <img
                key={attachment.id}
                src={attachment.url}
                alt={attachment.name}
                className="max-w-xs h-32 object-cover rounded"
              />
            ) : (
              <div key={attachment.id} className="text-xs">
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
    </div>
  );
}
