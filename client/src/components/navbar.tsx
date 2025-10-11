import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { Brain, LogOut, User, Upload, BarChart3 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-lg px-3 py-2 -ml-3">
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-heading text-xl font-semibold">AI Tutor</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {!isLoading && (
              <>
                <Link href="/upload" data-testid="link-upload">
                  <Button variant="ghost" className="gap-2">
                    <Upload className="h-4 w-4" />
                    <span className="hidden sm:inline">Upload</span>
                  </Button>
                </Link>
                <Link href="/dashboard" data-testid="link-dashboard">
                  <Button variant="ghost" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Progress</span>
                  </Button>
                </Link>
              </>
            )}
            {!isLoading && isAuthenticated && user && (
              <div className="flex items-center gap-3 ml-2">
                <Avatar className="h-8 w-8" data-testid="avatar-user">
                  <AvatarImage src={user.profileImageUrl || undefined} style={{ objectFit: "cover" }} />
                  <AvatarFallback>
                    {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.location.href = "/api/logout"}
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Log out</span>
                </Button>
              </div>
            )}
            {!isLoading && !isAuthenticated && (
              <Button
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-login"
              >
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
