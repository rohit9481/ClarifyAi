# AI Tutor Avatar - Local Development Setup

This guide will help you run the AI Tutor Avatar project on your local machine.

## Prerequisites

- **Node.js** 18+ (recommended: 20.x)
- **PostgreSQL** 14+ database
- **Google Cloud Account** (for Google OAuth)
- **Google Gemini API Key**

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up PostgreSQL Database

### Option A: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a new database:
   ```sql
   CREATE DATABASE ai_tutor;
   ```
3. Note your connection string (will be needed in `.env`)

### Option B: Use Supabase (Free Tier)

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your connection string from Project Settings → Database
4. Use the connection pooler URL (recommended)

## Step 3: Set Up Google OAuth

### Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"
4. Create OAuth credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Select "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback`
     - `http://127.0.0.1:5000/api/auth/google/callback`
   - Click "Create"
5. Copy your **Client ID** and **Client Secret**

## Step 4: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your API key

## Step 5: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your values:

```env
# Database (replace with your PostgreSQL connection string)
DATABASE_URL=postgresql://user:password@localhost:5432/ai_tutor

# Session Secret (generate a random string)
SESSION_SECRET=your-random-secret-key-at-least-32-characters-long

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Optional: HeyGen (for avatar features)
HEYGEN_API_KEY=your-heygen-api-key-if-you-have-one

# Environment
NODE_ENV=development
PORT=5000
```

### Generating a Secure Session Secret

On Linux/Mac:
```bash
openssl rand -base64 32
```

On Windows (PowerShell):
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Or use this Node.js command:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Step 6: Initialize Database

Push the database schema:

```bash
npm run db:push
```

This will create all necessary tables in your PostgreSQL database.

## Step 7: Run the Application

Start the development server:

```bash
npm run dev
```

The application will be available at:
- **Frontend & Backend**: http://localhost:5000

## Authentication Options

When running locally, you'll have two sign-in options:

1. **Google OAuth** - Available everywhere
2. **Replit Auth** - Only available when running on Replit platform

## Troubleshooting

### "Google OAuth not configured" message

- Make sure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env`
- Restart the server after changing environment variables

### Database connection errors

- Verify PostgreSQL is running
- Check your `DATABASE_URL` format: `postgresql://user:password@host:port/database`
- Ensure the database exists
- Check user permissions

### "Unauthorized redirect URI" from Google

- Ensure you added `http://localhost:5000/api/auth/google/callback` to authorized redirect URIs in Google Cloud Console
- The URL must match exactly (including protocol and port)

### Session not persisting

- Make sure `SESSION_SECRET` is set
- Clear your browser cookies and try again
- Check that the database sessions table was created

### Port 5000 already in use

Change the port in `.env`:
```env
PORT=3000
```

Then update your Google OAuth callback URL to:
```
http://localhost:3000/api/auth/google/callback
```

## Guest Mode

The application supports guest mode (no authentication required):

1. Click "Try as Guest" on the landing page
2. Upload PDFs and take quizzes
3. Progress is stored in browser localStorage
4. Data persists as long as you use the same browser

## Features Available in Local Mode

✅ PDF/DOCX upload and processing
✅ AI concept extraction (Gemini)
✅ Quiz generation and assessment
✅ Session reports with charts
✅ Interactive teaching modes (Virtual & Text)
✅ Web Speech API (voice features)
✅ Progress tracking and analytics
✅ Google OAuth authentication
✅ Guest mode with localStorage

❌ Replit Auth (only on Replit platform)
❌ HeyGen avatar (requires API key)

## Building for Production

1. Build the application:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Secret for session encryption |
| `GOOGLE_CLIENT_ID` | Yes* | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes* | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | No | Defaults to localhost:5000 |
| `GEMINI_API_KEY` | Yes | Google Gemini AI API key |
| `HEYGEN_API_KEY` | No | HeyGen avatar API key (optional) |
| `NODE_ENV` | No | `development` or `production` |
| `PORT` | No | Server port (default: 5000) |

\* Required for authentication. Without these, users can only use guest mode.

## Need Help?

- Check the main `README.md` for project overview
- Review `replit.md` for architecture details
- Open an issue on GitHub
- Contact the development team

## License

MIT License - see LICENSE file for details
