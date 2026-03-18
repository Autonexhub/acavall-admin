import { useParams, useNavigate } from 'react-router-dom';
import { useTherapist, useUpdateTherapist, useDeleteTherapist } from '@/lib/api/queries/useTherapists';
import { useSessions } from '@/lib/api/queries/useSessions';
import { useCurrentUser } from '@/lib/api/queries/useAuth';
import { canEdit, canDelete } from '@/lib/auth/permissions';
import { TherapistForm } from '@/components/forms/TherapistForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Trash2, ArrowLeft, Calendar, Clock, TrendingUp } from 'lucide-react';
import type { TherapistFormData } from '@/lib/validations/schemas';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';

export default function TherapistDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const therapistId = Number(id);

  const { data: therapist, isLoading, error } = useTherapist(therapistId);
  const { data: sessions, isLoading: loadingSessions } = useSessions();
  const { data: user } = useCurrentUser();

  const updateTherapist = useUpdateTherapist(therapistId);
  const deleteTherapist = useDeleteTherapist();

  // Filter sessions for this therapist
  const therapistSessions = useMemo(() => {
    if (!sessions) return [];
    return sessions.filter((session) =>
      session.therapists?.some((t) => t.id === therapistId)
    );
  }, [sessions, therapistId]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalHours = therapistSessions.reduce((sum, s) => sum + Number(s.hours), 0);
    const totalSessions = therapistSessions.length;
    const uniqueEntities = new Set(therapistSessions.map((s) => s.entity_id)).size;

    return {
      totalHours,
      totalSessions,
      uniqueEntities,
      avgHoursPerSession: totalSessions > 0 ? (totalHours / totalSessions).toFixed(1) : '0',
    };
  }, [therapistSessions]);

  const handleSubmit = async (data: TherapistFormData) => {
    await updateTherapist.mutateAsync(data);
  };

  const handleDelete = async () => {
    try {
      await deleteTherapist.mutateAsync(therapistId);
      toast({
        title: 'Personal eliminado',
        description: 'El miembro del personal se ha eliminado correctamente',
      });
      navigate('/staff');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo eliminar el miembro del personal',
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

  if (error || !therapist) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-destructive">Error al cargar el miembro del personal</h2>
          <p className="text-muted-foreground mt-2">El miembro del personal no existe o no se pudo cargar</p>
          <Button onClick={() => navigate('/staff')} className="mt-4">
            Volver a Personal
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
            onClick={() => navigate('/staff')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Personal</h1>
            <p className="text-muted-foreground mt-1">{therapist.name}</p>
          </div>
        </div>
        {canDelete(user, 'therapists') && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar miembro del personal?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente el miembro del personal
                  "{therapist.name}" y todas sus relaciones.
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

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Sesiones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats.totalSessions}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Horas Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats.totalHours}h</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Centros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats.uniqueEntities}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Promedio/Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats.avgHoursPerSession}h</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {canEdit(user, 'therapists') ? (
        <TherapistForm
          therapist={therapist}
          onSubmit={handleSubmit}
          isSubmitting={updateTherapist.isPending}
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              No tienes permisos para editar este miembro del personal
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Sesiones del Personal
          </CardTitle>
          <CardDescription>
            Historial de sesiones realizadas por este miembro del personal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingSessions ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : therapistSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay sesiones registradas para este miembro del personal
            </p>
          ) : (
            <div className="space-y-3">
              {therapistSessions.slice(0, 5).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => navigate(`/sessions/${session.id}`)}
                >
                  <div>
                    <p className="font-medium">{session.date}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.entity?.name || 'Sin centro'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={session.type === 'festivo' ? 'secondary' : 'default'}>
                      {session.type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {session.hours}h
                    </span>
                  </div>
                </div>
              ))}
              {therapistSessions.length > 5 && (
                <Button
                  variant="link"
                  onClick={() => navigate(`/sessions?therapist_id=${therapistId}`)}
                >
                  Ver todas las sesiones ({therapistSessions.length})
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
