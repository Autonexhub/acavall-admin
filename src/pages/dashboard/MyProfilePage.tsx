import { useCurrentUser } from '@/lib/api/queries/useAuth';
import { useTherapists } from '@/lib/api/queries/useTherapists';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Briefcase, MapPin, CreditCard, FileCheck } from 'lucide-react';
import { useMemo } from 'react';

// Helper to get staff type label
const getStaffTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    personal_laboral: 'Personal Laboral',
    personal_apoyo: 'Personal de Apoyo',
    personal_voluntariado: 'Personal Voluntariado',
  };
  return labels[type] || type;
};

export default function MyProfilePage() {
  const { data: user } = useCurrentUser();
  const { data: therapists, isLoading } = useTherapists();

  // Find the therapist record for the current user
  const myProfile = useMemo(() => {
    if (!therapists || !user) return null;
    return therapists.find((t) => t.email === user.email);
  }, [therapists, user]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!myProfile) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No se encontró información de perfil
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground mt-1">
          Información personal y laboral
        </p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
          <CardDescription>Datos de contacto y personales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Nombre Completo</span>
              </div>
              <p className="font-medium">{myProfile.name}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                <span>Tipo de Personal</span>
              </div>
              <Badge variant="secondary">
                {getStaffTypeLabel(myProfile.staff_type)}
              </Badge>
            </div>

            {myProfile.specialty && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span>Especialidad</span>
                </div>
                <p className="font-medium">{myProfile.specialty}</p>
              </div>
            )}

            {myProfile.email && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </div>
                <p className="font-medium">{myProfile.email}</p>
              </div>
            )}

            {myProfile.phone && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>Teléfono</span>
                </div>
                <p className="font-medium">{myProfile.phone}</p>
              </div>
            )}

            {myProfile.dni && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  <span>DNI / NIE</span>
                </div>
                <p className="font-medium">{myProfile.dni}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Work Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información Laboral</CardTitle>
          <CardDescription>Datos administrativos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myProfile.social_security_number && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileCheck className="h-4 w-4" />
                  <span>Nº Seguridad Social</span>
                </div>
                <p className="font-medium">{myProfile.social_security_number}</p>
              </div>
            )}

            {myProfile.account_number && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  <span>Nº Cuenta Bancaria</span>
                </div>
                <p className="font-medium font-mono text-sm">{myProfile.account_number}</p>
              </div>
            )}

            {myProfile.fiscal_address && (
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Dirección Fiscal</span>
                </div>
                <p className="font-medium">{myProfile.fiscal_address}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Entities */}
      {myProfile.entities && myProfile.entities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Entidades Asignadas</CardTitle>
            <CardDescription>
              Lugares donde trabajas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {myProfile.entities.map((entity) => (
                <div
                  key={entity.id}
                  className="flex items-center gap-2 p-3 border rounded-lg"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entity.color }}
                  />
                  <span className="font-medium">{entity.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {myProfile.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {myProfile.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
