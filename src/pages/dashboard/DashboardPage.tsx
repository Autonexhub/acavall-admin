import { useState } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, Building2, Clock, Plus } from "lucide-react";
import { CalendarMonth } from "@/components/shared/CalendarMonth";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { useSessions, useSessionStats } from "@/lib/api/queries/useSessions";
import { useEntities } from "@/lib/api/queries/useEntities";
import { useTherapists } from "@/lib/api/queries/useTherapists";

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch data using React Query hooks
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();
  const { data: stats, isLoading: statsLoading } = useSessionStats();
  const { data: entitiesData, isLoading: entitiesLoading } = useEntities();
  const { data: therapists = [], isLoading: therapistsLoading } = useTherapists();

  const entities = entitiesData?.data || [];
  const isLoading = sessionsLoading || statsLoading || entitiesLoading || therapistsLoading;

  // Calculate stats from API or use defaults
  const totalSessions = stats?.totalSessions ?? sessions.length;
  const totalHours = stats?.totalHours ?? sessions.reduce((acc, session) => acc + Number(session.hours), 0);
  const totalParticipants = stats?.totalParticipants ?? sessions.reduce((acc, session) => acc + (session.participants || 0), 0);
  const activeEntities = stats?.activeEntities ?? new Set(sessions.map(s => s.entity_id)).size;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Vista general de sesiones y actividad</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Sesión
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Sesiones del Mes"
          value={totalSessions}
          icon={CalendarIcon}
          trend="+12% vs mes anterior"
        />
        <StatCard
          title="Horas Totales"
          value={`${totalHours.toFixed(2)}h`}
          icon={Clock}
          trend={totalSessions > 0 ? `${(totalHours / totalSessions).toFixed(1)}h promedio` : '0h promedio'}
        />
        <StatCard
          title="Participantes"
          value={totalParticipants}
          icon={Users}
          trend="En sesiones registradas"
        />
        <StatCard
          title="Entidades Activas"
          value={activeEntities}
          icon={Building2}
          trend={`de ${entities.length} totales`}
        />
      </div>

      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            {format(currentDate, 'MMMM yyyy', { locale: es }).charAt(0).toUpperCase() +
             format(currentDate, 'MMMM yyyy', { locale: es }).slice(1)}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentDate(new Date())}
            >
              Hoy
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CalendarMonth
          currentDate={currentDate}
          sessions={sessions}
          entities={entities}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Próximas Sesiones</h3>
          <div className="space-y-3">
            {sessions.slice(0, 5).map((session) => {
              const entity = entities.find(e => e.id === session.entity_id);
              return (
                <div key={session.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entity?.color }}
                    />
                    <div>
                      <p className="font-medium text-foreground">{entity?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(session.date), "d 'de' MMMM", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {session.start_time} - {session.end_time}
                    </p>
                    <p className="text-xs text-muted-foreground">{session.hours}h</p>
                  </div>
                </div>
              );
            })}
            {sessions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay sesiones próximas
              </p>
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Personal Activo</h3>
          <div className="space-y-3">
            {therapists.map((therapist) => (
              <div key={therapist.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{therapist.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {therapist.entities?.length ?? 0} entidades asignadas
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{therapist.hoursWorked ?? 0}h</p>
                  <p className="text-xs text-muted-foreground">este mes</p>
                </div>
              </div>
            ))}
            {therapists.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay personal activo
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
