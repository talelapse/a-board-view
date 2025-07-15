import { format } from "date-fns";

interface CommentItemProps {
  comment: any;
}

export default function CommentItem({ comment }: CommentItemProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center space-x-2 mb-1">
        <span className="text-xs text-text-secondary">Born {comment.user.birthYear}</span>
        <div className={`w-1.5 h-1.5 rounded-full ${comment.user.gender === 'a' ? 'bg-gender-a' : 'bg-gender-b'}`}></div>
        <span className="text-xs text-text-secondary">
          {format(new Date(comment.createdAt), 'h:mm a')}
        </span>
      </div>
      <p className="text-sm text-text-primary">{comment.content}</p>
    </div>
  );
}
