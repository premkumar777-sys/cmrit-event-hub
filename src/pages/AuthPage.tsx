import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { GraduationCap, Users, BookOpen, ArrowLeft } from "lucide-react";

type RoleType = "student" | "organizer" | "faculty";

const roleConfig: Record<RoleType, {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  emailPattern: RegExp;
  emailPlaceholder: string;
  emailHint: string;
  emailError: string;
}> = {
  student: {
    title: "Student",
    icon: GraduationCap,
    color: "bg-role-student",
    emailPattern: /^[0-9]{2}[A-Za-z][0-9]{2}[A-Za-z][0-9]{4}@cmrithyderabad\.edu\.in$/,
    emailPlaceholder: "22B81A0501@cmrithyderabad.edu.in",
    emailHint: "Use your roll number (e.g., 22B81A0501@cmrithyderabad.edu.in)",
    emailError: "Invalid student email. Format: RollNo@cmrithyderabad.edu.in",
  },
  organizer: {
    title: "Club Organizer",
    icon: Users,
    color: "bg-role-organizer",
    emailPattern: /^[a-zA-Z]+@cmrithyderabad\.edu\.in$/,
    emailPlaceholder: "coding@cmrithyderabad.edu.in",
    emailHint: "Use your club email (e.g., coding@cmrithyderabad.edu.in)",
    emailError: "Invalid club email. Format: clubname@cmrithyderabad.edu.in",
  },
  faculty: {
    title: "Faculty / HoD / Director",
    icon: BookOpen,
    color: "bg-role-faculty",
    emailPattern: /^[a-zA-Z]+(\.[a-zA-Z]+)*@cmrithyderabad\.edu\.in$/,
    emailPlaceholder: "john.doe@cmrithyderabad.edu.in",
    emailHint: "Use your faculty email (e.g., name@cmrithyderabad.edu.in)",
    emailError: "Invalid faculty email. Format: name@cmrithyderabad.edu.in",
  },
};

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Get role from URL params
  const roleParam = searchParams.get("role") as RoleType | null;
  const role: RoleType = roleParam && roleConfig[roleParam] ? roleParam : "student";
  const config = roleConfig[role];
  const Icon = config.icon;
  
  // Form states
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [emailError, setEmailError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const validateEmail = (email: string): boolean => {
    // Check domain first
    if (!email.endsWith("@cmrithyderabad.edu.in")) {
      setEmailError("Only @cmrithyderabad.edu.in emails are allowed");
      return false;
    }
    
    // Check role-specific pattern
    if (!config.emailPattern.test(email)) {
      setEmailError(config.emailError);
      return false;
    }
    
    setEmailError("");
    return true;
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(signInEmail)) {
      toast({
        title: "Invalid email format",
        description: emailError || config.emailError,
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    const { error } = await signInWithEmail(signInEmail, signInPassword);
    
    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome!",
        description: "You have successfully signed in.",
      });
      navigate("/dashboard");
    }
    setIsLoading(false);
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(signUpEmail)) {
      toast({
        title: "Invalid email format",
        description: emailError || config.emailError,
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    const { error } = await signUpWithEmail(signUpEmail, signUpPassword, signUpName);
    
    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created!",
        description: "You have been signed in automatically.",
      });
      navigate("/dashboard");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 hero-gradient opacity-5" />
      
      <Card className="w-full max-w-md relative z-10 shadow-google animate-scale-in">
        <CardHeader className="text-center">
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-4"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          
          <div className="flex items-center justify-center gap-2 mb-4 mt-4">
            <div className={`flex items-center justify-center w-14 h-14 rounded-xl ${config.color} text-white`}>
              <Icon className="w-7 h-7" />
            </div>
          </div>
          <CardTitle className="text-2xl">{config.title} Login</CardTitle>
          <CardDescription>
            {config.emailHint}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Button
            variant="outline"
            className="w-full mb-6 h-12 gap-3 shadow-sm hover:shadow-md transition-shadow"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={config.emailPlaceholder}
                    value={signInEmail}
                    onChange={(e) => {
                      setSignInEmail(e.target.value);
                      setEmailError("");
                    }}
                    required
                  />
                  {emailError && signInEmail && (
                    <p className="text-xs text-destructive">{emailError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder={config.emailPlaceholder}
                    value={signUpEmail}
                    onChange={(e) => {
                      setSignUpEmail(e.target.value);
                      setEmailError("");
                    }}
                    required
                  />
                  {emailError && signUpEmail && (
                    <p className="text-xs text-destructive">{emailError}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{config.emailHint}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            By continuing, you agree to CMRIT's Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}