import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';

interface LocalAvatarProps {
  onAvatarReady?: () => void;
  onSpeakingStart?: () => void;
  onSpeakingEnd?: () => void;
  fallbackSpeak?: (text: string) => void;
}

export function LocalAvatar({
  onAvatarReady,
  onSpeakingStart,
  onSpeakingEnd,
  fallbackSpeak
}: LocalAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mouthOpenRef = useRef(0); // 0-1, how open the mouth is
  const blinkTimerRef = useRef(0);
  const isBlinkingRef = useRef(false);

  // Register global speak function
  useEffect(() => {
    (window as any).avatarSpeak = (text: string) => {
      if (fallbackSpeak) {
        fallbackSpeak(text);
      }
    };

    // Signal that avatar is ready
    if (onAvatarReady) {
      onAvatarReady();
    }

    return () => {
      delete (window as any).avatarSpeak;
    };
  }, [fallbackSpeak, onAvatarReady]);

  // Drawing the avatar
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Set up gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#f0f9ff');
      gradient.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw head (circle)
      ctx.fillStyle = '#fcd5b5';
      ctx.beginPath();
      ctx.arc(centerX, centerY - 20, 80, 0, Math.PI * 2);
      ctx.fill();

      // Draw hair
      ctx.fillStyle = '#3e2a1f';
      ctx.beginPath();
      ctx.arc(centerX, centerY - 50, 85, Math.PI, Math.PI * 2);
      ctx.fill();

      // Hair strands
      ctx.beginPath();
      ctx.moveTo(centerX - 85, centerY - 50);
      ctx.quadraticCurveTo(centerX - 100, centerY + 20, centerX - 70, centerY + 50);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(centerX + 85, centerY - 50);
      ctx.quadraticCurveTo(centerX + 100, centerY + 20, centerX + 70, centerY + 50);
      ctx.fill();

      // Draw eyes
      const eyeOpenness = isBlinkingRef.current ? 0.1 : 1;
      ctx.fillStyle = '#ffffff';
      
      // Left eye
      ctx.beginPath();
      ctx.ellipse(centerX - 30, centerY - 30, 12, 12 * eyeOpenness, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Right eye
      ctx.beginPath();
      ctx.ellipse(centerX + 30, centerY - 30, 12, 12 * eyeOpenness, 0, 0, Math.PI * 2);
      ctx.fill();

      if (!isBlinkingRef.current) {
        // Eye pupils
        ctx.fillStyle = '#2c1810';
        ctx.beginPath();
        ctx.arc(centerX - 30, centerY - 30, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(centerX + 30, centerY - 30, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw nose
      ctx.strokeStyle = '#d4a484';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 10);
      ctx.lineTo(centerX - 5, centerY + 5);
      ctx.stroke();

      // Draw mouth - animated based on speaking
      const mouthY = centerY + 25;
      const mouthWidth = 30;
      const mouthOpen = mouthOpenRef.current;

      ctx.fillStyle = '#8b4c39';
      ctx.beginPath();
      
      if (mouthOpen > 0.1) {
        // Open mouth (oval)
        ctx.ellipse(centerX, mouthY, mouthWidth, 8 + (mouthOpen * 12), 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Closed mouth (smile)
        ctx.moveTo(centerX - mouthWidth, mouthY);
        ctx.quadraticCurveTo(centerX, mouthY + 5, centerX + mouthWidth, mouthY);
        ctx.stroke();
      }

      // Update mouth animation
      if (isSpeaking) {
        // Animate mouth opening/closing
        mouthOpenRef.current = Math.abs(Math.sin(Date.now() / 100)) * 0.8 + 0.2;
      } else {
        // Gradually close mouth
        mouthOpenRef.current = Math.max(0, mouthOpenRef.current - 0.1);
      }

      // Update blink timer
      blinkTimerRef.current += 1;
      if (blinkTimerRef.current > 180) { // Blink every ~3 seconds
        isBlinkingRef.current = true;
        if (blinkTimerRef.current > 185) {
          isBlinkingRef.current = false;
          blinkTimerRef.current = 0;
        }
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSpeaking]);

  // Sync speaking state with parent callbacks
  useEffect(() => {
    if (isSpeaking && onSpeakingStart) {
      onSpeakingStart();
    } else if (!isSpeaking && onSpeakingEnd) {
      onSpeakingEnd();
    }
  }, [isSpeaking, onSpeakingStart, onSpeakingEnd]);

  // Expose speaking state control
  useEffect(() => {
    (window as any).setAvatarSpeaking = (speaking: boolean) => {
      setIsSpeaking(speaking);
    };

    return () => {
      delete (window as any).setAvatarSpeaking;
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="rounded-lg border-2 border-primary/20"
        data-testid="canvas-local-avatar"
      />
      <div className="text-center text-sm text-muted-foreground">
        {isSpeaking ? (
          <div className="flex items-center gap-2 text-primary">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Speaking...
          </div>
        ) : (
          "AI Tutor Ready"
        )}
      </div>
    </div>
  );
}
