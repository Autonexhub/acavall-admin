import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSession, useUpdateSession, useDeleteSession } from '@/lib/api/queries/useSessions';
import { SessionForm } from '@/components/forms/SessionForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { SessionFormData } from '@/lib/validations/schemas';

export default function SessionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sessionId = parseInt(id as string);

  const [isDeleting, setIsDeleting] = useState(false);

  const { data: session, isLoading } = useSession(sessionId);
  const updateSession = useUpdateSession(sessionId);
  const deleteSession = useDeleteSession();

  const handleUpdate = async (data: SessionFormData) => {
    try {
      await updateSession.mutateAsync(data);
      toast.success('Sesión actualizada correctamente');
      navigate('/sessions');
    } catch (error: any) {
      toast.error(error?.message || 'Error al actualizar la sesión');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteSession.mutateAsync(sessionId);
      toast.success('Sesión eliminada correctamente');
      navigate('/sessions');
    } catch (error: any) {
      toast.error(error?.message || 'Error al eliminar la sesión');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/sessions">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
        </div>
        <Card className="p-6">
          <p className="text-center text-muted-foreground">Sesión no encontrada</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/sessions">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editar Sesión</h1>
            <p className="text-muted-foreground mt-1">
              Actualiza los detalles de la sesión
            </p>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isDeleting}>
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Eliminar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará la sesión permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card className="p-6">
        <SessionForm
          session={session}
          onSubmit={handleUpdate}
          isSubmitting={updateSession.isPending}
        />
      </Card>
    </div>
  );
}
