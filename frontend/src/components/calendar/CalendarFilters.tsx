import React from 'react';
import { Filter, Video, CheckSquare, Layers } from 'lucide-react';
import { useMeetingContext } from '../../context/MeetingContext';
import { CalendarFilterType } from '../../types/calendar';
import { Priority } from '../../types/actionItem';

export const CalendarFilters: React.FC = () => {
  const {
    calendarFilter,
    setCalendarFilter,
    priorityFilter,
    setPriorityFilter,
    calendarEvents
  } = useMeetingContext();

  const filterButtons: { id: CalendarFilterType; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Все события', icon: <Layers size={14} /> },
    { id: 'meetings', label: 'Встречи', icon: <Video size={14} /> },
    { id: 'action_items', label: 'Дедлайны поручений', icon: <CheckSquare size={14} /> }
  ];

  const priorities: { id: Priority | 'all'; label: string; color?: string }[] = [
    { id: 'all', label: 'Любой приоритет' },
    { id: 'high', label: 'Высокий', color: 'var(--priority-high)' },
    { id: 'medium', label: 'Средний', color: 'var(--priority-medium)' },
    { id: 'low', label: 'Низкий', color: 'var(--priority-low)' }
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px 18px',
        background: 'rgba(15, 23, 42, 0.5)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '16px'
      }}
    >
      {/* Type Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginRight: '4px'
          }}
        >
          <Filter size={13} /> Фильтр:
        </span>
        {filterButtons.map((btn) => {
          const isActive = calendarFilter === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => setCalendarFilter(btn.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '0.775rem',
                fontWeight: 500,
                borderRadius: 'var(--radius-md)',
                border: isActive
                  ? '1px solid rgba(99, 102, 241, 0.4)'
                  : '1px solid rgba(255, 255, 255, 0.06)',
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {btn.icon}
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* Priority Filters & Event Count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        {(calendarFilter === 'all' || calendarFilter === 'action_items') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>Приоритет:</span>
            {priorities.map((p) => {
              const isActive = priorityFilter === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPriorityFilter(p.id)}
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.725rem',
                    fontWeight: 500,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--border-medium)' : 'transparent',
                    background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  {p.color && (
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: p.color
                      }}
                    />
                  )}
                  {p.label}
                </button>
              );
            })}
          </div>
        )}

        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            paddingLeft: '8px',
            borderLeft: '1px solid var(--border-subtle)'
          }}
        >
          Найдено: <strong style={{ color: 'var(--accent-secondary)' }}>{calendarEvents.length}</strong>
        </div>
      </div>
    </div>
  );
};
