import { useParams, useNavigate } from 'react-router-dom';
import { useUser, useUpdateUser, useDeleteUser } from '@/lib/api/queries/useUsers';
import { useCurrentUser } from '@/lib/api/queries/useAuth';
import { canEdit, canDelete } from '@/lib/auth/permissions';
import { UserForm } from '@/components/forms/UserForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, ArrowLeft } from 'lucide-react';
import type { UserFormData } from '@/lib/validations/schemas';

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const userId = Number(id);

  const { data: user, isLoading, error } = useUser(userId);
  const { data: currentUser } = useCurrentUser();

  const updateUser = useUpdateUser(userId);
  const deleteUser = useDeleteUser();

  const handleSubmit = async (data: UserFormData & { password?: string }) => {
    await updateUser.mutateAsync(data);
  };

  const handleDelete = async () => {
    try {
      await deleteUser.mutateAsync(userId);
      toast({
        title: 'Usuario eliminado',
        description: 'El usuario se ha eliminado correctamente',
      });
      navigate('/users');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo eliminar el usuario',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-destructive">Error al cargar el usuario</h2>
          <p className="text-muted-foreground mt-2">El usuario no existe o no se pudo cargar</p>
          <Button onClick={() => navigate('/users')} className="mt-4">
            Volver a Usuarios
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/users')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Usuario</h1>
            <p className="text-muted-foreground mt-1">{user.name}</p>
          </div>
        </div>
        {canDelete(currentUser, 'centers') && userId !== currentUser?.id && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente el usuario
                  "{user.name}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {canEdit(currentUser, 'centers') ? (
        <UserForm
          user={user}
          onSubmit={handleSubmit}
          isSubmitting={updateUser.isPending}
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              No tienes permisos para editar este usuario
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
