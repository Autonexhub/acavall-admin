import { useNavigate } from 'react-router-dom';
import { useCreateUser } from '@/lib/api/queries/useUsers';
import { useCurrentUser } from '@/lib/api/queries/useAuth';
import { canCreate } from '@/lib/auth/permissions';
import { UserForm } from '@/components/forms/UserForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import type { UserFormData } from '@/lib/validations/schemas';

export default function NewUserPage() {
  const navigate = useNavigate();
  const createUser = useCreateUser();
  const { data: user } = useCurrentUser();

  const handleSubmit = async (data: UserFormData & { password: string }) => {
    await createUser.mutateAsync(data);
  };

  if (!canCreate(user, 'centers')) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            No tienes permisos para crear usuarios
          </p>
          <Button onClick={() => navigate('/users')} className="mt-4">
            Volver a Usuarios
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/users')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Usuario</h1>
          <p className="text-muted-foreground mt-1">
            Crea un nuevo usuario del sistema
          </p>
        </div>
      </div>

      <UserForm
        onSubmit={handleSubmit}
        isSubmitting={createUser.isPending}
      />
    </div>
  );
}
