import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface OrganizerEventSummary {
  id: string;
  title: string;
  description: string | null;
  date: string | null;
  time: string | null;
  venue: string | null;
  category: string | null;
  department: string | null;
  status: string;
  max_participants: number | null;
  poster_url?: string | null;
}

export function useOrganizerEvents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<OrganizerEventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrationsMap, setRegistrationsMap] = useState<Record<string, number>>({});

  const fetchEvents = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, description, date, time, venue, category, department, status, max_participants, poster_url')
        .eq('organizer_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      setEvents((data || []) as OrganizerEventSummary[]);

      // Fetch registration counts for these events
      const eventIds = (data || []).map((e: any) => e.id);
      if (eventIds.length > 0) {
        const { data: regs } = await supabase
          .from('registrations')
          .select('event_id')
          .in('event_id', eventIds);

        const map: Record<string, number> = {};
        (regs || []).forEach((r: any) => {
          map[r.event_id] = (map[r.event_id] || 0) + 1;
        });
        setRegistrationsMap(map);
      } else {
        setRegistrationsMap({});
      }
    } catch (error) {
      console.error('Error fetching organizer events:', error);
      toast({ title: 'Error', description: 'Failed to load organizer events', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const refetch = async () => {
    await fetchEvents();
  };

  const closeRegistration = async (eventId: string) => {
    try {
      const { error } = await supabase.from('events').update({ registration_open: false }).eq('id', eventId);
      if (error) throw error;
      toast({ title: 'Success', description: 'Registrations closed' });
      refetch();
      return true;
    } catch (error) {
      console.error('Error closing registration:', error);
      toast({ title: 'Error', description: 'Failed to close registrations', variant: 'destructive' });
      return false;
    }
  };

  const cancelEvent = async (eventId: string) => {
    try {
      const { error } = await supabase.from('events').update({ status: 'cancelled' }).eq('id', eventId);
      if (error) throw error;
      toast({ title: 'Event cancelled', description: 'Event has been cancelled' });
      refetch();
      return true;
    } catch (error) {
      console.error('Error cancelling event:', error);
      toast({ title: 'Error', description: 'Failed to cancel event', variant: 'destructive' });
      return false;
    }
  };

  // Fetch registrations for a given event along with student profile
  const fetchRegistrations = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('id, user_id, created_at')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userIds = [...new Set((data || []).map((r: any) => r.user_id))];
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

      return (data || []).map((r: any) => ({
        id: r.id,
        user_id: r.user_id,
        created_at: r.created_at,
        profile: profileMap.get(r.user_id) || { id: r.user_id, full_name: 'Unknown', email: '' }
      }));
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast({ title: 'Error', description: 'Failed to fetch registrations', variant: 'destructive' });
      return [];
    }
  };

  return { events, loading, registrationsMap, refetch, closeRegistration, cancelEvent, fetchRegistrations };
}
