# Deployment Guide

This guide covers deploying the AI Tutor Avatar to various platforms.

## Deploying to Replit (Easiest)

### Initial Setup

1. **Import Project**
   - Go to [Replit](https://replit.com)
   - Click "Create Repl" → "Import from GitHub"
   - Paste your repository URL
   - Click "Import"

2. **Configure Secrets**
   - Click the lock icon (🔒) in the sidebar
   - Add the following secrets:
     ```
     GEMINI_API_KEY=your-gemini-key
     GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=your-google-client-secret
     ```
   - Replit automatically provides: `REPL_ID`, `REPLIT_DOMAINS`, `ISSUER_URL`, `DATABASE_URL`, `SESSION_SECRET`

3. **Setup Database**
   - Replit automatically creates a PostgreSQL database
   - Run in Shell:
     ```bash
     npm run db:push
     ```

4. **Update Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Add your Replit URL to authorized redirect URIs:
     ```
     https://your-repl-name.username.repl.co/api/auth/google/callback
     ```

5. **Run the Application**
   - Click the "Run" button
   - Your app will be live!

### Authentication on Replit

Users can sign in with:
- ✅ Replit Auth (recommended - easiest)
- ✅ Google OAuth
- ✅ Guest mode

## Deploying to Vercel

### Prerequisites
- [Vercel account](https://vercel.com)
- PostgreSQL database (Supabase, Neon, etc.)

### Steps

1. **Prepare for Deployment**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   ```

2. **Configure `vercel.json`**
   Create `vercel.json`:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist/public",
     "framework": "vite",
     "rewrites": [
       { "source": "/api/(.*)", "destination": "/api/$1" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   In Vercel Dashboard → Project Settings → Environment Variables:
   ```
   DATABASE_URL=your-postgresql-url
   SESSION_SECRET=your-random-secret
   GEMINI_API_KEY=your-gemini-key
   GOOGLE_CLIENT_ID=your-google-id
   GOOGLE_CLIENT_SECRET=your-google-secret
   GOOGLE_CALLBACK_URL=https://your-domain.vercel.app/api/auth/google/callback
   NODE_ENV=production
   ```

5. **Update Google OAuth**
   Add Vercel URL to authorized redirect URIs:
   ```
   https://your-domain.vercel.app/api/auth/google/callback
   ```

### Note
Replit Auth will NOT work on Vercel. Only Google OAuth and Guest mode.

## Deploying to Heroku

### Prerequisites
- [Heroku account](https://heroku.com)
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

### Steps

1. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

2. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set SESSION_SECRET=$(openssl rand -base64 32)
   heroku config:set GEMINI_API_KEY=your-gemini-key
   heroku config:set GOOGLE_CLIENT_ID=your-google-id
   heroku config:set GOOGLE_CLIENT_SECRET=your-google-secret
   heroku config:set GOOGLE_CALLBACK_URL=https://your-app-name.herokuapp.com/api/auth/google/callback
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **Initialize Database**
   ```bash
   heroku run npm run db:push
   ```

6. **Update Google OAuth**
   Add Heroku URL to authorized redirect URIs:
   ```
   https://your-app-name.herokuapp.com/api/auth/google/callback
   ```

## Deploying to Railway

### Steps

1. **Connect GitHub**
   - Go to [Railway](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Add PostgreSQL**
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway will auto-inject `DATABASE_URL`

3. **Set Environment Variables**
   In Variables tab:
   ```
   SESSION_SECRET=your-random-secret
   GEMINI_API_KEY=your-gemini-key
   GOOGLE_CLIENT_ID=your-google-id
   GOOGLE_CLIENT_SECRET=your-google-secret
   GOOGLE_CALLBACK_URL=https://your-app.up.railway.app/api/auth/google/callback
   NODE_ENV=production
   PORT=5000
   ```

4. **Deploy**
   - Railway automatically builds and deploys
   - Get your public URL from the Settings

5. **Initialize Database**
   In the service terminal:
   ```bash
   npm run db:push
   ```

6. **Update Google OAuth**
   Add Railway URL to authorized redirect URIs

## Environment-Specific Notes

### Database Connection Strings

**Supabase:**
```
postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
```

**Neon:**
```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

**Heroku Postgres:**
```
postgres://[user]:[password]@[host]:5432/[database]
```

### Session Store

The app automatically uses:
- **PostgreSQL session store** if `DATABASE_URL` is set
- **Memory store** as fallback (data lost on restart)

For production, always use PostgreSQL sessions.

### Google OAuth Setup

1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/)
2. Add ALL deployment URLs as authorized redirect URIs:
   ```
   http://localhost:5000/api/auth/google/callback           (local)
   https://your-repl.repl.co/api/auth/google/callback       (Replit)
   https://your-app.vercel.app/api/auth/google/callback     (Vercel)
   https://your-app.herokuapp.com/api/auth/google/callback  (Heroku)
   ```

## Health Checks

Add a health check endpoint by adding to `server/routes.ts`:

```typescript
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});
```

## Monitoring

### Recommended Tools
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Datadog** - Performance monitoring

## Troubleshooting

### "Unauthorized redirect URI" error
- Check that the exact callback URL is in Google Cloud Console
- Protocol must match (http vs https)
- No trailing slash

### Database connection errors
- Verify `DATABASE_URL` format
- Ensure database allows external connections
- Check SSL/TLS requirements

### Session not persisting
- Ensure `SESSION_SECRET` is set
- Check that sessions table exists in database
- Verify cookie settings (secure flag in production)

## Security Checklist

- [ ] All secrets stored in environment variables
- [ ] `SESSION_SECRET` is random and at least 32 characters
- [ ] Database connection uses SSL in production
- [ ] Google OAuth redirect URIs are exact matches
- [ ] HTTPS enforced in production
- [ ] CORS configured if needed
- [ ] Rate limiting enabled on API endpoints
- [ ] Database backups configured

## Scaling

### Performance Tips
1. **Use connection pooling** - Already enabled via Drizzle ORM
2. **Cache Gemini responses** - Implement Redis for repeated queries
3. **CDN for static assets** - Use Cloudflare or similar
4. **Database indexes** - Already optimized in schema
5. **Horizontal scaling** - Use load balancer for multiple instances

### Cost Optimization
- **Gemini API**: Monitor token usage, implement caching
- **Database**: Use connection pooling, optimize queries
- **Storage**: Clean up old guest sessions periodically

---

Need help? Check the main [README.md](./README.md) or [LOCAL_SETUP.md](./LOCAL_SETUP.md)
