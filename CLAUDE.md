# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development Commands
- `npm run dev` - Starts the development server on port 5000
- `npm run build` - Builds both frontend and backend for production
- `npm run start` - Runs the production build
- `npm run check` - TypeScript type checking
- `npm run db:push` - Apply database schema changes using Drizzle

### Environment Setup
Set up `.env` file with `DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"` for database connection.

## Architecture Overview

This is a Korean social board application ("A Board View") that allows anonymous users to create posts, comment, and chat with each other through random matching. The architecture follows a full-stack TypeScript setup:

### Frontend (`/client`)
- **Framework**: React 18 with TypeScript, Vite for bundling
- **Router**: wouter for client-side routing
- **UI**: shadcn/ui components with Tailwind CSS
- **State**: TanStack Query for server state management
- **WebSockets**: Real-time chat functionality

### Backend (`/server`)
- **Framework**: Express.js with TypeScript
- **WebSocket**: ws library for real-time chat
- **Storage**: JSON-based in-memory storage (no database in current setup)
- **AI Integration**: OpenAI API for chatbot functionality

### Shared (`/shared`)
- **Schema**: Drizzle ORM schema definitions shared between client and server
- **Types**: TypeScript types and Zod validation schemas

### Key Data Models
- **Users**: Anonymous users with birth year and gender (a/b)
- **Posts**: Text/image content with comments and likes
- **Matches**: Random user pairing for 1:1 chat
- **ChatMessages**: Real-time messaging between matched users
- **Bots**: AI-powered chat partners when no users available

### Authentication & Privacy
- Simple user registration without passwords
- Birth year hidden in display, only anonymous IDs shown
- Random matching system for user privacy

### Real-time Features
- WebSocket server at `/ws` for live chat
- Bot responses with AI integration
- Connection management for online users

### Path Aliases
- `@/` → `client/src/`
- `@shared/` → `shared/`
- `@assets/` → `attached_assets/`

### Storage Pattern
Currently uses JSON file storage (`server/data.json`) instead of PostgreSQL database. The Drizzle schema exists for future database migration, but the app runs with `JsonStorage` class that manages data in memory.

### Bot System
AI-powered bots automatically engage with users when no human partners are available for random matching, using OpenAI API for conversation generation.