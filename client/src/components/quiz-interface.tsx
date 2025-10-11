import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { Question, QuestionWithConcept } from "@shared/schema";
import { cn } from "@/lib/utils";

interface QuizInterfaceProps {
  questions: QuestionWithConcept[];
  currentQuestionIndex: number;
  selectedAnswer: number | null;
  onAnswerSelect: (answerIndex: number) => void;
  onSubmitAnswer: () => void;
  isSubmitting: boolean;
  isAnswerCorrect: boolean | null;
  showFeedback: boolean;
}

export function QuizInterface({
  questions,
  currentQuestionIndex,
  selectedAnswer,
  onAnswerSelect,
  onSubmitAnswer,
  isSubmitting,
  isAnswerCorrect,
  showFeedback,
}: QuizInterfaceProps) {
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (!currentQuestion) return null;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span data-testid="text-question-number">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span data-testid="text-progress-percent">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="p-8 question-reveal">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full" data-testid="text-concept-name">
              {currentQuestion.concept.conceptName}
            </div>
            <h2 className="font-heading text-2xl font-semibold" data-testid="text-question">
              {currentQuestion.questionText}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const showCorrectState = showFeedback && isCorrect;
              const showWrongState = showFeedback && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => !showFeedback && onAnswerSelect(index)}
                  disabled={showFeedback}
                  data-testid={`button-option-${index}`}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border-2 transition-all hover-elevate active-elevate-2",
                    isSelected && !showFeedback && "border-primary bg-primary/5",
                    !isSelected && !showFeedback && "border-border",
                    showCorrectState && "border-chart-2 bg-chart-2/10",
                    showWrongState && "border-destructive bg-destructive/10",
                    showFeedback && "cursor-default"
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex-1">{option}</span>
                    {showCorrectState && (
                      <CheckCircle2 className="h-5 w-5 text-chart-2 flex-shrink-0" />
                    )}
                    {showWrongState && (
                      <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Submit Button */}
          {!showFeedback && (
            <Button
              onClick={onSubmitAnswer}
              disabled={selectedAnswer === null || isSubmitting}
              className="w-full"
              size="lg"
              data-testid="button-submit-answer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Answer"
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
