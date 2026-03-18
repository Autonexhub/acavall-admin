import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/lib/api/queries/useProjects';
import { useCurrentUser } from '@/lib/api/queries/useAuth';
import { canCreate } from '@/lib/auth/permissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Plus, Briefcase, Calendar, Users, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const TYPE_LABELS = {
  grant: 'Ayudas Concedidas',
  own_funding: 'Financiación Propia',
};

const TYPE_COLORS = {
  grant: 'default',
  own_funding: 'secondary',
} as const;

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { data: projects, isLoading, error } = useProjects();

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  const handleProjectClick = (id: number) => {
    navigate(`/projects/${id}`);
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return null;
    try {
      return format(new Date(date), 'PP', { locale: es });
    } catch {
      return date;
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
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-destructive">Error al cargar proyectos</h2>
          <p className="text-muted-foreground mt-2">Por favor, intenta nuevamente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los proyectos y programas
          </p>
        </div>
        {canCreate(user, 'centers') && (
          <Button onClick={handleCreateProject}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Proyecto
          </Button>
        )}
      </div>

      {!projects || projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No hay proyectos registrados</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Comienza creando tu primer proyecto
            </p>
            {canCreate(user, 'centers') && (
              <Button onClick={handleCreateProject} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Crear Proyecto
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
              onClick={() => handleProjectClick(project.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    {project.name}
                  </CardTitle>
                  <Badge variant={TYPE_COLORS[project.type]}>
                    {TYPE_LABELS[project.type]}
                  </Badge>
                </div>
                {project.description && (
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(project.start_date || project.end_date) && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {project.start_date && formatDate(project.start_date)}
                        {project.start_date && project.end_date && ' - '}
                        {project.end_date && formatDate(project.end_date)}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                    {project.num_sessions > 0 && (
                      <div className="text-sm">
                        <div className="text-muted-foreground text-xs">Sesiones</div>
                        <div className="font-semibold">{project.num_sessions}</div>
                      </div>
                    )}
                    {project.beneficiaries > 0 && (
                      <div className="text-sm">
                        <div className="text-muted-foreground text-xs flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Beneficiarios
                        </div>
                        <div className="font-semibold">{project.beneficiaries}</div>
                      </div>
                    )}
                    {project.amount > 0 && (
                      <div className="text-sm col-span-2">
                        <div className="text-muted-foreground text-xs flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Importe
                        </div>
                        <div className="font-semibold">
                          {new Intl.NumberFormat('es-ES', {
                            style: 'currency',
                            currency: 'EUR',
                          }).format(project.amount)}
                        </div>
                      </div>
                    )}
                  </div>

                  {project.entities && project.entities.length > 0 && (
                    <div className="pt-3 border-t">
                      <div className="text-xs text-muted-foreground mb-2">Entidades</div>
                      <div className="flex flex-wrap gap-1">
                        {project.entities.map((entity) => (
                          <div
                            key={entity.id}
                            className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-xs"
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: entity.color }}
                            />
                            {entity.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
