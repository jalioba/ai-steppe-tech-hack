import React, { useMemo } from 'react';
import { useMeetingContext } from '../../context/MeetingContext';
import { getMonthGrid, getWeekdayNames } from '../../utils/dateUtils';
import { DayCell } from './DayCell';

export const MonthView: React.FC = () => {
  const { currentDate, calendarEvents, language } = useMeetingContext();

  const weekdays = useMemo(() => getWeekdayNames(language), [language]);

  const monthGrid = useMemo(() => {
    return getMonthGrid(currentDate, calendarEvents);
  }, [currentDate, calendarEvents]);

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        backdropFilter: 'blur(16px)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)'
      }}
    >
      {/* Weekdays Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(0, 0, 0, 0.25)'
        }}
      >
        {weekdays.map((day, idx) => {
          const isWeekend = idx >= 5;
          return (
            <div
              key={day}
              style={{
                padding: '12px 14px',
                textAlign: 'center',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: isWeekend ? 'var(--text-subtle)' : 'var(--text-muted)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Days Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gridAutoRows: 'minmax(125px, auto)'
        }}
      >
        {monthGrid.map((dayInfo) => (
          <DayCell key={dayInfo.dateString} dayInfo={dayInfo} />
        ))}
      </div>
    </div>
  );
};
