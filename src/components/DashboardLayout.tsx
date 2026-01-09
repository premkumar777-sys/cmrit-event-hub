import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    role: "student" | "organizer" | "faculty" | "hod" | "admin";
    avatar?: string;
  };
  onLogout?: () => void;
}

export function DashboardLayout({ children, user, onLogout }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await signOut();
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onMenuClick={() => setSidebarOpen(true)}
        onLogout={handleLogout}
        notificationCount={3}
      />
      <Sidebar
        role={user.role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main
        className={cn(
          "min-h-[calc(100vh-4rem)] transition-all duration-300",
          "md:ml-64 p-4 md:p-6"
        )}
      >
        {children}
      </main>
    </div>
  );
}
