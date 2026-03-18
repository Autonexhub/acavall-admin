import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Pencil, Trash2, Building2, Calendar, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useEntities } from '@/lib/api/queries/useEntities';
import {
  useCreateWorkHistory,
  useUpdateWorkHistory,
  useDeleteWorkHistory,
} from '@/lib/api/queries/useWorkHistory';
import type { WorkHistory } from '@/types/models';

interface WorkHistorySectionProps {
  therapistId: number;
  workHistory: WorkHistory[];
}

export function WorkHistorySection({ therapistId, workHistory }: WorkHistorySectionProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WorkHistory | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<WorkHistory | null>(null);

  const { data: entitiesData } = useEntities({ perPage: 100 });
  const entities = entitiesData?.data || [];

  const createWorkHistory = useCreateWorkHistory(therapistId);
  const updateWorkHistory = useUpdateWorkHistory();
  const deleteWorkHistory = useDeleteWorkHistory();

  const [formData, setFormData] = useState({
    entity_id: '',
    role: '',
    start_date: '',
    end_date: '',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      entity_id: '',
      role: '',
      start_date: '',
      end_date: '',
      notes: '',
    });
    setEditingEntry(null);
  };

  const handleOpenDialog = (entry?: WorkHistory) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        entity_id: entry.entity_id.toString(),
        role: entry.role,
        start_date: entry.start_date,
        end_date: entry.end_date || '',
        notes: entry.notes || '',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.entity_id || !formData.role || !formData.start_date) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos obligatorios',
        variant: 'destructive',
      });
      return;
    }

    try {
      const data = {
        entity_id: parseInt(formData.entity_id),
        role: formData.role,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        notes: formData.notes,
      };

      if (editingEntry) {
        await updateWorkHistory.mutateAsync({ id: editingEntry.id, data });
        toast({
          title: 'Historial actualizado',
          description: 'El registro se ha actualizado correctamente',
        });
      } else {
        await createWorkHistory.mutateAsync(data);
        toast({
          title: 'Historial creado',
          description: 'El registro se ha creado correctamente',
        });
      }

      handleCloseDialog();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Ha ocurrido un error',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingEntry) return;

    try {
      await deleteWorkHistory.mutateAsync(deletingEntry.id);
      toast({
        title: 'Registro eliminado',
        description: 'El registro se ha eliminado correctamente',
      });
      setIsDeleteDialogOpen(false);
      setDeletingEntry(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Ha ocurrido un error',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM yyyy', { locale: es });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historial de Trabajo</CardTitle>
              <CardDescription>
                Desglose cronológico de las posiciones ocupadas
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {workHistory.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay registros de historial laboral
            </p>
          ) : (
            <div className="space-y-4">
              {workHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{entry.entity_name}</span>
                        {!entry.end_date && (
                          <Badge variant="default" className="ml-2">
                            Actual
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="h-3 w-3" />
                        <span>{entry.role}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDate(entry.start_date)}
                          {' - '}
                          {entry.end_date ? formatDate(entry.end_date) : 'Presente'}
                        </span>
                      </div>

                      {entry.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{entry.notes}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(entry)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeletingEntry(entry);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? 'Editar Registro' : 'Nuevo Registro Laboral'}
            </DialogTitle>
            <DialogDescription>
              Completa los detalles del historial de trabajo
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="entity_id">
                Entidad <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.entity_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, entity_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una entidad" />
                </SelectTrigger>
                <SelectContent>
                  {entities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id.toString()}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">
                Rol/Puesto <span className="text-destructive">*</span>
              </Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, role: e.target.value }))
                }
                placeholder="Ej: Terapeuta Principal"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">
                  Fecha de Inicio <span className="text-destructive">*</span>
                </Label>
                <DatePicker
                  date={formData.start_date ? parseISO(formData.start_date) : undefined}
                  onDateChange={(date) =>
                    setFormData((prev) => ({ ...prev, start_date: date ? format(date, 'yyyy-MM-dd') : '' }))
                  }
                  placeholder="Selecciona fecha de inicio"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">Fecha de Fin</Label>
                <DatePicker
                  date={formData.end_date ? parseISO(formData.end_date) : undefined}
                  onDateChange={(date) =>
                    setFormData((prev) => ({ ...prev, end_date: date ? format(date, 'yyyy-MM-dd') : '' }))
                  }
                  placeholder="Selecciona fecha de fin"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Información adicional..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingEntry ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este registro
              del historial laboral.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingEntry(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
