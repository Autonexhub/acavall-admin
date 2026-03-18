import { useParams, useNavigate } from 'react-router-dom';
import { useEntity, useUpdateEntity, useDeleteEntity } from '@/lib/api/queries/useEntities';
import { useCurrentUser } from '@/lib/api/queries/useAuth';
import { canEdit, canDelete } from '@/lib/auth/permissions';
import { EntityForm } from '@/components/forms/EntityForm';
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
import type { EntityFormData } from '@/lib/validations/schemas';

export default function EntityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const entityId = Number(id);

  const { data: entity, isLoading, error } = useEntity(entityId);
  const { data: user } = useCurrentUser();

  const updateEntity = useUpdateEntity(entityId);
  const deleteEntity = useDeleteEntity();

  const handleSubmit = async (data: EntityFormData) => {
    await updateEntity.mutateAsync(data);
  };

  const handleDelete = async () => {
    try {
      await deleteEntity.mutateAsync(entityId);
      toast({
        title: 'Entidad eliminada',
        description: 'La entidad se ha eliminado correctamente',
      });
      navigate('/entities');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo eliminar la entidad',
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

  if (error || !entity) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-destructive">Error al cargar la entidad</h2>
          <p className="text-muted-foreground mt-2">La entidad no existe o no se pudo cargar</p>
          <Button onClick={() => navigate('/entities')} className="mt-4">
            Volver a Entidades
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
            onClick={() => navigate('/entities')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Entidad</h1>
            <p className="text-muted-foreground mt-1">{entity.name}</p>
          </div>
        </div>
        {canDelete(user, 'centers') && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar entidad?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente la entidad
                  "{entity.name}" y todas sus relaciones.
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

      {canEdit(user, 'centers') ? (
        <EntityForm
          entity={entity}
          onSubmit={handleSubmit}
          isSubmitting={updateEntity.isPending}
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              No tienes permisos para editar esta entidad
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
