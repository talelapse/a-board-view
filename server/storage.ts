import { type User, type InsertUser, type Post, type InsertPost, type Comment, type InsertComment, type Like, type Match, type ChatMessage, type InsertChatMessage } from "@shared/schema";
import { randomInt } from "crypto";

interface DataStore {
  users: User[];
  posts: Post[];
  comments: Comment[];
  likes: Like[];
  matches: Match[];
  chatMessages: ChatMessage[];
}

import data from './data.json' assert { type: 'json' };

const store: DataStore = {
  users: data.users.map(u => ({ ...u, createdAt: new Date(u.createdAt) })),
  posts: data.posts.map(p => ({ ...p, createdAt: new Date(p.createdAt) })),
  comments: data.comments.map(c => ({ ...c, createdAt: new Date(c.createdAt) })),
  likes: data.likes,
  matches: data.matches.map(m => ({ ...m, createdAt: new Date(m.createdAt) })),
  chatMessages: data.chatMessages.map(cm => ({ ...cm, createdAt: new Date(cm.createdAt) })),
};

// Interface for storage operations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  getPosts(): Promise<Post[]>;
  createPost(userId: number, postData: InsertPost): Promise<Post>;
  getCommentsByPost(postId: number): Promise<Comment[]>;
  createComment(postId: number, userId: number, commentData: InsertComment): Promise<Comment>;
  getLikesByPost(postId: number): Promise<Like[]>;
  toggleLike(postId: number, userId: number): Promise<void>;
  findRandomMatch(userId: number): Promise<Match | null>;
  getUserMatches(userId: number): Promise<Match[]>;
  getMatch(matchId: number): Promise<Match | undefined>;
  createChatMessage(matchId: number, senderId: number, content: string): Promise<ChatMessage>;
  getChatMessages(matchId: number): Promise<ChatMessage[]>;

  // Bot operations
  createBot(birthYear: number, gender: string): Promise<User>;
  getRandomBot(): Promise<User | null>;
  // Match creation for JSON storage
  createMatch(user1Id: number, user2Id: number): Promise<Match>;
}

export class JsonStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    return store.users.find(u => u.id === id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = store.users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
    const user: User = { id, ...insertUser, isBot: false, createdAt: new Date() };
    store.users.push(user);
    return user;
  }

  async getPosts(): Promise<Post[]> {
    const result = await Promise.all(
      store.posts.map(async post => {
        const user = await this.getUser(post.userId);
        return { ...post, user: user! } as Post;
      })
    );
    return result;
  }

  async createPost(userId: number, postData: InsertPost): Promise<Post> {
    const id = store.posts.reduce((max, p) => Math.max(max, p.id), 0) + 1;
    const post: Post = { id, userId, ...postData, createdAt: new Date(), user: await this.getUser(userId)! };
    store.posts.push(post);
    return post;
  }

  async getCommentsByPost(postId: number): Promise<Comment[]> {
    return store.comments.filter(c => c.postId === postId).map(c => ({
      ...c,
      user: store.users.find(u => u.id === c.userId)!
    } as Comment));
  }

  async createComment(postId: number, userId: number, commentData: InsertComment): Promise<Comment> {
    const id = store.comments.reduce((max, c) => Math.max(max, c.id), 0) + 1;
    const comment: Comment = { id, postId, userId, ...commentData, createdAt: new Date(), user: store.users.find(u => u.id === userId)! };
    store.comments.push(comment);
    return comment;
  }

  async getLikesByPost(postId: number): Promise<Like[]> {
    return store.likes.filter(l => l.postId === postId);
  }

  async toggleLike(postId: number, userId: number): Promise<void> {
    const idx = store.likes.findIndex(l => l.postId === postId && l.userId === userId);
    if (idx >= 0) {
      store.likes.splice(idx, 1);
    } else {
      const id = store.likes.reduce((max, l) => Math.max(max, l.id), 0) + 1;
      store.likes.push({ id, postId, userId });
    }
  }

  async findRandomMatch(userId: number): Promise<Match | null> {
    const candidates = store.users.filter(u => u.id !== userId && !u.isBot);
    if (candidates.length === 0) return null;
    const partner = candidates[randomInt(0, candidates.length)];
    const id = store.matches.reduce((max, m) => Math.max(max, m.id), 0) + 1;
    const match: Match = { id, user1Id: userId, user2Id: partner.id, createdAt: new Date() };
    store.matches.push(match);
    return { ...match, user1: await this.getUser(userId)!, user2: partner };
  }

  async getUserMatches(userId: number): Promise<Match[]> {
    return store.matches.filter(m => m.user1Id === userId || m.user2Id === userId).map(m => ({
      ...m,
      user1: store.users.find(u => u.id === m.user1Id)!,
      user2: store.users.find(u => u.id === m.user2Id)!
    }));
  }

  async getMatch(matchId: number): Promise<Match | undefined> {
    const m = store.matches.find(m => m.id === matchId);
    if (!m) return undefined;
    return { ...m, user1: store.users.find(u => u.id === m.user1Id)!, user2: store.users.find(u => u.id === m.user2Id)! };
  }

  async createChatMessage(matchId: number, senderId: number, content: string): Promise<ChatMessage> {
    const id = store.chatMessages.reduce((max, cm) => Math.max(max, cm.id), 0) + 1;
    const message: ChatMessage = { id, matchId, senderId, content, createdAt: new Date() };
    store.chatMessages.push(message);
    return message;
  }

  async getChatMessages(matchId: number): Promise<ChatMessage[]> {
    return store.chatMessages.filter(cm => cm.matchId === matchId);
  }
  
  // Bot operations
  async createBot(birthYear: number, gender: string): Promise<User> {
    const id = store.users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
    const bot: User = { id, birthYear, gender, isBot: true, createdAt: new Date() };
    store.users.push(bot);
    return bot;
  }

  async getRandomBot(): Promise<User | null> {
    const bots = store.users.filter(u => u.isBot);
    if (bots.length === 0) return null;
    const idx = randomInt(0, bots.length);
    return bots[idx];
  }
  
  async createMatch(user1Id: number, user2Id: number): Promise<Match> {
    const id = store.matches.reduce((max, m) => Math.max(max, m.id), 0) + 1;
    const match: Match = { id, user1Id, user2Id, createdAt: new Date() };
    store.matches.push(match);
    return { ...match, user1: await this.getUser(user1Id)!, user2: await this.getUser(user2Id)! };
  }
}

export const storage = new JsonStorage();
