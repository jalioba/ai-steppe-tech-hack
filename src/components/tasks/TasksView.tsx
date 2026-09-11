import React, { useState, useMemo } from 'react';
import { useMeetingContext } from '../../context/MeetingContext';
import { ActionItemsTable } from './ActionItemsTable';
import { ActionItemModal } from './ActionItemModal';
import { AddActionItemModal } from '../calendar/AddActionItemModal';
import { AiGenerateTableModal } from './AiGenerateTableModal';
import { Priority, ActionItemStatus } from '../../types/actionItem';
import {
  CheckSquare,
  Plus,
  Bot,
  Download,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  FileJson
} from 'lucide-react';

export const TasksView: React.FC = () => {
  const {
    actionItems,
    setIsAddActionItemOpen,
    setIsAiGenerateOpen,
    exportCsv,
    exportJson
  } = useMeetingContext();

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ActionItemStatus | 'all'>('all');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Computed stats
  const stats = useMemo(() => {
    const total = actionItems.length;
    const completed = actionItems.filter((t) => t.status === 'completed').length;
    const inProgress = actionItems.filter((t) => t.status === 'in_progress').length;
    const pending = actionItems.filter((t) => t.status === 'pending').length;
    const highPriority = actionItems.filter((t) => t.priority === 'high' && t.status !== 'completed').length;

    return { total, completed, inProgress, pending, highPriority };
  }, [actionItems]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return actionItems.filter((item) => {
      const matchesSearch =
        !search ||
        item.task.toLowerCase().includes(search.toLowerCase()) ||
        item.assignee.toLowerCase().includes(search.toLowerCase()) ||
        (item.meetingTitle && item.meetingTitle.toLowerCase().includes(search.toLowerCase()));

      const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [actionItems, search, priorityFilter, statusFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header & Quick Summary */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff' }}>
              Таблица поручений (Action Items Studio)
            </h2>
            <span
              style={{
                fontSize: '0.725rem',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: 'var(--accent-primary)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: 600
              }}
            >
              ТЗ Раздел 4
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Обязательные поля: Ответственный, Суть задачи, Срок выполнения, Приоритет • Ручное и ИИ создание
          </p>
        </div>

        {/* Action Buttons: Add & AI Generate & Exports */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* AI Generate Button */}
          <button
            className="btn btn-secondary"
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.15))',
              borderColor: 'rgba(99, 102, 241, 0.4)',
              color: '#ffffff'
            }}
            onClick={() => setIsAiGenerateOpen(true)}
            title="Автоматически извлечь задачи из текста или стенограммы"
          >
            <Bot size={16} style={{ color: 'var(--accent-secondary)' }} />
            <span>🤖 Сгенерировать через ИИ</span>
          </button>

          {/* Add Manual Task Button */}
          <button
            className="btn btn-primary"
            onClick={() => setIsAddActionItemOpen(true)}
          >
            <Plus size={16} />
            <span>Добавить поручение</span>
          </button>

          {/* Export Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowExportMenu(!showExportMenu)}
              title="Экспорт таблицы (CSV / JSON)"
            >
              <Download size={15} style={{ color: 'var(--accent-secondary)' }} />
              <span>Экспорт</span>
            </button>

            {showExportMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '6px',
                  background: 'var(--bg-card-solid)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg), 0 0 20px rgba(0,0,0,0.6)',
                  padding: '4px',
                  zIndex: 50,
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
                    padding: '8px 12px',
                    color: 'var(--text-main)',
                    fontSize: '0.775rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => {
                    exportCsv();
                    setShowExportMenu(false);
                  }}
                >
                  <FileSpreadsheet size={15} style={{ color: 'var(--accent-success)' }} />
                  <span>Экспорт в .CSV (Excel)</span>
                </button>

                <button
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    color: 'var(--text-main)',
                    fontSize: '0.775rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => {
                    exportJson();
                    setShowExportMenu(false);
                  }}
                >
                  <FileJson size={15} style={{ color: 'var(--accent-secondary)' }} />
                  <span>Экспорт в .JSON</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Stats Summary Counters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px'
        }}
      >
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>Всего задач</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
            {stats.total}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>Ожидают выполнения</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '2px' }}>
            {stats.pending}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>В процессе</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-secondary)', marginTop: '2px' }}>
            {stats.inProgress}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>Выполнено</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-success)', marginTop: '2px' }}>
            {stats.completed}
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>Высокий приоритет</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--priority-high)', marginTop: '2px' }}>
            {stats.highPriority}
          </div>
        </div>
      </div>

      {/* 3. Filter Bar & Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 16px'
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', minWidth: '240px', flex: 1 }}>
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-subtle)'
            }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '34px', fontSize: '0.8rem' }}
            placeholder="Поиск по задачам, исполнителям, встречам..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>Статус:</span>
            {[
              { id: 'all', label: 'Все' },
              { id: 'pending', label: 'Ожидает' },
              { id: 'in_progress', label: 'В работе' },
              { id: 'completed', label: 'Выполнено' }
            ].map((st) => {
              const isActive = statusFilter === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id as ActionItemStatus | 'all')}
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.725rem',
                    fontWeight: 500,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--border-medium)' : 'transparent',
                    background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {st.label}
                </button>
              );
            })}
          </div>

          {/* Priority Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>Приоритет:</span>
            {[
              { id: 'all', label: 'Все' },
              { id: 'high', label: 'Высокий', color: 'var(--priority-high)' },
              { id: 'medium', label: 'Средний', color: 'var(--priority-medium)' },
              { id: 'low', label: 'Низкий', color: 'var(--priority-low)' }
            ].map((p) => {
              const isActive = priorityFilter === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPriorityFilter(p.id as Priority | 'all')}
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.725rem',
                    fontWeight: 500,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--border-medium)' : 'transparent',
                    background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
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
        </div>
      </div>

      {/* 4. Action Items Table */}
      <ActionItemsTable items={filteredItems} />

      {/* 5. Modals */}
      <ActionItemModal />
      <AddActionItemModal />
      <AiGenerateTableModal />
    </div>
  );
};
