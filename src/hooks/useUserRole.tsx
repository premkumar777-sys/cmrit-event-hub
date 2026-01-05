import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'student' | 'organizer' | 'faculty' | 'hod' | 'admin';

export function useUserRole() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [primaryRole, setPrimaryRole] = useState<AppRole>('student');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setPrimaryRole('student');
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching roles:', error);
        setRoles(['student']);
        setPrimaryRole('student');
      } else {
        const userRoles = data.map(r => r.role as AppRole);
        setRoles(userRoles.length > 0 ? userRoles : ['student']);
        
        // Determine primary role (highest privilege)
        const rolePriority: AppRole[] = ['admin', 'hod', 'faculty', 'organizer', 'student'];
        const primary = rolePriority.find(role => userRoles.includes(role)) || 'student';
        setPrimaryRole(primary);
      }
      setLoading(false);
    };

    fetchRoles();
  }, [user]);

  const hasRole = (role: AppRole) => roles.includes(role);
  const isStaff = () => roles.some(role => ['organizer', 'faculty', 'hod', 'admin'].includes(role));

  return { roles, primaryRole, loading, hasRole, isStaff };
}
