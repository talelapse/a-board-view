# Anonymous Social App

## Overview

This is a full-stack anonymous social media application built with React and Express. Users can register with minimal information (birth year and gender), create posts, comment on posts, like content, and engage in real-time chat with matched users. The application emphasizes anonymity while providing a modern social media experience with real-time features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Real-time Communication**: WebSocket API for live chat functionality

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **WebSocket**: Native WebSocket server for real-time chat
- **Development**: tsx for TypeScript execution in development
- **Production**: esbuild for server bundling

### Data Storage
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema**: Drizzle ORM with schema definitions in shared directory
- **Tables**: Users, posts, comments, likes, matches, chat messages
- **Relationships**: Foreign key relationships between entities

## Key Components

### Authentication System
- **Anonymous Registration**: Users register with only birth year and gender
- **Client-side Storage**: User data stored in localStorage
- **No Traditional Auth**: No passwords or email verification required
- **Gender System**: Binary gender system ('a' and 'b') with color coding

### Social Features
- **Posts**: Text-based posts with optional image URLs
- **Comments**: Threaded comments on posts
- **Likes**: Simple like system for posts
- **Feed**: Chronological feed of all posts
- **Real-time Updates**: Live updates for new content

### Matching System
- **Random Matching**: Users can find random matches for chat
- **Bot Matching**: When no real users are available, system automatically matches with AI bots
- **Chat System**: Real-time messaging between matched users and bots
- **WebSocket Implementation**: Persistent connections for instant messaging
- **Match Persistence**: Matches stored in database for ongoing conversations
- **Anonymous Chat**: Partner information is hidden during chat sessions

### UI/UX Design
- **Mobile-first**: Responsive design optimized for mobile devices
- **Bottom Navigation**: Mobile-style navigation with key actions
- **Modal System**: Overlays for post creation and matching
- **Toast Notifications**: User feedback for actions
- **Loading States**: Proper loading indicators throughout

## Data Flow

### User Registration
1. User submits birth year and gender
2. Frontend validates input
3. POST request to `/api/auth/register`
4. User record created in database
5. User data stored in localStorage
6. Redirect to feed

### Post Creation
1. User creates post via modal
2. Content validated on client
3. POST request to `/api/posts`
4. Post stored in database
5. Feed refreshed via query invalidation
6. Toast notification shown

### Real-time Chat
1. WebSocket connection established
2. User authenticates with userId
3. Messages sent via WebSocket
4. Server broadcasts to matched users
5. Messages stored in database
6. UI updated in real-time

### Matching System
1. User requests random match
2. Server finds available users
3. Match record created
4. WebSocket notifications sent
5. Chat interface enabled

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React, React DOM, React Query
- **Database**: Drizzle ORM, Neon PostgreSQL driver
- **UI Components**: Radix UI primitives, Lucide React icons
- **Styling**: Tailwind CSS, class-variance-authority
- **Validation**: Zod for schema validation
- **Date Handling**: date-fns for date formatting
- **WebSocket**: Native WebSocket for real-time features
- **AI Integration**: OpenAI GPT-4o for bot conversations

### Development Dependencies
- **Build Tools**: Vite, esbuild, tsx
- **TypeScript**: Full TypeScript support
- **Linting**: ESLint configuration
- **Database Tools**: Drizzle Kit for migrations

## Deployment Strategy

### Build Process
1. **Client Build**: Vite builds React app to `dist/public`
2. **Server Build**: esbuild bundles Express server to `dist/index.js`
3. **Static Assets**: Client files served by Express in production

### Environment Configuration
- **Development**: tsx runs TypeScript directly
- **Production**: Node.js runs compiled JavaScript
- **Database**: Neon PostgreSQL connection via DATABASE_URL
- **WebSocket**: Same-origin WebSocket connections

### Production Considerations
- **Static File Serving**: Express serves built React app
- **Database Migrations**: Drizzle Kit handles schema changes
- **Error Handling**: Comprehensive error boundaries and logging
- **Performance**: Optimized builds and lazy loading
- **Security**: Input validation and sanitization

The application is designed to be deployed on platforms like Replit, Heroku, or similar Node.js hosting services with PostgreSQL database support.