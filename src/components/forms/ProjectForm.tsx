import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { projectSchema, type ProjectFormData } from '@/lib/validations/schemas';
import { useEntities } from '@/lib/api/queries/useEntities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { parseISO, format } from 'date-fns';
import type { Project } from '@/types/models';

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function ProjectForm({ project, onSubmit, isSubmitting }: ProjectFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: entitiesResponse, isLoading: loadingEntities } = useEntities({ perPage: 100 });
  const entities = entitiesResponse?.data || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
      start_date: project?.start_date || '',
      end_date: project?.end_date || '',
      num_sessions: project?.num_sessions || 0,
      beneficiaries: project?.beneficiaries || 0,
      amount: project?.amount || 0,
      type: project?.type || 'terapia',
      funding_type: project?.funding_type || 'private_subsidy',
      beneficiary_type: project?.beneficiary_type || 'otros',
      budget_number: project?.budget_number || '',
      budget_link: project?.budget_link || '',
      notes: project?.notes || '',
      entity_ids: project?.entities?.map((e) => e.id) || [],
    },
  });

  const selectedEntityIds = watch('entity_ids') || [];
  const projectType = watch('type');
  const fundingType = watch('funding_type');
  const beneficiaryType = watch('beneficiary_type');

  const handleEntityToggle = (entityId: number) => {
    const currentIds = selectedEntityIds;
    const newIds = currentIds.includes(entityId)
      ? currentIds.filter((id) => id !== entityId)
      : [...currentIds, entityId];
    setValue('entity_ids', newIds);
  };

  const onFormSubmit = async (data: ProjectFormData) => {
    try {
      await onSubmit(data);
      toast({
        title: project ? 'Proyecto actualizado' : 'Proyecto creado',
        description: project
          ? 'El proyecto se ha actualizado correctamente'
          : 'El proyecto se ha creado correctamente',
      });
      navigate('/projects');
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
          <CardTitle>Información del Proyecto</CardTitle>
          <CardDescription>
            Datos básicos del proyecto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre del Proyecto <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Nombre del proyecto"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción Breve</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descripción del proyecto"
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Fecha de Inicio</Label>
              <DatePicker
                date={watch('start_date') ? parseISO(watch('start_date')!) : undefined}
                onDateChange={(date) => setValue('start_date', date ? format(date, 'yyyy-MM-dd') : '')}
                disabled={isSubmitting}
                placeholder="Selecciona fecha de inicio"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Fecha de Fin</Label>
              <DatePicker
                date={watch('end_date') ? parseISO(watch('end_date')!) : undefined}
                onDateChange={(date) => setValue('end_date', date ? format(date, 'yyyy-MM-dd') : '')}
                disabled={isSubmitting}
                placeholder="Selecciona fecha de fin"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Programa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="num_sessions">Nº de Sesiones</Label>
              <Input
                id="num_sessions"
                type="number"
                min="0"
                {...register('num_sessions', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="beneficiaries">Beneficiarios</Label>
              <Input
                id="beneficiaries"
                type="number"
                min="0"
                {...register('beneficiaries', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Importe del Programa (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                {...register('amount', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Proyecto</Label>
            <Select
              value={projectType}
              onValueChange={(value) => setValue('type', value as 'ocio' | 'educacion' | 'terapia' | 'voluntariado' | 'formacion' | 'otros')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ocio">Ocio</SelectItem>
                <SelectItem value="educacion">Educación</SelectItem>
                <SelectItem value="terapia">Terapia</SelectItem>
                <SelectItem value="voluntariado">Voluntariado</SelectItem>
                <SelectItem value="formacion">Formación</SelectItem>
                <SelectItem value="otros">Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="funding_type">Tipo de Financiación</Label>
            <Select
              value={fundingType}
              onValueChange={(value) => setValue('funding_type', value as 'public_subsidy' | 'private_subsidy' | 'financiacion_propia')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de financiación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public_subsidy">Subvención Pública</SelectItem>
                <SelectItem value="private_subsidy">Subvención Privada</SelectItem>
                <SelectItem value="financiacion_propia">Financiación Propia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="beneficiary_type">Tipo de Beneficiario</Label>
            <Select
              value={beneficiaryType}
              onValueChange={(value) => setValue('beneficiary_type', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de beneficiario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discapacidad_sensorial">Discapacidad sensorial</SelectItem>
                <SelectItem value="discapacidad_intelectual">Discapacidad intelectual</SelectItem>
                <SelectItem value="discapacidad_fisica_organica">Discapacidad física y orgánica</SelectItem>
                <SelectItem value="discapacidad_psicosocial">Discapacidad psicosocial</SelectItem>
                <SelectItem value="personas_mayores">Personas mayores</SelectItem>
                <SelectItem value="mujeres_victimas_violencia">Mujeres víctimas de violencia de género</SelectItem>
                <SelectItem value="menores_riesgo">Menores en riesgo</SelectItem>
                <SelectItem value="infancia_juventud">Infancia y Juventud</SelectItem>
                <SelectItem value="cuidadores_familias">Cuidadores y Familias</SelectItem>
                <SelectItem value="otros">Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget_number">Nº de Presupuesto</Label>
              <Input
                id="budget_number"
                {...register('budget_number')}
                placeholder="PRE-2026-001"
                disabled={isSubmitting}
              />
              {errors.budget_number && (
                <p className="text-sm text-destructive">{errors.budget_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget_link">Link a Presupuesto</Label>
              <Input
                id="budget_link"
                type="url"
                {...register('budget_link')}
                placeholder="https://..."
                disabled={isSubmitting}
              />
              {errors.budget_link && (
                <p className="text-sm text-destructive">{errors.budget_link.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Entidades Asignadas</CardTitle>
          <CardDescription>
            Selecciona los entidades asociadas a este proyecto
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingEntities ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-8" />
              ))}
            </div>
          ) : !entities || entities.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay entidades disponibles
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {entities.map((entity) => (
                <div key={entity.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`entity-${entity.id}`}
                    checked={selectedEntityIds.includes(entity.id)}
                    onCheckedChange={() => handleEntityToggle(entity.id)}
                    disabled={isSubmitting}
                  />
                  <Label
                    htmlFor={`entity-${entity.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entity.color }}
                      />
                      <span className="font-medium">{entity.name}</span>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          )}
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
            placeholder="Notas adicionales sobre el proyecto..."
            disabled={isSubmitting}
            rows={4}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/projects')}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : project ? 'Actualizar proyecto' : 'Crear proyecto'}
        </Button>
      </div>
    </form>
  );
}
