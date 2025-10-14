// Replit Auth + Application storage interface
import {
  users,
  pdfs,
  concepts,
  questions,
  quizSessions,
  answers,
  type User,
  type UpsertUser,
  type Pdf,
  type InsertPdf,
  type Concept,
  type InsertConcept,
  type Question,
  type InsertQuestion,
  type QuizSession,
  type InsertQuizSession,
  type Answer,
  type InsertAnswer,
  type QuestionWithConcept,
  type ConceptWithStats,
} from "@shared/schema";
import { db } from "./db.js";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // PDF operations
  createPdf(pdf: InsertPdf): Promise<Pdf>;
  getPdf(id: string): Promise<Pdf | undefined>;
  getUserPdfs(userId: string): Promise<Pdf[]>;
  getGuestPdfs(guestSessionId: string): Promise<Pdf[]>;
  
  // Concept operations
  createConcept(concept: InsertConcept): Promise<Concept>;
  getConcept(id: string): Promise<Concept | undefined>;
  getConceptsByPdf(pdfId: string): Promise<Concept[]>;
  
  // Question operations
  createQuestion(question: InsertQuestion): Promise<Question>;
  getQuestionsByConcept(conceptId: string): Promise<Question[]>;
  getQuestionsWithConceptsByPdf(pdfId: string): Promise<QuestionWithConcept[]>;
  getQuestion(id: string): Promise<Question | undefined>;
  
  // Quiz session operations
  createQuizSession(session: InsertQuizSession): Promise<QuizSession>;
  updateQuizSession(id: string, correctAnswers: number): Promise<void>;
  getUserQuizSessions(userId: string): Promise<QuizSession[]>;
  getGuestQuizSessions(guestSessionId: string): Promise<QuizSession[]>;
  getQuizSessionWithDetails(id: string): Promise<any>;
  
  // Answer operations
  createAnswer(answer: InsertAnswer): Promise<Answer>;
  getSessionAnswers(quizSessionId: string): Promise<Answer[]>;
  
  // Dashboard operations
  getUserWeakConcepts(userId: string): Promise<ConceptWithStats[]>;
  getGuestWeakConcepts(guestSessionId: string): Promise<ConceptWithStats[]>;
  
  // Spaced repetition
  getPrioritizedQuestions(pdfId: string, userId?: string, guestSessionId?: string): Promise<QuestionWithConcept[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // PDF operations
  async createPdf(pdfData: InsertPdf): Promise<Pdf> {
    const [pdf] = await db.insert(pdfs).values(pdfData).returning();
    return pdf;
  }

  async getPdf(id: string): Promise<Pdf | undefined> {
    const [pdf] = await db.select().from(pdfs).where(eq(pdfs.id, id));
    return pdf;
  }

  async getUserPdfs(userId: string): Promise<Pdf[]> {
    return await db.select().from(pdfs).where(eq(pdfs.userId, userId)).orderBy(desc(pdfs.uploadedAt));
  }

  async getGuestPdfs(guestSessionId: string): Promise<Pdf[]> {
    return await db.select().from(pdfs).where(eq(pdfs.guestSessionId, guestSessionId)).orderBy(desc(pdfs.uploadedAt));
  }

  // Concept operations
  async createConcept(conceptData: InsertConcept): Promise<Concept> {
    const [concept] = await db.insert(concepts).values(conceptData).returning();
    return concept;
  }

  async getConcept(id: string): Promise<Concept | undefined> {
    const [concept] = await db.select().from(concepts).where(eq(concepts.id, id));
    return concept;
  }

  async getConceptsByPdf(pdfId: string): Promise<Concept[]> {
    return await db.select().from(concepts).where(eq(concepts.pdfId, pdfId));
  }

  // Question operations
  async createQuestion(questionData: InsertQuestion): Promise<Question> {
    const [question] = await db.insert(questions).values({
      ...questionData,
      options: questionData.options as any, // Type cast for JSONB array
    }).returning();
    return question;
  }

  async getQuestionsByConcept(conceptId: string): Promise<Question[]> {
    return await db.select().from(questions).where(eq(questions.conceptId, conceptId));
  }

  async getQuestionsWithConceptsByPdf(pdfId: string): Promise<QuestionWithConcept[]> {
    const result = await db
      .select({
        id: questions.id,
        conceptId: questions.conceptId,
        questionText: questions.questionText,
        options: questions.options,
        correctAnswer: questions.correctAnswer,
        createdAt: questions.createdAt,
        concept: concepts,
      })
      .from(questions)
      .innerJoin(concepts, eq(questions.conceptId, concepts.id))
      .where(eq(concepts.pdfId, pdfId));

    return result as QuestionWithConcept[];
  }

  async getQuestion(id: string): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question;
  }

  // Quiz session operations
  async createQuizSession(sessionData: InsertQuizSession): Promise<QuizSession> {
    const [session] = await db.insert(quizSessions).values(sessionData).returning();
    return session;
  }

  async updateQuizSession(id: string, correctAnswers: number): Promise<void> {
    await db
      .update(quizSessions)
      .set({ correctAnswers, completedAt: new Date() })
      .where(eq(quizSessions.id, id));
  }

  async getUserQuizSessions(userId: string): Promise<QuizSession[]> {
    return await db
      .select()
      .from(quizSessions)
      .where(eq(quizSessions.userId, userId))
      .orderBy(desc(quizSessions.createdAt));
  }

  async getGuestQuizSessions(guestSessionId: string): Promise<QuizSession[]> {
    return await db
      .select()
      .from(quizSessions)
      .where(eq(quizSessions.guestSessionId, guestSessionId))
      .orderBy(desc(quizSessions.createdAt));
  }

  async getQuizSessionWithDetails(id: string): Promise<any> {
    const [session] = await db.select().from(quizSessions).where(eq(quizSessions.id, id));
    
    if (!session) {
      return null;
    }

    const sessionAnswers = await db
      .select({
        id: answers.id,
        quizSessionId: answers.quizSessionId,
        questionId: answers.questionId,
        conceptId: answers.conceptId,
        userAnswer: answers.userAnswer,
        isCorrect: answers.isCorrect,
        avatarExplanation: answers.avatarExplanation,
        answeredAt: answers.answeredAt,
        question: questions,
        concept: concepts,
      })
      .from(answers)
      .innerJoin(questions, eq(answers.questionId, questions.id))
      .innerJoin(concepts, eq(answers.conceptId, concepts.id))
      .where(eq(answers.quizSessionId, id))
      .orderBy(answers.answeredAt);

    return {
      ...session,
      answers: sessionAnswers,
    };
  }

  // Answer operations
  async createAnswer(answerData: InsertAnswer): Promise<Answer> {
    const [answer] = await db.insert(answers).values(answerData).returning();
    return answer;
  }

  async getSessionAnswers(quizSessionId: string): Promise<Answer[]> {
    return await db.select().from(answers).where(eq(answers.quizSessionId, quizSessionId));
  }

  // Dashboard operations
  async getUserWeakConcepts(userId: string): Promise<ConceptWithStats[]> {
    const result = await db
      .select({
        id: concepts.id,
        pdfId: concepts.pdfId,
        conceptName: concepts.conceptName,
        conceptDescription: concepts.conceptDescription,
        createdAt: concepts.createdAt,
        totalQuestions: sql<number>`count(distinct ${questions.id})`,
        incorrectCount: sql<number>`count(distinct case when ${answers.isCorrect} = false then ${answers.id} end)`,
      })
      .from(concepts)
      .innerJoin(questions, eq(questions.conceptId, concepts.id))
      .innerJoin(answers, eq(answers.conceptId, concepts.id))
      .innerJoin(quizSessions, and(
        eq(answers.quizSessionId, quizSessions.id),
        eq(quizSessions.userId, userId)
      ))
      .groupBy(concepts.id)
      .having(sql`count(distinct case when ${answers.isCorrect} = false then ${answers.id} end) > 0`)
      .orderBy(desc(sql`count(distinct case when ${answers.isCorrect} = false then ${answers.id} end)`));

    return result as ConceptWithStats[];
  }

  async getGuestWeakConcepts(guestSessionId: string): Promise<ConceptWithStats[]> {
    const result = await db
      .select({
        id: concepts.id,
        pdfId: concepts.pdfId,
        conceptName: concepts.conceptName,
        conceptDescription: concepts.conceptDescription,
        createdAt: concepts.createdAt,
        totalQuestions: sql<number>`count(distinct ${questions.id})`,
        incorrectCount: sql<number>`count(distinct case when ${answers.isCorrect} = false then ${answers.id} end)`,
      })
      .from(concepts)
      .innerJoin(questions, eq(questions.conceptId, concepts.id))
      .innerJoin(answers, eq(answers.conceptId, concepts.id))
      .innerJoin(quizSessions, and(
        eq(answers.quizSessionId, quizSessions.id),
        eq(quizSessions.guestSessionId, guestSessionId)
      ))
      .groupBy(concepts.id)
      .having(sql`count(distinct case when ${answers.isCorrect} = false then ${answers.id} end) > 0`)
      .orderBy(desc(sql`count(distinct case when ${answers.isCorrect} = false then ${answers.id} end)`));

    return result as ConceptWithStats[];
  }

  // Spaced repetition - prioritize questions from weak concepts
  async getPrioritizedQuestions(pdfId: string, userId?: string, guestSessionId?: string): Promise<QuestionWithConcept[]> {
    // Get all questions for this PDF
    const allQuestions = await this.getQuestionsWithConceptsByPdf(pdfId);
    
    if (!userId && !guestSessionId) {
      // No user context, return questions in original order
      return allQuestions;
    }

    // Get weak concepts for this user/guest
    const weakConcepts = userId 
      ? await this.getUserWeakConcepts(userId)
      : await this.getGuestWeakConcepts(guestSessionId!);

    // Create a map of concept IDs to their incorrectCount for priority sorting
    const conceptPriority = new Map<string, number>();
    weakConcepts.forEach(concept => {
      conceptPriority.set(concept.id, concept.incorrectCount);
    });

    // Sort questions: weak concepts first (by incorrectCount desc), then others randomly
    const prioritized = allQuestions.sort((a, b) => {
      const aPriority = conceptPriority.get(a.conceptId) || 0;
      const bPriority = conceptPriority.get(b.conceptId) || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority (more incorrect) first
      }
      
      // For same priority, randomize
      return Math.random() - 0.5;
    });

    return prioritized;
  }
}

export const storage = new DatabaseStorage();
