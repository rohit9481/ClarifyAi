import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Volume2, VolumeX, Mic, CheckCircle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useProgressiveText } from "@/hooks/use-progressive-text";

interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
}

export default function VirtualLearn() {
  const { sessionId, conceptId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isFirstLesson, setIsFirstLesson] = useState(true);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Progressive text display for the latest message
  const { displayedText, isRevealing } = useProgressiveText({
    text: currentMessage,
    wordsPerSecond: 3,
  });

  // Get concept details
  const { data: concept, isLoading } = useQuery<{ id: string; conceptName: string; conceptDescription: string }>({
    queryKey: ["/api/concepts", conceptId],
    enabled: !!conceptId,
  });

  // Fetch initial lesson
  const fetchInitialLesson = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ask-concept-question", {
        conceptId,
        mode: "lesson",  // Request initial lesson
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      const lesson = data?.answer || "Let me help you understand this concept.";
      const message: ChatMessage = { role: 'assistant', content: lesson };
      setChatHistory([message]);
      setCurrentMessage(lesson);
      if (!isMuted) {
        speakText(lesson);
      }
      setIsFirstLesson(false);
    },
  });

  // Ask question mutation
  const askQuestionMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest("POST", "/api/ask-concept-question", {
        conceptId,
        question,
        mode: "question",  // Follow-up question mode
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      const answer = data?.answer || "I'm sorry, I couldn't generate a response. Please try asking again.";
      const message: ChatMessage = { role: 'assistant', content: answer };
      setChatHistory(prev => [...prev, message]);
      setCurrentMessage(answer);
      if (!isMuted) {
        speakText(answer);
      }
    },
  });

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        
        // Add user question to chat
        const userMessage: ChatMessage = { role: 'user', content: transcript };
        setChatHistory(prev => [...prev, userMessage]);
        
        // Ask the question
        askQuestionMutation.mutate(transcript);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice input error",
          description: "Could not capture your voice. Please try again.",
          variant: "destructive",
        });
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

  // Load initial lesson when concept is ready
  useEffect(() => {
    if (concept && isFirstLesson) {
      fetchInitialLesson.mutate();
    }
  }, [concept]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, displayedText]);

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window) || isMuted) {
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

  const toggleMute = () => {
    if (!isMuted) {
      // Muting - stop speech
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setIsMuted(!isMuted);
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice input not available",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Speech recognition error:", error);
        setIsListening(false);
      }
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-[600px] w-full" />
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
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-heading text-2xl md:text-3xl font-semibold" data-testid="heading-concept-name">
            Learning: {concept.conceptName}
          </h1>
          <p className="text-muted-foreground mt-1">Interactive voice-based tutoring</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
          {/* Left Column: Virtual Teacher */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-heading">Virtual Teacher</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex justify-center">
                  <div className={cn(
                    "relative w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center transition-all duration-300",
                    isSpeaking && "scale-110 shadow-lg shadow-purple-500/50"
                  )}>
                    <User className="h-16 w-16 text-white" />
                    {isSpeaking && (
                      <div className="absolute inset-0 rounded-full border-4 border-purple-400 animate-ping opacity-75" />
                    )}
                  </div>
                </div>

                {/* Mute Button */}
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleMute}
                    className="rounded-full"
                    data-testid="button-mute"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Voice Input Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleVoiceInput}
                  disabled={isListening || askQuestionMutation.isPending}
                  data-testid="button-voice-input"
                >
                  <Mic className="h-5 w-5 mr-2" />
                  {isListening ? "Listening..." : "Ask Question (Voice)"}
                </Button>

                {/* I'm Clear Button */}
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={handleClearConcept}
                  data-testid="button-clear-concept"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  I'm Clear
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Learning Conversation */}
          <Card className="flex flex-col h-[600px]">
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl font-heading">Learning Conversation</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6" data-testid="chat-history">
                {chatHistory.map((msg, idx) => {
                  const isLatest = idx === chatHistory.length - 1;
                  const textToShow = isLatest && msg.role === 'assistant' 
                    ? displayedText 
                    : msg.content;

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "flex gap-4",
                        msg.role === 'user' && "justify-end"
                      )}
                      data-testid={`message-${msg.role}-${idx}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg p-4",
                          msg.role === 'assistant' 
                            ? "bg-muted" 
                            : "bg-primary text-primary-foreground"
                        )}
                      >
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          {msg.role === 'user' ? 'You' : 'Tutor'}
                        </p>
                        <p className="whitespace-pre-wrap leading-relaxed">
                          {textToShow}
                          {isLatest && isRevealing && <span className="animate-pulse">▋</span>}
                        </p>
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  );
                })}
                {(askQuestionMutation.isPending || fetchInitialLesson.isPending) && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Tutor</p>
                      <p className="animate-pulse">Thinking...</p>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
