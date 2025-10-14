import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { setupAuth, isAuthenticated } from "./replitAuth.js";
import multer from "multer";
import { extractConceptsAndQuestions, generateLovableTutorExplanation, generateConceptAnswer } from "./gemini.js";
import { createAvatarSession, makeAvatarSpeak, closeAvatarSession } from "./heygen.js";
import { createRequire } from "module";
import mammoth from "mammoth";

// pdf-parse is CommonJS, use createRequire
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Document Upload & Processing (supports PDF and DOCX)
  app.post("/api/upload-pdf", upload.single("pdf"), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user?.claims?.sub;
      const guestSessionId = req.body.guestSessionId;

      if (!userId && !guestSessionId) {
        return res.status(400).json({ message: "User or guest session required" });
      }

      const fileBuffer = req.file.buffer;
      const fileName = req.file.originalname;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      
      console.log(`Processing ${fileExtension?.toUpperCase()}: ${fileName}, size: ${req.file.size} bytes`);
      
      let extractedText = "";

      // Extract text based on file type
      if (fileExtension === "pdf") {
        const parser = new PDFParse({ data: fileBuffer });
        const pdfData = await parser.getText();
        extractedText = pdfData.pages.map((p: any) => p.text).join('\n');
      } else if (fileExtension === "docx") {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        extractedText = result.value;
      } else {
        return res.status(400).json({ message: "Unsupported file type. Please upload PDF or DOCX files." });
      }
      
      console.log(`Extracted ${extractedText.length} characters from ${fileExtension?.toUpperCase()}`);

      if (!extractedText || extractedText.trim().length < 100) {
        return res.status(400).json({ message: "Document text too short or empty" });
      }

      // Create PDF record
      const pdf = await storage.createPdf({
        userId: userId || null,
        guestSessionId: guestSessionId || null,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        extractedText,
      });

      // Extract concepts and generate questions using Gemini
      const conceptsWithQuestions = await extractConceptsAndQuestions(extractedText);

      let totalQuestions = 0;

      // Store concepts and questions
      for (const item of conceptsWithQuestions) {
        const concept = await storage.createConcept({
          pdfId: pdf.id,
          conceptName: item.concept.conceptName,
          conceptDescription: item.concept.conceptDescription,
        });

        for (const question of item.questions) {
          await storage.createQuestion({
            conceptId: concept.id,
            questionText: question.questionText,
            options: question.options,
            correctAnswer: question.correctAnswer,
          });
          totalQuestions++;
        }
      }

      res.json({
        pdfId: pdf.id,
        fileName: pdf.fileName,
        conceptsCount: conceptsWithQuestions.length,
        questionsCount: totalQuestions,
      });
    } catch (error: any) {
      console.error("PDF upload error:", error);
      res.status(500).json({ message: error.message || "Failed to process PDF" });
    }
  });

  // Get concept by ID
  app.get("/api/concepts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const concept = await storage.getConcept(id);
      
      if (!concept) {
        return res.status(404).json({ message: "Concept not found" });
      }
      
      res.json(concept);
    } catch (error) {
      console.error("Error fetching concept:", error);
      res.status(500).json({ message: "Failed to fetch concept" });
    }
  });

  // Ask question about concept
  app.post("/api/ask-concept-question", async (req, res) => {
    try {
      const { conceptId, question } = req.body;
      
      const concept = await storage.getConcept(conceptId);
      if (!concept) {
        return res.status(404).json({ message: "Concept not found" });
      }

      // Generate answer using Gemini
      const answer = await generateConceptAnswer(
        concept.conceptName,
        concept.conceptDescription,
        question
      );
      
      res.json({ answer });
    } catch (error) {
      console.error("Error answering question:", error);
      res.status(500).json({ message: "Failed to answer question" });
    }
  });

  // Get questions for a PDF (with spaced repetition prioritization)
  app.get("/api/questions/:pdfId", async (req: any, res) => {
    try {
      const { pdfId } = req.params;
      const userId = req.user?.claims?.sub;
      const guestSessionId = req.query.guestSessionId;
      
      const questions = await storage.getPrioritizedQuestions(pdfId, userId, guestSessionId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Create quiz session
  app.post("/api/quiz-sessions", async (req: any, res) => {
    try {
      const { pdfId, totalQuestions, guestSessionId } = req.body;
      const userId = req.user?.claims?.sub;

      const session = await storage.createQuizSession({
        pdfId,
        userId: userId || null,
        guestSessionId: guestSessionId || null,
        totalQuestions,
        correctAnswers: 0,
      });

      res.json(session);
    } catch (error) {
      console.error("Error creating quiz session:", error);
      res.status(500).json({ message: "Failed to create quiz session" });
    }
  });

  // Submit answer
  app.post("/api/submit-answer", async (req, res) => {
    try {
      const { quizSessionId, questionId, conceptId, userAnswer } = req.body;

      const question = await storage.getQuestion(questionId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      const isCorrect = userAnswer === question.correctAnswer;
      let avatarExplanation = "";

      // Generate explanation if answer is wrong
      if (!isCorrect) {
        const concept = await storage.getConcept(conceptId);
        
        if (concept) {
          avatarExplanation = await generateLovableTutorExplanation(
            concept.conceptName,
            concept.conceptDescription,
            question.questionText,
            question.options[question.correctAnswer],
            question.options[userAnswer]
          );
        }
      }

      const answer = await storage.createAnswer({
        quizSessionId,
        questionId,
        conceptId,
        userAnswer,
        isCorrect,
        avatarExplanation: isCorrect ? null : avatarExplanation,
      });

      res.json(answer);
    } catch (error) {
      console.error("Error submitting answer:", error);
      res.status(500).json({ message: "Failed to submit answer" });
    }
  });

  // Complete quiz session
  app.patch("/api/quiz-sessions/:id/complete", async (req, res) => {
    try {
      const { id } = req.params;
      const { correctAnswers } = req.body;

      await storage.updateQuizSession(id, correctAnswers);
      res.json({ success: true });
    } catch (error) {
      console.error("Error completing quiz session:", error);
      res.status(500).json({ message: "Failed to complete quiz session" });
    }
  });

  // Get quiz session report
  app.get("/api/quiz-sessions/:id/report", async (req, res) => {
    try {
      const { id } = req.params;
      const sessionDetails = await storage.getQuizSessionWithDetails(id);
      
      if (!sessionDetails) {
        return res.status(404).json({ message: "Quiz session not found" });
      }

      res.json(sessionDetails);
    } catch (error) {
      console.error("Error fetching quiz session report:", error);
      res.status(500).json({ message: "Failed to fetch quiz session report" });
    }
  });

  // Dashboard (supports both authenticated and guest users)
  app.get("/api/dashboard", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const guestSessionId = req.query.guestSessionId;

      if (!userId && !guestSessionId) {
        return res.status(400).json({ message: "User or guest session required" });
      }

      const quizSessions = userId 
        ? await storage.getUserQuizSessions(userId)
        : await storage.getGuestQuizSessions(guestSessionId);

      const weakConcepts = userId
        ? await storage.getUserWeakConcepts(userId)
        : await storage.getGuestWeakConcepts(guestSessionId);

      // Calculate stats
      const totalQuizzes = quizSessions.length;
      const averageAccuracy = quizSessions.length > 0
        ? quizSessions.reduce((acc, s) => acc + (s.correctAnswers / s.totalQuestions), 0) / quizSessions.length * 100
        : 0;

      // Calculate streak (simplified - consecutive days with quizzes)
      let streak = 0;
      if (quizSessions.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (const session of quizSessions) {
          const sessionDate = new Date(session.createdAt!);
          sessionDate.setHours(0, 0, 0, 0);
          
          const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === streak) {
            streak++;
          } else {
            break;
          }
        }
      }

      // Get PDFs for recent sessions
      const recentSessionsWithPdfs = await Promise.all(
        quizSessions.slice(0, 5).map(async (session) => {
          const pdf = await storage.getPdf(session.pdfId);
          return { ...session, pdf };
        })
      );

      res.json({
        totalQuizzes,
        averageAccuracy,
        weakConcepts,
        recentSessions: recentSessionsWithPdfs,
        streak,
      });
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // HeyGen Avatar endpoints
  app.post("/api/heygen/create-session", async (req, res) => {
    try {
      const sessionData = await createAvatarSession();
      res.json(sessionData);
    } catch (error) {
      console.error("Error creating HeyGen session:", error);
      res.status(500).json({ message: "Failed to create avatar session" });
    }
  });

  app.post("/api/heygen/speak", async (req, res) => {
    try {
      const { sessionId, text } = req.body;
      await makeAvatarSpeak(sessionId, text);
      res.json({ success: true });
    } catch (error) {
      console.error("Error making avatar speak:", error);
      res.status(500).json({ message: "Failed to make avatar speak" });
    }
  });

  app.post("/api/heygen/close-session", async (req, res) => {
    try {
      const { sessionId } = req.body;
      await closeAvatarSession(sessionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error closing HeyGen session:", error);
      res.status(500).json({ message: "Failed to close avatar session" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
