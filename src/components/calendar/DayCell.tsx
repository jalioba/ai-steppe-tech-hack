import React, { useState } from 'react';
import { DayInfo, CalendarEventItem } from '../../types/calendar';
import { EventBadge } from './EventBadge';
import { useMeetingContext } from '../../context/MeetingContext';
import { Plus, X } from 'lucide-react';

interface DayCellProps {
  dayInfo: DayInfo;
}

export const DayCell: React.FC<DayCellProps> = ({ dayInfo }) => {
  const { isToday, isCurrentMonth, dayNumber, events, dateString } = dayInfo;
  const {
    setIsAddMeetingOpen,
    setIsAddActionItemOpen,
    setTargetCreateDate
  } = useMeetingContext();
  const [showAllPopover, setShowAllPopover] = useState(false);
  const [showQuickAddMenu, setShowQuickAddMenu] = useState(false);

  const maxVisibleEvents = 3;
  const visibleEvents = events.slice(0, maxVisibleEvents);
  const overflowCount = events.length - maxVisibleEvents;

  return (
    <div
      style={{
        minHeight: '120px',
        padding: '8px',
        background: isToday
          ? 'rgba(99, 102, 241, 0.05)'
          : isCurrentMonth
          ? 'rgba(17, 24, 39, 0.6)'
          : 'rgba(15, 23, 42, 0.25)',
        borderRight: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        opacity: isCurrentMonth ? 1 : 0.45,
        transition: 'background var(--transition-fast)'
      }}
      onMouseEnter={(e) => {
        if (isCurrentMonth) {
          e.currentTarget.style.background = isToday
            ? 'rgba(99, 102, 241, 0.1)'
            : 'rgba(30, 41, 59, 0.7)';
        }
      }}
      onMouseLeave={(e) => {
        if (isCurrentMonth) {
          e.currentTarget.style.background = isToday
            ? 'rgba(99, 102, 241, 0.05)'
            : 'rgba(17, 24, 39, 0.6)';
        }
      }}
    >
      {/* Date Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '6px'
        }}
      >
        <span
          style={{
            fontSize: '0.8125rem',
            fontWeight: isToday ? 700 : 500,
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: isToday ? 'var(--accent-primary)' : 'transparent',
            color: isToday ? '#ffffff' : 'var(--text-main)',
            boxShadow: isToday ? '0 0 10px rgba(99, 102, 241, 0.6)' : 'none'
          }}
        >
          {dayNumber}
        </span>

        {/* Quick Add Button on Day Hover */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn-ghost"
            onClick={(e) => {
              e.stopPropagation();
              setShowQuickAddMenu(!showQuickAddMenu);
            }}
            title={`Добавить событие на ${dateString}`}
            style={{
              width: '20px',
              height: '20px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              opacity: showQuickAddMenu ? 1 : 0.5,
              background: showQuickAddMenu ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => {
              if (!showQuickAddMenu) e.currentTarget.style.opacity = '0.5';
            }}
          >
            <Plus size={13} />
          </button>

          {/* Quick Add Dropdown */}
          {showQuickAddMenu && (
            <div
              style={{
                position: 'absolute',
                top: '24px',
                right: '0',
                background: 'var(--bg-card-solid)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg), 0 0 15px rgba(0,0,0,0.6)',
                padding: '4px',
                zIndex: 40,
                width: '180px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 10px',
                  color: 'var(--text-main)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background var(--transition-fast)'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                onClick={() => {
                  setTargetCreateDate(dateString);
                  setIsAddMeetingOpen(true);
                  setShowQuickAddMenu(false);
                }}
              >
                <span>📅</span>
                <span>Создать встречу</span>
              </button>

              <button
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '6px 10px',
                  color: 'var(--text-main)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background var(--transition-fast)'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(6, 182, 212, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                onClick={() => {
                  setTargetCreateDate(dateString);
                  setIsAddActionItemOpen(true);
                  setShowQuickAddMenu(false);
                }}
              >
                <span>✅</span>
                <span>Добавить поручение</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Events Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {visibleEvents.map((event) => (
          <EventBadge key={event.id} event={event} />
        ))}

        {overflowCount > 0 && (
          <button
            onClick={() => setShowAllPopover(true)}
            style={{
              border: 'none',
              background: 'rgba(255, 255, 255, 0.07)',
              color: 'var(--text-muted)',
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background var(--transition-fast)',
              width: '100%'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)')}
          >
            +{overflowCount} ещё...
          </button>
        )}
      </div>

      {/* Overflow Popover */}
      {showAllPopover && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            right: '10px',
            background: 'var(--bg-card-solid)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg), 0 0 20px rgba(0,0,0,0.8)',
            padding: '12px',
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '6px'
            }}
          >
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>
              События на {dateString}
            </span>
            <button
              className="btn-ghost"
              onClick={() => setShowAllPopover(false)}
              style={{ padding: '2px', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              maxHeight: '180px',
              overflowY: 'auto'
            }}
          >
            {events.map((event: CalendarEventItem) => (
              <EventBadge
                key={event.id}
                event={event}
                compact
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
