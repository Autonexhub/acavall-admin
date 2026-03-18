import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { entitySchema, type EntityFormData } from '@/lib/validations/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import type { Entity } from '@/types/models';

interface EntityFormProps {
  entity?: Entity;
  onSubmit: (data: EntityFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function EntityForm({ entity, onSubmit, isSubmitting }: EntityFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EntityFormData>({
    resolver: zodResolver(entitySchema),
    defaultValues: {
      name: entity?.name || '',
      color: entity?.color || '#3B82F6',
      contact_person: entity?.contact_person || '',
      phone: entity?.phone || '',
      email: entity?.email || '',
      cif_nif: entity?.cif_nif || '',
      fiscal_address: entity?.fiscal_address || '',
      postal_code: entity?.postal_code || '',
      city: entity?.city || '',
      province: entity?.province || '',
      notes: entity?.notes || '',
    },
  });

  const onFormSubmit = async (data: EntityFormData) => {
    try {
      await onSubmit(data);
      toast({
        title: entity ? 'Entidad actualizada' : 'Entidad creada',
        description: entity
          ? 'La entidad se ha actualizado correctamente'
          : 'La entidad se ha creado correctamente',
      });
      navigate('/entities');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Ha ocurrido un error',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información Básica</CardTitle>
          <CardDescription>
            Ingresa los datos de contacto de la entidad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Nombre de la entidad"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">
              Color Identificador <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="color"
                type="color"
                {...register('color')}
                className="w-24 h-10"
                disabled={isSubmitting}
              />
              <Input
                type="text"
                {...register('color')}
                placeholder="#3B82F6"
                className="flex-1"
                disabled={isSubmitting}
              />
            </div>
            {errors.color && (
              <p className="text-sm text-destructive">{errors.color.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_person">Persona de contacto</Label>
              <Input
                id="contact_person"
                {...register('contact_person')}
                placeholder="Nombre del contacto"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="+34 XXX XXX XXX"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos Fiscales</CardTitle>
          <CardDescription>
            Información fiscal y de facturación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cif_nif">CIF/NIF</Label>
            <Input
              id="cif_nif"
              {...register('cif_nif')}
              placeholder="A12345678"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fiscal_address">Dirección fiscal</Label>
            <Textarea
              id="fiscal_address"
              {...register('fiscal_address')}
              placeholder="Calle, número, piso, etc."
              disabled={isSubmitting}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postal_code">Código Postal</Label>
              <Input
                id="postal_code"
                {...register('postal_code')}
                placeholder="08001"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                {...register('city')}
                placeholder="Barcelona"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">Provincia</Label>
              <Input
                id="province"
                {...register('province')}
                placeholder="Barcelona"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notas Adicionales</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="notes"
            {...register('notes')}
            placeholder="Información adicional sobre la entidad..."
            disabled={isSubmitting}
            rows={4}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/entities')}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : entity ? 'Actualizar entidad' : 'Crear entidad'}
        </Button>
      </div>
    </form>
  );
}
