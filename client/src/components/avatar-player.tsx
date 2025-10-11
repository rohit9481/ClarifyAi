import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, RotateCcw, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarPlayerProps {
  conceptName: string;
  explanation: string;
  onComplete: () => void;
}

export function AvatarPlayer({ conceptName, explanation, onComplete }: AvatarPlayerProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // Load voices once
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setError("Your browser doesn't support text-to-speech");
      return;
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        voicesRef.current = voices;
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Auto-play when explanation changes (new concept)
  useEffect(() => {
    if (error || !voicesRef.current.length) return;

    // Reset state for new concept
    setIsSpeaking(false);
    setIsPlaying(false);
    utteranceRef.current = null;

    // Create and auto-play new utterance
    const utterance = createUtterance(explanation);
    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Auto-play failed:', err);
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [explanation, error]);

  const createUtterance = (text: string): SpeechSynthesisUtterance => {
    const utterance = new SpeechSynthesisUtterance(text);

    // Select a warm, friendly voice
    const preferredVoice = voicesRef.current.find(v => 
      v.name.includes('Female') || 
      v.name.includes('Samantha') || 
      v.name.includes('Karen') ||
      v.name.includes('Google US English') ||
      v.lang.startsWith('en')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Configure warm, supportive tone
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPlaying(false);
    };

    utterance.onpause = () => {
      setIsPlaying(false);
    };

    utterance.onresume = () => {
      setIsPlaying(true);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setError('Failed to play audio explanation');
      setIsSpeaking(false);
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    return utterance;
  };

  const handlePlayPause = () => {
    if (!voicesRef.current.length) return;

    if (isSpeaking && isPlaying) {
      // Currently playing - pause it
      window.speechSynthesis.pause();
    } else if (isSpeaking && !isPlaying) {
      // Paused - resume it
      window.speechSynthesis.resume();
    } else {
      // Not speaking - create new utterance and start
      const utterance = createUtterance(explanation);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleReplay = () => {
    if (!voicesRef.current.length) return;
    
    // Stop current playback and create fresh utterance
    window.speechSynthesis.cancel();
    const utterance = createUtterance(explanation);
    window.speechSynthesis.speak(utterance);
  };

  const handleMute = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPlaying(false);
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
              Listen to my explanation or read along below
            </p>
          </div>

          {/* Audio Visualizer Container */}
          <div
            className={cn(
              "relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border-2 transition-all duration-300",
              isSpeaking && "border-primary shadow-lg shadow-primary/20 avatar-pulse"
            )}
            data-testid="container-avatar"
          >
            {/* Audio Icon with Animation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={cn(
                "relative transition-all duration-300",
                isSpeaking && "scale-110"
              )}>
                <div className={cn(
                  "w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center transition-all",
                  isSpeaking && "bg-primary/30"
                )}>
                  <Volume2 className={cn(
                    "h-16 w-16 text-primary transition-all",
                    isSpeaking && "animate-pulse"
                  )} />
                </div>
                {isSpeaking && (
                  <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-30" />
                )}
              </div>
            </div>

            {error && (
              <div className="absolute top-4 left-4 right-4">
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              </div>
            )}

            {/* Audio Controls */}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                onClick={handlePlayPause}
                disabled={!!error}
                data-testid="button-play-pause"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={handleMute}
                disabled={!isSpeaking}
                data-testid="button-mute"
              >
                <VolumeX className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={handleReplay}
                disabled={!!error}
                data-testid="button-replay"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {/* Status Indicator */}
            <div className="absolute top-4 left-4">
              <div className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all",
                isSpeaking ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {isSpeaking ? "🎙️ Speaking..." : isPlaying ? "⏸️ Paused" : "▶️ Click play"}
              </div>
            </div>
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
            data-testid="button-continue"
          >
            Got it! Next Concept
          </Button>
        </div>
      </Card>
    </div>
  );
}
