import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { clubs } from "@/data/clubs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  ClipboardCheck,
  QrCode,
  Award,
  Bell,
  Shield,
  ArrowRight,
  GraduationCap,
  Users,
  BookOpen,
  Loader2,
} from "lucide-react";

const features = [
  {
    icon: ClipboardCheck,
    title: "Digital Approvals",
    description: "No more visiting cabins. Submit and track event approvals digitally.",
  },
  {
    icon: Calendar,
    title: "Event Discovery",
    description: "Browse and register for approved events across all departments.",
  },
  {
    icon: QrCode,
    title: "QR Attendance",
    description: "Quick check-in with QR codes. Accurate attendance tracking.",
  },
  {
    icon: Award,
    title: "Auto Certificates",
    description: "Receive certificates automatically after attending events.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Get reminders for registered events and approval updates.",
  },
  {
    icon: Shield,
    title: "75% Attendance Rule",
    description: "Automatic permission validation based on attendance records.",
  },
];

const roles = [
  {
    icon: GraduationCap,
    title: "Student",
    description: "Register for events, get certificates, and manage permissions.",
    color: "bg-role-student",
    roleKey: "student",
    emailHint: "RollNo@cmrithyderabad.edu.in",
  },
  {
    icon: Users,
    title: "Club Organizer",
    description: "Create events, manage registrations, and track attendance.",
    color: "bg-role-organizer",
    roleKey: "organizer",
    emailHint: "clubname@cmrithyderabad.edu.in",
  },
  {
    icon: BookOpen,
    title: "Faculty / HoD / Director",
    description: "Approve events and verify student permissions.",
    color: "bg-role-faculty",
    roleKey: "faculty",
    emailHint: "name@cmrithyderabad.edu.in",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: "Sign In Failed",
        description: error.message || "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
    }
    setIsGoogleLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-5 pointer-events-none" />
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-2xl shadow-google">
                C
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold text-foreground">CMRIT Events</h2>
                <p className="text-xs text-muted-foreground">Powered by Google</p>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 animate-fade-in">
              Smart Event &{" "}
              <span className="text-primary">Approval System</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl animate-slide-up">
              Digitize event approvals, registrations, attendance, and certificates.
              No more classroom disturbances or cabin visits.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="gap-2 shadow-google"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="gap-2"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                Sign in with Google
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete solution for managing college events from proposal to certificate.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="group hover:shadow-google transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Clubs Discovery Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Discover Campus Clubs
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join vibrant communities and participate in exciting events organized by our official clubs.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
            {clubs.map((club, index) => {
              const Icon = club.icon;
              return (
                <Card
                  key={club.id}
                  className="group hover:shadow-google transition-all duration-300 animate-fade-in cursor-pointer hover:-translate-y-1"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/clubs/${club.id}`)}
                >
                  <CardContent className="p-4 text-center">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${club.logoUrl ? 'bg-white' : club.bgColor} text-white mb-3 group-hover:scale-110 transition-transform overflow-hidden`}
                    >
                      {club.logoUrl ? (
                        <img
                          src={club.logoUrl}
                          alt={club.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{club.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{club.fullName}</p>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {club.category}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/auth")}
              className="gap-2"
            >
              Explore All Events
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Everyone
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Role-based access ensures the right tools for the right people.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {roles.map((role, index) => {
              const Icon = role.icon;
              return (
                <Card
                  key={role.title}
                  className="text-center hover:shadow-google transition-all duration-300 animate-fade-in cursor-pointer group"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => navigate(`/auth?role=${role.roleKey}`)}
                >
                  <CardContent className="p-8">
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${role.color} text-white mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{role.title}</h3>
                    <p className="text-muted-foreground mb-3">{role.description}</p>
                    <p className="text-xs text-muted-foreground/70 font-mono">{role.emailHint}</p>
                    <Button variant="ghost" size="sm" className="mt-3 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Login / Sign Up <ArrowRight className="w-3 h-3" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join CMRIT's digital event management system today.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/auth")}
            className="gap-2"
          >
            Sign in with College Email
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 CMR Institute of Technology. All rights reserved.</p>
          <p className="mt-1">Powered by Google Cloud Technologies</p>
        </div>
      </footer>
    </div>
  );
}
