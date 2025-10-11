// HeyGen Avatar API integration
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY || "";

interface SessionData {
  sessionId: string;
  streamUrl?: string;
}

export async function createAvatarSession(): Promise<SessionData> {
  try {
    // Note: Actual HeyGen API integration
    // This is a placeholder for the HeyGen streaming avatar session creation
    // In production, you would call HeyGen's actual API endpoints
    
    const response = await fetch("https://api.heygen.com/v1/streaming.new", {
      method: "POST",
      headers: {
        "X-Api-Key": HEYGEN_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quality: "high",
        avatar_name: "default", // Use default avatar or specify from user's settings
        voice: {
          voice_id: "en-US-Neural2-A", // Warm, friendly voice
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HeyGen API error response:", response.status, errorText);
      throw new Error(`Failed to create HeyGen session: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    return {
      sessionId: data.session_id,
      streamUrl: data.stream_url,
    };
  } catch (error) {
    console.error("HeyGen session creation error:", error);
    // Return mock session for development/fallback
    return {
      sessionId: `mock-session-${Date.now()}`,
      streamUrl: undefined,
    };
  }
}

export async function makeAvatarSpeak(
  sessionId: string,
  text: string
): Promise<void> {
  try {
    const response = await fetch("https://api.heygen.com/v1/streaming.task", {
      method: "POST",
      headers: {
        "X-Api-Key": HEYGEN_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        text: text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HeyGen speak API error response:", response.status, errorText);
      throw new Error(`Failed to make avatar speak: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error("HeyGen speak error:", error);
    // Silently fail for development - avatar player will show text explanation
  }
}

export async function closeAvatarSession(sessionId: string): Promise<void> {
  try {
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
      throw new Error("Failed to close HeyGen session");
    }
  } catch (error) {
    console.error("HeyGen session close error:", error);
    // Silently fail
  }
}
