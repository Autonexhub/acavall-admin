import { useMemo } from 'react';
import { useSessions } from '@/lib/api/queries/useSessions';
import { useEntities } from '@/lib/api/queries/useEntities';
import { usePrograms } from '@/lib/api/queries/usePrograms';
import { StatCard } from '@/components/shared/StatCard';
import { Card } from '@/components/ui/card';
import {
  TrendingUp,
  Users,
  Building2,
  Calendar,
  Clock,
  Target,
  Award,
  Loader2,
} from 'lucide-react';

export default function ImpactoPage() {
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const { data: entitiesData, isLoading: entitiesLoading } = useEntities();
  const { data: programs, isLoading: programsLoading } = usePrograms();

  const entities = entitiesData?.data || [];

  const stats = useMemo(() => {
    if (!sessions || !entities || entities.length === 0) {
      return {
        totalParticipants: 0,
        totalHours: 0,
        activeEntities: 0,
        avgParticipants: 0,
        monthlyData: [],
        entityDistribution: [],
      };
    }

    const totalParticipants = sessions.reduce((acc, s) => acc + (s.participants || 0), 0);
    const totalHours = sessions.reduce((acc, s) => acc + Number(s.hours), 0);
    const activeEntities = new Set(sessions.map((s) => s.entity_id)).size;
    const avgParticipants = sessions.length > 0 ? Math.round(totalParticipants / sessions.length) : 0;

    // Monthly data (mock for now - would need date grouping in real implementation)
    const monthlyData = [
      { month: 'Enero', sessions: 7, participants: 62, hours: 19.75 },
      { month: 'Febrero', sessions: 12, participants: 98, hours: 34 },
      { month: 'Marzo', sessions: 15, participants: 124, hours: 42 },
    ];

    // Entity distribution
    const entityDistribution = entities
      .map((entity) => {
        const entitySessions = sessions.filter((s) => s.entity_id === entity.id);
        return {
          ...entity,
          sessionCount: entitySessions.length,
          percentage:
            sessions.length > 0 ? Math.round((entitySessions.length / sessions.length) * 100) : 0,
        };
      })
      .filter((e) => e.sessionCount > 0)
      .slice(0, 6);

    return {
      totalParticipants,
      totalHours,
      totalSessions: sessions.length,
      activeEntities,
      avgParticipants,
      avgHours: sessions.length > 0 ? Math.round((totalHours / sessions.length) * 10) / 10 : 0,
      occupancyRate:
        entities.length > 0 ? Math.round((activeEntities / entities.length) * 100) : 0,
      monthlyData,
      entityDistribution,
    };
  }, [sessions, entities]);

  const isLoading = sessionsLoading || entitiesLoading || programsLoading;

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
        <h1 className="text-3xl font-bold text-foreground">Panel de Impacto</h1>
        <p className="text-muted-foreground mt-1">
          Métricas y resultados de las sesiones
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Participantes"
          value={stats.totalParticipants}
          icon={Users}
          trend="En todas las sesiones"
        />
        <StatCard
          title="Sesiones Realizadas"
          value={stats.totalSessions}
          icon={Calendar}
          trend="Este mes"
        />
        <StatCard
          title="Horas Impartidas"
          value={`${stats.totalHours}h`}
          icon={Clock}
          trend={`${stats.avgHours}h promedio`}
        />
        <StatCard
          title="Centros Activos"
          value={stats.activeEntities}
          icon={Building2}
          trend={`de ${entities.length} totales`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Evolución Mensual</h2>
          </div>
          <div className="space-y-4">
            {stats.monthlyData.map((data) => (
              <div key={data.month} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{data.month}</span>
                  <span className="text-sm text-muted-foreground">
                    {data.sessions} sesiones
                  </span>
                </div>
                <div className="h-12 bg-muted rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-primary flex items-center justify-end px-3 transition-all duration-500"
                    style={{ width: `${(data.participants / 124) * 100}%` }}
                  >
                    <span className="text-sm font-semibold text-primary-foreground">
                      {data.participants} participantes
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Distribución por Centro
          </h2>
          <div className="space-y-4">
            {stats.entityDistribution.map((entity) => (
              <div key={entity.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entity.color }}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {entity.name}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {entity.sessionCount} sesiones
                  </span>
                </div>
                {entity.percentage > 0 && (
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${entity.percentage}%`,
                        backgroundColor: entity.color,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Resumen de Impacto</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-muted rounded-lg">
            <p className="text-4xl font-bold text-primary mb-2">
              {stats.avgParticipants}
            </p>
            <p className="text-sm text-muted-foreground">
              Promedio de participantes por sesión
            </p>
          </div>
          <div className="text-center p-6 bg-muted rounded-lg">
            <p className="text-4xl font-bold text-primary mb-2">{stats.avgHours}h</p>
            <p className="text-sm text-muted-foreground">
              Duración promedio por sesión
            </p>
          </div>
          <div className="text-center p-6 bg-muted rounded-lg">
            <p className="text-4xl font-bold text-primary mb-2">
              {stats.occupancyRate}%
            </p>
            <p className="text-sm text-muted-foreground">Tasa de ocupación de centros</p>
          </div>
        </div>
      </Card>

      {/* Programs Impact Section */}
      {programs && programs.length > 0 && (
        <>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                Impacto 2024 por Programas
              </h2>
            </div>
            <p className="text-muted-foreground">
              Resumen anual de entidades alcanzadas, sesiones realizadas y participantes
              por programa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {programs.map((program) => (
              <Card
                key={program.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: program.color }}
                  />
                  <h3 className="text-lg font-semibold text-foreground">
                    {program.name}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Entidades</p>
                    <p className="text-3xl font-bold text-foreground">
                      {program.entities || 0}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Sesiones</p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: program.color }}
                      >
                        {program.sessions || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Participantes</p>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: program.color }}
                      >
                        {program.participants || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                Resumen Total de Programas
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-4xl font-bold text-primary mb-2">
                  {programs.reduce((acc, p) => acc + (p.entities || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Entidades</p>
              </div>

              <div className="text-center p-6 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-4xl font-bold text-primary mb-2">
                  {programs.reduce((acc, p) => acc + (p.sessions || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Sesiones</p>
              </div>

              <div className="text-center p-6 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-4xl font-bold text-primary mb-2">
                  {programs.reduce((acc, p) => acc + (p.participants || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Participantes</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Comparativa de Programas
            </h2>
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-foreground mb-3">
                  Sesiones por Programa
                </p>
                <div className="space-y-3">
                  {programs.map((program) => {
                    const maxSessions = Math.max(...programs.map((p) => p.sessions || 0));
                    const percentage =
                      maxSessions > 0 ? ((program.sessions || 0) / maxSessions) * 100 : 0;

                    return (
                      <div key={program.id}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">
                            {program.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {program.sessions || 0} sesiones
                          </span>
                        </div>
                        <div className="h-8 bg-muted rounded-lg overflow-hidden">
                          <div
                            className="h-full flex items-center justify-end px-3 transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: program.color,
                            }}
                          >
                            {percentage > 20 && (
                              <span className="text-sm font-semibold text-white">
                                {program.sessions || 0}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground mb-3">
                  Participantes por Programa
                </p>
                <div className="space-y-3">
                  {programs.map((program) => {
                    const maxParticipants = Math.max(
                      ...programs.map((p) => p.participants || 0)
                    );
                    const percentage =
                      maxParticipants > 0
                        ? ((program.participants || 0) / maxParticipants) * 100
                        : 0;

                    return (
                      <div key={program.id}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">
                            {program.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {program.participants || 0} participantes
                          </span>
                        </div>
                        <div className="h-8 bg-muted rounded-lg overflow-hidden">
                          <div
                            className="h-full flex items-center justify-end px-3 transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: program.color,
                            }}
                          >
                            {percentage > 20 && (
                              <span className="text-sm font-semibold text-white">
                                {program.participants || 0}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
