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
- `navbar.tsx` - Top navigation with auth state and theme toggle
- `theme-toggle.tsx` - Dark/light mode switcher (sun/moon icon)
- `theme-provider.tsx` - SSR-safe theme management with localStorage persistence
- `heygen-avatar.tsx` - Real HeyGen streaming avatar with WebRTC video, lip-sync, and facial movements
- `pdf-upload.tsx` - Drag-drop PDF uploader
- `quiz-interface.tsx` - MCQ question display

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

### Dashboard
- `GET /api/dashboard` - Get user stats, weak concepts, history (available to all users)

### Interactive Learning
- `GET /api/concepts/:id` - Get concept details by ID
- `POST /api/ask-concept-question` - Ask Gemini a question about a concept (for teaching modes)

### HeyGen Avatar
- `GET /api/heygen/token` - Get HeyGen access token for SDK
- `POST /api/heygen/create-session` - Initialize avatar session (legacy REST API)
- `POST /api/heygen/speak` - Make avatar speak text (legacy REST API)
- `POST /api/heygen/close-session` - End avatar session (legacy REST API)

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
- ✅ **Google OAuth Integration**
  - Added Google OAuth as authentication option alongside Replit Auth
  - Created unified auth system supporting both providers conditionally
  - AuthDropdown component for multiple login options
  - .env.example and comprehensive LOCAL_SETUP.md for local development
  - README.md and DEPLOYMENT.md documentation
- ✅ **Concept Mastery Tracking**
  - New concept_mastery database table to track user progress
  - Backend API: POST /api/concepts/:id/master, GET /api/concepts/:id/mastery
  - Frontend integration in Virtual and Text learning modes
  - Toast notifications when concepts marked as mastered
  - Persistent tracking across sessions for both authenticated and guest users
- ✅ **Re-test with New Questions**
  - POST /api/generate-retest-questions endpoint using Gemini AI
  - "Re-test Weak Concepts" button on session report page
  - Generates 5 fresh questions per weak concept  
  - Creates ONE quiz session with all new questions (consolidated)
  - Quiz page intelligently detects session vs PDF IDs
  - Fixed SQL array handling with inArray() for question filtering
  - Loading states and user feedback during question generation
- ✅ **Session Report with Performance Charts**
  - Comprehensive report page showing quiz results with score percentage
  - Performance chart by concept showing correct/incorrect breakdown
  - Detailed Q&A review section with all questions and answers
  - Areas for improvement section identifying weak concepts
  - "Teach Me" buttons for each weak concept to start interactive learning
- ✅ **Interactive Teaching Modes**
  - Teaching mode selection page with two options
  - Virtual Avatar Mode: Voice-based learning with Web Speech API (voice input/output)
  - Text Mode: Chat-based learning for text interaction
  - Both modes use Gemini AI for answering concept questions
- ✅ **Virtual Learning Mode Implementation**
  - Real-time voice Q&A using Web Speech API (speech recognition & synthesis)
  - Chat history showing conversation between student and tutor
  - Fixed critical bug: apiRequest returns Response object, must call .json() to parse
  - Gemini-powered answers for student questions about weak concepts
  - Voice controls: mute/unmute, listening indicator
  - "I'm Clear" button to mark concept mastery and return to report
- ✅ **Text Learning Mode Implementation**
  - Chat interface for text-based Q&A
  - Gemini-powered conversational tutoring
  - Message history with user/assistant distinction
  - Send button for submitting questions
- ✅ **Enhanced Dark Mode with SSR Safety**
  - ThemeProvider uses lazy useState initialization to prevent SSR/test environment errors
  - Guards for window/localStorage access ensure build-time and runtime safety
  - Theme persists across navigation via localStorage
  - Smooth theme transitions throughout the application
  - Theme toggle button (sun/moon icon) in navbar
- ✅ **HeyGen Streaming Avatar with Lip-Sync**
  - Real video avatar using HeyGen SDK with WebRTC streaming
  - Professional female avatar (Anna) with realistic facial movements
  - Synchronized lip movement during speech
  - Video controls for user interaction
  - Automatic fallback to Web Speech API if HeyGen unavailable
  - Graceful error handling with seamless audio continuity
  - Integrated into virtual-learn page for immersive teaching experience
- ✅ **Improved PDF Error Handling**
  - Better error messages for invalid PDF files
  - Returns 400 status with clear user-friendly message instead of 500 errors
  - Graceful handling of edge-case PDFs that can't be parsed

## Implementation Status
- **Frontend**: Complete with landing, upload, quiz, review, dashboard, and navbar
- **Backend**: All routes implemented - auth, PDF/DOCX processing, quiz, answers
- **Database**: Schema deployed, all tables created
- **AI Integration**: Gemini concept extraction + lovable tutor explanations working perfectly
- **Audio**: Web Speech API providing browser-based text-to-speech
- **Auth**: Replit Auth fully configured for authenticated + guest users
- **Testing**: E2E tests passing for assessment → teaching flow

## Implementation Complete ✅
The comprehensive AI tutor system is fully functional with:
- **PDF & DOCX upload and processing** - Extracts text and concepts via Gemini
- **Assessment-then-teaching pedagogical flow** - Quiz without hints, then targeted teaching with detailed reports
- **Session reports with charts** - Performance visualization, Q&A review, weak concept identification
- **Interactive teaching modes** - Choice between Virtual (voice) and Text (chat) learning experiences
- **Virtual Avatar Mode** - Real-time voice Q&A with **realistic video avatar featuring lip-sync and facial movements**
- **HeyGen Streaming Avatar** - Professional female avatar with WebRTC video, realistic lip movement, and graceful fallback
- **Text Learning Mode** - Chat-based conversational tutoring with Gemini AI
- **Dark Mode** - SSR-safe theme switching with localStorage persistence
- **Concept mastery tracking** - Mark concepts as "clear" with persistent database tracking
- **Re-test with new questions** - Generate fresh questions for weak concepts via Gemini AI
- **Audio explanations** - Browser text-to-speech with warm, friendly voice
- **Text explanations** - Always visible, AI-generated supportive guidance
- **Spaced repetition** - Prioritizes weak concepts for adaptive learning
- **Progress tracking** - Available to all users (guest & authenticated)
- **Dual authentication** - Google OAuth (for local) + Replit Auth (for Replit platform)
- **Production-ready** - Proper error handling, graceful degradation, comprehensive documentation

## Audio Implementation Notes
- **Web Speech API** is used for text-to-speech (works in Chrome, Edge, Safari, Firefox)
- **No API keys required** - Browser-native functionality
- **Graceful degradation** - Virtual mode works even without speech support (text chat remains functional)
- **Auto-plays** on review page with play/pause/replay controls
- **Voice settings**: Rate 0.9 (clarity), Pitch 1.1 (friendliness), auto-selects warm voices

## Interactive Teaching Implementation
- **Dual mode approach** - Users choose between voice-based (Virtual) or text-based (Text) learning
- **Gemini-powered Q&A** - Both modes use POST /api/ask-concept-question endpoint
- **Real-time responses** - Immediate AI-generated answers to student questions
- **Conversation history** - Full chat log maintained during learning session
- **Concept mastery tracking** - "I'm Clear" button to mark concepts as understood
- **Error resilience** - Fallback messages if Gemini API fails, graceful handling of missing browser features
