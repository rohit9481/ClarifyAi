# AI Tutor Avatar - Project Documentation

## Overview
An AI-powered tutoring application that uses PDF/DOCX-based concept extraction, adaptive MCQ testing, and avatar-driven explanations for incorrect answers. The application aims to provide a comprehensive and engaging learning experience, supporting both authenticated users (via Replit Auth and Google OAuth) and guest users with progress tracking and personalized feedback. Its core pedagogical approach is an "Assessment-Then-Teaching" flow, where users are first assessed, and then receive targeted teaching on concepts they struggled with, delivered by a supportive avatar.

## User Preferences
Not specified.

## System Architecture

### Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Wouter
- **Backend**: Express.js, Node.js
- **Database**: Supabase PostgreSQL via Drizzle ORM
- **AI Services**: Gemini (concept extraction, question generation, tutor explanations), HeyGen (avatar video explanations - future integration)
- **Authentication**: Replit Auth (OpenID Connect), Google OAuth

### Key Features
- **Dual Mode Support**: Authenticated users benefit from persistent progress tracking; guest users can access core functionalities without an account.
- **Document Processing**: Upload PDFs or DOCX files for AI-driven concept extraction and MCQ generation.
- **Assessment-Then-Teaching Flow**: Quizzes provide only correct/incorrect feedback initially. Post-quiz, the avatar provides explanations exclusively for concepts answered incorrectly.
- **Spaced Repetition**: Questions are dynamically prioritized based on a user's performance and concept weakness.
- **Avatar Explanations**: A HeyGen avatar (future) or Web Speech API-driven voice (current) delivers warm, supportive explanations for challenging concepts.
- **Progress Dashboard**: All users can track learning progress, identify weak areas, and view their history.
- **Interactive Teaching Modes**: Users can choose between a Virtual Avatar Mode (voice-based Q&A) and a Text Mode (chat-based Q&A), both powered by Gemini AI.
- **Concept Mastery Tracking**: Users can mark concepts as "mastered" for persistent tracking.
- **Re-test with New Questions**: Option to generate fresh questions for weak concepts.
- **Session Reports**: Comprehensive report page with performance charts, Q&A review, and areas for improvement.

### Design System
- **Colors**: Primary (friendly blue), Success (green), Error (gentle red), Avatar Active (soft purple), Highlight (warm amber).
- **Typography**: Inter (UI), Lexend (headings), JetBrains Mono (code/technical).
- **Animations**: `avatar-pulse`, `question-reveal`, `answer-pulse`.

### Frontend Components & Pages
- **Pages**: `landing`, `upload`, `quiz`, `review`, `dashboard`.
- **Shared Components**: `navbar`, `theme-toggle`, `theme-provider`, `speaking-avatar`, `pdf-upload`, `quiz-interface`, `avatar-player`.

### System Design Choices
- **Responsive Design**: All frontend components are built with responsiveness in mind.
- **SSR-Safe Theming**: Implemented light/dark mode with Server-Side Rendering safety.
- **Progressive Text Rendering**: Text appears word-by-word, synchronized with speech or at a readable pace in learning modes.
- **Enhanced Gemini Prompts**: Tailored prompts for simpler, more detailed explanations with real-world examples.
- **Robust Error Handling**: Improved error messages for invalid PDF files and graceful handling of edge cases.

## External Dependencies

- **Supabase**: PostgreSQL database for persistent data storage.
- **Google Gemini API**: Used for concept extraction from documents, MCQ generation, and providing conversational tutoring explanations.
- **HeyGen API**: Planned integration for generating avatar video explanations (currently using Web Speech API for audio).
- **Replit Auth**: OpenID Connect-based authentication for users hosted on Replit.
- **Google OAuth**: Alternative authentication provider for users.
- **Web Speech API**: Browser-native text-to-speech for audio explanations and speech recognition for virtual learning mode.
- **PDF-Parse**: Library for parsing PDF documents.
- **Mammoth.js**: Library for parsing DOCX documents.