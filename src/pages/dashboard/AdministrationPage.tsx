import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSessions } from '@/lib/api/queries/useSessions';
import { useEntities } from '@/lib/api/queries/useEntities';
import { useTherapists } from '@/lib/api/queries/useTherapists';
import { useProjects } from '@/lib/api/queries/useProjects';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Clock, Building2, Users, Download, Calendar, Loader2, FolderKanban } from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdministracionPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse dates from URL or default to current month
  const startDate = useMemo(() => {
    const param = searchParams.get('start');
    if (param) {
      const parsed = parseISO(param);
      if (isValid(parsed)) return parsed;
    }
    return startOfMonth(new Date());
  }, [searchParams]);

  const endDate = useMemo(() => {
    const param = searchParams.get('end');
    if (param) {
      const parsed = parseISO(param);
      if (isValid(parsed)) return parsed;
    }
    return endOfMonth(new Date());
  }, [searchParams]);

  const setStartDate = (date: Date) => {
    setSearchParams((prev) => {
      prev.set('start', format(date, 'yyyy-MM-dd'));
      return prev;
    });
  };

  const setEndDate = (date: Date) => {
    setSearchParams((prev) => {
      prev.set('end', format(date, 'yyyy-MM-dd'));
      return prev;
    });
  };

  // Pass date range to API so it returns sessions with therapists
  const { data: sessions, isLoading: sessionsLoading } = useSessions({
    start_date: format(startDate, 'yyyy-MM-dd'),
    end_date: format(endDate, 'yyyy-MM-dd'),
  });
  const { data: entitiesData, isLoading: entitiesLoading } = useEntities();
  const { data: therapists, isLoading: therapistsLoading } = useTherapists();
  const { data: projects, isLoading: projectsLoading } = useProjects();

  const entities = entitiesData?.data || [];

  // Sessions are already filtered by API, use them directly
  const filteredSessions = sessions || [];

  const stats = useMemo(() => {
    if (!filteredSessions || !therapists || !entities || entities.length === 0) {
      return {
        totalHours: 0,
        totalSessions: 0,
        activeTherapists: 0,
        therapistHours: [],
        entitySessions: [],
        projectHours: [],
      };
    }

    const totalHours = filteredSessions.reduce((acc, s) => acc + Number(s.hours), 0);
    const totalSessions = filteredSessions.length;

    // Count therapists who have sessions in this period
    const activeTherapistIds = new Set<number>();
    filteredSessions.forEach((s) => {
      s.therapists?.forEach((t) => activeTherapistIds.add(t.id));
    });
    const activeTherapists = activeTherapistIds.size;

    // Calculate hours per therapist
    const therapistHours = therapists
      .map((therapist) => {
        const therapistSessions = filteredSessions.filter((s) =>
          s.therapists?.some((t) => t.id === therapist.id)
        );
        const hours = therapistSessions.reduce((acc, s) => acc + Number(s.hours), 0);
        return {
          ...therapist,
          monthHours: hours,
          sessions: therapistSessions.length,
        };
      })
      .filter((t) => t.sessions > 0)
      .sort((a, b) => b.monthHours - a.monthHours);

    // Calculate sessions per entity
    const entitySessions = entities
      .map((entity) => {
        const entitySessionsList = filteredSessions.filter((s) => s.entity_id === entity.id);
        const hours = entitySessionsList.reduce((acc, s) => acc + Number(s.hours), 0);
        return {
          ...entity,
          sessions: entitySessionsList.length,
          hours,
        };
      })
      .filter((e) => e.sessions > 0)
      .sort((a, b) => b.hours - a.hours);

    // Calculate hours per project
    const projectHours = (projects || [])
      .map((project) => {
        const projectSessionsList = filteredSessions.filter((s) => s.project_id === project.id);
        const hours = projectSessionsList.reduce((acc, s) => acc + Number(s.hours), 0);
        return {
          ...project,
          sessions: projectSessionsList.length,
          hours,
        };
      })
      .filter((p) => p.sessions > 0)
      .sort((a, b) => b.hours - a.hours);

    return {
      totalHours,
      totalSessions,
      activeTherapists,
      therapistHours,
      entitySessions,
      projectHours,
    };
  }, [filteredSessions, therapists, entities, projects]);

  const handleExport = () => {
    const dateRangeStr = `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`;

    // Build CSV content
    let csv = '';

    // Header with date range
    csv += `INFORME DE ADMINISTRACIÓN\n`;
    csv += `Período: ${dateRangeStr}\n`;
    csv += `Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}\n\n`;

    // Summary
    csv += `RESUMEN\n`;
    csv += `Horas Totales,${stats.totalHours.toFixed(2)}\n`;
    csv += `Sesiones Realizadas,${stats.totalSessions}\n`;
    csv += `Personal Activo,${stats.activeTherapists}\n\n`;

    // Hours by Staff
    csv += `HORAS POR PERSONAL\n`;
    csv += `Nombre,Sesiones,Horas\n`;
    stats.therapistHours.forEach((t) => {
      csv += `"${t.name}",${t.sessions},${t.monthHours.toFixed(2)}\n`;
    });
    csv += `\n`;

    // Hours by Project
    csv += `HORAS POR PROYECTO\n`;
    csv += `Proyecto,Sesiones,Horas\n`;
    stats.projectHours.forEach((p) => {
      csv += `"${p.name}",${p.sessions},${p.hours.toFixed(2)}\n`;
    });
    csv += `\n`;

    // Sessions by Entity
    csv += `SESIONES POR ENTIDAD\n`;
    csv += `Entidad,Sesiones,Horas\n`;
    stats.entitySessions.forEach((e) => {
      csv += `"${e.name}",${e.sessions},${e.hours.toFixed(2)}\n`;
    });

    // Create and download the file
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const fileName = `informe_administracion_${format(startDate, 'yyyyMMdd')}_${format(endDate, 'yyyyMMdd')}.csv`;
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);

    toast.success(`Informe exportado: ${fileName}`);
  };

  const isLoading = sessionsLoading || entitiesLoading || therapistsLoading || projectsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Administración</h1>
          <p className="text-muted-foreground mt-1">Facturación, horas y pagos</p>
        </div>
        <Button onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Informe
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label>Fecha Inicio</Label>
            <DatePicker
              date={startDate}
              onDateChange={(date) => date && setStartDate(date)}
              placeholder="Fecha inicio"
            />
          </div>
          <div className="space-y-2">
            <Label>Fecha Fin</Label>
            <DatePicker
              date={endDate}
              onDateChange={(date) => date && setEndDate(date)}
              placeholder="Fecha fin"
            />
          </div>
          <div className="text-sm text-muted-foreground pb-2">
            Mostrando datos del {format(startDate, 'dd MMM yyyy', { locale: es })} al {format(endDate, 'dd MMM yyyy', { locale: es })}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Horas Totales"
          value={`${stats.totalHours.toFixed(2)}h`}
          icon={Clock}
        />
        <StatCard
          title="Sesiones Realizadas"
          value={stats.totalSessions}
          icon={Calendar}
        />
        <StatCard
          title="Personal Activo"
          value={stats.activeTherapists}
          icon={Users}
        />
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Horas por Personal
        </h2>
        <div className="space-y-4">
          {stats.therapistHours.length > 0 ? (
            stats.therapistHours.map((therapist) => (
              <div
                key={therapist.id}
                className="flex items-center justify-between p-4 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{therapist.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {therapist.sessions} sesiones
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">
                    {therapist.monthHours.toFixed(2)}h
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No hay datos de personal en este período
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Horas por Proyecto
        </h2>
        <div className="space-y-4">
          {stats.projectHours.length > 0 ? (
            stats.projectHours.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <FolderKanban className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{project.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {project.sessions} sesiones
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">{project.hours.toFixed(2)}h</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No hay datos de proyectos en este período
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Sesiones por Entidad
        </h2>
        <div className="space-y-4">
          {stats.entitySessions.length > 0 ? (
            stats.entitySessions.map((entity) => (
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
                      {entity.sessions} sesiones
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">{entity.hours.toFixed(2)}h</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No hay datos de entidades en este período
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
