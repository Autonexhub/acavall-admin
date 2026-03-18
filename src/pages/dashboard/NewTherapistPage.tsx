import { useNavigate } from 'react-router-dom';
import { useCreateTherapist } from '@/lib/api/queries/useTherapists';
import { useCurrentUser } from '@/lib/api/queries/useAuth';
import { canCreate } from '@/lib/auth/permissions';
import { TherapistForm } from '@/components/forms/TherapistForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import type { TherapistFormData } from '@/lib/validations/schemas';

export default function NewTherapistPage() {
  const navigate = useNavigate();
  const createTherapist = useCreateTherapist();
  const { data: user } = useCurrentUser();

  const handleSubmit = async (data: TherapistFormData) => {
    await createTherapist.mutateAsync(data);
  };

  if (!canCreate(user, 'therapists')) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            No tienes permisos para crear personals
          </p>
          <Button onClick={() => navigate('/staff')} className="mt-4">
            Volver a Personal
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
          onClick={() => navigate('/staff')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Personal</h1>
          <p className="text-muted-foreground mt-1">
            Agrega un nuevo personal al equipo
          </p>
        </div>
      </div>

      <TherapistForm
        onSubmit={handleSubmit}
        isSubmitting={createTherapist.isPending}
      />
    </div>
  );
}
