import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { therapistSchema, type TherapistFormData } from '@/lib/validations/schemas';
import { useEntities } from '@/lib/api/queries/useEntities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { Therapist } from '@/types/models';

interface TherapistFormProps {
  therapist?: Therapist;
  onSubmit: (data: TherapistFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function TherapistForm({ therapist, onSubmit, isSubmitting }: TherapistFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: entitiesData, isLoading: entitiesLoading } = useEntities({ page: 1, perPage: 100 });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TherapistFormData>({
    resolver: zodResolver(therapistSchema),
    defaultValues: {
      name: therapist?.name || '',
      specialty: therapist?.specialty || '',
      staff_type: therapist?.staff_type || 'personal_laboral',
      email: therapist?.email || '',
      phone: therapist?.phone || '',
      is_active: therapist ? Boolean(therapist.is_active) : true,
      entity_ids: therapist?.entities?.map((e) => e.id) || [],
    },
  });

  const isActive = watch('is_active');
  const selectedEntityIds = watch('entity_ids');
  const staffType = watch('staff_type');

  const handleEntityToggle = (entityId: number) => {
    const currentIds = selectedEntityIds || [];
    if (currentIds.includes(entityId)) {
      setValue('entity_ids', currentIds.filter((id) => id !== entityId));
    } else {
      setValue('entity_ids', [...currentIds, entityId]);
    }
  };

  const onFormSubmit = async (data: TherapistFormData) => {
    try {
      await onSubmit(data);
      toast({
        title: therapist ? 'Personal actualizado' : 'Personal creado',
        description: therapist
          ? 'El personal se ha actualizado correctamente'
          : 'El personal se ha creado correctamente',
      });
      navigate('/staff');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Ha ocurrido un error',
        variant: 'destructive',
      });
    }
  };

  if (entitiesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const entities = entitiesData?.data || [];

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del Personal</CardTitle>
          <CardDescription>
            Ingresa los datos personales y profesionales del personal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre Completo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Nombre del personal"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="staff_type">Tipo de Personal</Label>
            <Select
              value={staffType}
              onValueChange={(value) => setValue('staff_type', value as 'personal_laboral' | 'personal_apoyo' | 'personal_voluntariado')}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de personal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal_laboral">Personal Laboral</SelectItem>
                <SelectItem value="personal_apoyo">Personal de Apoyo</SelectItem>
                <SelectItem value="personal_voluntariado">Personal Voluntariado</SelectItem>
              </SelectContent>
            </Select>
            {errors.staff_type && (
              <p className="text-sm text-destructive">{errors.staff_type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialty">Especialidad</Label>
            <Input
              id="specialty"
              {...register('specialty')}
              placeholder="Ej: Psicólogo, Terapeuta Ocupacional"
              disabled={isSubmitting}
            />
            {errors.specialty && (
              <p className="text-sm text-destructive">{errors.specialty.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="correo@ejemplo.com"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="+34 123 456 789"
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Estado del Personal</Label>
              <p className="text-sm text-muted-foreground">
                {isActive ? 'Activo - Disponible para nuevas sesiones' : 'Inactivo - No disponible para nuevas sesiones'}
              </p>
            </div>
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue('is_active', checked)}
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Entidades Asignadas</CardTitle>
          <CardDescription>
            Selecciona las entidades donde este personal trabaja
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {entities.map((entity) => (
              <div key={entity.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`entity-${entity.id}`}
                  checked={selectedEntityIds?.includes(entity.id)}
                  onCheckedChange={() => handleEntityToggle(entity.id)}
                  disabled={isSubmitting}
                />
                <label
                  htmlFor={`entity-${entity.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entity.color }}
                  />
                  {entity.name}
                </label>
              </div>
            ))}
          </div>
          {errors.entity_ids && (
            <p className="text-sm text-destructive mt-2">{errors.entity_ids.message}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/staff')}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : therapist ? 'Actualizar' : 'Crear Personal'}
        </Button>
      </div>
    </form>
  );
}
