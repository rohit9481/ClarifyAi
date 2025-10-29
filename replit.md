# AI Tutor Avatar - Project Documentation

## Overview
An AI-powered tutoring application designed to enhance learning through PDF/DOCX-based concept extraction, adaptive MCQ testing, and personalized avatar explanations. It features an "assessment-then-teaching" pedagogical flow, where users are first assessed, and then an AI avatar provides targeted explanations for concepts they struggled with. The project aims to provide an engaging and effective learning experience, offering dual support for authenticated users (with progress tracking) and guest users. Key capabilities include spaced repetition, progress dashboards, and interactive learning modes.

## User Preferences
I want the agent to:
- Act as a senior software engineer.
- Prioritize best practices and clean code.
- Always ask for confirmation before making significant changes.
- Provide clear and concise explanations for any proposed solutions or changes.
- Focus on delivering production-ready code with robust error handling.
- Not make changes to files outside the direct scope of the current task unless explicitly instructed.
- Prefer iterative development, presenting changes in small, reviewable chunks.

## System Architecture
The application is built with a **React, TypeScript, Tailwind CSS, Shadcn UI** frontend, leveraging **Wouter** for routing. The backend is powered by **Express.js** and **Node.js**. **Supabase PostgreSQL** serves as the database, accessed via **Drizzle ORM**.

**Key Features:**
- **Dual Mode Support**: Authenticated users benefit from persistent progress tracking, while guest users can access core functionalities without an account.
- **Content Processing**: Uploaded PDF/DOCX files are processed to extract text, which **Gemini AI** then uses to identify core concepts and generate multiple-choice questions.
- **Assessment-Then-Teaching Flow**: Quizzes initially provide only correct/incorrect feedback. Post-assessment, an **Avatar Explanation** (via **HeyGen**) focuses on concepts where the user answered incorrectly, providing supportive guidance.
- **Spaced Repetition**: Questions are dynamically prioritized based on a user's performance, targeting concepts where they frequently make mistakes.
- **Progress Dashboard**: All users have access to a dashboard displaying learning progress, identifying weak areas, and reviewing their history.
- **Interactive Teaching Modes**: Users can choose between a **Virtual Avatar Mode** (voice-based Q&A using Web Speech API with an animated avatar) and a **Text Mode** (chat-based interaction) for deeper concept understanding.
- **Design System**: A friendly and trustworthy UI/UX is achieved with a specific color palette (Primary: friendly blue, Success: green, Error: gentle red, Avatar Active: soft purple, Highlight: warm amber), and typography using Inter (UI), Lexend (Heading), and JetBrains Mono (Mono).
- **Animations**: Subtle animations like `avatar-pulse`, `question-reveal`, and `answer-pulse` enhance user engagement.
- **Progressive Text Display**: A typewriter effect (`useProgressiveText` hook) for text explanations synchronizes with speech, improving readability and engagement.
- **SSR-Safe Dark Mode**: Provides a consistent user experience with theme persistence across sessions.

**Technical Implementations:**
- **Authentication**: Utilizes **Replit Auth** (OpenID Connect) and supports **Google OAuth** for broader accessibility.
- **Database Schema**: Core tables include `users`, `pdfs`, `concepts`, `questions`, `quiz_sessions`, `answers`, and `concept_mastery` for tracking detailed progress.
- **API Endpoints**: Comprehensive RESTful API for authentication, PDF/quiz management, dashboard data, and interactive learning.
- **Audio Explanations**: Leverages the **Web Speech API** for browser-native text-to-speech, offering a warm and friendly voice without requiring external API keys.
- **Error Handling**: Robust error handling is implemented for PDF parsing and API interactions, ensuring a graceful user experience.

## External Dependencies
- **Google Gemini**: Used for concept extraction from documents, MCQ generation, and providing AI-powered tutoring explanations and follow-up Q&A in interactive teaching modes.
- **HeyGen**: Provides the avatar technology for generating personalized video explanations for incorrect answers.
- **Supabase PostgreSQL**: The primary database solution for persistent storage of user data, documents, questions, and progress tracking.
- **Drizzle ORM**: Used to interact with the Supabase PostgreSQL database.
- **Replit Auth (OpenID Connect)**: For user authentication and session management on the Replit platform.
- **Google OAuth**: An alternative authentication provider.
- **Mammoth.js**: For parsing and extracting text content from DOCX files.