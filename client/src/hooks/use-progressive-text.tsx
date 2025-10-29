import { useState, useEffect, useRef } from "react";

interface UseProgressiveTextOptions {
  text: string;
  wordsPerSecond?: number; // Speed of text reveal
  onComplete?: () => void;
}

export function useProgressiveText({ 
  text, 
  wordsPerSecond = 3, 
  onComplete 
}: UseProgressiveTextOptions) {
  const [displayedText, setDisplayedText] = useState("");
  const [isRevealing, setIsRevealing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef(0);

  // Reset and start revealing when text changes
  useEffect(() => {
    if (!text) {
      setDisplayedText("");
      setIsRevealing(false);
      return;
    }

    // Reset state
    setDisplayedText("");
    currentIndexRef.current = 0;
    setIsRevealing(true);

    // Split text into words
    const words = text.split(" ");
    const delayMs = 1000 / wordsPerSecond;

    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Progressively reveal words
    const revealNextWord = () => {
      if (currentIndexRef.current < words.length) {
        const newText = words.slice(0, currentIndexRef.current + 1).join(" ");
        setDisplayedText(newText);
        currentIndexRef.current++;

        timerRef.current = setTimeout(revealNextWord, delayMs);
      } else {
        setIsRevealing(false);
        if (onComplete) {
          onComplete();
        }
      }
    };

    revealNextWord();

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [text, wordsPerSecond, onComplete]);

  const skipToEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setDisplayedText(text);
    setIsRevealing(false);
    currentIndexRef.current = text.split(" ").length;
    if (onComplete) {
      onComplete();
    }
  };

  return {
    displayedText,
    isRevealing,
    skipToEnd,
  };
}
