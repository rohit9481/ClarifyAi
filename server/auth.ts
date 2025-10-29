// Unified authentication module supporting multiple providers
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import MemoryStore from "memorystore";
import { setupGoogleAuth } from "./googleAuth.js";

const MemoryStoreSession = MemoryStore(session);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Use PostgreSQL session store if DATABASE_URL is available
  if (process.env.DATABASE_URL) {
    const pgStore = connectPg(session);
    const sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      ttl: sessionTtl,
      tableName: "sessions",
    });
    
    return session({
      secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: sessionTtl,
      },
    });
  } else {
    // Fallback to memory store for local development without database
    console.warn("DATABASE_URL not set - using in-memory session store (data will be lost on restart)");
    return session({
      secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
      store: new MemoryStoreSession({
        checkPeriod: sessionTtl,
      }),
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false,
        maxAge: sessionTtl,
      },
    });
  }
}

export async function setupAuth(app: Express) {
  // Trust proxy for secure cookies behind reverse proxy
  app.set("trust proxy", 1);
  
  // Initialize session
  app.use(getSession());
  
  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Serialize/deserialize user for session
  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  // Setup authentication providers
  setupGoogleAuth(app);

  // Setup Replit Auth if running on Replit
  if (process.env.REPLIT_DOMAINS && process.env.REPL_ID) {
    const { setupReplitAuth } = await import("./replitAuth.js");
    await setupReplitAuth(app);
  } else {
    console.log("Replit Auth not configured - running in local mode");
  }

  // Common logout route
  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });

  // Get current user route
  app.get("/api/auth/user", (req: any, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = req.user as any;
    res.json({
      id: user.claims?.sub,
      email: user.claims?.email,
      firstName: user.claims?.first_name,
      lastName: user.claims?.last_name,
      profileImageUrl: user.claims?.profile_image_url,
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = req.user as any;
  
  // Check token expiration if available
  if (user.expires_at) {
    const now = Math.floor(Date.now() / 1000);
    if (now > user.expires_at) {
      // Token expired - try to refresh if we have refresh token
      if (user.refresh_token && process.env.REPLIT_DOMAINS) {
        try {
          // Replit-specific token refresh
          const { refreshReplitToken } = await import("./replitAuth.js");
          await refreshReplitToken(user);
          return next();
        } catch (error) {
          return res.status(401).json({ message: "Unauthorized - token expired" });
        }
      }
      return res.status(401).json({ message: "Unauthorized - token expired" });
    }
  }

  next();
};
