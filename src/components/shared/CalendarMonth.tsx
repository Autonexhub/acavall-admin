'use client';

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { Session, Entity } from "@/types/models";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface CalendarMonthProps {
  currentDate: Date;
  sessions: Session[];
  entities: Entity[];
  onDateClick?: (date: Date) => void;
}

export function CalendarMonth({ currentDate, sessions, entities = [], onDateClick }: CalendarMonthProps) {
  const navigate = useNavigate();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const getSessionsForDay = (date: Date) => {
    return sessions.filter(
      (session) => format(new Date(session.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const handleSessionClick = (e: React.MouseEvent, sessionId: number) => {
    e.stopPropagation(); // Prevent triggering the date click
    navigate(`/sessions/${sessionId}`);
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm">
      <div className="grid grid-cols-7 gap-px bg-border">
        {weekDays.map((day) => (
          <div key={day} className="bg-muted p-3 text-center">
            <span className="text-sm font-medium text-muted-foreground">{day}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-border">
        {days.map((day, index) => {
          const daySessions = getSessionsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={index}
              onClick={() => onDateClick?.(day)}
              className={cn(
                "bg-card min-h-32 p-2 cursor-pointer hover:bg-muted/50 transition-colors",
                !isCurrentMonth && "opacity-40",
                isCurrentDay && "bg-calendar-today"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={cn(
                  "text-sm font-medium",
                  isCurrentDay ? "text-primary font-bold" : "text-foreground"
                )}>
                  {format(day, 'd')}
                </span>
              </div>

              <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                {daySessions.slice(0, 3).map((session) => {
                  const entity = entities.find(e => e.id === session.entity_id);
                  return (
                    <div
                      key={session.id}
                      onClick={(e) => handleSessionClick(e, session.id)}
                      className="text-xs px-2 py-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: entity?.color + '20', color: entity?.color }}
                      title="Click para editar"
                    >
                      {session.start_time} - {entity?.name || session.entity_name}
                    </div>
                  );
                })}
                {daySessions.length > 3 && (
                  <div className="text-xs text-muted-foreground px-2">
                    +{daySessions.length - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
