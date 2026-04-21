import { useMemo, useState } from 'react';
import { useSessions } from '@/lib/api/queries/useSessions';
import { useEntities } from '@/lib/api/queries/useEntities';
import { useCurrentUser } from '@/lib/api/queries/useAuth';
import { StatCard } from '@/components/shared/StatCard';
import { Card } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Clock, Building2, Calendar, TrendingUp, Users, Loader2, FileText } from 'lucide-react';
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

export default function MyReportsPage() {
  const { data: user } = useCurrentUser();
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));

  const { data: sessions, isLoading: sessionsLoading } = useSessions({
    start_date: format(startDate, 'yyyy-MM-dd'),
    end_date: format(endDate, 'yyyy-MM-dd'),
  });
  const { data: entitiesData, isLoading: entitiesLoading } = useEntities();

  const entities = entitiesData?.data || [];

  // Filter sessions for current user
  const mySessions = useMemo(() => {
    if (!sessions || !user) return [];
    return sessions.filter((session) =>
      session.therapists?.some((t) => t.email === user.email)
    );
  }, [sessions, user]);

  const stats = useMemo(() => {
    if (!mySessions || !entities || entities.length === 0) {
      return {
        totalHours: 0,
        totalSessions: 0,
        totalParticipants: 0,
        uniqueEntities: 0,
        entityBreakdown: [],
        sessionTypeBreakdown: [],
        monthlyEvolution: {},
      };
    }

    const totalHours = mySessions.reduce((acc, s) => acc + Number(s.hours), 0);
    const totalSessions = mySessions.length;
    const totalParticipants = mySessions.reduce((acc, s) => acc + (s.participants || 0), 0);
    const uniqueEntities = new Set(mySessions.map((s) => s.entity_id)).size;

    // Breakdown by entity
    const entityBreakdown = entities
      .map((entity) => {
        const entitySessions = mySessions.filter((s) => s.entity_id === entity.id);
        const hours = entitySessions.reduce((acc, s) => acc + Number(s.hours), 0);
        const participants = entitySessions.reduce((acc, s) => acc + (s.participants || 0), 0);
        return {
          ...entity,
          sessions: entitySessions.length,
          hours,
          participants,
        };
      })
      .filter((e) => e.sessions > 0)
      .sort((a, b) => b.hours - a.hours);

    // Breakdown by session type
    const sessionTypeMap = new Map<string, { count: number; hours: number; participants: number }>();
    mySessions.forEach((session) => {
      const current = sessionTypeMap.get(session.type) || { count: 0, hours: 0, participants: 0 };
      sessionTypeMap.set(session.type, {
        count: current.count + 1,
        hours: current.hours + Number(session.hours),
        participants: current.participants + (session.participants || 0),
      });
    });

    const sessionTypeBreakdown = Array.from(sessionTypeMap.entries())
      .map(([type, data]) => ({
        type,
        label: getSessionTypeLabel(type),
        ...data,
      }))
      .sort((a, b) => b.hours - a.hours);

    // Monthly evolution (group by month)
    const monthlyMap = new Map<string, { sessions: number; hours: number; participants: number }>();
    mySessions.forEach((session) => {
      const monthKey = format(new Date(session.date), 'MMMM yyyy', { locale: es });
      const current = monthlyMap.get(monthKey) || { sessions: 0, hours: 0, participants: 0 };
      monthlyMap.set(monthKey, {
        sessions: current.sessions + 1,
        hours: current.hours + Number(session.hours),
        participants: current.participants + (session.participants || 0),
      });
    });

    const monthlyEvolution = Object.fromEntries(monthlyMap);

    return {
      totalHours: totalHours.toFixed(2),
      totalSessions,
      totalParticipants,
      uniqueEntities,
      entityBreakdown,
      sessionTypeBreakdown,
      monthlyEvolution,
    };
  }, [mySessions, entities]);

  const isLoading = sessionsLoading || entitiesLoading;

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis Informes</h1>
        <p className="text-muted-foreground mt-1">
          Análisis detallado de tus horas trabajadas y sesiones
        </p>
      </div>

      {/* Date Range Filters */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Filtrar por Período
        </h2>
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
        <p className="text-sm text-muted-foreground mt-3">
          Período: {format(startDate, 'PPP', { locale: es })} - {format(endDate, 'PPP', { locale: es })}
        </p>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Horas Totales"
          value={`${stats.totalHours}h`}
          icon={Clock}
        />
        <StatCard
          title="Sesiones Realizadas"
          value={stats.totalSessions}
          icon={Calendar}
        />
        <StatCard
          title="Participantes Atendidos"
          value={stats.totalParticipants}
          icon={Users}
        />
        <StatCard
          title="Entidades Visitadas"
          value={stats.uniqueEntities}
          icon={Building2}
        />
      </div>

      {/* Hours by Entity */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Horas por Entidad
        </h2>
        <div className="space-y-4">
          {stats.entityBreakdown.length > 0 ? (
            stats.entityBreakdown.map((entity) => (
              <div
                key={entity.id}
                className="flex items-center justify-between p-4 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: entity.color + '20' }}
                  >
                    <Building2 className="h-6 w-6" style={{ color: entity.color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{entity.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {entity.sessions} sesiones • {entity.participants} participantes
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">{entity.hours.toFixed(2)}h</p>
                  <p className="text-sm text-muted-foreground">
                    {(entity.hours / Number(stats.totalHours) * 100).toFixed(1)}% del total
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No hay datos de entidades disponibles en este período
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Session Type Distribution */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Distribución por Tipo de Sesión
        </h2>
        <div className="space-y-4">
          {stats.sessionTypeBreakdown.length > 0 ? (
            stats.sessionTypeBreakdown.map((item) => (
              <div
                key={item.type}
                className="flex items-center justify-between p-4 bg-muted rounded-lg"
              >
                <div>
                  <p className="font-semibold text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.count} sesiones • {item.participants} participantes
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">{item.hours.toFixed(2)}h</p>
                  <p className="text-sm text-muted-foreground">
                    {(item.hours / Number(stats.totalHours) * 100).toFixed(1)}% del total
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No hay datos de tipos de sesión disponibles
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Monthly Evolution */}
      {Object.keys(stats.monthlyEvolution).length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Evolución Mensual</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(stats.monthlyEvolution).map(([month, data]) => (
              <div key={month} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground capitalize">{month}</span>
                  <span className="text-sm text-muted-foreground">
                    {data.sessions} sesiones
                  </span>
                </div>
                <div className="h-12 bg-muted rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-primary flex items-center justify-end px-3 transition-all duration-500"
                    style={{
                      width: `${Math.min((data.hours / Number(stats.totalHours)) * 100, 100)}%`,
                      minWidth: '60px'
                    }}
                  >
                    <span className="text-sm font-semibold text-primary-foreground">
                      {data.hours.toFixed(2)}h
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.participants} participantes
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Summary */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Resumen del Período</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-muted rounded-lg">
            <p className="text-4xl font-bold text-primary mb-2">
              {stats.totalSessions > 0
                ? (Number(stats.totalHours) / stats.totalSessions).toFixed(2)
                : '0.00'}h
            </p>
            <p className="text-sm text-muted-foreground">
              Promedio de horas por sesión
            </p>
          </div>
          <div className="text-center p-6 bg-muted rounded-lg">
            <p className="text-4xl font-bold text-primary mb-2">
              {stats.totalSessions > 0
                ? Math.round(stats.totalParticipants / stats.totalSessions)
                : 0}
            </p>
            <p className="text-sm text-muted-foreground">
              Promedio de participantes por sesión
            </p>
          </div>
          <div className="text-center p-6 bg-muted rounded-lg">
            <p className="text-4xl font-bold text-primary mb-2">
              {stats.uniqueEntities > 0
                ? (Number(stats.totalHours) / stats.uniqueEntities).toFixed(2)
                : '0.00'}h
            </p>
            <p className="text-sm text-muted-foreground">
              Promedio de horas por entidad
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
