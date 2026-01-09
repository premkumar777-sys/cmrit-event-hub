import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole, AppRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: AppRole[];
    redirectTo?: string;
}

// Map roles to their default dashboard routes
const roleDashboardMap: Record<AppRole, string> = {
    'student': '/events',
    'organizer': '/organizer',
    'faculty': '/faculty',
    'hod': '/faculty',
    'admin': '/admin',
};

export function ProtectedRoute({
    children,
    allowedRoles,
    redirectTo = '/auth'
}: ProtectedRouteProps) {
    const { user, loading: authLoading } = useAuth();
    const { primaryRole, loading: roleLoading } = useUserRole();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (authLoading || roleLoading) return;

        // Not authenticated - redirect to auth
        if (!user) {
            navigate(redirectTo, {
                replace: true,
                state: { from: location.pathname }
            });
            return;
        }

        // Check if user has required role
        if (allowedRoles && allowedRoles.length > 0) {
            if (!allowedRoles.includes(primaryRole)) {
                // Redirect to their appropriate dashboard
                navigate(roleDashboardMap[primaryRole], { replace: true });
            }
        }
    }, [user, authLoading, roleLoading, primaryRole, allowedRoles, navigate, redirectTo, location]);

    // Show loading while checking auth
    if (authLoading || roleLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!user) {
        return null;
    }

    // Role not allowed
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(primaryRole)) {
        return null;
    }

    return <>{children}</>;
}

// Smart dashboard redirect component
export function DashboardRedirect() {
    const { user, loading: authLoading } = useAuth();
    const { primaryRole, loading: roleLoading } = useUserRole();
    const navigate = useNavigate();

    useEffect(() => {
        if (authLoading || roleLoading) return;

        if (!user) {
            navigate('/auth', { replace: true });
            return;
        }

        // Redirect to role-specific dashboard
        navigate(roleDashboardMap[primaryRole], { replace: true });
    }, [user, authLoading, roleLoading, primaryRole, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
                <p className="text-muted-foreground">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
}
