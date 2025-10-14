import { useParams, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, MessageSquare, Mic, FileText, HelpCircle, ArrowLeft } from "lucide-react";

export default function TeachMode() {
  const { sessionId, conceptId } = useParams();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen p-8 flex items-center justify-center">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation(`/report/${sessionId}`)}
            className="mb-4"
            data-testid="button-back-report"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Report
          </Button>
          <h1 className="font-heading text-3xl font-bold text-center mb-2" data-testid="heading-choose-mode">
            Choose Teaching Mode
          </h1>
          <p className="text-center text-muted-foreground">
            How would you like to learn about this concept?
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Virtual Avatar Mode */}
          <Card className="p-8 space-y-6 hover-elevate">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
            </div>

            <div className="text-center space-y-3">
              <h2 className="font-heading text-2xl font-semibold" data-testid="heading-virtual-mode">
                Virtual Avatar Mode
              </h2>
              <p className="text-muted-foreground">
                Learn with an AI avatar that teaches through voice and visual cues. You can ask questions using your voice during the lesson.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mic className="h-4 w-4 text-purple-500" />
                <span>Voice interaction</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-purple-500" />
                <span>AI Avatar teaching</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-purple-500" />
                <span>Visual text support</span>
              </div>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              size="lg"
              onClick={() => setLocation(`/virtual-learn/${sessionId}/${conceptId}`)}
              data-testid="button-virtual-mode"
            >
              Start Virtual Learning
            </Button>
          </Card>

          {/* Text Mode */}
          <Card className="p-8 space-y-6 hover-elevate">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <MessageSquare className="h-10 w-10 text-white" />
              </div>
            </div>

            <div className="text-center space-y-3">
              <h2 className="font-heading text-2xl font-semibold" data-testid="heading-text-mode">
                Text Mode
              </h2>
              <p className="text-muted-foreground">
                Learn through detailed text explanations and interactive chat. Type your questions and get comprehensive written responses.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <span>Text-based interaction</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-blue-500" />
                <span>Detailed explanations</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <HelpCircle className="h-4 w-4 text-blue-500" />
                <span>Interactive Q&A</span>
              </div>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              size="lg"
              onClick={() => setLocation(`/text-learn/${sessionId}/${conceptId}`)}
              data-testid="button-text-mode"
            >
              Start Text Learning
            </Button>
          </Card>
        </div>

        {/* Back to Report Button */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setLocation(`/report/${sessionId}`)}
            data-testid="button-back-report-bottom"
          >
            Back to Report
          </Button>
        </div>
      </div>
    </div>
  );
}
