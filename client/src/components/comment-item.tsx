import { format } from "date-fns";
import type { CommentWithUser } from "@shared/schema";

interface CommentItemProps {
  comment: CommentWithUser;
}

// Generate anonymous ID based on user ID
function generateAnonymousId(userId: number): string {
  const anonymousIds = ['익명A', '익명B', '익명C', '익명D', '익명E', '익명F', '익명G', '익명H', '익명I', '익명J'];
  return anonymousIds[userId % anonymousIds.length];
}

export default function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center space-x-2 mb-1">
        <span className="text-xs text-text-secondary">{generateAnonymousId(comment.user.id)}</span>
        <div className={`w-1.5 h-1.5 rounded-full ${comment.user.gender === 'a' ? 'bg-gender-a' : 'bg-gender-b'}`}></div>
        <span className="text-xs text-text-secondary">
          {format(new Date(comment.createdAt), 'h:mm a')}
        </span>
      </div>
      <p className="text-sm text-text-primary">{comment.content}</p>
    </div>
  );
}
