// Gemini AI integration - see blueprint:javascript_gemini
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface ExtractedConcept {
  conceptName: string;
  conceptDescription: string;
}

interface GeneratedQuestion {
  questionText: string;
  options: string[];
  correctAnswer: number;
}

export interface ConceptWithQuestions {
  concept: ExtractedConcept;
  questions: GeneratedQuestion[];
}

export async function extractConceptsAndQuestions(
  pdfText: string
): Promise<ConceptWithQuestions[]> {
  try {
    const systemPrompt = `You are an expert educational AI that extracts key concepts from study materials and creates quiz questions.

Given text from a PDF document, you must:
1. Identify 3-7 key concepts that are important for students to understand
2. For each concept, generate 3 multiple-choice questions
3. Each question should have 4 options with exactly one correct answer
4. Make questions clear, specific, and testing real understanding (not just memorization)

Return a JSON array with this structure:
[
  {
    "concept": {
      "conceptName": "Brief concept name",
      "conceptDescription": "Clear 1-2 sentence description of the concept"
    },
    "questions": [
      {
        "questionText": "The question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0  // index of correct option (0-3)
      }
    ]
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              concept: {
                type: "object",
                properties: {
                  conceptName: { type: "string" },
                  conceptDescription: { type: "string" },
                },
                required: ["conceptName", "conceptDescription"],
              },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    questionText: { type: "string" },
                    options: {
                      type: "array",
                      items: { type: "string" },
                    },
                    correctAnswer: { type: "number" },
                  },
                  required: ["questionText", "options", "correctAnswer"],
                },
              },
            },
            required: ["concept", "questions"],
          },
        },
      },
      contents: `Analyze this study material and extract key concepts with quiz questions:\n\n${pdfText}`,
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }

    const data: ConceptWithQuestions[] = JSON.parse(rawJson);
    return data;
  } catch (error) {
    console.error("Gemini concept extraction error:", error);
    throw new Error(`Failed to extract concepts: ${error}`);
  }
}

export async function generateLovableTutorExplanation(
  conceptName: string,
  conceptDescription: string,
  questionText: string,
  correctAnswer: string,
  userAnswer: string
): Promise<string> {
  try {
    const prompt = `You are a warm, supportive, lovable AI tutor helping a student who just got a question wrong. Your tone should be:
- Encouraging and kind (never condescending)
- Patient and understanding
- Enthusiastic about helping them learn
- Use "you" and "let's" to create connection

The student was learning about: ${conceptName}
Concept: ${conceptDescription}

Question they got wrong: ${questionText}
They answered: ${userAnswer}
Correct answer: ${correctAnswer}

Provide a brief (2-3 sentences) warm explanation that:
1. Acknowledges their attempt positively
2. Explains why the correct answer is right in simple terms
3. Encourages them to keep going

Keep it conversational, supportive, and under 100 words.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Great effort! Let's review this concept together and you'll get it next time.";
  } catch (error) {
    console.error("Gemini explanation error:", error);
    return "Great try! This concept can be tricky, but you're making progress. Let's keep learning together!";
  }
}

// Generate initial detailed lesson when user first clicks "Teach Me"
export async function generateInitialLesson(
  conceptName: string,
  conceptDescription: string
): Promise<string> {
  try {
    const prompt = `You are a warm, friendly AI tutor. A student just got questions wrong about "${conceptName}" and needs to learn this concept from scratch.

Concept: ${conceptDescription}

Provide a comprehensive, beginner-friendly lesson that:

1. **Start with a simple definition**: Explain what ${conceptName} is in the simplest possible terms, like you're talking to someone who's never heard of it.

2. **Break it down step-by-step**: Explain 3 key aspects or steps in plain language. Use short sentences and simple words.

3. **Give 2 relatable real-world examples or analogies**: Make it interesting! Use everyday situations, metaphors, or analogies that help the concept click. Be creative and engaging.

4. **End with encouragement**: Let them know this concept is learnable and you're here to help.

Use a conversational, warm tone. Speak directly to the student using "you" and "let's". Make it feel like a friendly conversation, not a textbook.

Length: 150-250 words (enough to be thorough but not overwhelming).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    return response.text || `Let's learn about ${conceptName} together! ${conceptDescription} This is an important concept, and I'm here to help you understand it step by step.`;
  } catch (error) {
    console.error("Gemini lesson generation error:", error);
    return `Let's explore ${conceptName} together! ${conceptDescription} Don't worry - we'll break this down into simple pieces and you'll understand it in no time!`;
  }
}

// Answer follow-up questions with examples
export async function generateConceptAnswer(
  conceptName: string,
  conceptDescription: string,
  studentQuestion: string
): Promise<string> {
  try {
    const prompt = `You are a warm, supportive AI tutor helping a student learn about: ${conceptName}

Concept: ${conceptDescription}

The student asks: "${studentQuestion}"

Provide a clear, helpful answer that:
1. **Directly addresses their question** in simple language
2. **Briefly reminds them of the core concept** (1 sentence)
3. **Gives at least one concrete example** to illustrate your answer
4. **Uses analogies or real-world connections** when helpful
5. **Stays warm and encouraging** in tone

Use "you" and "let's" to keep it conversational. Make it feel like a helpful friend explaining something, not a teacher lecturing.

Length: 80-150 words (thorough but focused).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    return response.text || "That's a great question! Let me help you understand this concept better.";
  } catch (error) {
    console.error("Gemini answer generation error:", error);
    return "That's an interesting question! This concept relates to the main ideas we're studying. Let's explore it together.";
  }
}
