import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  TrendingUp, 
  Target, 
  Award, 
  Flame, 
  BookOpen,
  Loader2,
  AlertCircle
} from "lucide-react";
import type { QuizSession, ConceptWithStats, Pdf } from "@shared/schema";

interface DashboardData {
  totalQuizzes: number;
  averageAccuracy: number;
  weakConcepts: ConceptWithStats[];
  recentSessions: (QuizSession & { pdf: Pdf })[];
  streak: number;
}

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
    enabled: isAuthenticated,
  });

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="container mx-auto px-4 py-24">
        <Card className="max-w-2xl mx-auto p-12 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="font-heading text-2xl font-semibold">No Data Yet</h2>
          <p className="text-muted-foreground">
            Start learning by uploading your first PDF
          </p>
          <Button onClick={() => setLocation("/upload")} data-testid="button-start-learning">
            Upload PDF
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="font-heading text-4xl font-bold">
            Welcome back, {user?.firstName || "Learner"}!
          </h1>
          <p className="text-xl text-muted-foreground">
            Here's your learning progress
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-sm text-muted-foreground">Total Quizzes</span>
            </div>
            <div className="font-heading text-3xl font-bold" data-testid="stat-total-quizzes">
              {dashboardData.totalQuizzes}
            </div>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Target className="h-8 w-8 text-chart-2" />
              <span className="text-sm text-muted-foreground">Accuracy</span>
            </div>
            <div className="font-heading text-3xl font-bold" data-testid="stat-accuracy">
              {Math.round(dashboardData.averageAccuracy)}%
            </div>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Flame className="h-8 w-8 text-chart-4" />
              <span className="text-sm text-muted-foreground">Streak</span>
            </div>
            <div className="font-heading text-3xl font-bold" data-testid="stat-streak">
              {dashboardData.streak} days
            </div>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Award className="h-8 w-8 text-purple-500" />
              <span className="text-sm text-muted-foreground">Weak Areas</span>
            </div>
            <div className="font-heading text-3xl font-bold" data-testid="stat-weak-concepts">
              {dashboardData.weakConcepts.length}
            </div>
          </Card>
        </div>

        {/* Weak Concepts */}
        {dashboardData.weakConcepts.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold">Focus On These Concepts</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {dashboardData.weakConcepts.slice(0, 6).map((concept) => (
                <Card key={concept.id} className="p-6 hover-elevate transition-all">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <h3 className="font-semibold" data-testid={`concept-name-${concept.id}`}>
                          {concept.conceptName}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {concept.conceptDescription}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {concept.incorrectCount}/{concept.totalQuestions}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        {dashboardData.recentSessions.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-heading text-2xl font-semibold">Recent Quizzes</h2>
            <div className="space-y-3">
              {dashboardData.recentSessions.slice(0, 5).map((session) => {
                const accuracy = Math.round((session.correctAnswers / session.totalQuestions) * 100);
                
                return (
                  <Card key={session.id} className="p-6 hover-elevate transition-all">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <h3 className="font-semibold" data-testid={`session-pdf-${session.id}`}>
                          {session.pdf.fileName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.createdAt!).toLocaleDateString()} at{" "}
                          {new Date(session.createdAt!).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="font-heading text-2xl font-bold" data-testid={`session-score-${session.id}`}>
                            {session.correctAnswers}/{session.totalQuestions}
                          </div>
                          <div className="text-xs text-muted-foreground">Score</div>
                        </div>
                        <div className="text-center">
                          <div
                            className={`font-heading text-2xl font-bold ${
                              accuracy >= 80 ? "text-chart-2" : accuracy >= 60 ? "text-chart-4" : "text-destructive"
                            }`}
                            data-testid={`session-accuracy-${session.id}`}
                          >
                            {accuracy}%
                          </div>
                          <div className="text-xs text-muted-foreground">Accuracy</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <Card className="p-8 bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="font-heading text-2xl font-semibold">Keep Learning!</h3>
              <p className="text-muted-foreground">
                Upload a new PDF to continue your learning journey
              </p>
            </div>
            <Button size="lg" onClick={() => setLocation("/upload")} data-testid="button-upload-new">
              <TrendingUp className="h-4 w-4 mr-2" />
              Upload New PDF
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
