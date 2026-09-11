import React from 'react';
import { Video, CheckSquare, Clock } from 'lucide-react';
import { CalendarEventItem } from '../../types/calendar';
import { useMeetingContext } from '../../context/MeetingContext';

interface EventBadgeProps {
  event: CalendarEventItem;
  compact?: boolean;
}

export const EventBadge: React.FC<EventBadgeProps> = ({ event, compact = false }) => {
  const { setSelectedEvent } = useMeetingContext();

  const isMeeting = event.type === 'meeting';

  // Priority color config
  const getPriorityDot = () => {
    if (!event.priority) return null;
    const colors: Record<string, string> = {
      high: 'var(--priority-high)',
      medium: 'var(--priority-medium)',
      low: 'var(--priority-low)'
    };
    return (
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: colors[event.priority] || 'var(--accent-primary)',
          boxShadow: `0 0 5px ${colors[event.priority]}`,
          flexShrink: 0
        }}
      />
    );
  };

  const badgeStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: compact ? '2px 6px' : '4px 8px',
    borderRadius: 'var(--radius-sm)',
    fontSize: compact ? '0.7rem' : '0.75rem',
    fontWeight: 500,
    cursor: 'pointer',
    width: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    transition: 'all var(--transition-fast)',
    userSelect: 'none',
    border: '1px solid transparent',
    background: isMeeting ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.04)',
    color: isMeeting ? '#e0e7ff' : '#f1f5f9'
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(-1px)';
    if (isMeeting) {
      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.25)';
      e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.3)';
    } else {
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
      e.currentTarget.style.borderColor = 'var(--border-medium)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.background = isMeeting
      ? 'rgba(99, 102, 241, 0.15)'
      : 'rgba(255, 255, 255, 0.04)';
    e.currentTarget.style.borderColor = 'transparent';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div
      style={badgeStyle}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedEvent(event);
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={`${isMeeting ? 'Встреча' : 'Поручение'}: ${event.title}`}
    >
      {isMeeting ? (
        <Video size={12} style={{ color: 'var(--accent-secondary)', flexShrink: 0 }} />
      ) : (
        <CheckSquare size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      )}

      {getPriorityDot()}

      {event.time && (
        <span
          style={{
            fontSize: '0.675rem',
            color: 'var(--accent-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px',
            flexShrink: 0
          }}
        >
          <Clock size={10} />
          {event.time.split(' - ')[0]}
        </span>
      )}

      <span
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1
        }}
      >
        {event.title}
      </span>

      {event.assignee && (
        <span
          style={{
            fontSize: '0.65rem',
            color: 'var(--text-subtle)',
            background: 'rgba(255, 255, 255, 0.06)',
            padding: '1px 5px',
            borderRadius: '4px',
            flexShrink: 0
          }}
        >
          {event.assignee.split(' ')[0]}
        </span>
      )}
    </div>
  );
};
