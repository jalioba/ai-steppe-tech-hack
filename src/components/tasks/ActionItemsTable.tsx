import React, { useState } from 'react';
import { ActionItem } from '../../types/actionItem';
import { useMeetingContext } from '../../context/MeetingContext';
import { formatDateDisplay } from '../../utils/dateUtils';
import {
  CheckCircle2,
  Clock,
  Calendar as CalendarIcon,
  Edit2,
  Trash2,
  Bot,
  User,
  Check,
  ArrowUpDown
} from 'lucide-react';

interface ActionItemsTableProps {
  items: ActionItem[];
}

export const ActionItemsTable: React.FC<ActionItemsTableProps> = ({ items }) => {
  const {
    toggleActionItemStatus,
    setEditingActionItem,
    deleteActionItem,
    setActiveNav,
    setCurrentDate
  } = useMeetingContext();

  const [sortField, setSortField] = useState<'deadline' | 'priority' | 'assignee'>('deadline');
  const [sortAsc, setSortAsc] = useState(true);

  const priorityWeight = { high: 3, medium: 2, low: 1 };

  const sortedItems = [...items].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'deadline') {
      cmp = (a.deadline || '').localeCompare(b.deadline || '');
    } else if (sortField === 'priority') {
      cmp = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    } else if (sortField === 'assignee') {
      cmp = a.assignee.localeCompare(b.assignee);
    }
    return sortAsc ? cmp : -cmp;
  });

  const handleSort = (field: 'deadline' | 'priority' | 'assignee') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const navigateToCalendar = (deadlineStr: string) => {
    if (deadlineStr) {
      const parts = deadlineStr.split('-');
      setCurrentDate(
        new Date(
          parseInt(parts[0], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[2], 10)
        )
      );
    }
    setActiveNav('calendar');
  };

  if (items.length === 0) {
    return (
      <div
        style={{
          padding: '60px 20px',
          textAlign: 'center',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Поручений по заданным фильтрам не найдено.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        backdropFilter: 'blur(16px)',
        boxShadow: 'var(--shadow-md)'
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderBottom: '1px solid var(--border-subtle)',
                fontSize: '0.725rem',
                textTransform: 'uppercase',
                color: 'var(--text-subtle)',
                letterSpacing: '0.05em'
              }}
            >
              <th style={{ padding: '14px 16px', width: '48px', textAlign: 'center' }}>Статус</th>
              <th style={{ padding: '14px 16px' }}>Суть задачи (Task)</th>
              <th
                style={{ padding: '14px 16px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('assignee')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Ответственный</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                style={{ padding: '14px 16px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('deadline')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Срок выполнения</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th
                style={{ padding: '14px 16px', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('priority')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Приоритет</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th style={{ padding: '14px 16px' }}>Источник</th>
              <th style={{ padding: '14px 16px', textAlign: 'right' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item, idx) => {
              const isCompleted = item.status === 'completed';
              const isInProgress = item.status === 'in_progress';

              return (
                <tr
                  key={item.id}
                  style={{
                    borderBottom:
                      idx < sortedItems.length - 1
                        ? '1px solid var(--border-subtle)'
                        : 'none',
                    background: isCompleted ? 'rgba(16, 185, 129, 0.02)' : 'transparent',
                    transition: 'background var(--transition-fast)'
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = isCompleted
                      ? 'rgba(16, 185, 129, 0.02)'
                      : 'transparent')
                  }
                >
                  {/* Status Toggle Checkbox */}
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <button
                      type="button"
                      style={{
                        background: isCompleted
                          ? 'var(--accent-success)'
                          : isInProgress
                          ? 'rgba(6, 182, 212, 0.15)'
                          : 'transparent',
                        border: '1px solid',
                        borderColor: isCompleted
                          ? 'var(--accent-success)'
                          : isInProgress
                          ? 'var(--accent-secondary)'
                          : 'var(--border-medium)',
                        width: '22px',
                        height: '22px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                      onClick={() => toggleActionItemStatus(item.id)}
                      title={
                        isCompleted
                          ? 'Статус: Выполнено (кликните, чтобы вернуть в Ожидает)'
                          : isInProgress
                          ? 'Статус: В работе (кликните, чтобы отметить Выполнено)'
                          : 'Статус: Ожидает (кликните, чтобы взять В работу)'
                      }
                    >
                      {isCompleted && <Check size={14} color="#ffffff" />}
                      {isInProgress && (
                        <div
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'var(--accent-secondary)'
                          }}
                        />
                      )}
                    </button>
                  </td>

                  {/* Task Text & Meeting Badge */}
                  <td style={{ padding: '14px 16px', fontSize: '0.875rem', color: '#ffffff' }}>
                    <div
                      style={{
                        color: isCompleted ? 'var(--text-subtle)' : '#ffffff',
                        textDecoration: isCompleted ? 'line-through' : 'none',
                        lineHeight: 1.4
                      }}
                    >
                      {item.task}
                    </div>
                    {item.meetingTitle && (
                      <div
                        style={{
                          fontSize: '0.725rem',
                          color: 'var(--text-subtle)',
                          marginTop: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span style={{ color: 'var(--accent-secondary)' }}>•</span>
                        <span>{item.meetingTitle}</span>
                      </div>
                    )}
                  </td>

                  {/* Assignee */}
                  <td style={{ padding: '14px 16px', fontSize: '0.85rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-main)'
                      }}
                    >
                      <User size={12} style={{ color: 'var(--text-muted)' }} />
                      <span>{item.assignee}</span>
                    </span>
                  </td>

                  {/* Deadline */}
                  <td
                    style={{
                      padding: '14px 16px',
                      fontSize: '0.85rem',
                      color: 'var(--accent-secondary)',
                      fontWeight: 500,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {formatDateDisplay(item.deadline)}
                  </td>

                  {/* Priority Badge */}
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      className={`badge ${
                        item.priority === 'high'
                          ? 'badge-high'
                          : item.priority === 'medium'
                          ? 'badge-medium'
                          : 'badge-low'
                      }`}
                    >
                      {item.priority === 'high'
                        ? 'Высокий'
                        : item.priority === 'medium'
                        ? 'Средний'
                        : 'Низкий'}
                    </span>
                  </td>

                  {/* Origin: User vs AI */}
                  <td style={{ padding: '14px 16px' }}>
                    {item.isAiGenerated ? (
                      <span
                        style={{
                          fontSize: '0.725rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'rgba(99, 102, 241, 0.12)',
                          color: '#a5b4fc',
                          border: '1px solid rgba(99, 102, 241, 0.25)'
                        }}
                      >
                        <Bot size={12} />
                        <span>🤖 ИИ</span>
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.725rem',
                          color: 'var(--text-subtle)'
                        }}
                      >
                        Ручное
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        justifyContent: 'flex-end'
                      }}
                    >
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        onClick={() => navigateToCalendar(item.deadline)}
                        title="Показать дедлайн в календаре"
                      >
                        <CalendarIcon size={13} />
                        <span>Календарь</span>
                      </button>

                      <button
                        className="btn-ghost"
                        style={{ padding: '4px', cursor: 'pointer', borderRadius: '4px' }}
                        onClick={() => setEditingActionItem(item)}
                        title="Редактировать поручение"
                      >
                        <Edit2 size={14} style={{ color: 'var(--text-muted)' }} />
                      </button>

                      <button
                        className="btn-ghost"
                        style={{ padding: '4px', cursor: 'pointer', borderRadius: '4px' }}
                        onClick={() => {
                          if (window.confirm(`Удалить поручение "${item.task.slice(0, 30)}..."?`)) {
                            deleteActionItem(item.id);
                          }
                        }}
                        title="Удалить поручение"
                      >
                        <Trash2 size={14} style={{ color: 'var(--priority-high)' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
