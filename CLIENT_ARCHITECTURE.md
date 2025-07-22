# Client Architecture Reference - A Board View

*Generated for development reference - Korean anonymous social board application*

## Quick Reference

### **Core Technologies**
- **React 18** + TypeScript + Vite
- **wouter** (lightweight routing)
- **TanStack Query** (server state)
- **shadcn/ui** + Tailwind CSS
- **WebSocket** (real-time chat)

### **Key Directories**
```
client/src/
├── components/     # Reusable UI components
├── pages/          # Route components
├── hooks/          # Custom React hooks
└── lib/           # Utilities & configuration
```

## Architecture Patterns

### **State Management**
- **Server State**: TanStack Query with infinite stale time
- **Local State**: Minimal useState for UI state
- **Authentication**: localStorage anonymous sessions
- **Real-time**: WebSocket integration

### **Component Architecture**
- **Container-Presentation**: Pages as containers, components for presentation
- **Composition over Inheritance**: shadcn/ui component composition
- **Mobile-First**: All components optimized for mobile (max-width: 448px)

### **Type Safety**
- **Shared Types**: Import from `@shared/schema`
- **API Validation**: Zod schemas with TypeScript generation
- **Component Props**: Fully typed interfaces

## Key Components

### **Navigation & Layout**
- `BottomNavigation`: Mobile-persistent navigation bar
- `App.tsx`: Main routing and provider setup

### **Social Features**
- `PostItem`: Social feed posts with likes/comments
- `CommentItem`: Individual comment display
- `CreatePostModal`: Post creation interface

### **Real-time Features**
- `Chat`: 1:1 messaging interface
- `RandomMatchModal`: User matching system
- `useWebSocket`: WebSocket connection management

### **UI Foundation**
- `components/ui/`: 40+ shadcn/ui components
- Mobile-optimized with accessibility built-in

## Development Workflow

### **Adding New Features**
1. Update shared schemas (`@shared/schema`)
2. Create/update API endpoints
3. Build UI components with shadcn/ui
4. Integrate with TanStack Query
5. Test on mobile viewport

### **Component Development**
1. Start with shadcn/ui base components
2. Compose multiple primitives as needed
3. Add server state with TanStack Query
4. Wrap text with `t()` for i18n
5. Mobile-first responsive design

## API Integration

### **HTTP Client Pattern**
```typescript
// Centralized request handling
const { data } = useQuery({
  queryKey: ["/api/endpoint"],
  enabled: !!currentUser,
});
```

### **Real-time Pattern**
```typescript
// WebSocket integration
const { messages, sendMessage } = useWebSocket(matchId);
```

## Styling & Design

### **Color System**
- Primary: `hsl(245, 83%, 63%)` (brand color)
- Gender A: `hsl(0, 84%, 60%)` (red indicator)
- Gender B: `hsl(217, 91%, 60%)` (blue indicator)

### **Layout Constraints**
- Max width: 448px (mobile-optimized)
- Touch-friendly buttons (min 44px)
- Korean text optimization

## Performance Considerations

- **Code Splitting**: Dynamic imports for routes
- **Query Caching**: Infinite stale time for better UX
- **Bundle Optimization**: Minimal dependencies
- **Image Handling**: URL-based with lazy loading

## Authentication Flow

1. Anonymous registration (birth year + gender)
2. localStorage session persistence  
3. Server-side session validation
4. Automatic login state management

## Development Commands

- `npm run dev` - Development server (port 5000)
- `npm run build` - Production build
- `npm run check` - TypeScript validation

---

*This document serves as a reference for understanding the client architecture and development patterns. Keep it updated as the codebase evolves.*