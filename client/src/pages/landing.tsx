import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Upload, MessageSquare, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  <Sparkles className="h-4 w-4" />
                  AI-Powered Learning
                </div>
                <h1 className="font-heading text-5xl md:text-6xl font-bold leading-tight">
                  Your AI Tutor,
                  <br />
                  <span className="text-primary">Always Ready to Help</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Upload your study materials and learn with a friendly AI avatar that provides warm, 
                  supportive explanations exactly when you need them.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                {!isLoading && !isAuthenticated && (
                  <>
                    <Button
                      size="lg"
                      onClick={() => window.location.href = "/api/login"}
                      className="gap-2"
                      data-testid="button-hero-signin"
                    >
                      Sign Up Free
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Link href="/upload">
                      <Button size="lg" variant="outline" data-testid="button-hero-guest">
                        Try as Guest
                      </Button>
                    </Link>
                  </>
                )}
                {!isLoading && isAuthenticated && (
                  <Link href="/upload">
                    <Button size="lg" className="gap-2" data-testid="button-hero-upload">
                      Start Learning
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="space-y-1">
                  <div className="font-heading text-3xl font-bold text-primary">10k+</div>
                  <div className="text-sm text-muted-foreground">Concepts Learned</div>
                </div>
                <div className="space-y-1">
                  <div className="font-heading text-3xl font-bold text-primary">95%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-purple-500/30 rounded-3xl blur-3xl"></div>
                <Card className="relative p-8 backdrop-blur-sm bg-card/50">
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                    <Brain className="h-32 w-32 text-white" />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 md:px-8 py-16">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-heading text-4xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to personalized learning
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 space-y-4 hover-elevate transition-all">
              <div className="p-3 bg-primary/10 rounded-xl w-fit">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading text-2xl font-semibold">Upload PDFs</h3>
              <p className="text-muted-foreground leading-relaxed">
                Upload your study materials, notes, or textbooks. Our AI extracts key concepts automatically.
              </p>
            </Card>

            <Card className="p-8 space-y-4 hover-elevate transition-all">
              <div className="p-3 bg-chart-2/10 rounded-xl w-fit">
                <MessageSquare className="h-8 w-8 text-chart-2" />
              </div>
              <h3 className="font-heading text-2xl font-semibold">Take Quizzes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Answer AI-generated questions. When you get one wrong, our avatar tutor explains it warmly.
              </p>
            </Card>

            <Card className="p-8 space-y-4 hover-elevate transition-all">
              <div className="p-3 bg-purple-500/10 rounded-xl w-fit">
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="font-heading text-2xl font-semibold">Track Progress</h3>
              <p className="text-muted-foreground leading-relaxed">
                Monitor your learning journey. We identify weak areas and help you improve over time.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 md:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
            <div className="text-center space-y-6">
              <h2 className="font-heading text-4xl font-bold">Ready to Start Learning?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of students who are learning smarter with AI-powered tutoring
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                {!isLoading && !isAuthenticated && (
                  <>
                    <Button
                      size="lg"
                      onClick={() => window.location.href = "/api/login"}
                      data-testid="button-cta-signin"
                    >
                      Get Started Free
                    </Button>
                    <Link href="/upload">
                      <Button size="lg" variant="outline" data-testid="button-cta-guest">
                        Try Without Account
                      </Button>
                    </Link>
                  </>
                )}
                {!isLoading && isAuthenticated && (
                  <Link href="/upload">
                    <Button size="lg" data-testid="button-cta-upload">
                      Upload Your First PDF
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
