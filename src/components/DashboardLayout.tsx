import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    role: "student" | "organizer" | "faculty" | "admin";
    avatar?: string;
  };
  onLogout?: () => void;
}

export function DashboardLayout({ children, user, onLogout }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onMenuClick={() => setSidebarOpen(true)}
        onLogout={onLogout}
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
