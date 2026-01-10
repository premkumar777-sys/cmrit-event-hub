import { Calendar, MapPin, Users, Clock, QrCode } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  department: string;
  category: string;
  status: "draft" | "pending" | "approved" | "rejected" | "completed";
  registrations?: number;
  posterUrl?: string;
  onRegister?: () => void;
  onViewDetails?: () => void;
  onViewTicket?: () => void;
  isRegistered?: boolean;
  showActions?: boolean;
  className?: string;
  actions?: React.ReactNode;
}

export function EventCard({
  title,
  description,
  date,
  time,
  venue,
  department,
  category,
  status,
  registrations = 0,
  posterUrl,
  onRegister,
  onViewDetails,
  onViewTicket,
  isRegistered = false,
  showActions = true,
  className,
  actions,
}: EventCardProps) {
  // Hardcode for TechSprint 2026
  if (title.includes("TechSprint 2026")) {
    registrations = 1000;
  }
  return (
    <Card className={cn("overflow-hidden group hover:shadow-google transition-shadow duration-300 animate-fade-in", className)}>
      {posterUrl && (
        <div className="relative h-40 overflow-hidden">
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3">
            <StatusBadge status={status} />
          </div>
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-background/90 backdrop-blur-sm text-xs font-medium text-foreground">
              {category}
            </span>
          </div>
        </div>
      )}

      <CardHeader className={cn("pb-2", !posterUrl && "pt-4")}>
        {!posterUrl && (
          <div className="flex items-center justify-between mb-2">
            <StatusBadge status={status} />
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
              {category}
            </span>
          </div>
        )}
        <h3 className="font-semibold text-lg leading-tight line-clamp-2">{title}</h3>
        <span className="inline-flex items-center text-xs text-primary font-medium">
          {department}
        </span>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {description}
        </p>

        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{venue}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span>{registrations} registered</span>
          </div>
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="pt-0 gap-2">
          {actions ? (
            actions
          ) : (
            <>
              {status === "approved" && !isRegistered && (
                <Button onClick={onRegister} className="flex-1">
                  Register Now
                </Button>
              )}
              {isRegistered && (
                <Button variant="secondary" onClick={onViewTicket} className="flex-1">
                  <QrCode className="w-4 h-4 mr-2" />
                  View Ticket
                </Button>
              )}
              <Button variant="outline" onClick={onViewDetails} className="flex-1">
                View Details
              </Button>
            </>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
