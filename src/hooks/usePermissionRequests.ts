import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface PermissionRequest {
  id: string;
  reason: string | null;
  status: string | null;
  created_at: string | null;
  event: {
    id: string;
    title: string;
  };
  student: {
    id: string;
    full_name: string | null;
    email: string;
    attendance_percentage: number | null;
  };
}

export function usePermissionRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<PermissionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('permission_requests')
        .select(`
          id,
          reason,
          status,
          created_at,
          event_id,
          user_id
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch event and student details
      const eventIds = [...new Set(data?.map(r => r.event_id) || [])];
      const studentIds = [...new Set(data?.map(r => r.user_id) || [])];

      const [eventsResult, studentsResult] = await Promise.all([
        supabase.from('events').select('id, title').in('id', eventIds),
        supabase.from('profiles').select('id, full_name, email, attendance_percentage').in('id', studentIds)
      ]);

      const eventMap = new Map(eventsResult.data?.map(e => [e.id, e]) || []);
      const studentMap = new Map(studentsResult.data?.map(s => [s.id, s]) || []);

      const requestsWithDetails = (data || []).map(request => ({
        ...request,
        event: eventMap.get(request.event_id) || { id: request.event_id, title: 'Unknown Event' },
        student: studentMap.get(request.user_id) || {
          id: request.user_id,
          full_name: 'Unknown',
          email: '',
          attendance_percentage: null
        }
      }));

      setRequests(requestsWithDetails);
    } catch (error) {
      console.error('Error fetching permission requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const updateRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('permission_requests')
        .update({
          status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      setRequests(prev => prev.filter(r => r.id !== requestId));
      toast({
        title: status === 'approved' ? "Permission Granted" : "Permission Denied",
        description: status === 'approved' 
          ? "The student can now register for the event."
          : "The student's request has been denied.",
      });
      return true;
    } catch (error) {
      console.error('Error updating permission request:', error);
      toast({
        title: "Error",
        description: "Failed to update request. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    requests,
    loading,
    grantPermission: (id: string) => updateRequest(id, 'approved'),
    denyPermission: (id: string) => updateRequest(id, 'rejected'),
    refetch: fetchRequests,
  };
}
