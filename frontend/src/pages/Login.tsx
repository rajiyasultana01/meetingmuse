import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { authAPI } from "@/lib/api";
import { Loader2 } from "lucide-react";
import heroImage from "@/assets/hero-background.jpg";
import { auth } from "@/config/firebase";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Sign in with Firebase
      await login(email, password);
      await saveTokenForExtension();

      toast({
        title: "Success!",
        description: "You have successfully logged in.",
      });

      // Get user profile to check role
      try {
        const { data: profile } = await authAPI.getCurrentUser();

        // Redirect based on role
        if (profile.role === 'admin') {
          navigate("/admin");
        } else {
          navigate("/userdashboard");
        }
      } catch (err) {
        // If profile fetch fails, just go to user dashboard
        navigate("/userdashboard");
      }
    } catch (error: any) {
      console.error('Login error:', error);

      let errorMessage = error.message || "Invalid email or password";

      // Handle Firebase errors
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address.";
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = "This account has been disabled.";
      }

      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);

    try {
      await loginWithGoogle();
      await saveTokenForExtension();

      toast({
        title: "Success!",
        description: "You have successfully logged in with Google.",
      });

      // Get user profile to check role
      try {
        const { data: profile } = await authAPI.getCurrentUser();

        // Redirect based on role
        if (profile.role === 'admin') {
          navigate("/admin");
        } else {
          navigate("/userdashboard");
        }
      } catch (err) {
        // If profile fetch fails, just go to user dashboard
        navigate("/userdashboard");
      }
    } catch (error: any) {
      console.error('Google login error:', error);

      let errorMessage = error.message || "Failed to sign in with Google";

      // Handle Firebase errors
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in popup was closed before completion.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = "Sign-in was cancelled.";
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Sign-in popup was blocked by your browser.";
      }

      toast({
        title: "Google sign-in failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Helper to save token for extension
  const saveTokenForExtension = async () => {
    try {
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken(true);
        localStorage.setItem('meetingmuse_extension_token', token);
        localStorage.setItem('meetingmuse_user_email', auth.currentUser.email || '');
        localStorage.setItem('meetingmuse_user_uid', auth.currentUser.uid);
        console.log('Token saved for extension access');
      }
    } catch (e) {
      console.error('Failed to save token for extension:', e);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/40" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <h1 className="text-5xl font-bold font-playfair mb-4">
            Welcome to MeetingMind
          </h1>
          <p className="text-xl text-gray-200">
            Transform your meetings into actionable insights with AI-powered summaries.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md p-8 shadow-soft">
          <div className="mb-8">
            <h2 className="text-3xl font-bold font-playfair mb-2">Let's get started!</h2>
            <p className="text-muted-foreground">
              Sign in to access your meeting summaries
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl shadow-soft hover:shadow-hover transition-all"
              size="lg"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl"
            size="lg"
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in with Google...
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </>
            )}
          </Button>

          <div className="mt-6 text-center space-y-2">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Forgot your password?
            </a>
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <a href="/signup" className="text-foreground font-medium hover:underline">
                Sign up
              </a>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              Create an account to get started with MeetingMind
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
