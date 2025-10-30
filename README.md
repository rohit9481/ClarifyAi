# AI Tutor Avatar🎓

An intelligent, adaptive learning platform that transforms static educational documents into interactive learning experiences powered by Google's Gemini AI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)

## ✨ Features

### 🤖 AI-Powered Learning
- **Smart Concept Extraction**: Upload PDF or DOCX documents and let Gemini AI identify key educational concepts
- **Auto-Generated Quizzes**: Get 5 multiple-choice questions per concept, automatically created by AI
- **Adaptive Difficulty**: Spaced repetition algorithm prioritizes questions from your weak areas

### 📊 Assessment & Analytics
- **Assessment-Then-Teaching Flow**: Take quizzes without hints, then get targeted teaching on concepts you struggled with
- **Performance Visualization**: Charts showing your accuracy by concept
- **Detailed Reports**: See all your answers with explanations for incorrect responses
- **Progress Tracking**: Monitor learning velocity, identify weak areas, view historical performance

### 🎯 Interactive Teaching Modes
- **Virtual Avatar Mode**: Voice-based Q&A using Web Speech API - ask questions and hear responses
- **Text Chat Mode**: Text-based conversational tutoring with Gemini AI
- **Personalized Explanations**: Warm, supportive AI responses tailored to your questions

### 👥 Flexible Access
- **Google OAuth**: Sign in with your Google account for persistent progress
- **Replit Auth**: Quick authentication when running on Replit platform  
- **Guest Mode**: Try immediately without authentication - progress saved in browser

## 🚀 Quick Start

### Running on Replit (Recommended)

1. Fork this Repl
2. Click "Run"
3. Sign in with Replit or Google
4. Start learning!

### Running Locally

See [LOCAL_SETUP.md](./LOCAL_SETUP.md) for detailed instructions.

**Quick version:**

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# 3. Initialize database
npm run db:push

# 4. Run the application
npm run dev
```

Visit http://localhost:5000

## 🎓 How to Use

### 1. Upload a Document
- Click "Upload" in the navigation
- Choose a PDF or DOCX file (study materials, textbooks, notes)
- AI extracts concepts and generates quiz questions

### 2. Take the Quiz
- Answer all questions (no immediate feedback - this is assessment)
- Submit your quiz when done

### 3. Review Your Results
- See your score and performance chart
- Identify which concepts you struggled with
- Review all Q&A with explanations for wrong answers

### 4. Learn Interactively
- Click "Teach Me" on any weak concept
- Choose your learning mode:
  - **Virtual Mode**: Talk to the AI tutor (requires microphone)
  - **Text Mode**: Chat with the AI tutor
- Ask questions until you feel confident
- Mark concepts as "Clear" when ready

### 5. Track Your Progress
- Visit the Dashboard to see:
  - Total sessions and average score
  - Weak concepts across all your learning
  - Historical performance over time

## 🏗️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** + Shadcn UI components
- **TanStack Query** for server state
- **Wouter** for routing
- **Web Speech API** for voice interactions
- **Recharts** for analytics visualizations

### Backend
- **Express.js** server
- **PostgreSQL** database (via Supabase)
- **Drizzle ORM** for type-safe queries
- **Passport.js** for authentication
- **Multer** for file uploads

### AI & External Services
- **Google Gemini** (gemini-2.5-flash) for NLP
- **Google OAuth** for authentication
- **Replit Auth** (when on Replit)
- **Web Speech API** (browser-native TTS)

## 📁 Project Structure

```
ai-tutor-avatar/
├── client/                  # React frontend
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/          # Route pages
│       ├── hooks/          # Custom React hooks
│       └── lib/            # Utilities
├── server/                 # Express backend
│   ├── auth.ts            # Unified authentication
│   ├── googleAuth.ts      # Google OAuth strategy
│   ├── replitAuth.ts      # Replit Auth strategy
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Database interface
│   ├── gemini.ts          # AI integration
│   └── index.ts           # Server entry
├── shared/                # Shared types & schemas
│   └── schema.ts          # Database schema
├── LOCAL_SETUP.md         # Local development guide
└── README.md              # This file
```

## 🔐 Authentication

The platform supports multiple authentication methods:

- **Google OAuth**: Available everywhere (local and production)
- **Replit Auth**: Only when running on Replit platform
- **Guest Mode**: No authentication required, uses localStorage

## 🗄️ Database Schema

- `users` - User accounts and profiles
- `sessions` - Session storage for authentication
- `pdfs` - Uploaded documents
- `concepts` - AI-extracted educational concepts
- `questions` - Generated MCQ questions
- `quiz_sessions` - User quiz attempts
- `answers` - Student answers with feedback

## 🌐 API Endpoints

### Authentication
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/login` - Replit Auth login (Replit only)
- `GET /api/logout` - Logout
- `GET /api/auth/user` - Get current user

### Documents & Quizzes
- `POST /api/upload-pdf` - Upload PDF/DOCX
- `GET /api/questions/:pdfId` - Get quiz questions
- `POST /api/quiz-sessions` - Create quiz session
- `POST /api/submit-answer` - Submit answer
- `PATCH /api/quiz-sessions/:id/complete` - Complete quiz

### Teaching & Analytics
- `GET /api/concepts/:id` - Get concept details
- `POST /api/ask-concept-question` - Ask AI about concept
- `GET /api/dashboard` - Get user analytics

## 🧪 Testing

```bash
# Run type checking
npm run check

# Build production bundle
npm run build

# Start production server
npm start
```

## 📝 Environment Variables

See [LOCAL_SETUP.md](./LOCAL_SETUP.md) for complete reference.

Required:
- `DATABASE_URL` - PostgreSQL connection
- `SESSION_SECRET` - Session encryption key
- `GEMINI_API_KEY` - Google Gemini AI key
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret

Optional:
- `HEYGEN_API_KEY` - HeyGen avatar (future feature)
- `PORT` - Server port (default: 5000)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini** for powerful AI capabilities
- **Replit** for seamless deployment platform
- **Shadcn UI** for beautiful component library
- **Supabase** for managed PostgreSQL

## 📧 Support

- 📖 Documentation: [LOCAL_SETUP.md](./LOCAL_SETUP.md)
- 🐛 Issues: Open an issue on GitHub
- 💬 Discussions: Start a discussion

## 🎯 Roadmap

- [ ] Advanced analytics with learning velocity
- [ ] Gamification (badges, streaks, leaderboards)
- [ ] Multi-modal learning (images, diagrams)
- [ ] Collaborative study groups
- [ ] Mobile app (React Native)
- [ ] LMS integration (Canvas, Moodle)
- [ ] Teacher dashboard
- [ ] Multi-language support

---
## contributors: PES2UG22CS344,PES2UG22CS374,PES2UG23CS819,PES2UG23CS821

Built with ❤️ using AI to make learning more interactive and effective.
