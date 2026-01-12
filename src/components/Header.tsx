import { Menu, User, LogOut, Plus, Bell, Check, Clock, Info } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RoleBadge } from "@/components/ui/role-badge";
import SettingsDialog from "@/components/SettingsDialog";
import { cn } from "@/lib/utils";

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    role: "student" | "organizer" | "faculty" | "hod" | "admin" | "canteen_admin";
    avatar?: string;
  };
  onMenuClick?: () => void;
  onLogout?: () => void;
  notificationCount?: number;
  className?: string;
}

export function Header({
  user,
  onMenuClick,
  onLogout,
  notificationCount = 3, // Defaulting to 3 for static demo
  className,
}: HeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const isDev = (import.meta as any).env?.DEV ?? false;
  const schedulePath = isDev ? '/create-event/dev' : '/create-event';
  const showScheduleCTA = !!(user?.role === 'organizer' || isDev);

  const notifications = [
    {
      id: 1,
      title: "Event Approved",
      description: "Tech Sprint 2024 has been approved by HOD.",
      time: "2 hours ago",
      icon: Check,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      id: 2,
      title: "New Registration",
      description: "John Doe registered for AI Workshop.",
      time: "5 hours ago",
      icon: User,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      id: 3,
      title: "Reminder",
      description: "Department meeting at 2 PM tomorrow.",
      time: "1 day ago",
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      id: 4,
      title: "System Update",
      description: "Maintenance scheduled for Saturday night.",
      time: "2 days ago",
      icon: Info,
      color: "text-gray-500",
      bg: "bg-gray-500/10",
    },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container flex h-16 items-center gap-4 px-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-transparent text-primary-foreground font-bold text-lg overflow-hidden">
            <img src="/logos/logo.jpg" alt="CMRIT Logo" className="w-full h-full object-cover" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold leading-none">CMRIT Events</h1>
            <p className="text-xs text-muted-foreground">Powered by Google</p>

          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {showScheduleCTA && (
            <Button
              onClick={() => navigate(schedulePath)}
              title={isDev && !user ? "Schedule Event (dev preview)" : "Schedule Event"}
              className="gap-2 bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Schedule Event</span>
            </Button>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-medium flex items-center justify-center">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="p-4 border-b">
                <h4 className="font-semibold leading-none">Notifications</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  You have {notificationCount} unread messages
                </p>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="grid gap-1 p-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start gap-4 p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
                    >
                      <div className={`mt-1 p-2 rounded-full ${notification.bg} ${notification.color}`}>
                        <notification.icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{notification.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.description}
                        </p>
                        <p className="text-[10px] text-muted-foreground pt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-2 border-t text-center">
                <Button variant="ghost" size="sm" className="w-full text-xs h-8">
                  Mark all as read
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-2">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <RoleBadge role={user.role} />
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} user={user} />
        </div>
      </div>
    </header>
  );
}
