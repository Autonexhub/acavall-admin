import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useCreateSession } from '@/lib/api/queries/useSessions';
import { SessionForm } from '@/components/forms/SessionForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import type { SessionFormData } from '@/lib/validations/schemas';

export default function NewSessionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createSession = useCreateSession();

  // Get pre-filled date from query params if available
  const prefilledDate = searchParams.get('date');

  const handleCreate = async (data: SessionFormData) => {
    try {
      await createSession.mutateAsync(data);
      toast.success('Sesión creada correctamente');
      navigate('/sessions');
    } catch (error: any) {
      toast.error(error?.message || 'Error al crear la sesión');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/sessions">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nueva Sesión</h1>
          <p className="text-muted-foreground mt-1">
            Registra una nueva sesión de terapia
          </p>
        </div>
      </div>

      <Card className="p-6">
        <SessionForm
          session={prefilledDate ? { date: prefilledDate } as any : undefined}
          onSubmit={handleCreate}
          isSubmitting={createSession.isPending}
        />
      </Card>
    </div>
  );
}
