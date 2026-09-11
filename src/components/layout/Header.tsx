import React from 'react';
import { Search, Globe, Plus } from 'lucide-react';
import { useMeetingContext } from '../../context/MeetingContext';
import { OfflineBadge } from './OfflineBadge';

export const Header: React.FC = () => {
  const {
    activeNav,
    searchQuery,
    setSearchQuery,
    language,
    setLanguage,
    setIsAddMeetingOpen
  } = useMeetingContext();

  const titles: Record<string, { title: string; subtitle: string }> = {
    calendar: {
      title: 'Календарь и дедлайны',
      subtitle: 'Интерактивное расписание встреч и сроков выполнения поручений'
    },
    meetings: {
      title: 'Протоколы совещаний',
      subtitle: 'Executive Summary, принятые решения и открытые вопросы'
    },
    upload: {
      title: 'Автономная транскрибация',
      subtitle: 'Локальная обработка аудио через Faster-Whisper без внешних API'
    },
    tasks: {
      title: 'Таблица поручений',
      subtitle: 'Контроль исполнителей, сроков и приоритетов задач'
    },
    chat: {
      title: 'ИИ-Ассистент по встречам',
      subtitle: 'Локальный RAG-поиск ответов по содержанию стенограмм'
    }
  };

  const currentInfo = titles[activeNav] || titles.calendar;

  return (
    <header
      style={{
        height: 'var(--header-height)',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(10, 14, 23, 0.75)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 15,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px'
      }}
    >
      {/* Title & Subtitle */}
      <div>
        <h1
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--text-main)',
            lineHeight: 1.2
          }}
        >
          {currentInfo.title}
        </h1>
        <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
          {currentInfo.subtitle}
        </p>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Search Bar */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              color: 'var(--text-subtle)',
              pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            placeholder="Поиск по встречам, задачам, участникам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 14px 8px 36px',
              width: '280px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-main)',
              fontSize: '0.8125rem',
              outline: 'none',
              transition: 'all var(--transition-fast)'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
              e.currentTarget.style.width = '320px';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.width = '280px';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
            }}
          />
        </div>

        {/* Offline Badge */}
        <OfflineBadge />

        {/* Language Switcher (RU / KZ / EN) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '4px 6px'
          }}
        >
          <Globe size={14} style={{ color: 'var(--text-subtle)', marginLeft: '4px' }} />
          {(['ru', 'kz', 'en'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              style={{
                background: language === lang ? 'var(--accent-primary)' : 'transparent',
                color: language === lang ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '0.725rem',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all var(--transition-fast)'
              }}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Action Button: Add Meeting */}
        <button
          className="btn btn-primary"
          onClick={() => setIsAddMeetingOpen(true)}
          style={{ padding: '8px 14px' }}
        >
          <Plus size={16} />
          <span>Новая встреча</span>
        </button>
      </div>
    </header>
  );
};
