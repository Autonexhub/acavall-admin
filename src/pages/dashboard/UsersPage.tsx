import { useNavigate } from 'react-router-dom';
import { useUsers } from '@/lib/api/queries/useUsers';
import { useAuth } from '@/components/providers/auth-provider';
import { canCreate } from '@/lib/auth/permissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Mail, Phone, Shield, Eye } from 'lucide-react';
import { toast } from 'sonner';

const ROLE_LABELS = {
  admin: 'Administrador',
  coordinator: 'Coordinador',
  therapist: 'Personal',
};

const ROLE_COLORS = {
  admin: 'destructive',
  coordinator: 'default',
  therapist: 'secondary',
} as const;

export default function UsersPage() {
  const navigate = useNavigate();
  const { data: users, isLoading, error } = useUsers();
  const { user: currentUser, impersonate } = useAuth();

  const handleCreateUser = () => {
    navigate('/users/new');
  };

  const handleUserClick = (id: number) => {
    navigate(`/users/${id}`);
  };

  const handleImpersonate = async (userId: number, userName: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click navigation
    try {
      await impersonate(userId);
      toast.success(`Ahora estás viendo como ${userName}`);
    } catch (error) {
      toast.error('Error al iniciar modo de visualización');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-destructive">Error al cargar usuarios</h2>
          <p className="text-muted-foreground mt-2">Por favor, intenta nuevamente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los usuarios del sistema
          </p>
        </div>
        {canCreate(currentUser, 'centers') && (
          <Button onClick={handleCreateUser}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        )}
      </div>

      {!users || users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No hay usuarios registrados</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Comienza creando tu primer usuario
            </p>
            {canCreate(currentUser, 'centers') && (
              <Button onClick={handleCreateUser} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Crear Usuario
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card
              key={user.id}
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
              onClick={() => handleUserClick(user.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    {user.name}
                  </CardTitle>
                  <Badge variant={ROLE_COLORS[user.role]}>
                    {ROLE_LABELS[user.role]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{user.phone}</span>
                    </div>
                  )}
                  {!user.is_active && (
                    <Badge variant="outline" className="mt-2">
                      Inactivo
                    </Badge>
                  )}
                </div>
                {currentUser?.role === 'admin' && user.id !== currentUser.id && (
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => handleImpersonate(user.id, user.name, e)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver como este usuario
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
