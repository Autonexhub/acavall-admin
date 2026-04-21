import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/providers/auth-provider';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '@/types/auth';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export default function RoleGuard({
  children,
  allowedRoles,
  redirectTo = '/my-sessions'
}: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user's role is allowed
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
