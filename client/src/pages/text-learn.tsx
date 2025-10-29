import { useEffect, useState } from "react";
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

export default function TextLearn() {
  const { sessionId, conceptId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [chatHistory, setChatHistory] = useState<Array<{role: string, content: string}>>([]);
  const [userQuestion, setUserQuestion] = useState("");

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

  // Initial explanation when concept loads
  useEffect(() => {
    if (concept && chatHistory.length === 0) {
      const initialExplanation = `Let me explain ${concept.conceptName}. ${concept.conceptDescription}`;
      setChatHistory([{role: 'assistant', content: initialExplanation}]);
    }
  }, [concept, chatHistory.length]);

  const handleAskQuestion = () => {
    if (!userQuestion.trim()) return;

    setChatHistory(prev => [...prev, {role: 'user', content: userQuestion}]);
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

        {/* Chat Interface */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Interactive Learning Chat</h3>
          </div>
          
          {/* Chat History */}
          <div className="space-y-4 max-h-96 overflow-y-auto mb-6" data-testid="chat-history">
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
                  {msg.role === 'user' ? 'You' : 'AI Tutor'}
                </p>
                <p className="leading-relaxed">{msg.content}</p>
              </div>
            ))}
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
              disabled={!userQuestion.trim() || askQuestionMutation.isPending}
              className="w-full"
              data-testid="button-send-question"
            >
              <Send className="h-4 w-4 mr-2" />
              {askQuestionMutation.isPending ? "Getting answer..." : "Send Question"}
            </Button>
          </div>
        </Card>

        {/* Concept Summary */}
        <Card className="p-6 bg-muted/50">
          <h3 className="font-semibold mb-2">Concept Summary</h3>
          <p className="text-muted-foreground leading-relaxed">
            {concept.conceptDescription}
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
