import { useNavigate } from 'react-router-dom';
import { useCreateEntity } from '@/lib/api/queries/useEntities';
import { useCurrentUser } from '@/lib/api/queries/useAuth';
import { canCreate } from '@/lib/auth/permissions';
import { EntityForm } from '@/components/forms/EntityForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import type { EntityFormData } from '@/lib/validations/schemas';

export default function NewEntityPage() {
  const navigate = useNavigate();
  const createEntity = useCreateEntity();
  const { data: user } = useCurrentUser();

  const handleSubmit = async (data: EntityFormData) => {
    await createEntity.mutateAsync(data);
  };

  if (!canCreate(user, 'centers')) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            No tienes permisos para crear entidades
          </p>
          <Button onClick={() => navigate('/entities')} className="mt-4">
            Volver a Entidades
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
          onClick={() => navigate('/entities')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nueva Entidad</h1>
          <p className="text-muted-foreground mt-1">
            Crea una nueva entidad colaboradora
          </p>
        </div>
      </div>

      <EntityForm
        onSubmit={handleSubmit}
        isSubmitting={createEntity.isPending}
      />
    </div>
  );
}
