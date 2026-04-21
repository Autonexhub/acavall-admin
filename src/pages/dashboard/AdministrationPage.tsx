import { useMemo, useState } from 'react';
import { useSessions } from '@/lib/api/queries/useSessions';
import { useEntities } from '@/lib/api/queries/useEntities';
import { useTherapists } from '@/lib/api/queries/useTherapists';
import { useSendTestEmail } from '@/lib/api/queries/useAuth';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Clock, Building2, Users, Download, Calendar, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function AdministracionPage() {
  const [testEmail, setTestEmail] = useState('');
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const { data: entitiesData, isLoading: entitiesLoading } = useEntities();
  const { data: therapists, isLoading: therapistsLoading } = useTherapists();
  const sendTestEmailMutation = useSendTestEmail();

  const entities = entitiesData?.data || [];

  const stats = useMemo(() => {
    if (!sessions || !therapists || !entities || entities.length === 0) {
      return {
        totalHours: 0,
        totalSessions: 0,
        activeTherapists: 0,
        therapistHours: [],
        entitySessions: [],
      };
    }

    const totalHours = sessions.reduce((acc, s) => acc + Number(s.hours), 0);
    const totalSessions = sessions.length;
    const activeTherapists = therapists.length;

    // Calculate hours per therapist
    const therapistHours = therapists.map((therapist) => {
      const therapistSessions = sessions.filter((s) =>
        s.therapists?.some((t) => t.id === therapist.id)
      );
      const hours = therapistSessions.reduce((acc, s) => acc + Number(s.hours), 0);
      return {
        ...therapist,
        monthHours: hours,
        sessions: therapistSessions.length,
      };
    });

    // Calculate sessions per entity
    const entitySessions = entities
      .map((entity) => {
        const entitySessionsList = sessions.filter((s) => s.entity_id === entity.id);
        const hours = entitySessionsList.reduce((acc, s) => acc + Number(s.hours), 0);
        return {
          ...entity,
          sessions: entitySessionsList.length,
          hours,
        };
      })
      .filter((e) => e.sessions > 0);

    return {
      totalHours,
      totalSessions,
      activeTherapists,
      therapistHours,
      entitySessions,
    };
  }, [sessions, therapists, entities]);

  const handleExport = () => {
    toast.info('Función de exportación en desarrollo');
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Por favor ingresa un email');
      return;
    }

    try {
      await sendTestEmailMutation.mutateAsync(testEmail);
      toast.success(`Email de prueba enviado a ${testEmail}`);
      setTestEmail('');
    } catch (error) {
      toast.error('Error al enviar email de prueba');
    }
  };

  const isLoading = sessionsLoading || entitiesLoading || therapistsLoading;

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

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Probar Configuración de Email
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Envía un email de prueba para verificar que la configuración SMTP está funcionando correctamente.
        </p>
        <div className="flex gap-3">
          <Input
            type="email"
            placeholder="email@ejemplo.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendTestEmail();
              }
            }}
          />
          <Button
            onClick={handleSendTestEmail}
            disabled={sendTestEmailMutation.isPending || !testEmail}
          >
            {sendTestEmailMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Enviar Prueba
              </>
            )}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Horas Totales Mes"
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
                      {therapist.sessions} sesiones realizadas
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">
                    {therapist.monthHours.toFixed(2)}h
                  </p>
                  <p className="text-sm text-muted-foreground">este mes</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No hay datos de personal disponibles
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
                  <p className="text-sm text-muted-foreground">total</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No hay datos de entidades disponibles
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
