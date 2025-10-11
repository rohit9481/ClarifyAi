import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarPlayerProps {
  conceptName: string;
  explanation: string;
  onComplete: () => void;
}

export function AvatarPlayer({ conceptName, explanation, onComplete }: AvatarPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    const initializeAvatar = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Create HeyGen streaming avatar session
        const response = await fetch("/api/heygen/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to create avatar session");
        }

        const data = await response.json();
        setSessionData(data);

        // Start speaking the explanation
        const speakResponse = await fetch("/api/heygen/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: data.sessionId,
            text: explanation,
          }),
        });

        if (!speakResponse.ok) {
          throw new Error("Failed to start avatar speech");
        }

        setIsSpeaking(true);
        setIsLoading(false);

        // Simulate speaking duration (in production, listen to HeyGen events)
        const wordCount = explanation.split(" ").length;
        const estimatedDuration = Math.max(wordCount * 400, 3000); // ~400ms per word, min 3s
        
        setTimeout(() => {
          setIsSpeaking(false);
        }, estimatedDuration);

      } catch (err) {
        console.error("Avatar error:", err);
        setError(err instanceof Error ? err.message : "Failed to load avatar");
        setIsLoading(false);
      }
    };

    initializeAvatar();

    return () => {
      // Cleanup: close session
      if (sessionData?.sessionId) {
        fetch("/api/heygen/close-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionData.sessionId }),
        }).catch(console.error);
      }
    };
  }, [explanation]);

  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-semibold" data-testid="text-avatar-concept">
              {conceptName}
            </h2>
            <p className="text-muted-foreground">
              Let me explain this concept to you
            </p>
          </div>

          {/* Avatar Video Container */}
          <div
            className={cn(
              "relative aspect-video rounded-lg overflow-hidden bg-muted border-2 transition-all",
              isSpeaking && "avatar-speaking"
            )}
            data-testid="container-avatar"
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                <div className="space-y-2">
                  <p className="text-destructive font-medium">{error}</p>
                  <p className="text-sm text-muted-foreground">
                    The explanation is still available below
                  </p>
                </div>
              </div>
            )}

            {sessionData?.streamUrl && (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted={isMuted}
                data-testid="video-avatar"
              >
                <source src={sessionData.streamUrl} type="video/mp4" />
              </video>
            )}

            {/* Placeholder when no video */}
            {!sessionData?.streamUrl && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-purple-500/20">
                <div className="text-center space-y-2">
                  <div className="w-24 h-24 mx-auto rounded-full bg-primary/30 flex items-center justify-center">
                    <Volume2 className="h-12 w-12 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Audio Explanation</p>
                </div>
              </div>
            )}

            {/* Audio Controls */}
            {!isLoading && (
              <div className="absolute bottom-4 right-4 flex gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => setIsMuted(!isMuted)}
                  data-testid="button-mute"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={handleReplay}
                  data-testid="button-replay"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Explanation Text */}
          <Card className="p-4 bg-muted/50">
            <p className="text-sm leading-relaxed" data-testid="text-explanation">
              {explanation}
            </p>
          </Card>

          {/* Continue Button */}
          <Button
            onClick={onComplete}
            className="w-full"
            size="lg"
            disabled={isLoading}
            data-testid="button-continue"
          >
            Got it! Next Question
          </Button>
        </div>
      </Card>
    </div>
  );
}
