import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useEventRegistration } from "@/hooks/useEventRegistration";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RegistrationTicketDialog } from "@/components/RegistrationTicketDialog";
import { format } from "date-fns";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function StudentRegistrations() {
  const { registrations, loading, getRegistrationDetails, cancelRegistration, refreshRegistrations } = useEventRegistration();
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticket, setTicket] = useState<any | null>(null);
  const [eventsMap, setEventsMap] = useState<Record<string, any>>({});

  useEffect(() => {
    const loadEvents = async () => {
      const eventIds = registrations.map(r => r.event_id);
      if (eventIds.length === 0) {
        setEventsMap({});
        return;
      }
      const { data } = await supabase.from('events').select('*').in('id', eventIds);
      const map: Record<string, any> = {};
      (data || []).forEach(e => map[e.id] = e);
      setEventsMap(map);
    };
    loadEvents();
  }, [registrations]);

  const openTicket = async (reg: any) => {
    // Try to find organizer name from event or profile
    const event = eventsMap[reg.event_id];
    let organizerName = 'Organizer';
    if (event?.organizer_id) {
      const { data: prof } = await supabase.from('profiles').select('full_name,email').eq('id', event.organizer_id).single();
      organizerName = prof?.full_name || prof?.email || organizerName;
    }
    const details = await getRegistrationDetails(reg.id, organizerName);
    if (details) {
      setTicket(details);
      setTicketOpen(true);
    }
  };

  const handleCancel = async (reg: any) => {
    if (!confirm('Are you sure you want to cancel your registration?')) return;
    await cancelRegistration(reg.id);
    refreshRegistrations();
  };

  return (
    <DashboardLayout user={{ name: 'Student', email: '', role: 'student' }}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Registrations</h1>
          <p className="text-muted-foreground mt-1">See your registered events and download tickets.</p>
        </div>

        {loading ? (
          <div className="p-6 bg-card rounded">Loading...</div>
        ) : registrations.length === 0 ? (
          <div className="p-6 bg-card rounded">You have no registrations yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {registrations.map((r: any) => (
              <Card key={r.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{eventsMap[r.event_id]?.title || 'Event'}</div>
                      <div className="text-xs text-muted-foreground">{eventsMap[r.event_id]?.date ? format(new Date(eventsMap[r.event_id].date), 'MMM dd, yyyy') : ''}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => openTicket(r)}>View Ticket</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleCancel(r)}>Cancel</Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{eventsMap[r.event_id]?.venue || ''}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <RegistrationTicketDialog open={ticketOpen} onOpenChange={setTicketOpen} registration={ticket} />
      </div>
    </DashboardLayout>
  );
}