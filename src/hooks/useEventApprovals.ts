import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface PendingEvent {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  venue: string | null;
  category: string | null;
  department: string | null;
  max_participants: number | null;
  created_at: string | null;
  organizer: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

export function useEventApprovals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingEvents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          description,
          date,
          time,
          venue,
          category,
          department,
          max_participants,
          created_at,
          organizer_id
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch organizer profiles
      const organizerIds = [...new Set(data?.map(e => e.organizer_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', organizerIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const eventsWithOrganizers = (data || []).map(event => ({
        ...event,
        organizer: profileMap.get(event.organizer_id) || {
          id: event.organizer_id,
          full_name: 'Unknown',
          email: ''
        }
      }));

      setPendingEvents(eventsWithOrganizers);
    } catch (error) {
      console.error('Error fetching pending events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingEvents();
  }, [user]);

  const approveEvent = async (eventId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('events')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', eventId);

      if (error) throw error;

      setPendingEvents(prev => prev.filter(e => e.id !== eventId));
      toast({
        title: "Event Approved",
        description: "The event has been approved and is now visible to students.",
      });
      return true;
    } catch (error) {
      console.error('Error approving event:', error);
      toast({
        title: "Error",
        description: "Failed to approve event. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const rejectEvent = async (eventId: string, reason: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('events')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', eventId);

      if (error) throw error;

      setPendingEvents(prev => prev.filter(e => e.id !== eventId));
      toast({
        title: "Event Rejected",
        description: "The event has been rejected and the organizer will be notified.",
      });
      return true;
    } catch (error) {
      console.error('Error rejecting event:', error);
      toast({
        title: "Error",
        description: "Failed to reject event. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    pendingEvents,
    loading,
    approveEvent,
    rejectEvent,
    refetch: fetchPendingEvents,
  };
}
