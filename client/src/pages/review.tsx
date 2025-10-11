import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { AvatarPlayer } from "@/components/avatar-player";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, BarChart3, GraduationCap } from "lucide-react";
import type { QuestionWithConcept } from "@shared/schema";

interface IncorrectAnswer {
  question: QuestionWithConcept;
  userAnswer: number;
  explanation: string;
}

export default function Review() {
  const { sessionId } = useParams();
  const [, setLocation] = useLocation();
  const [incorrectAnswers, setIncorrectAnswers] = useState<IncorrectAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewComplete, setReviewComplete] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const reviewData = localStorage.getItem(`review-${sessionId}`);
    if (reviewData) {
      const answers = JSON.parse(reviewData) as IncorrectAnswer[];
      setIncorrectAnswers(answers);
    } else {
      setLocation("/");
    }
  }, [sessionId, setLocation]);

  const handleComplete = () => {
    if (currentIndex < incorrectAnswers.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setReviewComplete(true);
      localStorage.removeItem(`review-${sessionId}`);
    }
  };

  if (incorrectAnswers.length === 0) {
    return null;
  }

  if (reviewComplete) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto p-12 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-6 bg-primary/10 rounded-full">
              <GraduationCap className="h-16 w-16 text-primary" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="font-heading text-4xl font-bold">Review Complete!</h2>
            <p className="text-xl text-muted-foreground">
              You've reviewed all the concepts you struggled with
            </p>
          </div>

          <p className="text-muted-foreground max-w-lg mx-auto">
            Great job working through the material! These concepts will appear more frequently in future quizzes to help strengthen your understanding.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button onClick={() => setLocation("/")} variant="outline" data-testid="button-home">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
            <Button onClick={() => setLocation("/dashboard")} data-testid="button-dashboard">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Progress
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentAnswer = incorrectAnswers[currentIndex];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-semibold">
            Let's Review Your Answers
          </h2>
          <div className="text-sm text-muted-foreground" data-testid="text-progress">
            Concept {currentIndex + 1} of {incorrectAnswers.length}
          </div>
        </div>

        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Question:</h3>
            <p className="text-muted-foreground" data-testid="text-question">
              {currentAnswer.question.questionText}
            </p>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Your Answer:</div>
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md" data-testid="text-user-answer">
              {currentAnswer.question.options[currentAnswer.userAnswer]}
            </div>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Correct Answer:</div>
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-md" data-testid="text-correct-answer">
              {currentAnswer.question.options[currentAnswer.question.correctAnswer]}
            </div>
          </div>
        </Card>

        <AvatarPlayer
          conceptName={currentAnswer.question.concept.conceptName}
          explanation={currentAnswer.explanation}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}
