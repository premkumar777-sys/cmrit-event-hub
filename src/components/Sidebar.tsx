import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  ClipboardCheck,
  Users,
  QrCode,
  Award,
  BarChart3,
  Settings,
  Plus,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

type RoleType = "student" | "organizer" | "faculty" | "hod" | "admin";

interface SidebarProps {
  role: RoleType;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: RoleType[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["student", "organizer", "faculty", "hod", "admin"],
  },
  {
    label: "Browse Events",
    href: "/events",
    icon: Calendar,
    roles: ["student"],
  },
  {
    label: "My Registrations",
    href: "/registrations",
    icon: FileText,
    roles: ["student"],
  },
  {
    label: "Create Event",
    href: "/create-event",
    icon: Plus,
    roles: ["organizer"],
  },
  {
    label: "My Events",
    href: "/my-events",
    icon: Calendar,
    roles: ["organizer"],
  },
  {
    label: "Approval Requests",
    href: "/approvals",
    icon: ClipboardCheck,
    roles: ["faculty", "hod", "admin"],
  },
  {
    label: "QR Scanner",
    href: "/scanner",
    icon: QrCode,
    roles: ["organizer", "faculty", "hod"],
  },
  {
    label: "Certificates",
    href: "/certificates",
    icon: Award,
    roles: ["student"],
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    roles: ["organizer", "faculty", "hod", "admin"],
  },
  {
    label: "Manage Users",
    href: "/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["student", "organizer", "faculty", "hod", "admin"],
  },
];

export function Sidebar({ role, isOpen = true, onClose }: SidebarProps) {
  const location = useLocation();
  
  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      
      <aside
        className={cn(
          "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-sidebar transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="flex flex-col gap-1 p-4">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
