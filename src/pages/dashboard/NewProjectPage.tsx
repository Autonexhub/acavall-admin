import { useNavigate } from 'react-router-dom';
import { useCreateProject } from '@/lib/api/queries/useProjects';
import { useCurrentUser } from '@/lib/api/queries/useAuth';
import { canCreate } from '@/lib/auth/permissions';
import { ProjectForm } from '@/components/forms/ProjectForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import type { ProjectFormData } from '@/lib/validations/schemas';

export default function NewProjectPage() {
  const navigate = useNavigate();
  const createProject = useCreateProject();
  const { data: user } = useCurrentUser();

  const handleSubmit = async (data: ProjectFormData) => {
    await createProject.mutateAsync(data);
  };

  if (!canCreate(user, 'centers')) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            No tienes permisos para crear proyectos
          </p>
          <Button onClick={() => navigate('/projects')} className="mt-4">
            Volver a Proyectos
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
          onClick={() => navigate('/projects')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Proyecto</h1>
          <p className="text-muted-foreground mt-1">
            Crea un nuevo proyecto o programa
          </p>
        </div>
      </div>

      <ProjectForm
        onSubmit={handleSubmit}
        isSubmitting={createProject.isPending}
      />
    </div>
  );
}
