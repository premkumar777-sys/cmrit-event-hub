import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getClubById, clubs } from "@/data/clubs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EventCard } from "@/components/EventCard";
import {
  ArrowLeft,
  Calendar,
  Users,
  Mail,
  Clock,
  CalendarDays,
  MapPin,
} from "lucide-react";

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
  poster_url: string | null;
  organizer_id: string;
}

interface ClubStats {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalRegistrations: number;
}

export default function ClubPage() {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrationCounts, setRegistrationCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ClubStats>({
    totalEvents: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    totalRegistrations: 0,
  });

  const location = useLocation();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const club = clubId ? getClubById(clubId) : null;

  const handleRegister = (event: Event) => {
    const externalUrl = (event as any).register_url as string | undefined;
    if (externalUrl) {
      window.open(externalUrl, "_blank", "noopener,noreferrer");
      return;
    }
    navigate("/auth");
  };

  const handleViewDetailsLocal = (event: Event) => {
    setSelectedEvent(event);
  };

  useEffect(() => {
    if (!club) return;

    const fetchClubData = async () => {
      setLoading(true);
      try {
        // Find organizers with matching email pattern for this club
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email")
          .ilike("email", `%${club.email.split("@")[0]}%`);

        const organizerIds = profiles?.map((p) => p.id) || [];

        if (organizerIds.length === 0) {
          // If no exact match, try fetching events by category match
          const { data: eventsByCategory } = await supabase
            .from("events")
            .select("*")
            .in("status", ["approved", "completed"])
            .ilike("category", `%${club.category}%`)
            .order("date", { ascending: false })
            .limit(10);

          // Start with events found by category
          let clubEvents = (eventsByCategory as Event[]) || [];

          // In development, also merge any seed events explicitly for this club (Fine Arts or GDG)
          if (process.env.NODE_ENV === "development") {
            try {
              const seedModule = await import("@/data/seedEvents");
              const seedEvents = seedModule.seedEvents || [];
              const matchingSeed = seedEvents.filter((s: any) => (s.organizer_id === "seed:fine-arts" && club.id === "fine-arts-club") || (s.organizer_id === "seed:gdg" && club.id === "gdg"));

              const existingIds = new Set(clubEvents.map((e) => e.id));
              const seedAsEvents = matchingSeed.map((s: any) => ({
                id: s.id,
                title: s.title,
                description: s.description,
                date: s.date,
                time: s.time || null,
                venue: s.venue,
                department: s.department || null,
                category: s.category || null,
                status: s.status as any,
                poster_url: s.poster_url || null,
                organizer_id: s.organizer_id,
              }));

              clubEvents = [...seedAsEvents.filter((s) => !existingIds.has(s.id)), ...clubEvents];
            } catch (e) {
              // ignore
            }
          }

          // Set events and compute stats & registration counts same as organizer branch
          setEvents(clubEvents);

          // If the page was opened with an eventId in state (e.g., from the seed event), show it
          const eventIdFromState = (location.state as any)?.eventId;
          if (eventIdFromState) {
            const found = clubEvents.find((e) => e.id === eventIdFromState);
            if (found) setSelectedEvent(found);
          }

          const today = new Date().toISOString().split("T")[0];
          const upcoming = clubEvents.filter((e) => e.date >= today && e.status === "approved");
          const completed = clubEvents.filter((e) => e.status === "completed" || e.date < today);

          const eventIds = clubEvents.map((e) => e.id);
          if (eventIds.length > 0) {
            const { data: registrations } = await supabase
              .from("registrations")
              .select("event_id")
              .in("event_id", eventIds);

            const counts: Record<string, number> = {};
            let total = 0;
            registrations?.forEach((reg) => {
              counts[reg.event_id] = (counts[reg.event_id] || 0) + 1;
              total++;
            });
            setRegistrationCounts(counts);

            setStats({
              totalEvents: clubEvents.length,
              upcomingEvents: upcoming.length,
              completedEvents: completed.length,
              totalRegistrations: total,
            });
          }

          setLoading(false);
          return;
        }

        // Fetch events by organizer
        const { data: eventsData, error } = await supabase
          .from("events")
          .select("*")
          .in("organizer_id", organizerIds)
          .in("status", ["approved", "completed"])
          .order("date", { ascending: false });

        if (error) throw error;

        let clubEvents = (eventsData as Event[]) || [];

        // In development, merge local seed events that match this club
        if (process.env.NODE_ENV === "development") {
          try {
            const seedModule = await import("@/data/seedEvents");
            const seedEvents = seedModule.seedEvents || [];
            const matchingSeed = seedEvents.filter((s: any) => (s.organizer_id === "seed:fine-arts" && club.id === "fine-arts-club") || (s.organizer_id === "seed:gdg" && club.id === "gdg"));

            // convert to Event shape where necessary and dedupe
            const existingIds = new Set(clubEvents.map((e) => e.id));
            const seedAsEvents = matchingSeed.map((s: any) => ({
              id: s.id,
              title: s.title,
              description: s.description,
              date: s.date,
              time: s.time || null,
              venue: s.venue,
              department: s.department || null,
              category: s.category || null,
              status: s.status as any,
              poster_url: s.poster_url || null,
              organizer_id: s.organizer_id,
            }));

            clubEvents = [...seedAsEvents.filter((s) => !existingIds.has(s.id)), ...clubEvents];
          } catch (e) {
            // ignore
          }
        }

        setEvents(clubEvents);

        // If the page was opened with an eventId in state (e.g., from the seed event), show it
        const eventIdFromState = (location.state as any)?.eventId;
        if (eventIdFromState) {
          const found = clubEvents.find((e) => e.id === eventIdFromState);
          if (found) setSelectedEvent(found);
        }

        // Calculate stats
        const today = new Date().toISOString().split("T")[0];
        const upcoming = clubEvents.filter((e) => e.date >= today && e.status === "approved");
        const completed = clubEvents.filter((e) => e.status === "completed" || e.date < today);

        // Handlers for club page actions
        const handleRegister = (event: Event) => {
          const externalUrl = (event as any).register_url as string | undefined;
          if (externalUrl) {
            window.open(externalUrl, "_blank", "noopener,noreferrer");
            return;
          }
          // Fallback: navigate to auth (or registration flow)
          navigate("/auth");
        };

        const handleViewDetailsLocal = (event: Event) => {
          setSelectedEvent(event);
        };

        // Fetch registration counts
        const eventIds = clubEvents.map((e) => e.id);
        if (eventIds.length > 0) {
          const { data: registrations } = await supabase
            .from("registrations")
            .select("event_id")
            .in("event_id", eventIds);

          const counts: Record<string, number> = {};
          let total = 0;
          registrations?.forEach((reg) => {
            counts[reg.event_id] = (counts[reg.event_id] || 0) + 1;
            total++;
          });
          setRegistrationCounts(counts);

          setStats({
            totalEvents: clubEvents.length,
            upcomingEvents: upcoming.length,
            completedEvents: completed.length,
            totalRegistrations: total,
          });
        }
      } catch (error) {
        console.error("Error fetching club data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubData();
  }, [club]);

  if (!club) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center p-8">
          <h2 className="text-xl font-semibold mb-2">Club Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The club you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/")}>Go to Home</Button>
        </Card>
      </div>
    );
  }

  const Icon = club.icon;
  const today = new Date().toISOString().split("T")[0];
  const upcomingEvents = events.filter((e) => e.date >= today);
  const pastEvents = events.filter((e) => e.date < today);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className={`${club.bgColor} text-white`}>
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-white/80 hover:text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm overflow-hidden">
              {club.logoUrl ? (
                <img src={club.logoUrl} alt={club.name} className="w-full h-full object-contain p-2" />
              ) : (
                <Icon className="w-10 h-10" />
              )}
            </div>
            <div className="flex-1">
              <Badge variant="secondary" className="mb-2 bg-white/20 text-white border-0">
                {club.category}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold mb-1">{club.name}</h1>
              <p className="text-white/90 text-lg">{club.fullName}</p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/auth")}
              className="gap-2"
            >
              <Mail className="w-4 h-4" />
              Join Club
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">About {club.name}</h2>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {club.description}
                </p>
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    <span>Founded in {club.foundedYear}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{club.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Upcoming Events
              </h2>
              {loading ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <Card key={i} className="p-4">
                      <Skeleton className="h-32 w-full mb-4" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  {/* If a specific event is selected via state, show its full details here */}
                  {selectedEvent && (
                    <Card className="mb-6">
                      <CardHeader>
                        <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">{selectedEvent.description}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />{selectedEvent.date}</div>
                          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />{selectedEvent.time || 'TBD'}</div>
                          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />{selectedEvent.venue}</div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {upcomingEvents.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {upcomingEvents.map((event) => (
                        <EventCard
                          key={event.id}
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
                          onRegister={() => handleRegister(event)}
                          onViewDetails={() => handleViewDetailsLocal(event)}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card className="p-8 text-center">
                      <Clock className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">
                        No upcoming events scheduled. Check back soon!
                      </p>
                    </Card>
                  )}
                </>
              )}
            </div>

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  Past Events
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {pastEvents.slice(0, 4).map((event) => (
                    <EventCard
                      key={event.id}
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
                      showActions={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Club Statistics</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Total Events</span>
                  </div>
                  <span className="font-semibold">{stats.totalEvents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Upcoming</span>
                  </div>
                  <span className="font-semibold text-primary">{stats.upcomingEvents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Total Registrations</span>
                  </div>
                  <span className="font-semibold">{stats.totalRegistrations}</span>
                </div>
              </CardContent>
            </Card>

            {/* Other Clubs */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Explore Other Clubs</h3>
              </CardHeader>
              <CardContent className="space-y-2">
                {clubs
                  .filter((c) => c.id !== club.id)
                  .slice(0, 5)
                  .map((otherClub) => {
                    const OtherIcon = otherClub.icon;
                    return (
                      <Button
                        key={otherClub.id}
                        variant="ghost"
                        className="w-full justify-start gap-3"
                        onClick={() => navigate(`/clubs/${otherClub.id}`)}
                      >
                        <div className={`p-1.5 rounded-lg ${otherClub.logoUrl ? 'bg-white' : otherClub.bgColor} overflow-hidden`}>
                          {otherClub.logoUrl ? (
                            <img src={otherClub.logoUrl} alt={otherClub.name} className="w-4 h-4 object-contain" />
                          ) : (
                            <OtherIcon className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <span className="truncate">{otherClub.name}</span>
                      </Button>
                    );
                  })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
