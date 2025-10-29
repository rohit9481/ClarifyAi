import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpeakingAvatarProps {
  isSpeaking: boolean;
  text: string;
  className?: string;
}

export function SpeakingAvatar({ isSpeaking, text, className }: SpeakingAvatarProps) {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative">
        {/* Avatar container with animation */}
        <div
          className={cn(
            "relative w-48 h-48 rounded-full overflow-hidden border-4 transition-all duration-300",
            isSpeaking
              ? "border-primary shadow-lg shadow-primary/50 scale-105"
              : "border-border dark:border-border"
          )}
        >
          {/* Avatar background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
          
          {/* Avatar icon/image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={cn(
                "w-32 h-32 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center transition-transform duration-200",
                isSpeaking && "animate-pulse"
              )}
            >
              <svg
                className={cn(
                  "w-24 h-24 text-primary transition-all duration-200",
                  isSpeaking && "scale-110"
                )}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>

          {/* Speaking indicator - animated circles */}
          {isSpeaking && (
            <>
              <div className="absolute inset-0 border-4 border-primary/30 rounded-full animate-ping" />
              <div className="absolute inset-4 border-4 border-primary/20 rounded-full animate-pulse" />
            </>
          )}
        </div>

        {/* Voice indicator icon */}
        <div
          className={cn(
            "absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200",
            isSpeaking
              ? "bg-primary text-primary-foreground scale-110"
              : "bg-muted text-muted-foreground"
          )}
        >
          {isSpeaking ? (
            <Volume2 className="w-6 h-6 animate-pulse" />
          ) : (
            <VolumeX className="w-6 h-6" />
          )}
        </div>
      </div>

      {/* Current text being spoken */}
      {text && (
        <div className="max-w-lg">
          <div
            className={cn(
              "p-4 rounded-lg border transition-all duration-300",
              isSpeaking
                ? "bg-primary/5 border-primary/30 dark:bg-primary/10"
                : "bg-muted/50 border-border"
            )}
          >
            <p className="text-sm text-center text-foreground/80 italic">
              {isSpeaking ? `"${text}"` : text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
