import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Upload from "@/pages/upload";
import Quiz from "@/pages/quiz";
import Dashboard from "@/pages/dashboard";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Switch>
          {isLoading || !isAuthenticated ? (
            <>
              <Route path="/" component={Landing} />
              <Route path="/upload" component={Upload} />
              <Route path="/quiz/:pdfId" component={Quiz} />
            </>
          ) : (
            <>
              <Route path="/" component={Landing} />
              <Route path="/upload" component={Upload} />
              <Route path="/quiz/:pdfId" component={Quiz} />
              <Route path="/dashboard" component={Dashboard} />
            </>
          )}
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
