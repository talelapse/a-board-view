import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertChatMessageSchema } from "@shared/schema";
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

  // Legacy routes removed - all API calls now go through backend proxy

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
