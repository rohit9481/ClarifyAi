import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, CheckCircle, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useProgressiveText } from "@/hooks/use-progressive-text";

interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
}

export default function TextLearn() {
  const { sessionId, conceptId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userQuestion, setUserQuestion] = useState("");
  const [currentMessage, setCurrentMessage] = useState("");
  const [isFirstLesson, setIsFirstLesson] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Progressive text display for the latest assistant message
  const { displayedText, isRevealing } = useProgressiveText({
    text: currentMessage,
    wordsPerSecond: 5, // Faster for text mode
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
      setUserQuestion("");
    },
    onError: (error: any) => {
      console.error("Error asking question:", error);
      const message: ChatMessage = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again."
      };
      setChatHistory(prev => [...prev, message]);
      setCurrentMessage("I'm sorry, I encountered an error. Please try again.");
      setUserQuestion("");
    },
  });

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

  const handleAskQuestion = () => {
    if (!userQuestion.trim()) return;

    // Add user question to chat
    const userMessage: ChatMessage = { role: 'user', content: userQuestion };
    setChatHistory(prev => [...prev, userMessage]);
    
    // Ask the question
    askQuestionMutation.mutate(userQuestion);
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
        <div className="max-w-5xl mx-auto">
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-heading text-2xl md:text-3xl font-semibold" data-testid="heading-concept-name">
            Learning: {concept.conceptName}
          </h1>
          <p className="text-muted-foreground mt-1">Interactive text-based tutoring</p>
        </div>

        {/* Main Card */}
        <Card className="flex flex-col h-[600px]">
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl font-heading">Learning Conversation</CardTitle>
            </div>
          </CardHeader>

          {/* Chat History */}
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
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-5 w-5 text-white" />
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
                        {msg.role === 'user' ? 'You' : 'AI Tutor'}
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
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                    <p className="text-sm font-medium text-muted-foreground mb-1">AI Tutor</p>
                    <p className="animate-pulse">Thinking...</p>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </CardContent>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                placeholder="Type your question about this concept..."
                className="flex-1"
                rows={2}
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
                disabled={!userQuestion.trim() || askQuestionMutation.isPending}
                size="lg"
                data-testid="button-send-question"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>

        {/* I'm Clear Button */}
        <div className="mt-6">
          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={handleClearConcept}
            data-testid="button-clear-concept"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            I'm Clear with this Concept
          </Button>
        </div>
      </div>
    </div>
  );
}
