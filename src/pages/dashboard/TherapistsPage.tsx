import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTherapists } from '@/lib/api/queries/useTherapists';
import { useCurrentUser } from '@/lib/api/queries/useAuth';
import { canCreate } from '@/lib/auth/permissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Plus, User, Mail, Phone, Clock, Search } from 'lucide-react';

export default function TherapistsPage() {
  const navigate = useNavigate();
  const { data: therapists, isLoading, error } = useTherapists();
  const { data: user } = useCurrentUser();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Filter therapists based on search
  const filteredTherapists = useMemo(() => {
    if (!therapists || !search) return therapists || [];

    const searchLower = search.toLowerCase();
    return therapists.filter((therapist) => {
      return (
        therapist.name.toLowerCase().includes(searchLower) ||
        therapist.email?.toLowerCase().includes(searchLower) ||
        therapist.phone?.toLowerCase().includes(searchLower) ||
        therapist.specialty?.toLowerCase().includes(searchLower)
      );
    });
  }, [therapists, search]);

  const handleCreateTherapist = () => {
    navigate('/staff/new');
  };

  const handleTherapistClick = (id: number) => {
    navigate(`/staff/${id}`);
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-destructive">Error al cargar personal</h2>
          <p className="text-muted-foreground mt-2">Por favor, intenta nuevamente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personal</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona el personal del equipo
          </p>
        </div>
        {canCreate(user, 'therapists') && (
          <Button onClick={handleCreateTherapist}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Personal
          </Button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, email, teléfono o especialidad..."
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredTherapists.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">
              {searchInput ? 'No se encontró personal' : 'No hay personal registrado'}
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              {searchInput
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza agregando tu primer personal'}
            </p>
            {!searchInput && canCreate(user, 'therapists') && (
              <Button onClick={handleCreateTherapist} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Crear Personal
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTherapists.map((therapist) => (
            <Card
              key={therapist.id}
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
              onClick={() => handleTherapistClick(therapist.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      {therapist.name}
                    </CardTitle>
                    {therapist.specialty && (
                      <CardDescription className="mt-2">
                        {therapist.specialty}
                      </CardDescription>
                    )}
                  </div>
                  {therapist.is_active ? (
                    <Badge variant="default">Activo</Badge>
                  ) : (
                    <Badge variant="secondary">Inactivo</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {therapist.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground truncate">
                        {therapist.email}
                      </span>
                    </div>
                  )}
                  {therapist.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{therapist.phone}</span>
                    </div>
                  )}
                  {therapist.entities && therapist.entities.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Entidades asignadas:</p>
                      <div className="flex flex-wrap gap-1">
                        {therapist.entities.slice(0, 3).map((entity) => (
                          <div
                            key={entity.id}
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded-full border"
                            style={{ borderColor: entity.color }}
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: entity.color }}
                            />
                            <span>{entity.name}</span>
                          </div>
                        ))}
                        {therapist.entities.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{therapist.entities.length - 3} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {therapist.hoursWorked !== undefined && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Horas trabajadas:</span>
                      <span className="font-medium">{therapist.hoursWorked}h</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
