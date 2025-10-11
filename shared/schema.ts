import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// PDF Documents uploaded by users
export const pdfs = pgTable("pdfs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"), // null for guest users
  guestSessionId: varchar("guest_session_id"), // for guest users
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  extractedText: text("extracted_text").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const insertPdfSchema = createInsertSchema(pdfs).omit({
  id: true,
  uploadedAt: true,
});

export type InsertPdf = z.infer<typeof insertPdfSchema>;
export type Pdf = typeof pdfs.$inferSelect;

// Concepts extracted from PDFs
export const concepts = pgTable("concepts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pdfId: varchar("pdf_id").notNull(),
  conceptName: text("concept_name").notNull(),
  conceptDescription: text("concept_description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConceptSchema = createInsertSchema(concepts).omit({
  id: true,
  createdAt: true,
});

export type InsertConcept = z.infer<typeof insertConceptSchema>;
export type Concept = typeof concepts.$inferSelect;

// Questions generated for each concept
export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conceptId: varchar("concept_id").notNull(),
  questionText: text("question_text").notNull(),
  options: jsonb("options").notNull().$type<string[]>(),
  correctAnswer: integer("correct_answer").notNull(), // index of correct option (0-3)
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
});

export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

// Quiz sessions
export const quizSessions = pgTable("quiz_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pdfId: varchar("pdf_id").notNull(),
  userId: varchar("user_id"), // null for guest users
  guestSessionId: varchar("guest_session_id"), // for guest users
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull().default(0),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertQuizSessionSchema = createInsertSchema(quizSessions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type InsertQuizSession = z.infer<typeof insertQuizSessionSchema>;
export type QuizSession = typeof quizSessions.$inferSelect;

// Individual answers in quiz sessions
export const answers = pgTable("answers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quizSessionId: varchar("quiz_session_id").notNull(),
  questionId: varchar("question_id").notNull(),
  conceptId: varchar("concept_id").notNull(),
  userAnswer: integer("user_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  avatarExplanation: text("avatar_explanation"), // Gemini-generated explanation
  answeredAt: timestamp("answered_at").defaultNow(),
});

export const insertAnswerSchema = createInsertSchema(answers).omit({
  id: true,
  answeredAt: true,
});

export type InsertAnswer = z.infer<typeof insertAnswerSchema>;
export type Answer = typeof answers.$inferSelect;

// Extended types for frontend use
export type QuestionWithConcept = Question & {
  concept: Concept;
};

export type QuizSessionWithDetails = QuizSession & {
  pdf: Pdf;
  answers: (Answer & {
    question: QuestionWithConcept;
  })[];
};

export type ConceptWithStats = Concept & {
  totalQuestions: number;
  incorrectCount: number;
};
