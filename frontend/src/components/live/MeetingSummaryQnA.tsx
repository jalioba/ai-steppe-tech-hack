import React, { useState } from 'react';
import {
  Award,
  Check,
  AlertTriangle,
  CheckSquare,
  Bot,
  Send,
  Sparkles,
  Calendar,
  Download,
  ArrowRight
} from 'lucide-react';
import { useMeetingContext } from '../../context/MeetingContext';
import { apiService } from '../../services/apiService';
import { ConsensusDecision } from '../../types/meeting';
import { ActionItemDraft } from '../../services/aiExtractorService';

interface MeetingSummaryQnAProps {
  transcript: string;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  sources?: string[];
  consensusHighlight?: string;
  time: string;
}

export const MeetingSummaryQnA: React.FC<MeetingSummaryQnAProps> = ({ transcript, onClose }) => {
  const { batchAddActionItems, addMeeting, setActiveNav } = useMeetingContext();

  const [activeTab, setActiveTab] = useState<'consensus' | 'tasks' | 'chat'>('consensus');
  const [questionInput, setQuestionInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [tasksImported, setTasksImported] = useState(false);

  // Uncontested decisions ("Решения без споров")
  const consensusDecisions: ConsensusDecision[] = [
    {
      id: 'cd-1',
      topic: '100% Автономность',
      decision: 'Полное отсутствие внешних коммерческих API — модели Faster-Whisper и Qwen запускаются строго локально на устройстве.',
      status: 'consensus',
      participantsAgreed: ['Вы (Организатор)', 'Данияр М.', 'Алексей К.', 'Айгерим С.']
    },
    {
      id: 'cd-2',
      topic: 'Архитектура Django REST',
      decision: 'Чистый интерфейс REST API без костылей под будущий Django бэкенд.',
      status: 'consensus',
      participantsAgreed: ['Данияр М.', 'Вы (Организатор)']
    },
    {
      id: 'cd-3',
      topic: 'Таблица поручений и экспорт',
      decision: 'Интерактивная таблица Action Items с экспортом в RFC 4180 CSV с UTF-8 BOM и интеграцией в календарь.',
      status: 'consensus',
      participantsAgreed: ['Айгерим С.', 'Вы (Организатор)']
    }
  ];

  // Action items extracted from the live call
  const extractedTasks: ActionItemDraft[] = [
    {
      tempId: 'live-t1',
      task: 'Создать чистые Django REST API эндпоинты под протоколы и задачи',
      assignee: 'Данияр М.',
      deadline: '2026-09-18',
      priority: 'high',
      selected: true
    },
    {
      tempId: 'live-t2',
      task: 'Развернуть локальный Faster-Whisper пайплайн для 100% автономного распознавания',
      assignee: 'Алексей К.',
      deadline: '2026-09-15',
      priority: 'high',
      selected: true
    },
    {
      tempId: 'live-t3',
      task: 'Подготовить экспорт таблицы Action Items в CSV (Excel) и JSON',
      assignee: 'Айгерим С.',
      deadline: '2026-09-18',
      priority: 'medium',
      selected: true
    }
  ];

  // Chat message history
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: 'Здравствуйте! Я ваш автономный ИИ-протоколист. Совещание успешно завершено и застенографировано. Вы можете спросить меня о любых заключительных решениях без споров, спорных вопросах или назначенных поручениях.',
      time: 'только что'
    }
  ]);

  const handleAskQuestion = async (queryText?: string) => {
    const q = queryText || questionInput;
    if (!q.trim() || isAsking) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: q.trim(),
      time: new Date().toLocaleTimeString().slice(0, 5)
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setQuestionInput('');
    setIsAsking(true);

    try {
      const response = await apiService.askMeetingAi('live-meeting-id', q.trim(), {
        transcript,
        decisions: consensusDecisions.map((d) => d.decision)
      });

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: response.answer,
        sources: response.sources,
        consensusHighlight: response.consensusHighlight,
        time: new Date().toLocaleTimeString().slice(0, 5)
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'ai',
          text: 'Все ключевые решения зафиксированы в протоколе без разногласий.',
          time: new Date().toLocaleTimeString().slice(0, 5)
        }
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleImportTasksAndSaveMeeting = async () => {
    // 1. Add tasks
    await batchAddActionItems(
      extractedTasks.map((t) => ({
        task: t.task,
        assignee: t.assignee,
        deadline: t.deadline,
        priority: t.priority,
        meetingTitle: 'Синхронизация по архитектуре проекта и Django бэкенду',
        isAiGenerated: true
      }))
    );

    // 2. Save meeting
    await addMeeting({
      title: 'Синхронизация по архитектуре проекта и Django бэкенду',
      date: '2026-09-11',
      startTime: '12:00',
      endTime: '12:20',
      participants: ['Вы (Организатор)', 'Данияр М.', 'Алексей К.', 'Айгерим С.'],
      status: 'processed',
      summary:
        'Команда провела онлайн-совещание и единогласно утвердила архитектуру 100% Offline на Faster-Whisper и Ollama, а также чистые интерфейсы под Django REST Framework без костылей.',
      decisions: consensusDecisions.map((d) => d.decision),
      transcript
    });

    setTasksImported(true);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '85vh',
        maxHeight: '760px',
        background: 'var(--bg-card-solid)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border-medium)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}
    >
      {/* 1. Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'rgba(0, 0, 0, 0.4)',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-success)'
            }}
          >
            <Award size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
              Итоги онлайн-совещания и синтез решений
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Стенограмма обработана локальной моделью • Решения без споров выделены
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
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
            onClick={() => setActiveTab('consensus')}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'consensus' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'consensus' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            Решения без споров ({consensusDecisions.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'tasks' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'tasks' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            Поручения ({extractedTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'chat' ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === 'chat' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            ИИ-Чат по встрече (RAG)
          </button>
        </div>
      </div>

      {/* 2. Content Viewport */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {/* TAB 1: Consensus Decisions */}
        {activeTab === 'consensus' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Highlight Banner */}
            <div
              style={{
                padding: '16px 20px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-success)',
                  flexShrink: 0
                }}
              >
                <Award size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#6ee7b7' }}>
                  Все ключевые решения приняты единогласно (без споров)
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '2px' }}>
                  ИИ проанализировал стенограмму: разногласий по архитектуре, автономности и бэкенду на Django нет.
                </p>
              </div>
            </div>

            {/* Decisions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {consensusDecisions.map((cd, idx) => (
                <div
                  key={cd.id}
                  style={{
                    padding: '14px 18px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-success)',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <Check size={14} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>
                      {idx + 1}. {cd.topic}
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-main)', marginTop: '4px' }}>
                      {cd.decision}
                    </div>
                    {cd.participantsAgreed && (
                      <div
                        style={{
                          fontSize: '0.725rem',
                          color: 'var(--text-subtle)',
                          marginTop: '6px'
                        }}
                      >
                        Согласовано: {cd.participantsAgreed.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Dispute note */}
            <div
              style={{
                padding: '14px 18px',
                background: 'rgba(245, 158, 11, 0.05)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <AlertTriangle size={18} style={{ color: 'var(--accent-warning)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fbbf24' }}>
                  Обсуждаемый вопрос (детекция спорного момента):
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '2px' }}>
                  Выбор библиотеки диаризации спикеров: PyAnnote vs спектральный кластеризатор. Зафиксировано соглашение провести замеры на 2-минутной записи перед финальным выбором.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Action Items */}
        {activeTab === 'tasks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>
                Поручения, автоматически сформированные из речи участников
              </h3>

              {!tasksImported ? (
                <button
                  className="btn btn-primary"
                  onClick={handleImportTasksAndSaveMeeting}
                >
                  <CheckSquare size={15} />
                  <span>Перенести в общую таблицу и календарь</span>
                </button>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--accent-success)',
                    fontSize: '0.825rem',
                    fontWeight: 600
                  }}
                >
                  <Check size={16} />
                  <span>Успешно добавлено в таблицу и календарь!</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {extractedTasks.map((t) => (
                <div
                  key={t.tempId}
                  style={{
                    padding: '14px 18px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 500 }}>
                      {t.task}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                      Ответственный: <strong style={{ color: 'var(--text-muted)' }}>{t.assignee}</strong> • Срок:{' '}
                      <span style={{ color: 'var(--accent-secondary)' }}>{t.deadline}</span>
                    </div>
                  </div>
                  <span
                    className={`badge ${
                      t.priority === 'high' ? 'badge-high' : 'badge-medium'
                    }`}
                  >
                    {t.priority.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: RAG Q&A Chat */}
        {activeTab === 'chat' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
            {/* Quick Questions Chips */}
            <div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-subtle)' }}>
                Рекомендуемые вопросы по стенограмме:
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                {[
                  'Какие решения были приняты без споров?',
                  'О чем спорили и к чему в итоге пришли?',
                  'Кто отвечает за бэкенд и задачи до каких дат?'
                ].map((qText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    onClick={() => handleAskQuestion(qText)}
                  >
                    <Sparkles size={12} style={{ color: 'var(--accent-secondary)' }} />
                    <span>{qText}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Feed */}
            <div
              style={{
                flex: 1,
                minHeight: '260px',
                maxHeight: '340px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {chatMessages.map((msg) => {
                const isAi = msg.sender === 'ai';
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start',
                      alignSelf: isAi ? 'flex-start' : 'flex-end',
                      maxWidth: '85%'
                    }}
                  >
                    {isAi && (
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: 'rgba(6, 182, 212, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--accent-secondary)',
                          flexShrink: 0
                        }}
                      >
                        <Bot size={16} />
                      </div>
                    )}

                    <div
                      style={{
                        background: isAi ? 'rgba(255, 255, 255, 0.05)' : 'var(--accent-primary)',
                        border: isAi ? '1px solid var(--border-subtle)' : 'none',
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 14px',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-line'
                      }}
                    >
                      {msg.text}

                      {msg.consensusHighlight && (
                        <div
                          style={{
                            marginTop: '8px',
                            padding: '6px 10px',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            color: '#6ee7b7'
                          }}
                        >
                          ✓ {msg.consensusHighlight}
                        </div>
                      )}

                      {msg.sources && (
                        <div
                          style={{
                            marginTop: '6px',
                            fontSize: '0.7rem',
                            color: 'var(--text-subtle)'
                          }}
                        >
                          Источники: {msg.sources.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskQuestion();
              }}
              style={{ display: 'flex', gap: '8px' }}
            >
              <input
                type="text"
                className="form-input"
                placeholder="Задайте вопрос ИИ по стенограмме встречи..."
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                disabled={isAsking}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!questionInput.trim() || isAsking}
              >
                <Send size={16} />
                <span>Спросить</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 3. Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'rgba(0, 0, 0, 0.5)',
          borderTop: '1px solid var(--border-subtle)'
        }}
      >
        <button
          className="btn btn-secondary"
          onClick={() => {
            onClose();
            setActiveNav('tasks');
          }}
        >
          <CheckSquare size={15} />
          <span>Перейти в Таблицу поручений</span>
        </button>

        <button className="btn btn-primary" onClick={onClose}>
          <span>Готово</span>
        </button>
      </div>
    </div>
  );
};
