import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Repeat } from 'lucide-react';
import type { RecurrenceRule } from '@/types/models';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface RecurrenceSelectorProps {
  value: RecurrenceRule | null;
  onChange: (rule: RecurrenceRule | null) => void;
  disabled?: boolean;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'L', fullLabel: 'Lunes' },
  { value: 2, label: 'M', fullLabel: 'Martes' },
  { value: 3, label: 'X', fullLabel: 'Miércoles' },
  { value: 4, label: 'J', fullLabel: 'Jueves' },
  { value: 5, label: 'V', fullLabel: 'Viernes' },
  { value: 6, label: 'S', fullLabel: 'Sábado' },
  { value: 0, label: 'D', fullLabel: 'Domingo' },
];

export function RecurrenceSelector({ value, onChange, disabled }: RecurrenceSelectorProps) {
  const [isRecurring, setIsRecurring] = useState(!!value);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>(
    value?.frequency || 'weekly'
  );
  const [interval, setInterval] = useState(value?.interval || 1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(value?.daysOfWeek || [1]); // Default to Monday
  const [endType, setEndType] = useState<'never' | 'date' | 'count'>(value?.endType || 'never');
  const [endDate, setEndDate] = useState(
    value?.endDate || format(addDays(new Date(), 30), 'yyyy-MM-dd')
  );
  const [endCount, setEndCount] = useState(value?.endCount || 10);

  // Update parent when values change
  useEffect(() => {
    if (!isRecurring) {
      onChange(null);
      return;
    }

    const rule: RecurrenceRule = {
      frequency,
      interval,
      endType,
    };

    if (frequency === 'weekly') {
      rule.daysOfWeek = daysOfWeek;
    }

    if (endType === 'date') {
      rule.endDate = endDate;
    } else if (endType === 'count') {
      rule.endCount = endCount;
    }

    onChange(rule);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecurring, frequency, interval, daysOfWeek, endType, endDate, endCount]);

  const toggleDayOfWeek = (day: number) => {
    if (daysOfWeek.includes(day)) {
      // Don't allow removing the last day
      if (daysOfWeek.length === 1) return;
      setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day].sort());
    }
  };

  const getFrequencyLabel = () => {
    if (frequency === 'daily') return interval === 1 ? 'día' : 'días';
    if (frequency === 'weekly') return interval === 1 ? 'semana' : 'semanas';
    if (frequency === 'monthly') return interval === 1 ? 'mes' : 'meses';
    return '';
  };

  const getRecurrenceSummary = () => {
    if (!isRecurring) return 'No se repite';

    let summary = `Cada `;
    if (interval > 1) summary += `${interval} `;
    summary += getFrequencyLabel();

    if (frequency === 'weekly' && daysOfWeek.length > 0) {
      const dayLabels = daysOfWeek
        .map((d) => DAYS_OF_WEEK.find((day) => day.value === d)?.fullLabel)
        .join(', ');
      summary += ` los ${dayLabels}`;
    }

    if (endType === 'date') {
      summary += `, hasta el ${format(new Date(endDate), 'PPP', { locale: es })}`;
    } else if (endType === 'count') {
      summary += `, ${endCount} veces`;
    }

    return summary;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_recurring"
          checked={isRecurring}
          onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
          disabled={disabled}
        />
        <label
          htmlFor="is_recurring"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
        >
          <Repeat className="h-4 w-4" />
          Repetir sesión
        </label>
      </div>

      {isRecurring && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Frequency Selection */}
            <div className="space-y-2">
              <Label>Frecuencia</Label>
              <Select
                value={frequency}
                onValueChange={(val) => setFrequency(val as typeof frequency)}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diariamente</SelectItem>
                  <SelectItem value="weekly">Semanalmente</SelectItem>
                  <SelectItem value="monthly">Mensualmente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Interval */}
            <div className="space-y-2">
              <Label>Repetir cada</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="52"
                  value={interval}
                  onChange={(e) => setInterval(Number(e.target.value))}
                  disabled={disabled}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">
                  {getFrequencyLabel()}
                </span>
              </div>
            </div>

            {/* Days of Week (for weekly frequency) */}
            {frequency === 'weekly' && (
              <div className="space-y-2">
                <Label>Días de la semana</Label>
                <div className="flex gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDayOfWeek(day.value)}
                      disabled={disabled}
                      className={`
                        w-10 h-10 rounded-full text-sm font-medium transition-colors
                        ${
                          daysOfWeek.includes(day.value)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                      title={day.fullLabel}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Selecciona al menos un día
                </p>
              </div>
            )}

            {/* End Type */}
            <div className="space-y-3">
              <Label>Finaliza</Label>
              <RadioGroup
                value={endType}
                onValueChange={(val) => setEndType(val as typeof endType)}
                disabled={disabled}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="never" id="never" />
                  <label htmlFor="never" className="text-sm cursor-pointer">
                    Nunca
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="date" id="endDate" />
                  <label htmlFor="endDate" className="text-sm cursor-pointer flex-1">
                    <div className="flex items-center gap-2">
                      <span>En la fecha:</span>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={disabled || endType !== 'date'}
                        className="w-auto"
                        onClick={() => setEndType('date')}
                      />
                    </div>
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="count" id="endCount" />
                  <label htmlFor="endCount" className="text-sm cursor-pointer flex-1">
                    <div className="flex items-center gap-2">
                      <span>Después de:</span>
                      <Input
                        type="number"
                        min="1"
                        max="365"
                        value={endCount}
                        onChange={(e) => setEndCount(Number(e.target.value))}
                        disabled={disabled || endType !== 'count'}
                        className="w-20"
                        onClick={() => setEndType('count')}
                      />
                      <span>repeticiones</span>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </div>

            {/* Summary */}
            <div className="pt-4 border-t">
              <div className="flex items-start gap-2 text-sm">
                <Calendar className="h-4 w-4 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium">Resumen:</p>
                  <p className="text-muted-foreground">{getRecurrenceSummary()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
