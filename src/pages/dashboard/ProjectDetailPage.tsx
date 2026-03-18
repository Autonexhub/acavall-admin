import { useParams, useNavigate } from 'react-router-dom';
import { useProject, useUpdateProject, useDeleteProject } from '@/lib/api/queries/useProjects';
import { useCurrentUser } from '@/lib/api/queries/useAuth';
import { canEdit, canDelete } from '@/lib/auth/permissions';
import { ProjectForm } from '@/components/forms/ProjectForm';
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
import type { ProjectFormData } from '@/lib/validations/schemas';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const projectId = Number(id);

  const { data: project, isLoading, error } = useProject(projectId);
  const { data: user } = useCurrentUser();

  const updateProject = useUpdateProject(projectId);
  const deleteProject = useDeleteProject();

  const handleSubmit = async (data: ProjectFormData) => {
    await updateProject.mutateAsync(data);
  };

  const handleDelete = async () => {
    try {
      await deleteProject.mutateAsync(projectId);
      toast({
        title: 'Proyecto eliminado',
        description: 'El proyecto se ha eliminado correctamente',
      });
      navigate('/projects');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo eliminar el proyecto',
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

  if (error || !project) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-destructive">Error al cargar el proyecto</h2>
          <p className="text-muted-foreground mt-2">El proyecto no existe o no se pudo cargar</p>
          <Button onClick={() => navigate('/projects')} className="mt-4">
            Volver a Proyectos
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
            onClick={() => navigate('/projects')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Proyecto</h1>
            <p className="text-muted-foreground mt-1">{project.name}</p>
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
                <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente el proyecto
                  "{project.name}" y todas sus relaciones.
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
        <ProjectForm
          project={project}
          onSubmit={handleSubmit}
          isSubmitting={updateProject.isPending}
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              No tienes permisos para editar este proyecto
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
