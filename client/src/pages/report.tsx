import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { RotateCcw, ArrowLeft, Check, X, AlertCircle, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Report() {
  const { sessionId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: reportData, isLoading } = useQuery({
    queryKey: ["/api/quiz-sessions", sessionId, "report"],
    enabled: !!sessionId,
  });

  // Re-test weak concepts mutation
  const retestMutation = useMutation({
    mutationFn: async () => {
      const guestSessionId = localStorage.getItem("guestSessionId");
      const conceptIds = weakConcepts.map((concept: any) => concept.id);
      
      // Generate new questions for all weak concepts in a single request
      const response = await apiRequest("POST", "/api/generate-retest-questions", {
        conceptIds,
        guestSessionId,
      });
      
      const result = await response.json();
      return { quizSessionId: result.quizSessionId };
    },
    onSuccess: (data) => {
      toast({
        title: "New Questions Generated!",
        description: "Ready to re-test your weak concepts with fresh questions.",
      });
      // Redirect to the new quiz session
      setTimeout(() => {
        setLocation(`/quiz/${data.quizSessionId}`);
      }, 1500);
    },
    onError: (error) => {
      console.error("Failed to generate new questions:", error);
      toast({
        title: "Error",
        description: "Failed to generate new questions. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Report not found</p>
      </div>
    );
  }

  const scorePercentage = Math.round((reportData.correctAnswers / reportData.totalQuestions) * 100);
  
  // Group answers by concept for performance chart
  const conceptPerformance = reportData.answers.reduce((acc: any, answer: any) => {
    const conceptName = answer.concept.conceptName;
    if (!acc[conceptName]) {
      acc[conceptName] = { concept: conceptName, correct: 0, total: 0 };
    }
    acc[conceptName].total++;
    if (answer.isCorrect) {
      acc[conceptName].correct++;
    }
    return acc;
  }, {});

  const chartData = Object.values(conceptPerformance).map((item: any) => ({
    name: item.concept.length > 30 ? item.concept.substring(0, 30) + "..." : item.concept,
    fullName: item.concept,
    score: Math.round((item.correct / item.total) * 100),
  }));

  // Get weak concepts (incorrect answers)
  const weakConcepts = Array.from(
    new Map(
      reportData.answers
        .filter((answer: any) => !answer.isCorrect)
        .map((answer: any) => [answer.conceptId, answer.concept])
    ).values()
  );

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Session Report Header */}
        <Card className="p-8">
          <div className="text-center space-y-6">
            <h1 className="font-heading text-3xl font-bold" data-testid="heading-report">
              Session Report
            </h1>
            
            <div className="space-y-2">
              <div className="text-7xl font-bold text-primary" data-testid="text-score-percentage">
                {scorePercentage}%
              </div>
              <p className="text-muted-foreground" data-testid="text-score-summary">
                You answered {reportData.correctAnswers} out of {reportData.totalQuestions} questions correctly.
              </p>
            </div>

            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                variant="outline"
                onClick={() => setLocation(`/quiz/${reportData.pdfId}`)}
                data-testid="button-retake-test"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake Test
              </Button>
              {weakConcepts.length > 0 && (
                <Button
                  variant="default"
                  onClick={() => retestMutation.mutate()}
                  disabled={retestMutation.isPending}
                  data-testid="button-retest-weak"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {retestMutation.isPending ? "Generating..." : "Re-test Weak Concepts"}
                </Button>
              )}
              <Button
                onClick={() => setLocation("/dashboard")}
                data-testid="button-dashboard"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </Card>

        {/* Performance by Concept Chart */}
        <Card className="p-6">
          <h2 className="font-heading text-2xl font-semibold mb-6" data-testid="heading-performance-chart">
            Performance by Concept
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  className="text-xs"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis 
                  domain={[0, 100]}
                  className="text-xs"
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <Card className="p-3">
                          <p className="font-medium">{payload[0].payload.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            Score: {payload[0].value}%
                          </p>
                        </Card>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="score" 
                  fill="hsl(var(--primary))" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Areas for Improvement */}
        {weakConcepts.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <h2 className="font-heading text-2xl font-semibold" data-testid="heading-areas-improvement">
                Areas for Improvement
              </h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Based on your answers, you might want to review these topics:
            </p>
            <div className="space-y-3">
              {weakConcepts.map((concept: any) => (
                <div
                  key={concept.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  data-testid={`concept-weak-${concept.id}`}
                >
                  <span className="font-medium">{concept.conceptName}</span>
                  <Button
                    onClick={() => setLocation(`/teach-mode/${sessionId}/${concept.id}`)}
                    data-testid={`button-teach-${concept.id}`}
                  >
                    Teach Me
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Detailed Review */}
        <Card className="p-6">
          <h2 className="font-heading text-2xl font-semibold mb-6" data-testid="heading-detailed-review">
            Detailed Review
          </h2>
          <div className="space-y-6">
            {reportData.answers.map((answer: any, index: number) => (
              <Card 
                key={answer.id} 
                className={`p-6 ${answer.isCorrect ? 'border-green-500/50' : 'border-destructive/50'}`}
                data-testid={`review-question-${index + 1}`}
              >
                <div className="space-y-4">
                  {/* Question Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-sm text-muted-foreground">
                          {index + 1}.
                        </span>
                        <h3 className="font-medium" data-testid={`question-text-${index + 1}`}>
                          {answer.question.questionText}
                        </h3>
                      </div>
                    </div>
                    <div className={`p-2 rounded-full ${answer.isCorrect ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                      {answer.isCorrect ? (
                        <Check className="h-5 w-5 text-green-500" data-testid={`icon-correct-${index + 1}`} />
                      ) : (
                        <X className="h-5 w-5 text-destructive" data-testid={`icon-incorrect-${index + 1}`} />
                      )}
                    </div>
                  </div>

                  {/* Answers */}
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Correct Answer: </span>
                      <span className="font-medium text-green-600 dark:text-green-400" data-testid={`correct-answer-${index + 1}`}>
                        {answer.question.options[answer.question.correctAnswer]}
                      </span>
                    </div>
                    {!answer.isCorrect && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Your Answer: </span>
                        <span className="font-medium text-destructive" data-testid={`user-answer-${index + 1}`}>
                          {answer.question.options[answer.userAnswer]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Explanation */}
                  {answer.avatarExplanation && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-md">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Explanation:</p>
                      <p className="text-sm leading-relaxed" data-testid={`explanation-${index + 1}`}>
                        {answer.avatarExplanation}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
