import { 
  users, 
  posts, 
  comments, 
  likes, 
  matches, 
  chatMessages,
  type User, 
  type InsertUser,
  type Post,
  type InsertPost,
  type Comment,
  type InsertComment,
  type Like,
  type Match,
  type ChatMessage,
  type InsertChatMessage
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ne, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Post operations
  getPosts(): Promise<Post[]>;
  createPost(userId: number, postData: InsertPost): Promise<Post>;
  
  // Comment operations
  getCommentsByPost(postId: number): Promise<Comment[]>;
  createComment(postId: number, userId: number, commentData: InsertComment): Promise<Comment>;
  
  // Like operations
  getLikesByPost(postId: number): Promise<Like[]>;
  toggleLike(postId: number, userId: number): Promise<void>;
  
  // Match operations
  findRandomMatch(userId: number): Promise<Match | null>;
  getUserMatches(userId: number): Promise<Match[]>;
  getMatch(matchId: number): Promise<Match | undefined>;
  
  // Bot operations
  createBot(birthYear: number, gender: string): Promise<User>;
  getRandomBot(): Promise<User | null>;
  
  // Chat operations
  createChatMessage(matchId: number, senderId: number, content: string): Promise<ChatMessage>;
  getChatMessages(matchId: number): Promise<ChatMessage[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getPosts(): Promise<Post[]> {
    const result = await db
      .select({
        id: posts.id,
        userId: posts.userId,
        content: posts.content,
        imageUrl: posts.imageUrl,
        createdAt: posts.createdAt,
        user: {
          id: users.id,
          birthYear: users.birthYear,
          gender: users.gender,
          createdAt: users.createdAt
        }
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt));
    
    return result.map(row => ({
      ...row,
      user: row.user!
    })) as Post[];
  }

  async createPost(userId: number, postData: InsertPost): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values({ ...postData, userId })
      .returning();
    
    const user = await this.getUser(userId);
    return { ...post, user: user! } as Post;
  }

  async getCommentsByPost(postId: number): Promise<Comment[]> {
    const result = await db
      .select({
        id: comments.id,
        postId: comments.postId,
        userId: comments.userId,
        content: comments.content,
        createdAt: comments.createdAt,
        user: {
          id: users.id,
          birthYear: users.birthYear,
          gender: users.gender,
          createdAt: users.createdAt
        }
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));
    
    return result.map(row => ({
      ...row,
      user: row.user!
    })) as Comment[];
  }

  async createComment(postId: number, userId: number, commentData: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values({ ...commentData, postId, userId })
      .returning();
    
    const user = await this.getUser(userId);
    return { ...comment, user: user! } as Comment;
  }

  async getLikesByPost(postId: number): Promise<Like[]> {
    return await db
      .select()
      .from(likes)
      .where(eq(likes.postId, postId));
  }

  async toggleLike(postId: number, userId: number): Promise<void> {
    const existingLike = await db
      .select()
      .from(likes)
      .where(and(eq(likes.postId, postId), eq(likes.userId, userId)));
    
    if (existingLike.length > 0) {
      await db
        .delete(likes)
        .where(and(eq(likes.postId, postId), eq(likes.userId, userId)));
    } else {
      await db
        .insert(likes)
        .values({ postId, userId });
    }
  }

  async findRandomMatch(userId: number): Promise<Match | null> {
    // Find users who haven't been matched with current user and are not bots
    const availableUsers = await db
      .select()
      .from(users)
      .where(and(ne(users.id, userId), eq(users.isBot, false)));
    
    if (availableUsers.length === 0) {
      return null;
    }
    
    // Pick a random user
    const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
    
    // Create match
    const [match] = await db
      .insert(matches)
      .values({
        user1Id: userId,
        user2Id: randomUser.id
      })
      .returning();
    
    return {
      ...match,
      user1: await this.getUser(userId),
      user2: await this.getUser(randomUser.id),
      partner: randomUser
    } as Match;
  }

  async getUserMatches(userId: number): Promise<Match[]> {
    const result = await db
      .select({
        id: matches.id,
        user1Id: matches.user1Id,
        user2Id: matches.user2Id,
        createdAt: matches.createdAt,
        user1: {
          id: users.id,
          birthYear: users.birthYear,
          gender: users.gender,
          createdAt: users.createdAt
        },
        user2: {
          id: users.id,
          birthYear: users.birthYear,
          gender: users.gender,
          createdAt: users.createdAt
        }
      })
      .from(matches)
      .leftJoin(users, eq(matches.user1Id, users.id))
      .where(or(eq(matches.user1Id, userId), eq(matches.user2Id, userId)))
      .orderBy(desc(matches.createdAt));
    
    return result.map(row => ({
      ...row,
      user1: row.user1!,
      user2: row.user2!
    })) as Match[];
  }

  async getMatch(matchId: number): Promise<Match | undefined> {
    const [match] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, matchId));
    
    if (!match) return undefined;
    
    const user1 = await this.getUser(match.user1Id);
    const user2 = await this.getUser(match.user2Id);
    
    return {
      ...match,
      user1: user1!,
      user2: user2!
    } as Match;
  }

  async createChatMessage(matchId: number, senderId: number, content: string): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values({
        matchId,
        senderId,
        content
      })
      .returning();
    
    return message;
  }

  async getChatMessages(matchId: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.matchId, matchId))
      .orderBy(desc(chatMessages.createdAt));
  }

  // Bot operations
  async createBot(birthYear: number, gender: string): Promise<User> {
    const [bot] = await db.insert(users).values({
      birthYear,
      gender,
      isBot: true,
    }).returning();
    return bot;
  }

  async getRandomBot(): Promise<User | null> {
    const [bot] = await db.select().from(users).where(eq(users.isBot, true)).orderBy(sql`RANDOM()`).limit(1);
    return bot || null;
  }
}

export const storage = new DatabaseStorage();