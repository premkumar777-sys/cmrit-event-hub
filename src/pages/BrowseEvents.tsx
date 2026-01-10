import { useEffect, useState } from "react";
import { EventCard } from "@/components/EventCard";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useEventRegistration } from "@/hooks/useEventRegistration";
import { Button } from "@/components/ui/button";

export default function BrowseEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const { registerForEvent, isRegistered } = useEventRegistration();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('events')
        .select('*, organizer:profiles(full_name, email)')
        .eq('status', 'approved')
        .order('date', { ascending: true });
      // Merge seed events in development so dev environment shows example events
      let merged = data || [];
      if (process.env.NODE_ENV === 'development') {
        try {
          const seedModule = await import("@/data/seedEvents");
          const seedEvents = seedModule.seedEvents || [];
          const existingIds = new Set((merged || []).map((e: any) => e.id));
          merged = [...merged, ...seedEvents.filter((s: any) => !existingIds.has(s.id))] as any[];
        } catch (e) {
          // ignore if seed module not present
        }
      }

      setEvents(merged);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = events.filter(e => (e.title || '').toLowerCase().includes(query.toLowerCase()) || (e.description || '').toLowerCase().includes(query.toLowerCase()));

  const { profile } = useUserProfile();
  const { user } = useAuth();
  const { primaryRole } = useUserRole();
  const navigate = useNavigate();

  const dashboardLayoutUser = user ? {
    name: profile?.full_name || user?.email?.split('@')[0] || "Guest",
    email: user?.email || "",
    role: "student" as const // Fallback to student for guest view
  } : { name: 'Guest', email: '', role: 'student' as const };

  return (
    <DashboardLayout user={dashboardLayoutUser}>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Browse Events</h1>
            <p className="text-muted-foreground mt-1">Explore approved events and register.</p>
          </div>
          {user && (primaryRole === 'organizer' || primaryRole === 'faculty' || primaryRole === 'hod' || primaryRole === 'admin') && (
            <div>
              <Button onClick={() => navigate('/create-event')} className="gap-2">
                <Plus className="w-4 h-4" />
                Schedule Event
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Input placeholder="Search events" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Button variant="outline" onClick={() => setQuery('')}>Clear</Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground">No events found.</p>
          ) : (
            filtered.map(ev => (
              <EventCard
                key={ev.id}
                {...ev}
                onRegister={() => {
                  if (ev.register_url) {
                    window.open(ev.register_url, '_blank');
                    return;
                  }
                  // Pass the prompt organizer name or a fallback
                  const orgName = ev.organizer?.full_name || ev.organizer?.email?.split('@')[0] || "Organizer";
                  registerForEvent(ev, orgName);
                }}
              />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
