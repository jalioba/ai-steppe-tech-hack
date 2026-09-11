import React from 'react';
import {
  Calendar,
  FileText,
  UploadCloud,
  CheckSquare,
  Bot,
  Sparkles,
  HardDrive
} from 'lucide-react';
import { useMeetingContext, NavTab } from '../../context/MeetingContext';

interface NavItem {
  id: NavTab;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeColor?: 'indigo' | 'cyan' | 'high' | 'medium' | 'low';
}

export const Sidebar: React.FC = () => {
  const { activeNav, setActiveNav, meetings, actionItems } = useMeetingContext();

  const pendingTasksCount = actionItems.filter((t) => t.status !== 'completed').length;

  const navItems: NavItem[] = [
    {
      id: 'calendar',
      label: 'Календарь и дедлайны',
      sublabel: 'Встречи и сроки задач',
      icon: <Calendar size={18} />,
      badge: `${meetings.length + actionItems.length}`,
      badgeColor: 'indigo'
    },
    {
      id: 'meetings',
      label: 'Протоколы встреч',
      sublabel: 'Executive Summary и тезисы',
      icon: <FileText size={18} />,
      badge: meetings.length,
      badgeColor: 'cyan'
    },
    {
      id: 'upload',
      label: 'Транскрибация аудио',
      sublabel: 'MP3, WAV, M4A → Текст',
      icon: <UploadCloud size={18} />
    },
    {
      id: 'tasks',
      label: 'Таблица поручений',
      sublabel: 'Action Items с дедлайнами',
      icon: <CheckSquare size={18} />,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
      badgeColor: 'high'
    },
    {
      id: 'chat',
      label: 'ИИ-Ассистент (RAG)',
      sublabel: 'Вопросы по содержанию',
      icon: <Bot size={18} />,
      badge: 'Бонус',
      badgeColor: 'cyan'
    }
  ];

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        background: 'var(--bg-card-solid)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 20,
        backdropFilter: 'blur(20px)'
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)',
            color: '#ffffff'
          }}
        >
          <Sparkles size={22} />
        </div>
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: '0.95rem',
              letterSpacing: '-0.02em',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            AI Meeting Intel
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
            Автономный протоколист
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div
          style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-subtle)',
            padding: '4px 12px 8px'
          }}
        >
          Навигация
        </div>
        {navItems.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all var(--transition-fast)',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: isActive ? 'var(--accent-secondary)' : 'inherit' }}>
                  {item.icon}
                </span>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 500 }}>
                    {item.label}
                  </div>
                  {item.sublabel && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                      {item.sublabel}
                    </div>
                  )}
                </div>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`badge ${
                    item.badgeColor === 'high'
                      ? 'badge-high'
                      : item.badgeColor === 'cyan'
                      ? 'badge-cyan'
                      : 'badge-indigo'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Local Spec Footer */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(0, 0, 0, 0.25)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <HardDrive size={14} style={{ color: 'var(--accent-secondary)' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Локальные модели
          </span>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          <div>• Whisper: <span style={{ color: '#a5b4fc' }}>Faster-Whisper (int8)</span></div>
          <div>• LLM: <span style={{ color: '#67e8f9' }}>Ollama / Qwen-2.5-7B</span></div>
        </div>
      </div>
    </aside>
  );
};
