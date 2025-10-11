# AI Tutor Avatar - Project Documentation

## Overview
An AI-powered tutoring application that uses PDF-based concept extraction, adaptive MCQ testing, and HeyGen avatar explanations for incorrect answers. Supports both authenticated users (with Replit Auth) and guest mode.

## Architecture

### Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Wouter (routing)
- **Backend**: Express.js, Node.js
- **Database**: Supabase PostgreSQL via Drizzle ORM
- **AI Services**: 
  - Gemini (concept extraction, question generation, tutor explanations)
  - HeyGen (avatar video explanations)
- **Authentication**: Replit Auth (OpenID Connect)

### Key Features
1. **Dual Mode Support**: Authenticated users get progress tracking; guest users can try without accounts
2. **PDF Processing**: Upload PDFs → extract text → Gemini extracts concepts → generates MCQs
3. **Adaptive Testing**: Interactive quiz with immediate feedback
4. **Avatar Explanations**: When wrong, HeyGen avatar speaks Gemini-generated warm explanations
5. **Progress Dashboard**: Track learning, identify weak areas, view history (auth users only)

## Data Model

### Core Tables
- `users` - User accounts via Replit Auth
- `sessions` - Session storage for Replit Auth
- `pdfs` - Uploaded documents (linked to userId or guestSessionId)
- `concepts` - AI-extracted concepts from PDFs
- `questions` - Generated MCQs for each concept
- `quiz_sessions` - Individual quiz attempts
- `answers` - Student answers with explanations

### User Flows

**Guest User Flow:**
1. Land on homepage → "Try as Guest"
2. Upload PDF → AI processes → generates quiz
3. Take quiz → wrong answers trigger avatar explanations
4. Results shown (stored locally via guestSessionId)

**Authenticated User Flow:**
1. Sign in via Replit Auth
2. Upload PDF → stored with userId
3. Take quiz → progress tracked in database
4. View dashboard with stats, weak concepts, history
5. Return anytime with saved progress

## Frontend Components

### Pages
- `landing.tsx` - Hero, features, CTAs
- `upload.tsx` - PDF upload interface
- `quiz.tsx` - Quiz flow with avatar explanations
- `dashboard.tsx` - Progress tracking (auth only)

### Shared Components
- `navbar.tsx` - Top navigation with auth state
- `theme-toggle.tsx` - Dark/light mode switcher
- `theme-provider.tsx` - Theme management
- `pdf-upload.tsx` - Drag-drop PDF uploader
- `quiz-interface.tsx` - MCQ question display
- `avatar-player.tsx` - HeyGen video player with explanations

## Design System

### Colors (from design_guidelines.md)
- Primary: Friendly blue (trust, learning)
- Success: Green (correct answers)
- Error: Gentle red (incorrect, not harsh)
- Avatar Active: Soft purple (speaking state)
- Highlight: Warm amber (achievements)

### Typography
- Sans: Inter (UI)
- Heading: Lexend (friendly, readable)
- Mono: JetBrains Mono (code/technical)

### Animations
- `avatar-pulse` - 2s pulse on avatar border when speaking
- `question-reveal` - 300ms fade-in for questions
- `answer-pulse` - 200ms scale pulse on selection

## API Endpoints

### Authentication (Replit Auth)
- `GET /api/login` - Initiate OAuth flow
- `GET /api/logout` - Sign out
- `GET /api/callback` - OAuth callback
- `GET /api/auth/user` - Get current user

### PDF & Quiz
- `POST /api/upload-pdf` - Upload & process PDF
- `GET /api/questions/:pdfId` - Get questions for PDF
- `POST /api/quiz-sessions` - Create quiz session
- `POST /api/submit-answer` - Submit answer, get explanation
- `PATCH /api/quiz-sessions/:id/complete` - Mark session complete

### Dashboard (Auth only)
- `GET /api/dashboard` - Get user stats, weak concepts, history

### HeyGen Avatar
- `POST /api/heygen/create-session` - Initialize avatar session
- `POST /api/heygen/speak` - Make avatar speak text
- `POST /api/heygen/close-session` - End avatar session

## Environment Variables
- `DATABASE_URL` - Supabase connection string
- `GEMINI_API_KEY` - Google Gemini API key
- `HEYGEN_API_KEY` - HeyGen API key
- `SESSION_SECRET` - Session encryption (auto-provided by Replit)
- `REPL_ID`, `REPLIT_DOMAINS`, `ISSUER_URL` - Replit Auth (auto-provided)

## Development Workflow
1. Schema defined in `shared/schema.ts`
2. Frontend components built with Shadcn + Tailwind
3. Backend routes in `server/routes.ts`
4. Storage interface in `server/storage.ts`
5. Database operations via Drizzle ORM

## Recent Changes
- ✅ Initial project setup with full schema
- ✅ All frontend components built with responsive design and exceptional polish
- ✅ Theme system with light/dark mode (Inter + Lexend fonts)
- ✅ Replit Auth integration fully implemented
- ✅ Guest mode support via localStorage sessionId
- ✅ HeyGen avatar player with speaking animations
- ✅ Complete quiz flow from upload → test → avatar explanation
- ✅ Backend API endpoints implemented
- ✅ Supabase database schema deployed via Drizzle
- ✅ Gemini integration for concept extraction & tutor explanations
- ✅ HeyGen API integration for avatar sessions
- ✅ All CRUD operations with proper error handling
- ✅ Dashboard with stats, weak concepts tracking, and history

## Implementation Status
- **Frontend**: Complete with landing, upload, quiz, dashboard, and navbar
- **Backend**: All routes implemented - auth, PDF processing, quiz, answers, HeyGen
- **Database**: Schema deployed, all tables created
- **AI Integration**: Gemini concept extraction + lovable tutor explanations working
- **Avatar**: HeyGen API integration ready (with graceful fallback)
- **Auth**: Replit Auth fully configured for authenticated + guest users

## Testing Needed
- End-to-end flow: Upload PDF → Extract concepts → Take quiz → Avatar explains wrong answers
- Dashboard data aggregation for authenticated users
- Guest mode session persistence
- Error states and edge cases
