import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Mic, CheckCircle, ArrowLeft, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: 'assistant' | 'user';
  content: string;
  displayedContent?: string; // For progressive rendering
}

export default function VirtualLearn() {
  const { sessionId, conceptId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get concept details
  const { data: concept, isLoading } = useQuery({
    queryKey: ["/api/concepts", conceptId],
    enabled: !!conceptId,
  });

  // Get initial explanation
  const { data: initialData, isLoading: isLoadingExplanation } = useQuery({
    queryKey: ["/api/concepts", conceptId, "initial-explanation"],
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
      const newMessage: Message = { role: 'assistant', content: answer, displayedContent: '' };
      setMessages(prev => [...prev, newMessage]);
      setIsLoadingResponse(false);
      speakTextProgressively(answer, messages.length);
    },
    onError: (error: any) => {
      console.error("Error asking question:", error);
      const errorMsg: Message = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        displayedContent: "I'm sorry, I encountered an error. Please try again."
      };
      setMessages(prev => [...prev, errorMsg]);
      setIsLoadingResponse(false);
    },
  });

  // Initialize speech synthesis and recognition
  useEffect(() => {
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleVoiceQuestion(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
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

  // Load initial explanation when available
  useEffect(() => {
    const data = initialData as any;
    if (data?.explanation && messages.length === 0) {
      const welcomeMessage: Message = {
        role: 'assistant',
        content: data.explanation,
        displayedContent: ''
      };
      setMessages([welcomeMessage]);
      speakTextProgressively(data.explanation, 0);
    }
  }, [initialData, messages.length]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speakTextProgressively = (text: string, messageIndex: number) => {
    if (!('speechSynthesis' in window) || isMuted) {
      // If speech is muted or not available, just show full text immediately
      setMessages(prev => prev.map((msg, idx) =>
        idx === messageIndex ? { ...msg, displayedContent: msg.content } : msg
      ));
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
    utterance.onend = () => {
      setIsSpeaking(false);
      // Ensure full text is displayed when speech ends
      setMessages(prev => prev.map((msg, idx) =>
        idx === messageIndex ? { ...msg, displayedContent: msg.content } : msg
      ));
    };

    // Progressive text rendering - word by word
    const words = text.split(' ');
    let wordIndex = 0;
    const wordsPerUpdate = 2; // Show 2 words at a time for smoother rendering
    
    const intervalTime = (utterance.rate * 400); // Adjust based on speech rate
    const progressInterval = setInterval(() => {
      if (wordIndex < words.length) {
        const displayedWords = words.slice(0, wordIndex + wordsPerUpdate).join(' ');
        setMessages(prev => prev.map((msg, idx) =>
          idx === messageIndex ? { ...msg, displayedContent: displayedWords } : msg
        ));
        wordIndex += wordsPerUpdate;
      } else {
        clearInterval(progressInterval);
      }
    }, intervalTime);

    utterance.onend = () => {
      setIsSpeaking(false);
      clearInterval(progressInterval);
      setMessages(prev => prev.map((msg, idx) =>
        idx === messageIndex ? { ...msg, displayedContent: msg.content } : msg
      ));
    };

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

  const handleVoiceQuestion = (question: string) => {
    if (!question.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: question,
      displayedContent: question
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoadingResponse(true);
    askQuestionMutation.mutate(question);
  };

  const toggleMute = () => {
    if (isSpeaking && !isMuted) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setIsMuted(!isMuted);
  };

  const handleClearConcept = async () => {
    try {
      const guestSessionId = localStorage.getItem("guestSessionId");
      await apiRequest("POST", `/api/concepts/${conceptId}/master`, {
        guestSessionId,
      });
      
      toast({
        title: "Concept Mastered!",
        description: "You've marked this concept as clear. Great work!",
      });
      setLocation(`/report/${sessionId}`);
    } catch (error) {
      console.error("Failed to mark concept as mastered:", error);
      toast({
        title: "Error",
        description: "Failed to save mastery status. Please try again.",
        variant: "destructive",
      });
      setLocation(`/report/${sessionId}`);
    }
  };

  if (isLoading || isLoadingExplanation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-64 w-full max-w-4xl" />
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setLocation(`/teach-mode/${sessionId}/${conceptId}`)}
            data-testid="button-back-mode"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="font-heading text-xl font-semibold" data-testid="heading-concept-name">
            {(concept as any)?.conceptName}
          </h1>
          <div className="w-20" />
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 h-[calc(100vh-180px)]">
          {/* Left Sidebar - Virtual Teacher */}
          <Card className="p-6 flex flex-col items-center justify-between h-full">
            <div className="flex flex-col items-center flex-1 justify-center space-y-6">
              <h2 className="font-heading text-xl font-semibold">Virtual Teacher</h2>
              
              {/* Avatar */}
              <div className={cn(
                "relative w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center transition-all duration-300",
                isSpeaking && "scale-110 shadow-lg shadow-purple-500/50"
              )}>
                <User className="h-16 w-16 text-white" />
                {isSpeaking && (
                  <div className="absolute inset-0 rounded-full border-4 border-purple-400 animate-ping opacity-30" />
                )}
              </div>

              {/* Mute Button */}
              <Button
                size="icon"
                variant="outline"
                onClick={toggleMute}
                data-testid="button-mute"
                className="rounded-md"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>

            {/* Voice Question Button */}
            <div className="w-full space-y-3">
              <Button
                className="w-full"
                variant="default"
                onClick={handleVoiceInput}
                disabled={isLoadingResponse}
                data-testid="button-voice-input"
              >
                <Mic className="h-4 w-4 mr-2" />
                {isListening ? "Listening..." : "Ask Question (Voice)"}
              </Button>

              <Button
                className="w-full"
                variant="outline"
                onClick={handleClearConcept}
                data-testid="button-clear-concept"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                I'm Clear
              </Button>
            </div>
          </Card>

          {/* Right Panel - Learning Conversation */}
          <Card className="p-6 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="font-heading text-xl font-semibold">Learning Conversation</h2>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2" data-testid="chat-history">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-4 rounded-lg",
                    message.role === 'user' 
                      ? "bg-primary/10 ml-12" 
                      : "bg-muted mr-12"
                  )}
                  data-testid={`message-${message.role}-${index}`}
                >
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {message.role === 'user' ? 'You' : 'AI Tutor'}
                  </p>
                  <p className="whitespace-pre-wrap">
                    {message.displayedContent || message.content}
                  </p>
                </div>
              ))}
              {isLoadingResponse && (
                <div className="bg-muted mr-12 p-4 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">AI Tutor</p>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
