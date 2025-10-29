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

export async function generateConceptAnswer(
  conceptName: string,
  conceptDescription: string,
  studentQuestion: string
): Promise<string> {
  try {
    const prompt = `You are a warm, supportive AI tutor helping a student learn about: ${conceptName}

Concept Description: ${conceptDescription}

The student asks: "${studentQuestion}"

Provide a clear, helpful answer that:
1. Directly addresses their question in simple, everyday language
2. Breaks down complex ideas into easy-to-understand parts
3. ALWAYS includes at least one relatable real-world example or analogy to make it interesting
4. Uses conversational tone with "you" and "let's"
5. Stays warm, supportive, and encouraging

Structure your response:
- Start with a simple, direct answer
- Explain the concept step-by-step
- Provide a concrete example or analogy
- End with encouragement or an invitation to ask more

Aim for 4-6 sentences that feel like a friendly conversation.`;

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

export async function generateInitialConceptExplanation(
  conceptName: string,
  conceptDescription: string
): Promise<string> {
  try {
    const prompt = `You are a warm, supportive AI tutor introducing a concept the student struggled with.

Concept: ${conceptName}
Description: ${conceptDescription}

Create an engaging introduction that:
1. Welcomes the student warmly
2. Explains the concept in simple, everyday language
3. ALWAYS includes a relatable real-world example or analogy
4. Breaks down the concept into easy-to-understand parts
5. Uses conversational tone - like explaining to a friend

Structure:
- Start with a warm greeting about learning this concept
- Explain what it is in simple terms
- Give a concrete example or analogy that makes it click
- End by asking if they have questions

Make it feel like a conversation, not a lecture. Aim for 5-7 sentences.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    return response.text || `Let's explore ${conceptName} together! This is an important concept that will help you understand the material better.`;
  } catch (error) {
    console.error("Gemini explanation error:", error);
    return `Let's dive into ${conceptName}! I'm here to help you understand this concept step by step. Feel free to ask any questions!`;
  }
}
