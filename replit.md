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
2. **PDF/DOCX Processing**: Upload PDFs or DOCX files → extract text → Gemini extracts concepts → generates MCQs
3. **Assessment-Then-Teaching Flow**: 
   - Assessment phase: Quiz shows only correct/incorrect feedback (no explanations)
   - Teaching phase: After quiz, avatar teaches ONLY the concepts user got wrong
4. **Spaced Repetition**: Questions prioritized by concept weakness (incorrect answer frequency)
5. **Avatar Explanations**: HeyGen avatar delivers warm, supportive explanations for weak concepts
6. **Progress Dashboard**: Track learning, identify weak areas, view history (available to all users)

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
2. Upload PDF/DOCX → AI processes → generates quiz
3. Take quiz (assessment) → see only correct/incorrect feedback
4. After quiz → review session teaches concepts where answers were wrong
5. Avatar explains each incorrect concept with warm, supportive guidance
6. View dashboard with progress (stored locally via guestSessionId)

**Authenticated User Flow:**
1. Sign in via Replit Auth
2. Upload PDF/DOCX → stored with userId
3. Take quiz (assessment) → progress tracked in database
4. After quiz → review session for incorrect answers with avatar
5. View dashboard with stats, weak concepts, history
6. Return anytime with saved progress

## Frontend Components

### Pages
- `landing.tsx` - Hero, features, CTAs
- `upload.tsx` - PDF/DOCX upload interface
- `quiz.tsx` - Assessment phase (quiz without explanations)
- `review.tsx` - Teaching phase (avatar explains wrong answers)
- `dashboard.tsx` - Progress tracking (available to all users)

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
- ✅ Backend API endpoints implemented
- ✅ Supabase database schema deployed via Drizzle
- ✅ Gemini integration for concept extraction & lovable tutor explanations
- ✅ All CRUD operations with proper error handling
- ✅ Dashboard with stats, weak concepts tracking, and history (available to all users)
- ✅ Fixed PDF parsing bug (PDFParse class usage)
- ✅ Added DOCX file support using mammoth library
- ✅ Implemented spaced repetition algorithm for prioritizing weak concepts
- ✅ **Assessment-Then-Teaching Flow**
  - Quiz now shows only correct/incorrect feedback (no explanations during assessment)
  - After quiz completion, redirects to review session
  - Review page teaches ONLY the concepts user got wrong with explanations
  - localStorage-based data handoff between quiz and review phases
  - Accurate score tracking with fixed state management
- ✅ **Fixed Text Explanations Bug**
  - Added getConcept() method to storage layer
  - Gemini AI now generates meaningful explanations (397+ chars)
  - Text explanations display correctly on review page
- ✅ **Implemented Web Speech API for Audio**
  - Browser-based text-to-speech (no API keys needed)
  - Warm, friendly voice with optimized speech parameters
  - Play/pause, mute, replay controls
  - Auto-plays explanations on review page
  - Works in all modern browsers (Chrome, Edge, Safari, Firefox)

## Implementation Status
- **Frontend**: Complete with landing, upload, quiz, review, dashboard, and navbar
- **Backend**: All routes implemented - auth, PDF/DOCX processing, quiz, answers
- **Database**: Schema deployed, all tables created
- **AI Integration**: Gemini concept extraction + lovable tutor explanations working perfectly
- **Audio**: Web Speech API providing browser-based text-to-speech
- **Auth**: Replit Auth fully configured for authenticated + guest users
- **Testing**: E2E tests passing for assessment → teaching flow

## Implementation Complete ✅
The core AI tutor system is fully functional with:
- **PDF & DOCX upload and processing** - Extracts text and concepts via Gemini
- **Assessment-then-teaching pedagogical flow** - Quiz without hints, then targeted teaching
- **Audio explanations** - Browser text-to-speech with warm, friendly voice
- **Text explanations** - Always visible, AI-generated supportive guidance
- **Spaced repetition** - Prioritizes weak concepts for adaptive learning
- **Progress tracking** - Available to all users (guest & authenticated)

## Audio Implementation Notes
- **Web Speech API** is used for text-to-speech (works in Chrome, Edge, Safari, Firefox)
- **No API keys required** - Browser-native functionality
- **Auto-plays** on review page with play/pause/replay controls
- **Graceful fallback** - Text explanations always visible if audio unavailable
- **Voice settings**: Rate 0.9 (clarity), Pitch 1.1 (friendliness), auto-selects warm voices
