## Gemini Project Context

### Project Overview
This is a full-stack application called "A Board View". It functions as an anonymous social board where users can post content, comment, and chat with others. The project is structured with a `client` (React), a `server` (Express), and a `shared` directory for the Drizzle ORM schema.

### Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, wouter (for routing).
- **Backend**: Node.js, Express.js, TypeScript, WebSockets (`ws`).
- **Database**: PostgreSQL with Drizzle ORM.
- **Build/Dev**: `tsx` for development, `esbuild` for production server build.

### Key Commands
- **Package Manager**: `npm` is used for dependency management (`package-lock.json` exists).
- **Run development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Run production server**: `npm run start`
- **Database push (schema sync)**: `npm run db:push`
- **Type check**: `npm run check`

### Architectural Notes
- The backend server is the main entry point, serving both the API and the Vite-dev-server in development, or the static client build in production.
- All API routes are defined in `server/routes.ts`.
- The database schema is defined in `shared/schema.ts` and is shared between the client and server, which is a key pattern to maintain.
- Frontend components from `shadcn/ui` are located in `client/src/components/ui`.
- User authentication seems to be session-based, managed on the Express server.
- Real-time chat functionality is implemented using WebSockets.
- The user has a stored preference for `uv`, but this project uses `npm`. Stick to `npm` for all project-related commands to maintain consistency with the project setup.
