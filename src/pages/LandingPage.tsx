import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-5" />
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
                onClick={() => navigate("/auth")}
              >
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
