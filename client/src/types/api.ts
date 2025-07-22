import type { PostWithUser, CommentWithUser, MatchWithUsers, User } from "@shared/schema";

// API response types
export interface PostsResponse {
  posts: PostWithUser[];
}

export interface CommentsResponse {
  comments: CommentWithUser[];
}

export interface LikesResponse {
  likes: any[]; // Basic likes without user details
}

export interface MatchesResponse {
  matches: MatchWithUsers[];
}

export interface UserResponse {
  user: User;
}

export interface MatchResponse {
  match: MatchWithUsers;
}