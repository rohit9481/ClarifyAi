import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { QuizInterface } from "@/components/quiz-interface";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Trophy, Home, RotateCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { QuestionWithConcept, Answer } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useGuestSession } from "@/hooks/useGuestSession";

export default function Quiz() {
  const { pdfId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const guestSessionId = useGuestSession();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [quizSessionId, setQuizSessionId] = useState<string>("");
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState<Array<{
    question: QuestionWithConcept;
    userAnswer: number;
    explanation: string;
  }>>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Fetch questions for this PDF (with spaced repetition)
  const { data: questions, isLoading } = useQuery<QuestionWithConcept[]>({
    queryKey: ["/api/questions", pdfId, isAuthenticated ? "" : `?guestSessionId=${guestSessionId}`],
    enabled: !!pdfId,
  });

  // Create quiz session
  useEffect(() => {
    if (questions && questions.length > 0 && !quizSessionId) {
      const createSession = async () => {
        try {
          console.log("Creating quiz session for pdfId:", pdfId, "guestSessionId:", guestSessionId);
          const response = await apiRequest("POST", "/api/quiz-sessions", {
            pdfId,
            totalQuestions: questions.length,
            guestSessionId: !isAuthenticated ? guestSessionId : undefined,
          });
          const session = await response.json();
          console.log("Quiz session created:", session.id);
          setQuizSessionId(session.id);
        } catch (error) {
          console.error("Failed to create quiz session:", error);
          toast({
            title: "Session Error",
            description: "Failed to create quiz session. Using fallback mode.",
            variant: "destructive",
          });
          // Fallback: use a temporary session ID to allow quiz to proceed
          setQuizSessionId("temp-" + Date.now());
        }
      };
      createSession();
    }
  }, [questions, pdfId, quizSessionId, isAuthenticated, guestSessionId, toast]);

  const submitAnswerMutation = useMutation<Answer, Error, { questionId: string; userAnswer: number }>({
    mutationFn: async ({ questionId, userAnswer }): Promise<Answer> => {
      const response = await apiRequest("POST", "/api/submit-answer", {
        quizSessionId,
        questionId,
        conceptId: questions![currentQuestionIndex].conceptId,
        userAnswer,
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setShowFeedback(true);
      const isLastQuestion = currentQuestionIndex === questions!.length - 1;
      
      // Calculate updated counts
      const updatedCorrectCount = correctCount + (data.isCorrect ? 1 : 0);
      let updatedIncorrectAnswers = incorrectAnswers;
      
      if (data.isCorrect) {
        setCorrectCount(prev => prev + 1);
      } else {
        // Track incorrect answer for post-quiz review
        const newIncorrectAnswer = {
          question: questions![currentQuestionIndex],
          userAnswer: selectedAnswer!,
          explanation: data.avatarExplanation || "",
        };
        updatedIncorrectAnswers = [...incorrectAnswers, newIncorrectAnswer];
        setIncorrectAnswers(updatedIncorrectAnswers);
      }
      
      // Auto-advance to next question or complete quiz
      setTimeout(() => {
        if (isLastQuestion) {
          handleQuizComplete(updatedIncorrectAnswers, updatedCorrectCount);
        } else {
          handleNextQuestion();
        }
      }, 1500);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !questions || !quizSessionId) return;

    const currentQuestion = questions[currentQuestionIndex];
    submitAnswerMutation.mutate({
      questionId: currentQuestion.id,
      userAnswer: selectedAnswer,
    });
  };

  const handleNextQuestion = () => {
    if (!questions) return;
    setCurrentQuestionIndex(prev => prev + 1);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  const handleQuizComplete = async (
    finalIncorrectAnswers: typeof incorrectAnswers,
    finalCorrectCount: number
  ) => {
    await completeQuizSession(finalIncorrectAnswers, finalCorrectCount);
    
    // Always redirect to report page to show session summary
    setLocation(`/report/${quizSessionId}`);
  };

  const completeQuizSession = async (
    finalIncorrectAnswers: typeof incorrectAnswers,
    finalCorrectCount: number
  ) => {
    try {
      await apiRequest("PATCH", `/api/quiz-sessions/${quizSessionId}/complete`, {
        correctAnswers: finalCorrectCount,
      });
      
      // Save incorrect answers for review session
      if (finalIncorrectAnswers.length > 0) {
        console.log("Saving to localStorage:", `review-${quizSessionId}`, finalIncorrectAnswers);
        localStorage.setItem(
          `review-${quizSessionId}`,
          JSON.stringify(finalIncorrectAnswers)
        );
      }
    } catch (error) {
      console.error("Failed to complete quiz:", error);
    }
  };

  if (isLoading || (questions && questions.length > 0 && !quizSessionId)) {
    return (
      <div className="container mx-auto px-4 py-24 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">
            {isLoading ? "Loading quiz questions..." : "Preparing your quiz..."}
          </p>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24">
        <Card className="max-w-2xl mx-auto p-12 text-center space-y-4">
          <h2 className="font-heading text-2xl font-semibold">No Questions Available</h2>
          <p className="text-muted-foreground">
            We couldn't generate questions for this PDF. Please try uploading a different file.
          </p>
          <Button onClick={() => setLocation("/upload")} data-testid="button-back-upload">
            Upload Another PDF
          </Button>
        </Card>
      </div>
    );
  }

  if (quizCompleted) {
    const accuracy = Math.round((correctCount / questions.length) * 100);
    
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto p-12 text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-6 bg-primary/10 rounded-full">
              <Trophy className="h-16 w-16 text-primary" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="font-heading text-4xl font-bold">Quiz Complete!</h2>
            <p className="text-xl text-muted-foreground">
              Great job on finishing the quiz
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto py-6">
            <div className="space-y-1">
              <div className="font-heading text-4xl font-bold text-primary" data-testid="text-score">
                {correctCount}/{questions.length}
              </div>
              <div className="text-sm text-muted-foreground">Correct Answers</div>
            </div>
            <div className="space-y-1">
              <div className="font-heading text-4xl font-bold text-primary" data-testid="text-accuracy">
                {accuracy}%
              </div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button onClick={() => setLocation("/")} variant="outline" data-testid="button-home">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
            <Button onClick={() => setLocation("/upload")} data-testid="button-new-quiz">
              <RotateCw className="h-4 w-4 mr-2" />
              New Quiz
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <QuizInterface
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        selectedAnswer={selectedAnswer}
        onAnswerSelect={setSelectedAnswer}
        onSubmitAnswer={handleSubmitAnswer}
        isSubmitting={submitAnswerMutation.isPending}
        isAnswerCorrect={
          showFeedback && selectedAnswer !== null
            ? selectedAnswer === questions[currentQuestionIndex].correctAnswer
            : null
        }
        showFeedback={showFeedback}
      />
    </div>
  );
}
