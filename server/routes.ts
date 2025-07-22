import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertPostSchema, insertCommentSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";
import { botService } from "./botService";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const connectedUsers = new Map<number, WebSocket>();
  
  wss.on('connection', (ws) => {
    let userId: number | null = null;
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth') {
          userId = message.userId;
          if (userId) {
            connectedUsers.set(userId, ws);
          }
        } else if (message.type === 'chat_message' && userId !== null) {
          const chatMessage = await storage.createChatMessage(message.matchId, userId, message.content);
          
          // Send to both users in the match
          const match = await storage.getMatch(message.matchId);
          if (match) {
            const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
            const otherUser = await storage.getUser(otherUserId);
            const otherUserWs = connectedUsers.get(otherUserId);
            
            const messageData = {
              type: 'chat_message',
              message: chatMessage,
              sender: await storage.getUser(userId)
            };
            
            if (otherUserWs && otherUserWs.readyState === WebSocket.OPEN) {
              otherUserWs.send(JSON.stringify(messageData));
            }
            
            // If the other user is a bot, generate a response
            if (otherUser && otherUser.isBot) {
              setTimeout(async () => {
                try {
                  const recentMessages = await storage.getChatMessages(message.matchId);
                  const conversationHistory = recentMessages.slice(-10).map(msg => msg.content);
                  
                  const botResponse = await botService.generateResponse(message.content, conversationHistory);
                  const botMessage = await storage.createChatMessage(message.matchId, otherUserId, botResponse);
                  
                  // Send bot response back to the user
                  const botMessageData = {
                    type: 'chat_message',
                    message: botMessage,
                    sender: otherUser
                  };
                  
                  if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(botMessageData));
                  }
                } catch (error) {
                  console.error('Bot response error:', error);
                }
              }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
            }
          }
        }
      } catch (error) {
        console.error('WebSocket error:', error);
      }
    });
    
    ws.on('close', () => {
      if (userId) {
        connectedUsers.delete(userId);
      }
    });
  });

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json({ user });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Registration failed' });
    }
  });

  app.get('/api/auth/user/:id', async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ user });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to fetch user' });
    }
  });

  // Posts routes
  app.get('/api/posts', async (req, res) => {
    try {
      const posts = await storage.getPosts();
      res.json({ posts });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to fetch posts' });
    }
  });

  app.post('/api/posts', async (req, res) => {
    try {
      const postData = insertPostSchema.parse(req.body);
      const userId = parseInt(req.body.userId);
      const post = await storage.createPost(userId, postData);
      res.json({ post });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create post' });
    }
  });

  app.get('/api/posts/:id/comments', async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getCommentsByPost(postId);
      res.json({ comments });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to fetch comments' });
    }
  });

  app.post('/api/posts/:id/comments', async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const commentData = insertCommentSchema.parse(req.body);
      const userId = parseInt(req.body.userId);
      const comment = await storage.createComment(postId, userId, commentData);
      res.json({ comment });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create comment' });
    }
  });

  app.post('/api/posts/:id/like', async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = parseInt(req.body.userId);
      await storage.toggleLike(postId, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to toggle like' });
    }
  });

  app.get('/api/posts/:id/likes', async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const likes = await storage.getLikesByPost(postId);
      res.json({ likes });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to fetch likes' });
    }
  });

  // Matching routes
  app.post('/api/matches/find', async (req, res) => {
    try {
      const userId = parseInt(req.body.userId);
      let match = await storage.findRandomMatch(userId);
      
      // If no real users available, match with a bot
      if (!match) {
        await botService.ensureBotsExist();
        const bot = await botService.getOrCreateBot();
        match = await storage.createMatch(userId, bot.id);
        (match as any).partner = bot;
      }
      
      res.json({ match });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to find match' });
    }
  });

  // AI-only matching route
  app.post('/api/matches/find-ai', async (req, res) => {
    try {
      const userId = parseInt(req.body.userId);
      
      // Ensure bots exist
      await botService.ensureBotsExist();
      const bot = await botService.getOrCreateBot();
      
      // Create match with bot directly
      const match = await storage.createMatch(userId, bot.id);
      (match as any).partner = bot;
      
      res.json({ match });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to find AI match' });
    }
  });

  app.get('/api/matches/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const matches = await storage.getUserMatches(userId);
      res.json({ matches });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to fetch matches' });
    }
  });

  app.get('/api/matches/:matchId/messages', async (req, res) => {
    try {
      const matchId = parseInt(req.params.matchId);
      const messages = await storage.getChatMessages(matchId);
      res.json({ messages });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to fetch messages' });
    }
  });

  return httpServer;
}
