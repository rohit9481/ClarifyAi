import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Chrome } from "lucide-react";
import { SiGoogle } from "react-icons/si";

export function AuthDropdown() {
  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  const handleReplitLogin = () => {
    window.location.href = "/api/login";
  };

  // Check if we're on Replit (has Replit domains)
  const isOnReplit = window.location.hostname.includes("replit");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button data-testid="button-login">
          <User className="h-4 w-4 mr-2" />
          Sign In
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleGoogleLogin} data-testid="menu-google-login">
          <SiGoogle className="h-4 w-4 mr-2" />
          Sign in with Google
        </DropdownMenuItem>
        {isOnReplit && (
          <DropdownMenuItem onClick={handleReplitLogin} data-testid="menu-replit-login">
            <Chrome className="h-4 w-4 mr-2" />
            Sign in with Replit
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
