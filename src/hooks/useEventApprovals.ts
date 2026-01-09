import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole, AppRole } from './useUserRole';
import { useToast } from './use-toast';

export type ApprovalLevel = 'pending_faculty' | 'pending_hod' | 'pending_director' | 'approved' | 'rejected';

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
  approval_level: ApprovalLevel;
  approved_by_faculty: string | null;
  approved_at_faculty: string | null;
  approved_by_hod: string | null;
  approved_at_hod: string | null;
  organizer: {
    id: string;
    full_name: string | null;
    email: string;
  };
}

export interface ApprovalHistoryEntry {
  id: string;
  event_id: string;
  action: 'submitted' | 'approved' | 'rejected' | 'escalated';
  from_level: ApprovalLevel | null;
  to_level: ApprovalLevel | null;
  performed_by: string;
  performer_name?: string;
  comments: string | null;
  created_at: string;
}

// Map role to the approval level they can approve
const roleToApprovalLevel: Record<AppRole, ApprovalLevel | null> = {
  'faculty': 'pending_faculty',
  'hod': 'pending_hod',
  'admin': 'pending_director', // Admin can act as director
  'organizer': null,
  'student': null,
};

// Map approval level to next level after approval
const nextApprovalLevel: Record<ApprovalLevel, ApprovalLevel> = {
  'pending_faculty': 'pending_hod',
  'pending_hod': 'pending_director',
  'pending_director': 'approved',
  'approved': 'approved',
  'rejected': 'rejected',
};

export function useEventApprovals() {
  const { user } = useAuth();
  const { primaryRole, hasRole } = useUserRole();
  const { toast } = useToast();
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Determine which approval level this user can approve
  const getApprovalLevelForRole = (): ApprovalLevel | null => {
    // Check in order of highest privilege
    if (hasRole('admin')) return 'pending_director';
    if (hasRole('hod')) return 'pending_hod';
    if (hasRole('faculty')) return 'pending_faculty';
    return null;
  };

  const fetchPendingEvents = async () => {
    if (!user) return;

    const approvalLevel = getApprovalLevelForRole();
    if (!approvalLevel) {
      setPendingEvents([]);
      setLoading(false);
      return;
    }

    try {
      // For HOD, they can approve both pending_hod and pending_director (if acting as director)
      let levels: ApprovalLevel[] = [approvalLevel];
      if (hasRole('hod')) {
        levels = ['pending_hod', 'pending_director'];
      }
      if (hasRole('admin')) {
        levels = ['pending_faculty', 'pending_hod', 'pending_director'];
      }

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
          approval_level,
          approved_by_faculty,
          approved_at_faculty,
          approved_by_hod,
          approved_at_hod,
          organizer_id
        `)
        .eq('status', 'pending')
        .in('approval_level', levels)
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
        approval_level: event.approval_level as ApprovalLevel,
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
  }, [user, primaryRole]);

  const approveEvent = async (eventId: string, comments?: string) => {
    if (!user) return false;

    try {
      const event = pendingEvents.find(e => e.id === eventId);
      if (!event) throw new Error('Event not found');

      const currentLevel = event.approval_level;
      const newLevel = nextApprovalLevel[currentLevel];

      // Update event based on current level
      const updateFields: Record<string, unknown> = {
        approval_level: newLevel,
      };

      if (currentLevel === 'pending_faculty') {
        updateFields.approved_by_faculty = user.id;
        updateFields.approved_at_faculty = new Date().toISOString();
      } else if (currentLevel === 'pending_hod') {
        updateFields.approved_by_hod = user.id;
        updateFields.approved_at_hod = new Date().toISOString();
      } else if (currentLevel === 'pending_director') {
        updateFields.approved_by_director = user.id;
        updateFields.approved_at_director = new Date().toISOString();
        updateFields.status = 'approved';
        updateFields.approved_by = user.id;
        updateFields.approved_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('events')
        .update(updateFields)
        .eq('id', eventId);

      if (updateError) throw updateError;

      // Log to approval history
      await supabase.from('approval_history').insert({
        event_id: eventId,
        action: 'approved',
        from_level: currentLevel,
        to_level: newLevel,
        performed_by: user.id,
        comments: comments || null,
      });

      setPendingEvents(prev => prev.filter(e => e.id !== eventId));

      const isFullyApproved = newLevel === 'approved';
      toast({
        title: isFullyApproved ? "Event Fully Approved!" : "Event Approved to Next Level",
        description: isFullyApproved
          ? "The event has been fully approved and is now visible to students."
          : `The event has been forwarded for ${newLevel.replace('pending_', '').toUpperCase()} approval.`,
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
      const event = pendingEvents.find(e => e.id === eventId);
      if (!event) throw new Error('Event not found');

      const { error } = await supabase
        .from('events')
        .update({
          approval_level: 'rejected',
          status: 'rejected',
          rejection_reason: reason,
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', eventId);

      if (error) throw error;

      // Log to approval history
      await supabase.from('approval_history').insert({
        event_id: eventId,
        action: 'rejected',
        from_level: event.approval_level,
        to_level: 'rejected',
        performed_by: user.id,
        comments: reason,
      });

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

  // Fetch approval history for a specific event
  const fetchApprovalHistory = async (eventId: string): Promise<ApprovalHistoryEntry[]> => {
    try {
      const { data, error } = await supabase
        .from('approval_history')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch performer names
      const performerIds = [...new Set(data?.map(h => h.performed_by) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', performerIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      return (data || []).map(entry => ({
        ...entry,
        performer_name: profileMap.get(entry.performed_by) || 'Unknown',
      }));
    } catch (error) {
      console.error('Error fetching approval history:', error);
      return [];
    }
  };

  return {
    pendingEvents,
    loading,
    approveEvent,
    rejectEvent,
    refetch: fetchPendingEvents,
    fetchApprovalHistory,
    userApprovalLevel: getApprovalLevelForRole(),
  };
}

