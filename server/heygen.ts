// HeyGen API integration for real-time avatar lip-sync
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY || "";

interface SessionData {
  sessionId: string;
  url?: string;
  accessToken?: string;
}

export async function createAvatarSession(): Promise<SessionData> {
  try {
    if (!HEYGEN_API_KEY) {
      console.warn("HEYGEN_API_KEY not set, using mock session");
      return {
        sessionId: `mock-session-${Date.now()}`,
      };
    }

    // Create streaming session using HeyGen REST API
    const response = await fetch("https://api.heygen.com/v1/streaming.new", {
      method: "POST",
      headers: {
        "X-Api-Key": HEYGEN_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quality: "high",
        avatar_name: "Wayne_20240711",
        voice: {
          voice_id: "en-US-JennyNeural",
          rate: 0.9,
        },
        language: "en",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HeyGen API error:", response.status, errorText);
      throw new Error(`Failed to create session: ${response.status}`);
    }

    const data = await response.json();
    
    console.log("HeyGen avatar session created:", data.session_id);

    return {
      sessionId: data.session_id,
      url: data.url,
      accessToken: data.access_token,
    };
  } catch (error: any) {
    console.error("HeyGen session creation error:", error);
    return {
      sessionId: `mock-session-${Date.now()}`,
    };
  }
}

export async function makeAvatarSpeak(
  sessionId: string,
  text: string
): Promise<void> {
  try {
    if (sessionId.startsWith("mock-")) {
      console.log("Mock session - skipping HeyGen speak");
      return;
    }

    const response = await fetch("https://api.heygen.com/v1/streaming.task", {
      method: "POST",
      headers: {
        "X-Api-Key": HEYGEN_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        text: text,
        task_type: "talk",
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to make avatar speak: ${response.status}`);
    }

    console.log("Avatar speaking:", text.substring(0, 50) + "...");
  } catch (error: any) {
    console.error("HeyGen speak error:", error);
  }
}

export async function closeAvatarSession(sessionId: string): Promise<void> {
  try {
    if (sessionId.startsWith("mock-")) {
      console.log("Mock session - skipping HeyGen close");
      return;
    }

    const response = await fetch("https://api.heygen.com/v1/streaming.stop", {
      method: "POST",
      headers: {
        "X-Api-Key": HEYGEN_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to close session");
    }

    console.log("HeyGen avatar session closed:", sessionId);
  } catch (error: any) {
    console.error("HeyGen session close error:", error);
  }
}
