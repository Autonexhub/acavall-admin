import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSessions } from '@/lib/api/queries/useSessions';
import { useEntities } from '@/lib/api/queries/useEntities';
import { useTherapists } from '@/lib/api/queries/useTherapists';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarMonth } from '@/components/shared/CalendarMonth';
import { Plus, Calendar, List, Loader2, Filter } from 'lucide-react';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { SessionFilters } from '@/types/api';
import type { DateRange } from 'react-day-picker';

export default function SessionsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize from URL params or defaults
  const getInitialDate = () => {
    const monthParam = searchParams.get('month');
    return monthParam ? parseISO(monthParam + '-01') : new Date();
  };

  const getInitialFilters = (): SessionFilters => {
    const initialDate = getInitialDate();
    return {
      start_date: searchParams.get('start_date') || format(startOfMonth(initialDate), 'yyyy-MM-dd'),
      end_date: searchParams.get('end_date') || format(endOfMonth(initialDate), 'yyyy-MM-dd'),
      entity_id: searchParams.get('entity_id') ? parseInt(searchParams.get('entity_id')!) : undefined,
      therapist_id: searchParams.get('therapist_id') ? parseInt(searchParams.get('therapist_id')!) : undefined,
    };
  };

  const [currentDate, setCurrentDate] = useState(getInitialDate());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>(
    (searchParams.get('view') as 'calendar' | 'list') || 'calendar'
  );
  const [filters, setFilters] = useState<SessionFilters>(getInitialFilters());

  const { data: sessions, isLoading: sessionsLoading } = useSessions(filters);
  const { data: entitiesData, isLoading: entitiesLoading } = useEntities({ page: 1, perPage: 100 });
  const { data: therapists, isLoading: therapistsLoading } = useTherapists();

  const entities = entitiesData?.data || [];

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();

    // Add view mode
    params.set('view', viewMode);

    // Add month for calendar navigation
    params.set('month', format(currentDate, 'yyyy-MM'));

    // Add filter params
    if (filters.start_date) params.set('start_date', filters.start_date);
    if (filters.end_date) params.set('end_date', filters.end_date);
    if (filters.entity_id) params.set('entity_id', filters.entity_id.toString());
    if (filters.therapist_id) params.set('therapist_id', filters.therapist_id.toString());

    setSearchParams(params, { replace: true });
  }, [filters, viewMode, currentDate, setSearchParams]);

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    setFilters({
      ...filters,
      start_date: format(startOfMonth(newDate), 'yyyy-MM-dd'),
      end_date: format(endOfMonth(newDate), 'yyyy-MM-dd'),
    });
  };

  const handleFilterChange = (key: keyof SessionFilters, value: string | number | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDateClick = (date: Date) => {
    // Navigate to create session with pre-filled date
    navigate(`/sessions/new?date=${format(date, 'yyyy-MM-dd')}`);
  };

  const isLoading = sessionsLoading || entitiesLoading || therapistsLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sesiones</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las sesiones de terapia
          </p>
        </div>
        <Link to="/sessions/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Sesión
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Filtros</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Rango de fechas
            </label>
            <DateRangePicker
              dateRange={{
                from: filters.start_date ? parseISO(filters.start_date) : undefined,
                to: filters.end_date ? parseISO(filters.end_date) : undefined,
              }}
              onDateRangeChange={(range) => {
                handleFilterChange('start_date', range?.from ? format(range.from, 'yyyy-MM-dd') : undefined);
                handleFilterChange('end_date', range?.to ? format(range.to, 'yyyy-MM-dd') : undefined);
              }}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Entidad
            </label>
            <Select
              value={filters.entity_id?.toString() || 'all'}
              onValueChange={(value) =>
                handleFilterChange('entity_id', value === 'all' ? undefined : parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las entidades</SelectItem>
                {entities?.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id.toString()}>
                    {entity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Personal
            </label>
            <Select
              value={filters.therapist_id?.toString() || 'all'}
              onValueChange={(value) =>
                handleFilterChange('therapist_id', value === 'all' ? undefined : parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo el personal</SelectItem>
                {therapists?.map((therapist) => (
                  <SelectItem key={therapist.id} value={therapist.id.toString()}>
                    {therapist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendario
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            Lista
          </Button>
        </div>

        {viewMode === 'calendar' && (
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => handleDateChange('prev')}>
              Anterior
            </Button>
            <h3 className="text-lg font-semibold text-foreground min-w-48 text-center">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </h3>
            <Button variant="outline" size="sm" onClick={() => handleDateChange('next')}>
              Siguiente
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : viewMode === 'calendar' ? (
        <CalendarMonth
          currentDate={currentDate}
          sessions={sessions || []}
          entities={entities || []}
          onDateClick={handleDateClick}
        />
      ) : (
        <Card className="p-6">
          <div className="space-y-4">
            {sessions && sessions.length > 0 ? (
              sessions.map((session) => {
                const entity = entities?.find((e) => e.id === session.entity_id);
                return (
                  <Link
                    key={session.id}
                    to={`/sessions/${session.id}`}
                    className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: entity?.color + '20' }}
                        >
                          <Calendar
                            className="h-6 w-6"
                            style={{ color: entity?.color }}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {entity?.name || session.entity_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(session.date), 'PPP', { locale: es })} -{' '}
                            {session.start_time} a {session.end_time}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {session.therapists?.map((therapist) => (
                              <span
                                key={therapist.id}
                                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                              >
                                {therapist.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">
                          {session.hours}h
                        </p>
                        {session.participants && (
                          <p className="text-sm text-muted-foreground">
                            {session.participants} participantes
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No hay sesiones en este período
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
