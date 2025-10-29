import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, CheckCircle, ArrowLeft, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: 'assistant' | 'user';
  content: string;
  displayedContent?: string; // For progressive rendering
}

export default function TextLearn() {
  const { sessionId, conceptId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [userQuestion, setUserQuestion] = useState("");
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
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
      setUserQuestion("");
      setIsLoadingResponse(false);
      renderTextProgressively(answer, messages.length);
    },
    onError: (error: any) => {
      console.error("Error asking question:", error);
      const errorMsg: Message = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        displayedContent: "I'm sorry, I encountered an error. Please try again."
      };
      setMessages(prev => [...prev, errorMsg]);
      setUserQuestion("");
      setIsLoadingResponse(false);
    },
  });

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
      renderTextProgressively(data.explanation, 0);
    }
  }, [initialData, messages.length]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Progressive text rendering - word by word
  const renderTextProgressively = (text: string, messageIndex: number) => {
    const words = text.split(' ');
    let wordIndex = 0;
    const wordsPerUpdate = 3; // Show 3 words at a time for smooth reading
    
    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        const displayedWords = words.slice(0, wordIndex + wordsPerUpdate).join(' ');
        setMessages(prev => prev.map((msg, idx) =>
          idx === messageIndex ? { ...msg, displayedContent: displayedWords } : msg
        ));
        wordIndex += wordsPerUpdate;
      } else {
        clearInterval(interval);
        // Ensure full text is displayed
        setMessages(prev => prev.map((msg, idx) =>
          idx === messageIndex ? { ...msg, displayedContent: msg.content } : msg
        ));
      }
    }, 200); // Show new words every 200ms
  };

  const handleAskQuestion = () => {
    if (!userQuestion.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: userQuestion.trim(),
      displayedContent: userQuestion.trim()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoadingResponse(true);
    askQuestionMutation.mutate(userQuestion.trim());
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
            {(concept as any)?.conceptName}
          </h1>
          <div className="w-20" /> {/* Spacer for alignment */}
        </div>

        {/* Chat Interface */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Interactive Learning Chat</h3>
          </div>
          
          {/* Chat History */}
          <div className="space-y-4 max-h-96 overflow-y-auto mb-6" data-testid="chat-history">
            {messages.map((msg, idx) => (
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
                  {msg.role === 'user' ? 'You' : 'AI Tutor'}
                </p>
                <p className="leading-relaxed whitespace-pre-wrap">
                  {msg.displayedContent || msg.content}
                </p>
              </div>
            ))}
            {isLoadingResponse && (
              <div className="bg-muted mr-8 p-4 rounded-lg">
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

          {/* Question Input */}
          <div className="space-y-4">
            <Textarea
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder="Type your question about this concept..."
              className="min-h-24"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAskQuestion();
                }
              }}
              data-testid="input-question"
            />
            <Button
              onClick={handleAskQuestion}
              disabled={!userQuestion.trim() || isLoadingResponse}
              className="w-full"
              data-testid="button-send-question"
            >
              <Send className="h-4 w-4 mr-2" />
              {isLoadingResponse ? "Getting answer..." : "Send Question"}
            </Button>
          </div>
        </Card>

        {/* Concept Summary */}
        <Card className="p-6 bg-muted/50">
          <h3 className="font-semibold mb-2">Concept Summary</h3>
          <p className="text-muted-foreground leading-relaxed">
            {(concept as any)?.conceptDescription}
          </p>
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
