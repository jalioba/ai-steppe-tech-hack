import React from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CalendarView } from './components/calendar/CalendarView';
import { TasksView } from './components/tasks/TasksView';
import { TranscriptionView } from './components/transcription/TranscriptionView';
import { RagChatView } from './components/chat/RagChatView';
import { LiveMeetingModal } from './components/live/LiveMeetingModal';
import { useMeetingContext } from './context/MeetingContext';
import {
  UploadCloud,
  FileText,
  CheckSquare,
  Bot,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { formatDateDisplay } from './utils/dateUtils';

export const App: React.FC = () => {
  const {
    activeNav,
    setActiveNav,
    meetings,
    actionItems,
    setSelectedEvent,
    setCurrentDate
  } = useMeetingContext();

  return (
    <div className="app-layout">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Viewport */}
      <div className="main-content">
        <Header />

        <main className="page-container">
          {/* 1. CALENDAR VIEW (Core focus of current phase) */}
          {activeNav === 'calendar' && <CalendarView />}

          {/* 2. PROTOCOLS VIEW (Ready for core processing stage) */}
          {activeNav === 'meetings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
                    Все протоколы встреч ({meetings.length})
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Структурированные протоколы по ТЗ: Решения, Темы и тезисы, Открытые вопросы
                  </p>
                </div>

                <button
                  className="btn btn-secondary"
                  onClick={() => setActiveNav('calendar')}
                >
                  <CalendarIcon size={16} />
                  <span>Открыть в календаре</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {meetings.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      padding: '20px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      backdropFilter: 'blur(16px)',
                      transition: 'border-color var(--transition-fast)',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setSelectedEvent({
                        id: m.id,
                        type: 'meeting',
                        title: m.title,
                        date: m.date,
                        status: m.status,
                        rawItem: m
                      });
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = 'var(--border-active)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = 'var(--border-subtle)')
                    }
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          className={`badge ${
                            m.status === 'processed' ? 'badge-low' : 'badge-cyan'
                          }`}
                        >
                          {m.status === 'processed' ? 'Обработана ИИ' : 'Запланирована'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                          {formatDateDisplay(m.date)} • {m.startTime} - {m.endTime}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--accent-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        Подробнее <ArrowRight size={13} />
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff' }}>
                      {m.title}
                    </h3>

                    {m.summary && (
                      <p
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--text-muted)',
                          marginTop: '8px',
                          lineHeight: 1.5
                        }}
                      >
                        {m.summary}
                      </p>
                    )}

                    {m.participants && (
                      <div
                        style={{
                          marginTop: '12px',
                          display: 'flex',
                          gap: '6px',
                          flexWrap: 'wrap'
                        }}
                      >
                        {m.participants.map((p) => (
                          <span
                            key={p}
                            style={{
                              fontSize: '0.725rem',
                              background: 'rgba(255, 255, 255, 0.05)',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              color: 'var(--text-subtle)'
                            }}
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. ACTION ITEMS STUDIO (User & AI Table Creation, Export, Filtering) */}
          {activeNav === 'tasks' && <TasksView />}

          {/* 4. AUDIO TRANSCRIPTION & DIARIZATION */}
          {activeNav === 'upload' && <TranscriptionView />}

          {/* 5. RAG CHAT */}
          {activeNav === 'chat' && <RagChatView />}
        </main>
      </div>

      {/* Google Meet Style Virtual Room Modal */}
      <LiveMeetingModal />
    </div>
  );
};
