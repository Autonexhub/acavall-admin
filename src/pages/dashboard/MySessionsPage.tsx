import { useState, useMemo } from 'react';
import { useSessions } from '@/lib/api/queries/useSessions';
import { useCurrentUser } from '@/lib/api/queries/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock, Users, TrendingUp } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

// Helper to get session type label
const getSessionTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    perros: 'Perros',
    gatos: 'Gatos',
    caballos: 'Caballos',
    sin_animales: 'Sin animales',
    entorno_natural: 'Entorno natural',
  };
  return labels[type] || type;
};

export default function MySessionsPage() {
  const { data: user } = useCurrentUser();
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));

  const { data: sessions, isLoading } = useSessions({
    start_date: format(startDate, 'yyyy-MM-dd'),
    end_date: format(endDate, 'yyyy-MM-dd'),
  });

  // Filter sessions for current user (assuming they have a therapist_id)
  const mySessions = useMemo(() => {
    if (!sessions || !user) return [];
    // Filter sessions where current user is one of the therapists
    return sessions.filter((session) =>
      session.therapists?.some((t) => t.email === user.email)
    );
  }, [sessions, user]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalHours = mySessions.reduce((sum, s) => sum + Number(s.hours), 0);
    const totalSessions = mySessions.length;
    const totalParticipants = mySessions.reduce((sum, s) => sum + (s.participants || 0), 0);
    const uniqueEntities = new Set(mySessions.map((s) => s.entity_id)).size;

    return {
      totalHours: totalHours.toFixed(2),
      totalSessions,
      totalParticipants,
      uniqueEntities,
    };
  }, [mySessions]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis Sesiones</h1>
        <p className="text-muted-foreground mt-1">
          Visualiza tus sesiones y horas trabajadas
        </p>
      </div>

      {/* Date Range Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar por Fecha</CardTitle>
          <CardDescription>Selecciona el rango de fechas para ver tus sesiones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha Inicio</Label>
              <DatePicker
                date={startDate}
                onDateChange={(date) => date && setStartDate(date)}
                placeholder="Fecha de inicio"
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha Fin</Label>
              <DatePicker
                date={endDate}
                onDateChange={(date) => date && setEndDate(date)}
                placeholder="Fecha de fin"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Sesiones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Participantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats.totalParticipants}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Entidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats.uniqueEntities}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>Listado de Sesiones</CardTitle>
          <CardDescription>
            Sesiones del {format(startDate, 'PPP', { locale: es })} al{' '}
            {format(endDate, 'PPP', { locale: es })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : mySessions.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No hay sesiones registradas en este período
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {mySessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium">
                        {format(new Date(session.date), 'PPP', { locale: es })}
                      </p>
                      <Badge variant="outline">
                        {getSessionTypeLabel(session.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {session.entity?.name || 'Sin entidad'} • {session.start_time} -{' '}
                      {session.end_time}
                    </p>
                    {session.notes && (
                      <p className="text-xs text-muted-foreground italic">
                        {session.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{session.hours}h</p>
                    <p className="text-xs text-muted-foreground">
                      {session.participants || 0} participantes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
