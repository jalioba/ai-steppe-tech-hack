import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  CheckSquare
} from 'lucide-react';
import { addMonths, subMonths, addWeeks, subWeeks } from 'date-fns';
import { useMeetingContext } from '../../context/MeetingContext';
import { formatMonthYear } from '../../utils/dateUtils';

export const CalendarHeader: React.FC = () => {
  const {
    currentDate,
    setCurrentDate,
    viewMode,
    setViewMode,
    exportIcs,
    setIsAddMeetingOpen,
    setIsAddActionItemOpen,
    language
  } = useMeetingContext();

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px'
      }}
    >
      {/* Left: Navigation & Date Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <h2
          style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            minWidth: '180px'
          }}
        >
          {formatMonthYear(currentDate, language)}
        </h2>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '3px'
          }}
        >
          <button
            className="btn-ghost"
            onClick={handlePrev}
            style={{ width: '30px', height: '30px', padding: 0, cursor: 'pointer' }}
            title="Предыдущий период"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleToday}
            style={{ padding: '4px 12px', fontSize: '0.775rem' }}
          >
            Сегодня
          </button>
          <button
            className="btn-ghost"
            onClick={handleNext}
            style={{ width: '30px', height: '30px', padding: 0, cursor: 'pointer' }}
            title="Следующий период"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Right: View Toggle, ICS Export, Add Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* View Switcher: Month / Week */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '3px'
          }}
        >
          <button
            onClick={() => setViewMode('month')}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              background: viewMode === 'month' ? 'var(--accent-primary)' : 'transparent',
              color: viewMode === 'month' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            Месяц
          </button>
          <button
            onClick={() => setViewMode('week')}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              background: viewMode === 'week' ? 'var(--accent-primary)' : 'transparent',
              color: viewMode === 'week' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            Неделя
          </button>
        </div>

        {/* Export .ics Button (Bonus ТЗ criteria!) */}
        <button
          className="btn btn-secondary"
          onClick={exportIcs}
          title="Скачать файл расписания и дедлайнов в формате .ics для импорта в Google Calendar, Apple или Outlook"
        >
          <Download size={15} style={{ color: 'var(--accent-secondary)' }} />
          <span>Экспорт в .ics</span>
        </button>

        {/* Add Action Item Button */}
        <button
          className="btn btn-secondary"
          onClick={() => setIsAddActionItemOpen(true)}
          title="Добавить новое поручение в список и календарь"
        >
          <CheckSquare size={15} style={{ color: 'var(--accent-primary)' }} />
          <span>+ Поручение</span>
        </button>

        {/* Schedule Meeting Button */}
        <button
          className="btn btn-primary"
          onClick={() => setIsAddMeetingOpen(true)}
        >
          <Plus size={16} />
          <span>Запланировать</span>
        </button>
      </div>
    </div>
  );
};
