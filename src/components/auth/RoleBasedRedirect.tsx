import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/providers/auth-provider';
import { Loader2 } from 'lucide-react';

export default function RoleBasedRedirect() {
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

  // Redirect based on user role
  if (user.role === 'therapist') {
    return <Navigate to="/my-sessions" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}
