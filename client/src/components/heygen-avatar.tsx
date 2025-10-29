import { useEffect, useRef, useState } from "react";
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskType,
  VoiceEmotion,
} from "@heygen/streaming-avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Volume2, VolumeX } from "lucide-react";

interface HeyGenAvatarProps {
  onAvatarReady?: () => void;
  onSpeakingStart?: () => void;
  onSpeakingEnd?: () => void;
  fallbackSpeak?: (text: string) => void;
}

export function HeyGenAvatar({ onAvatarReady, onSpeakingStart, onSpeakingEnd, fallbackSpeak }: HeyGenAvatarProps) {
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isLoadingRepeat, setIsLoadingRepeat] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [debug, setDebug] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [avatarReady, setAvatarReady] = useState(false);

  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/heygen/token", {
        method: "GET",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch token: ${response.status}`);
      }
      
      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error; // Re-throw so caller knows token fetch failed
    }
  }

  async function startSession() {
    setIsLoadingSession(true);
    setDebug("Initializing avatar session...");
    
    try {
      const newToken = await fetchAccessToken();
      
      avatar.current = new StreamingAvatar({ token: newToken });
      
      // Set up event listeners
      avatar.current.on(StreamingEvents.AVATAR_START_TALKING, () => {
        console.log("Avatar started talking");
        setDebug("Avatar is speaking");
        onSpeakingStart?.();
      });

      avatar.current.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
        console.log("Avatar stopped talking");
        setDebug("Avatar ready");
        onSpeakingEnd?.();
      });

      avatar.current.on(StreamingEvents.STREAM_READY, (event) => {
        console.log("Stream ready:", event.detail);
        setDebug("Avatar stream ready");
        if (event.detail) {
          setStream(event.detail);
        }
      });

      avatar.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log("Stream disconnected");
        setDebug("Avatar disconnected");
        endSession();
      });

      // Create session with a professional female avatar
      const sessionData = await avatar.current.createStartAvatar({
        quality: AvatarQuality.High,
        avatarName: "Anna_public_3_20240108", // Professional female avatar
        voice: {
          voiceId: "en-US-JennyNeural", // Warm, friendly female voice
          rate: 1.0,
          emotion: VoiceEmotion.FRIENDLY,
        },
        language: "en",
      });

      console.log("Avatar session created:", sessionData);
      setDebug("Avatar ready to teach");
      setAvatarReady(true);
      onAvatarReady?.();
    } catch (error: any) {
      console.error("Error starting avatar session:", error);
      setDebug(`Error: ${error.message || "Failed to start avatar"}`);
    } finally {
      setIsLoadingSession(false);
    }
  }

  async function handleSpeak(text: string) {
    if (!avatar.current || !avatarReady) {
      console.error("Avatar not ready - falling back to Web Speech API");
      // Use fallback immediately for this text
      if (fallbackSpeak) {
        fallbackSpeak(text);
      }
      // Clear the global function so future calls use Web Speech API
      delete (window as any).heygenSpeak;
      return;
    }

    setIsLoadingRepeat(true);
    setDebug("Preparing to speak...");
    
    try {
      await avatar.current.speak({
        text: text,
        taskType: TaskType.REPEAT,
      });
      setDebug("Speaking...");
    } catch (error: any) {
      console.error("Error speaking:", error);
      setDebug(`Error: ${error.message || "Failed to speak"} - Using fallback`);
      
      // Immediately use fallback for this text
      if (fallbackSpeak) {
        fallbackSpeak(text);
      }
      
      // Clear global function to enable Web Speech API fallback for future calls
      delete (window as any).heygenSpeak;
      setAvatarReady(false);
    } finally {
      setIsLoadingRepeat(false);
    }
  }

  async function endSession() {
    if (!avatar.current) return;
    
    try {
      await avatar.current.stopAvatar();
      setStream(null);
      setAvatarReady(false);
      setDebug("Session ended");
    } catch (error) {
      console.error("Error ending session:", error);
    }
  }

  useEffect(() => {
    // Auto-start session on mount
    startSession();

    return () => {
      endSession();
    };
  }, []);

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current?.play();
        setDebug("Avatar video playing");
      };
    }
  }, [stream]);

  // Expose speak method to parent
  useEffect(() => {
    if (avatarReady) {
      (window as any).heygenSpeak = handleSpeak;
    }
    return () => {
      delete (window as any).heygenSpeak;
    };
  }, [avatarReady]);

  const toggleMute = () => {
    if (mediaStream.current) {
      mediaStream.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="w-full" data-testid="heygen-avatar-container">
      <div className="relative aspect-video bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg overflow-hidden">
        {!stream && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isLoadingSession ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Loading avatar...</p>
              </>
            ) : (
              <>
                <Volume2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">Initializing...</p>
              </>
            )}
          </div>
        )}
        
        <video
          ref={mediaStream}
          autoPlay
          playsInline
          controls
          className="w-full h-full object-cover"
          data-testid="avatar-video"
        >
          <track kind="captions" />
        </video>

        {/* Mute toggle */}
        {stream && (
          <div className="absolute top-4 right-4">
            <Button
              size="icon"
              variant="secondary"
              onClick={toggleMute}
              data-testid="button-mute-avatar"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </div>

      {/* Status indicator */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground" data-testid="avatar-status">
          {debug}
        </p>
        {isLoadingRepeat && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-xs">Processing speech...</span>
          </div>
        )}
      </div>
    </div>
  );
}
