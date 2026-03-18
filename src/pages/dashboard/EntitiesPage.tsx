import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntities } from '@/lib/api/queries/useEntities';
import { useCurrentUser } from '@/lib/api/queries/useAuth';
import { canCreate } from '@/lib/auth/permissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Building2, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function EntitiesPage() {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, error } = useEntities({
    search,
    page: currentPage,
    perPage: 18,
  });

  const entities = data?.data || [];
  const pagination = data?.pagination;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleCreateEntity = () => {
    navigate('/entities/new');
  };

  const handleEntityClick = (id: number) => {
    navigate(`/entities/${id}`);
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(9)].map((_, i) => (
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
          <h2 className="text-2xl font-semibold text-destructive">Error al cargar entidades</h2>
          <p className="text-muted-foreground mt-2">Por favor, intenta nuevamente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Entidades</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las entidades colaboradoras
          </p>
        </div>
        {canCreate(user, 'centers') && (
          <Button onClick={handleCreateEntity}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Entidad
          </Button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, contacto, email o teléfono..."
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {entities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">
              {searchInput ? 'No se encontraron entidades' : 'No hay entidades registradas'}
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              {searchInput
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza creando tu primera entidad'}
            </p>
            {!searchInput && canCreate(user, 'centers') && (
              <Button onClick={handleCreateEntity} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Crear Entidad
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {entities.map((entity) => (
              <Card
                key={entity.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
                onClick={() => handleEntityClick(entity.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: entity.color }}
                    />
                    <span className="flex-1">{entity.name}</span>
                  </CardTitle>
                  {entity.city && entity.province && (
                    <CardDescription>
                      {entity.city}, {entity.province}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {entity.contact_person && (
                      <div>
                        <span className="text-muted-foreground">Contacto: </span>
                        <span className="font-medium">{entity.contact_person}</span>
                      </div>
                    )}
                    {entity.phone && (
                      <div>
                        <span className="text-muted-foreground">Teléfono: </span>
                        <span className="font-medium">{entity.phone}</span>
                      </div>
                    )}
                    {entity.email && (
                      <div>
                        <span className="text-muted-foreground">Email: </span>
                        <span className="font-medium text-xs">{entity.email}</span>
                      </div>
                    )}
                    {entity.cif_nif && (
                      <div className="pt-2 border-t">
                        <span className="text-muted-foreground">CIF/NIF: </span>
                        <span className="font-medium">{entity.cif_nif}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {pagination && pagination.last_page > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {pagination.from} - {pagination.to} de {pagination.total} entidades
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === pagination.last_page ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={page === currentPage ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="px-2">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.last_page}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
