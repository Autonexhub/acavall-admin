'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sessionSchema, type SessionFormData } from '@/lib/validations/schemas';
import { useEntities } from '@/lib/api/queries/useEntities';
import { useTherapists } from '@/lib/api/queries/useTherapists';
import { useProjects } from '@/lib/api/queries/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Session, RecurrenceRule } from '@/types/models';
import { RecurrenceSelector } from '@/components/sessions/RecurrenceSelector';

interface SessionFormProps {
  session?: Session;
  onSubmit: (data: SessionFormData) => void;
  isSubmitting?: boolean;
}

export function SessionForm({ session, onSubmit, isSubmitting }: SessionFormProps) {
  const { data: entitiesData, isLoading: entitiesLoading } = useEntities({ page: 1, perPage: 100 });
  const { data: projectsData, isLoading: projectsLoading } = useProjects({ page: 1, perPage: 100 });
  const { data: therapists, isLoading: therapistsLoading } = useTherapists();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: session
      ? {
          entity_id: session.entity_id,
          project_id: session.project_id,
          date: session.date,
          start_time: session.start_time,
          end_time: session.end_time,
          hours: session.hours,
          participants: session.participants || 0,
          notes: session.notes || '',
          type: session.type,
          therapist_ids: session.therapists?.map((t) => t.id) || [],
        }
      : {
          type: 'caballos',
          therapist_ids: [],
          recurrence_rule: null,
        },
  });

  const startTime = watch('start_time');
  const endTime = watch('end_time');
  const selectedDate = watch('date');
  const selectedEntityId = watch('entity_id');
  const selectedProjectId = watch('project_id');
  const selectedTherapistIds = watch('therapist_ids');
  const recurrenceRule = watch('recurrence_rule');

  // Auto-calculate hours when start_time or end_time changes
  useEffect(() => {
    if (startTime && endTime) {
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);

      const startInMinutes = startHour * 60 + startMinute;
      const endInMinutes = endHour * 60 + endMinute;

      if (endInMinutes > startInMinutes) {
        const hours = (endInMinutes - startInMinutes) / 60;
        setValue('hours', Math.round(hours * 100) / 100);
      }
    }
  }, [startTime, endTime, setValue]);

  const handleTherapistToggle = (therapistId: number) => {
    const currentIds = selectedTherapistIds || [];
    if (currentIds.includes(therapistId)) {
      setValue('therapist_ids', currentIds.filter((id) => id !== therapistId));
    } else {
      setValue('therapist_ids', [...currentIds, therapistId]);
    }
  };

  if (entitiesLoading || projectsLoading || therapistsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const entities = entitiesData?.data || [];
  const projects = projectsData || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date Picker */}
        <div className="space-y-2">
          <Label htmlFor="date">Fecha</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !selectedDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(new Date(selectedDate), 'PPP', { locale: es })
                ) : (
                  <span>Selecciona una fecha</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate ? new Date(selectedDate) : undefined}
                onSelect={(date) => setValue('date', date ? format(date, 'yyyy-MM-dd') : '')}
                locale={es}
              />
            </PopoverContent>
          </Popover>
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>

        {/* Entity Select */}
        <div className="space-y-2">
          <Label htmlFor="entity_id">Entidad</Label>
          <Select
            value={selectedEntityId?.toString()}
            onValueChange={(value) => setValue('entity_id', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una entidad" />
            </SelectTrigger>
            <SelectContent>
              {entities?.map((entity) => (
                <SelectItem key={entity.id} value={entity.id.toString()}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entity.color }}
                    />
                    {entity.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.entity_id && (
            <p className="text-sm text-destructive">{errors.entity_id.message}</p>
          )}
        </div>

        {/* Project Select */}
        <div className="space-y-2">
          <Label htmlFor="project_id">Proyecto</Label>
          <Select
            value={selectedProjectId?.toString()}
            onValueChange={(value) => setValue('project_id', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un proyecto" />
            </SelectTrigger>
            <SelectContent>
              {projects?.filter(p => p.is_active).map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.project_id && (
            <p className="text-sm text-destructive">{errors.project_id.message}</p>
          )}
        </div>

        {/* Start Time */}
        <div className="space-y-2">
          <Label htmlFor="start_time">Hora de inicio</Label>
          <Input
            id="start_time"
            type="time"
            {...register('start_time')}
            className={errors.start_time ? 'border-destructive' : ''}
          />
          {errors.start_time && (
            <p className="text-sm text-destructive">{errors.start_time.message}</p>
          )}
        </div>

        {/* End Time */}
        <div className="space-y-2">
          <Label htmlFor="end_time">Hora de fin</Label>
          <Input
            id="end_time"
            type="time"
            {...register('end_time')}
            className={errors.end_time ? 'border-destructive' : ''}
          />
          {errors.end_time && (
            <p className="text-sm text-destructive">{errors.end_time.message}</p>
          )}
        </div>

        {/* Hours (auto-calculated but editable) */}
        <div className="space-y-2">
          <Label htmlFor="hours">Horas</Label>
          <Input
            id="hours"
            type="number"
            step="0.25"
            {...register('hours', { valueAsNumber: true })}
            placeholder="Se calcula automáticamente"
          />
          {errors.hours && (
            <p className="text-sm text-destructive">{errors.hours.message}</p>
          )}
        </div>

        {/* Participants */}
        <div className="space-y-2">
          <Label htmlFor="participants">Participantes</Label>
          <Input
            id="participants"
            type="number"
            {...register('participants', { valueAsNumber: true })}
            className={errors.participants ? 'border-destructive' : ''}
          />
          {errors.participants && (
            <p className="text-sm text-destructive">{errors.participants.message}</p>
          )}
        </div>

        {/* Type */}
        <div className="space-y-2">
          <Label htmlFor="type">Tipo de sesión</Label>
          <Select
            value={watch('type')}
            onValueChange={(value: 'perros' | 'gatos' | 'caballos' | 'sin_animales' | 'entorno_natural') =>
              setValue('type', value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="perros">Perros</SelectItem>
              <SelectItem value="gatos">Gatos</SelectItem>
              <SelectItem value="caballos">Caballos</SelectItem>
              <SelectItem value="sin_animales">Sin animales</SelectItem>
              <SelectItem value="entorno_natural">Entorno natural</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && (
            <p className="text-sm text-destructive">{errors.type.message}</p>
          )}
        </div>
      </div>

      {/* Therapists Multi-select - Grouped by Staff Type */}
      <div className="space-y-4">
        <Label>Personal Activo</Label>

        {/* Personal Laboral */}
        {therapists?.filter(t => t.is_active && t.staff_type === 'personal_laboral').length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">Personal Laboral</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 border rounded-lg bg-muted/30">
              {therapists?.filter(t => t.is_active && t.staff_type === 'personal_laboral').map((therapist) => (
                <div key={therapist.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`therapist-${therapist.id}`}
                    checked={selectedTherapistIds?.includes(therapist.id)}
                    onCheckedChange={() => handleTherapistToggle(therapist.id)}
                  />
                  <label
                    htmlFor={`therapist-${therapist.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {therapist.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personal de Apoyo */}
        {therapists?.filter(t => t.is_active && t.staff_type === 'personal_apoyo').length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">Personal de Apoyo</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 border rounded-lg bg-muted/30">
              {therapists?.filter(t => t.is_active && t.staff_type === 'personal_apoyo').map((therapist) => (
                <div key={therapist.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`therapist-${therapist.id}`}
                    checked={selectedTherapistIds?.includes(therapist.id)}
                    onCheckedChange={() => handleTherapistToggle(therapist.id)}
                  />
                  <label
                    htmlFor={`therapist-${therapist.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {therapist.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personal Voluntariado */}
        {therapists?.filter(t => t.is_active && t.staff_type === 'personal_voluntariado').length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">Personal Voluntariado</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 border rounded-lg bg-muted/30">
              {therapists?.filter(t => t.is_active && t.staff_type === 'personal_voluntariado').map((therapist) => (
                <div key={therapist.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`therapist-${therapist.id}`}
                    checked={selectedTherapistIds?.includes(therapist.id)}
                    onCheckedChange={() => handleTherapistToggle(therapist.id)}
                  />
                  <label
                    htmlFor={`therapist-${therapist.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {therapist.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {errors.therapist_ids && (
          <p className="text-sm text-destructive">{errors.therapist_ids.message}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          rows={4}
          {...register('notes')}
          placeholder="Observaciones adicionales..."
        />
        {errors.notes && (
          <p className="text-sm text-destructive">{errors.notes.message}</p>
        )}
      </div>

      {/* Recurrence Selector - Only show when creating new sessions */}
      {!session && (
        <div className="space-y-4">
          <RecurrenceSelector
            value={recurrenceRule || null}
            onChange={(rule) => setValue('recurrence_rule', rule)}
            disabled={isSubmitting}
          />
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {session ? 'Actualizar Sesión' : recurrenceRule ? 'Crear Sesiones Recurrentes' : 'Crear Sesión'}
        </Button>
      </div>
    </form>
  );
}
