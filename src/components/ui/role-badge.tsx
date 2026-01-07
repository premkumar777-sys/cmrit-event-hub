import { cn } from "@/lib/utils";
import { GraduationCap, Users, BookOpen, Shield, Crown } from "lucide-react";

type RoleType = "student" | "organizer" | "faculty" | "hod" | "admin";

interface RoleBadgeProps {
  role: RoleType;
  className?: string;
  showIcon?: boolean;
}

const roleConfig: Record<RoleType, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  student: {
    label: "Student",
    icon: GraduationCap,
    className: "bg-role-student/10 text-role-student border border-role-student/20",
  },
  organizer: {
    label: "Club Organizer",
    icon: Users,
    className: "bg-role-organizer/10 text-role-organizer border border-role-organizer/20",
  },
  faculty: {
    label: "Faculty",
    icon: BookOpen,
    className: "bg-role-faculty/10 text-role-faculty border border-role-faculty/20",
  },
  hod: {
    label: "HoD",
    icon: Crown,
    className: "bg-role-faculty/10 text-role-faculty border border-role-faculty/20",
  },
  admin: {
    label: "Admin",
    icon: Shield,
    className: "bg-role-admin/10 text-role-admin border border-role-admin/20",
  },
};

export function RoleBadge({ role, className, showIcon = true }: RoleBadgeProps) {
  const config = roleConfig[role];
  const Icon = config.icon;
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {config.label}
    </span>
  );
}
