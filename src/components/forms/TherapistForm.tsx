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
import { Textarea } from '@/components/ui/textarea';
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
      dni: therapist?.dni || '',
      social_security_number: therapist?.social_security_number || '',
      account_number: therapist?.account_number || '',
      fiscal_address: therapist?.fiscal_address || '',
      notes: therapist?.notes || '',
      has_dni_photo: therapist ? Boolean(therapist.has_dni_photo) : false,
      has_certificate_delitos: therapist ? Boolean(therapist.has_certificate_delitos) : false,
      is_active: therapist ? Boolean(therapist.is_active) : true,
      entity_ids: therapist?.entities?.map((e) => e.id) || [],
      create_user_account: false,
      user_password: '',
    },
  });

  const isActive = watch('is_active');
  const selectedEntityIds = watch('entity_ids');
  const staffType = watch('staff_type');
  const hasDniPhoto = watch('has_dni_photo');
  const hasCertificateDelitos = watch('has_certificate_delitos');
  const createUserAccount = watch('create_user_account');
  const userEmail = watch('email');

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
          <CardTitle>Documentación y Datos Fiscales</CardTitle>
          <CardDescription>
            Información administrativa y legal del personal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dni">DNI / NIE</Label>
              <Input
                id="dni"
                {...register('dni')}
                placeholder="12345678A"
                disabled={isSubmitting}
              />
              {errors.dni && (
                <p className="text-sm text-destructive">{errors.dni.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="social_security_number">Nº Seguridad Social</Label>
              <Input
                id="social_security_number"
                {...register('social_security_number')}
                placeholder="123456789012"
                disabled={isSubmitting}
              />
              {errors.social_security_number && (
                <p className="text-sm text-destructive">{errors.social_security_number.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_number">Nº de Cuenta Bancaria</Label>
            <Input
              id="account_number"
              {...register('account_number')}
              placeholder="ES00 0000 0000 0000 0000 0000"
              disabled={isSubmitting}
            />
            {errors.account_number && (
              <p className="text-sm text-destructive">{errors.account_number.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fiscal_address">Dirección Fiscal</Label>
            <Textarea
              id="fiscal_address"
              {...register('fiscal_address')}
              placeholder="Calle, número, piso, código postal, ciudad"
              disabled={isSubmitting}
              rows={2}
            />
            {errors.fiscal_address && (
              <p className="text-sm text-destructive">{errors.fiscal_address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Notas adicionales sobre el personal..."
              disabled={isSubmitting}
              rows={3}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <Label>Documentación en Archivo</Label>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_dni_photo"
                checked={hasDniPhoto}
                onCheckedChange={(checked) => setValue('has_dni_photo', checked as boolean)}
                disabled={isSubmitting}
              />
              <label
                htmlFor="has_dni_photo"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Foto de DNI
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_certificate_delitos"
                checked={hasCertificateDelitos}
                onCheckedChange={(checked) => setValue('has_certificate_delitos', checked as boolean)}
                disabled={isSubmitting}
              />
              <label
                htmlFor="has_certificate_delitos"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Certificado de Delitos de Naturaleza Sexual
              </label>
            </div>
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

      <Card>
        <CardHeader>
          <CardTitle>Cuenta de Usuario</CardTitle>
          <CardDescription>
            Crear una cuenta de acceso para que este personal pueda ver sus sesiones y reportes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="create_user_account"
              checked={createUserAccount}
              onCheckedChange={(checked) => setValue('create_user_account', checked as boolean)}
              disabled={isSubmitting}
            />
            <label
              htmlFor="create_user_account"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Crear cuenta de acceso al sistema
            </label>
          </div>

          {createUserAccount && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div className="space-y-2">
                <Label htmlFor="user_email">Email de acceso</Label>
                <Input
                  id="user_email"
                  type="email"
                  value={userEmail || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Se usará el email del personal como nombre de usuario
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="user_password">
                  Contraseña <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="user_password"
                  type="password"
                  {...register('user_password')}
                  placeholder="Mínimo 6 caracteres"
                  disabled={isSubmitting}
                />
                {errors.user_password && (
                  <p className="text-sm text-destructive">{errors.user_password.message}</p>
                )}
              </div>

              <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-md">
                <p className="font-medium mb-1">ℹ️ Permisos de la cuenta:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Podrá ver sus propias sesiones y horas trabajadas</li>
                  <li>Podrá ver su historial laboral</li>
                  <li>NO podrá ver información de otros personal</li>
                  <li>NO podrá crear o editar sesiones</li>
                </ul>
              </div>
            </div>
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
