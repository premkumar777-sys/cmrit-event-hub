import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { EventCard } from "@/components/EventCard";
import { DepartmentFilter } from "@/components/DepartmentFilter";
import { RegistrationTicketDialog } from "@/components/RegistrationTicketDialog";
import { Calendar, Award, CheckCircle, Clock, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEventRegistration } from "@/hooks/useEventRegistration";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  venue: string | null;
  department: string | null;
  category: string | null;
  status: "draft" | "pending" | "approved" | "rejected" | "completed";
  max_participants: number | null;
  poster_url: string | null;
  organizer_id: string;
}

interface OrganizerInfo {
  [key: string]: string; // organizer_id -> organizer name/club name
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { registrations, loading: regLoading, registerForEvent, isRegistered } = useEventRegistration();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [organizerNames, setOrganizerNames] = useState<OrganizerInfo>({});
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState("all");
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<{
    id: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    eventVenue: string;
    organizerName: string;
    userName: string;
    userEmail: string;
  } | null>(null);

  const [userProfile, setUserProfile] = useState<{ full_name: string; email: string } | null>(null);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();
      setUserProfile(data);
    };
    fetchProfile();
  }, [user]);

  // Fetch approved events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .in("status", ["approved", "completed"])
          .order("date", { ascending: true });

        if (error) throw error;
        setEvents(data || []);

        // Fetch organizer names for each event
        const organizerIds = [...new Set(data?.map((e) => e.organizer_id) || [])];
        if (organizerIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name, email")
            .in("id", organizerIds);

          const names: OrganizerInfo = {};
          profiles?.forEach((p) => {
            // Extract club/organizer name from email or use full_name
            const emailPrefix = p.email.split("@")[0];
            names[p.id] = p.full_name || emailPrefix;
          });
          setOrganizerNames(names);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Get registration counts for events
  const [registrationCounts, setRegistrationCounts] = useState<{ [key: string]: number }>({});
  
  useEffect(() => {
    const fetchCounts = async () => {
      if (events.length === 0) return;
      
      const { data } = await supabase
        .from("registrations")
        .select("event_id");
      
      const counts: { [key: string]: number } = {};
      data?.forEach((r) => {
        counts[r.event_id] = (counts[r.event_id] || 0) + 1;
      });
      setRegistrationCounts(counts);
    };
    fetchCounts();
  }, [events]);

  const filteredEvents = events.filter(
    (event) => selectedDept === "all" || event.department === selectedDept
  );

  const handleRegister = async (event: Event) => {
    const organizerName = organizerNames[event.organizer_id] || "Event Organizer";
    const result = await registerForEvent(event, organizerName);
    
    if (result) {
      // Show the ticket immediately after registration
      setSelectedTicket(result);
      setTicketDialogOpen(true);
    }
  };

  const handleViewTicket = (event: Event) => {
    const registration = registrations.find((r) => r.event_id === event.id);
    if (!registration) return;

    const organizerName = organizerNames[event.organizer_id] || "Event Organizer";
    
    setSelectedTicket({
      id: registration.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time || "",
      eventVenue: event.venue || "",
      organizerName,
      userName: userProfile?.full_name || "Attendee",
      userEmail: userProfile?.email || user?.email || "",
    });
    setTicketDialogOpen(true);
  };

  const userName = userProfile?.full_name || user?.email?.split("@")[0] || "Student";

  if (loading || regLoading) {
    return (
      <DashboardLayout user={{ name: userName, email: user?.email || "", role: "student" }}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={{ name: userName, email: user?.email || "", role: "student" }}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome back, {userName.split(" ")[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover and register for upcoming events across departments.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
          <StatsCard
            title="Registered Events"
            value={registrations.length}
            icon={Calendar}
          />
          <StatsCard
            title="Events Attended"
            value={0}
            icon={CheckCircle}
          />
          <StatsCard
            title="Certificates"
            value={0}
            icon={Award}
          />
          <StatsCard
            title="Upcoming"
            value={events.filter((e) => e.status === "approved").length}
            icon={Clock}
          />
        </div>

        {/* Events Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
          </div>
          
          <DepartmentFilter
            selected={selectedDept}
            onSelect={setSelectedDept}
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEvents.map((event, index) => (
              <div
                key={event.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <EventCard
                  id={event.id}
                  title={event.title}
                  description={event.description || ""}
                  date={event.date}
                  time={event.time || "TBD"}
                  venue={event.venue || "TBD"}
                  department={event.department || "General"}
                  category={event.category || "Event"}
                  status={event.status}
                  registrations={registrationCounts[event.id] || 0}
                  posterUrl={event.poster_url || undefined}
                  isRegistered={isRegistered(event.id)}
                  onRegister={() => handleRegister(event)}
                  onViewTicket={() => handleViewTicket(event)}
                  onViewDetails={() => {}}
                />
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No events found for this department.</p>
            </div>
          )}
        </div>
      </div>

      <RegistrationTicketDialog
        open={ticketDialogOpen}
        onOpenChange={setTicketDialogOpen}
        registration={selectedTicket}
      />
    </DashboardLayout>
  );
}
