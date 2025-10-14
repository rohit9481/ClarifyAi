import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Volume2, Mic, MicOff, Send, CheckCircle, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";

export default function VirtualLearn() {
  const { sessionId, conceptId } = useParams();
  const [, setLocation] = useLocation();
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{role: string, content: string}>>([]);
  const [userQuestion, setUserQuestion] = useState("");
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);

  // Get concept details
  const { data: concept, isLoading } = useQuery({
    queryKey: ["/api/concepts", conceptId],
    enabled: !!conceptId,
  });

  // Ask question mutation
  const askQuestionMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest("POST", "/api/ask-concept-question", {
        conceptId,
        question,
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      const answer = data?.answer || "I'm sorry, I couldn't generate a response. Please try asking again.";
      setChatHistory(prev => [...prev, {role: 'assistant', content: answer}]);
      speakText(answer);
      setUserQuestion("");
    },
    onError: (error: any) => {
      console.error("Error asking question:", error);
      setChatHistory(prev => [...prev, {
        role: 'assistant', 
        content: "I'm sorry, I encountered an error. Please try again."
      }]);
      setUserQuestion("");
    },
  });

  // Initialize speech synthesis and recognition
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      return;
    }

    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserQuestion(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Initial explanation when concept loads
  useEffect(() => {
    if (concept && !currentExplanation) {
      const initialExplanation = `Let me explain ${concept.conceptName}. ${concept.conceptDescription}`;
      setCurrentExplanation(initialExplanation);
      setChatHistory([{role: 'assistant', content: initialExplanation}]);
      speakText(initialExplanation);
    }
  }, [concept, currentExplanation]);

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Female') || 
      v.name.includes('Samantha') ||
      v.lang.startsWith('en')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in your browser");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleAskQuestion = () => {
    if (!userQuestion.trim()) return;

    setChatHistory(prev => [...prev, {role: 'user', content: userQuestion}]);
    askQuestionMutation.mutate(userQuestion);
  };

  const handleClearConcept = () => {
    // Mark concept as mastered and return to report
    setLocation(`/report/${sessionId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!concept) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Concept not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setLocation(`/teach-mode/${sessionId}/${conceptId}`)}
            data-testid="button-back-mode"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="font-heading text-2xl font-semibold" data-testid="heading-concept-name">
            {concept.conceptName}
          </h1>
          <div className="w-20" /> {/* Spacer for alignment */}
        </div>

        {/* Avatar Visual */}
        <Card className={cn(
          "p-8 transition-all duration-300",
          isSpeaking && "border-primary shadow-lg shadow-primary/20"
        )}>
          <div className="flex items-center justify-center">
            <div className={cn(
              "relative w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center transition-all",
              isSpeaking && "scale-110"
            )}>
              <Volume2 className={cn(
                "h-16 w-16 text-primary transition-all",
                isSpeaking && "animate-pulse"
              )} />
              {isSpeaking && (
                <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-30" />
              )}
            </div>
          </div>
          <p className="text-center mt-4 text-muted-foreground" data-testid="text-avatar-status">
            {isSpeaking ? "Speaking..." : "Ready to answer your questions"}
          </p>
        </Card>

        {/* Chat History */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Learning Session</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto" data-testid="chat-history">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-4 rounded-lg",
                  msg.role === 'user' 
                    ? "bg-primary/10 ml-8" 
                    : "bg-muted mr-8"
                )}
                data-testid={`message-${msg.role}-${idx}`}
              >
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {msg.role === 'user' ? 'You' : 'Tutor'}
                </p>
                <p>{msg.content}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Question Input */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Ask a Question</h3>
          <div className="flex gap-2">
            <Textarea
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder="Type your question or use voice..."
              className="flex-1"
              data-testid="input-question"
            />
            <div className="flex flex-col gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={handleVoiceInput}
                className={cn(isListening && "bg-destructive text-destructive-foreground")}
                data-testid="button-voice-input"
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                size="icon"
                onClick={handleAskQuestion}
                disabled={!userQuestion.trim() || askQuestionMutation.isPending}
                data-testid="button-send-question"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Clear Button */}
        <Card className="p-6">
          <Button
            className="w-full"
            size="lg"
            onClick={handleClearConcept}
            data-testid="button-clear-concept"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            I'm Clear with this Concept
          </Button>
        </Card>
      </div>
    </div>
  );
}
