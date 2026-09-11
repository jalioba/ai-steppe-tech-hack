import React, { useMemo } from 'react';
import { useMeetingContext } from '../../context/MeetingContext';
import { getWeekDays, getWeekdayNames } from '../../utils/dateUtils';
import { EventBadge } from './EventBadge';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 08:00 to 20:00

export const WeekView: React.FC = () => {
  const { currentDate, calendarEvents, language } = useMeetingContext();

  const weekdays = useMemo(() => getWeekdayNames(language), [language]);

  const weekDaysInfo = useMemo(() => {
    return getWeekDays(currentDate, calendarEvents);
  }, [currentDate, calendarEvents]);

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        backdropFilter: 'blur(16px)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Week Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '70px repeat(7, 1fr)',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(0, 0, 0, 0.3)'
        }}
      >
        <div style={{ padding: '14px', borderRight: '1px solid var(--border-subtle)' }} />
        {weekDaysInfo.map((day, idx) => (
          <div
            key={day.dateString}
            style={{
              padding: '12px 10px',
              textAlign: 'center',
              borderRight: idx < 6 ? '1px solid var(--border-subtle)' : 'none',
              background: day.isToday ? 'rgba(99, 102, 241, 0.08)' : 'transparent'
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase'
              }}
            >
              {weekdays[idx]}
            </div>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: day.isToday ? 'var(--accent-primary)' : 'var(--text-main)',
                marginTop: '2px'
              }}
            >
              {day.dayNumber}
            </div>
          </div>
        ))}
      </div>

      {/* All-Day Deadlines Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '70px repeat(7, 1fr)',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(15, 23, 42, 0.5)',
          minHeight: '44px'
        }}
      >
        <div
          style={{
            padding: '8px 10px',
            fontSize: '0.675rem',
            color: 'var(--text-subtle)',
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600
          }}
        >
          Дедлайны
        </div>
        {weekDaysInfo.map((day, idx) => {
          const actionItems = day.events.filter((e) => e.type === 'action_item');
          return (
            <div
              key={`deadlines-${day.dateString}`}
              style={{
                padding: '6px',
                borderRight: idx < 6 ? '1px solid var(--border-subtle)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              {actionItems.map((event) => (
                <EventBadge key={event.id} event={event} compact />
              ))}
            </div>
          );
        })}
      </div>

      {/* Hourly Grid */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '650px',
          overflowY: 'auto'
        }}
      >
        {HOURS.map((hour) => {
          const hourStr = `${hour.toString().padStart(2, '0')}:00`;
          return (
            <div
              key={hour}
              style={{
                display: 'grid',
                gridTemplateColumns: '70px repeat(7, 1fr)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                minHeight: '60px'
              }}
            >
              {/* Hour Label */}
              <div
                style={{
                  padding: '6px 10px',
                  fontSize: '0.725rem',
                  color: 'var(--text-subtle)',
                  borderRight: '1px solid var(--border-subtle)',
                  textAlign: 'right',
                  fontFamily: 'monospace'
                }}
              >
                {hourStr}
              </div>

              {/* Day Columns */}
              {weekDaysInfo.map((day, idx) => {
                // Find meetings that start in this hour
                const hourMeetings = day.events.filter((e) => {
                  if (e.type !== 'meeting' || !e.time) return false;
                  const startHour = parseInt(e.time.split(':')[0], 10);
                  return startHour === hour;
                });

                return (
                  <div
                    key={`${hour}-${day.dateString}`}
                    style={{
                      borderRight: idx < 6 ? '1px solid var(--border-subtle)' : 'none',
                      padding: '4px 6px',
                      background: day.isToday ? 'rgba(99, 102, 241, 0.03)' : 'transparent',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    {hourMeetings.map((m) => (
                      <EventBadge key={m.id} event={m} />
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
