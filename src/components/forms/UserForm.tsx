import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { userSchema, type UserFormData } from '@/lib/validations/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import type { User } from '@/types/models';

interface UserFormProps {
  user?: User;
  onSubmit: (data: UserFormData & { password?: string }) => Promise<void>;
  isSubmitting?: boolean;
}

export function UserForm({ user, onSubmit, isSubmitting }: UserFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UserFormData & { password?: string }>({
    resolver: zodResolver(user ? userSchema.partial({ password: true }) : userSchema.required({ password: true })),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || 'therapist',
      password: '',
    },
  });

  const selectedRole = watch('role');

  const onFormSubmit = async (data: UserFormData & { password?: string }) => {
    try {
      // Don't send empty password on update
      if (user && !data.password) {
        delete data.password;
      }

      await onSubmit(data);
      toast({
        title: user ? 'Usuario actualizado' : 'Usuario creado',
        description: user
          ? 'El usuario se ha actualizado correctamente'
          : 'El usuario se ha creado correctamente',
      });
      navigate('/users');
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
          <CardTitle>Información del Usuario</CardTitle>
          <CardDescription>
            Datos básicos del usuario del sistema
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
              placeholder="Nombre completo"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                Correo Electrónico <span className="text-destructive">*</span>
              </Label>
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
                {...register('phone')}
                placeholder="+34 XXX XXX XXX"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">
              Rol <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setValue('role', value as 'admin' | 'coordinator' | 'therapist')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="therapist">Personal</SelectItem>
                <SelectItem value="coordinator">Coordinador</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Contraseña {!user && <span className="text-destructive">*</span>}
              {user && <span className="text-muted-foreground text-xs ml-2">(dejar en blanco para mantener la actual)</span>}
            </Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder={user ? 'Nueva contraseña (opcional)' : 'Contraseña'}
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/users')}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : user ? 'Actualizar usuario' : 'Crear usuario'}
        </Button>
      </div>
    </form>
  );
}
