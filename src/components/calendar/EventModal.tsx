import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  CheckSquare,
  ShieldAlert,
  Download,
  Trash2,
  Check,
  Award
} from 'lucide-react';
import { useMeetingContext } from '../../context/MeetingContext';
import { Meeting } from '../../types/meeting';
import { ActionItem, ActionItemStatus } from '../../types/actionItem';
import { formatDateDisplay } from '../../utils/dateUtils';
import { exportMeetingProtocolToJson } from '../../services/exportService';

export const EventModal: React.FC = () => {
  const {
    selectedEvent,
    setSelectedEvent,
    actionItems,
    deleteMeeting,
    deleteActionItem,
    updateActionItem,
    toggleActionItemStatus
  } = useMeetingContext();

  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!selectedEvent) return null;

  const isMeeting = selectedEvent.type === 'meeting';
  const meeting = isMeeting ? (selectedEvent.rawItem as Meeting) : null;
  const actionItem = !isMeeting ? (selectedEvent.rawItem as ActionItem) : null;

  // If meeting, find all action items tied to this meeting
  const tiedTasks = meeting
    ? actionItems.filter((t) => t.meetingId === meeting.id)
    : [];

  return (
    <div className="modal-backdrop" onClick={() => setSelectedEvent(null)}>
      <div
        className="modal-card"
        style={{ maxWidth: '680px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              className={`badge ${
                isMeeting
                  ? 'badge-indigo'
                  : selectedEvent.priority === 'high'
                  ? 'badge-high'
                  : selectedEvent.priority === 'medium'
                  ? 'badge-medium'
                  : 'badge-low'
              }`}
            >
              {isMeeting ? 'Встреча' : 'Поручение'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {formatDateDisplay(selectedEvent.date)}
            </span>
          </div>

          <button
            className="btn-ghost"
            onClick={() => setSelectedEvent(null)}
            style={{ width: '32px', height: '32px', padding: 0, cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Title */}
          <div>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1.3
              }}
            >
              {selectedEvent.title}
            </h2>
            {selectedEvent.time && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--accent-secondary)',
                  fontSize: '0.825rem',
                  marginTop: '4px'
                }}
              >
                <Clock size={14} />
                <span>{selectedEvent.time}</span>
              </div>
            )}
          </div>

          {/* MEETING DETAILS */}
          {meeting && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Participants */}
              {meeting.participants && meeting.participants.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <Users size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Участники:</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {meeting.participants.map((p) => (
                      <span
                        key={p}
                        style={{
                          fontSize: '0.75rem',
                          background: 'rgba(255, 255, 255, 0.08)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          color: 'var(--text-main)'
                        }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Status & Processing State */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Статус обработки:</span>
                <span
                  className={`badge ${
                    meeting.status === 'processed' ? 'badge-low' : 'badge-cyan'
                  }`}
                >
                  {meeting.status === 'processed' ? 'Обработана локальным ИИ' : 'Запланирована'}
                </span>
                {meeting.audioFileName && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                    ({meeting.audioFileName})
                  </span>
                )}
              </div>

              {/* Must-Have: Executive Summary (3-5 sentences according to ТЗ) */}
              {meeting.summary ? (
                <div
                  style={{
                    padding: '14px 16px',
                    background: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#a5b4fc',
                      fontWeight: 600,
                      fontSize: '0.825rem',
                      marginBottom: '6px'
                    }}
                  >
                    <FileText size={15} />
                    <span>Executive Summary (Краткая выжимка для руководителя)</span>
                  </div>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-main)',
                      lineHeight: 1.6
                    }}
                  >
                    {meeting.summary}
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--border-subtle)',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    textAlign: 'center'
                  }}
                >
                  Аудиозапись еще не загружена. На следующем этапе будет доступна локальная транскрибация Whisper.
                </div>
              )}

              {/* Must-Have: Принятые решения */}
              {meeting.decisions && meeting.decisions.length > 0 && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#6ee7b7',
                      fontWeight: 600,
                      fontSize: '0.825rem',
                      marginBottom: '8px'
                    }}
                  >
                    <CheckCircle2 size={15} />
                    <span>Принятые решения</span>
                  </div>
                  <ul
                    style={{
                      listStyle: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    {meeting.decisions.map((dec, idx) => (
                      <li
                        key={idx}
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--text-main)',
                          padding: '8px 12px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: 'var(--radius-sm)',
                          borderLeft: '3px solid var(--priority-low)'
                        }}
                      >
                        {dec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ТЗ & User Feature: Решения без споров (Consensus) */}
              {meeting.consensusDecisions && meeting.consensusDecisions.length > 0 && (
                <div
                  style={{
                    padding: '12px 14px',
                    background: 'rgba(16, 185, 129, 0.06)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(16, 185, 129, 0.25)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#6ee7b7',
                      fontWeight: 600,
                      fontSize: '0.825rem',
                      marginBottom: '8px'
                    }}
                  >
                    <Award size={15} />
                    <span>Итоговые решения без споров (Единогласный консенсус)</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {meeting.consensusDecisions.map((cd) => (
                      <div
                        key={cd.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          fontSize: '0.8rem',
                          color: 'var(--text-main)'
                        }}
                      >
                        <Check size={14} style={{ color: 'var(--accent-success)', flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <strong style={{ color: '#ffffff' }}>{cd.topic}:</strong> {cd.decision}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Must-Have: Темы и тезисы */}
              {meeting.topics && meeting.topics.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      color: 'var(--accent-secondary)',
                      marginBottom: '8px'
                    }}
                  >
                    Темы и тезисы обсуждения
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {meeting.topics.map((t, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '10px 12px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#ffffff' }}>
                          {t.topic}
                        </div>
                        <div
                          style={{
                            fontSize: '0.775rem',
                            color: 'var(--text-muted)',
                            marginTop: '3px'
                          }}
                        >
                          {t.notes}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Must-Have: Открытые вопросы */}
              {meeting.openQuestions && meeting.openQuestions.length > 0 && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#fcd34d',
                      fontWeight: 600,
                      fontSize: '0.825rem',
                      marginBottom: '8px'
                    }}
                  >
                    <HelpCircle size={15} />
                    <span>Открытые вопросы (требуют решения)</span>
                  </div>
                  <ul
                    style={{
                      listStyle: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    {meeting.openQuestions.map((q, idx) => (
                      <li
                        key={idx}
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--text-main)',
                          padding: '6px 10px',
                          background: 'rgba(245, 158, 11, 0.05)',
                          borderRadius: 'var(--radius-sm)',
                          borderLeft: '3px solid var(--priority-medium)'
                        }}
                      >
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Бонус ТЗ: Риски и блокеры */}
              {meeting.risks && meeting.risks.length > 0 && (
                <div
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(244, 63, 94, 0.08)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(244, 63, 94, 0.25)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#fda4af',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      marginBottom: '6px'
                    }}
                  >
                    <ShieldAlert size={15} />
                    <span>Подсвеченные риски и спорные моменты</span>
                  </div>
                  {meeting.risks.map((r, idx) => (
                    <div key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                      • {r.risk}
                    </div>
                  ))}
                </div>
              )}

              {/* Action Items tied to this meeting */}
              {tiedTasks.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      color: '#ffffff',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <CheckSquare size={15} style={{ color: 'var(--accent-primary)' }} />
                    <span>Поручения по итогам встречи ({tiedTasks.length})</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {tiedTasks.map((task) => (
                      <div
                        key={task.id}
                        style={{
                          padding: '8px 12px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                          <button
                            type="button"
                            style={{
                              background: task.status === 'completed' ? 'var(--accent-success)' : 'transparent',
                              border: '1px solid',
                              borderColor: task.status === 'completed' ? 'var(--accent-success)' : 'var(--border-medium)',
                              width: '20px',
                              height: '20px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              flexShrink: 0
                            }}
                            onClick={() => toggleActionItemStatus(task.id)}
                            title={task.status === 'completed' ? 'Отметить как невыполненное' : 'Отметить как выполненное'}
                          >
                            {task.status === 'completed' && <Check size={13} color="#ffffff" />}
                          </button>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: '0.8125rem',
                                color: task.status === 'completed' ? 'var(--text-subtle)' : 'var(--text-main)',
                                textDecoration: task.status === 'completed' ? 'line-through' : 'none'
                              }}
                            >
                              {task.task}
                            </div>
                            <div
                              style={{
                                fontSize: '0.725rem',
                                color: 'var(--text-subtle)',
                                marginTop: '2px'
                              }}
                            >
                              Ответственный: <strong style={{ color: 'var(--text-muted)' }}>{task.assignee}</strong> • Срок:{' '}
                              {task.deadline}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`badge ${
                            task.priority === 'high'
                              ? 'badge-high'
                              : task.priority === 'medium'
                              ? 'badge-medium'
                              : 'badge-low'
                          }`}
                        >
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ACTION ITEM DETAILS */}
          {actionItem && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Ответственный</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff', marginTop: '2px' }}>
                      {actionItem.assignee}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Срок выполнения (Дедлайн)</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-secondary)', marginTop: '2px' }}>
                      {formatDateDisplay(actionItem.deadline)}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Приоритет</div>
                    <div style={{ marginTop: '4px' }}>
                      <span
                        className={`badge ${
                          actionItem.priority === 'high'
                            ? 'badge-high'
                            : actionItem.priority === 'medium'
                            ? 'badge-medium'
                            : 'badge-low'
                        }`}
                      >
                        {actionItem.priority === 'high'
                          ? 'Высокий приоритет'
                          : actionItem.priority === 'medium'
                          ? 'Средний приоритет'
                          : 'Низкий приоритет'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginBottom: '4px' }}>
                      Статус (клик для изменения)
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {(
                        [
                          { id: 'pending', label: 'Ожидает' },
                          { id: 'in_progress', label: 'В работе' },
                          { id: 'completed', label: 'Выполнено' }
                        ] as const
                      ).map((st) => {
                        const isActive = actionItem.status === st.id;
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => updateActionItem(actionItem.id, { status: st.id })}
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.725rem',
                              fontWeight: 500,
                              borderRadius: 'var(--radius-sm)',
                              border: isActive ? '1px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                              background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                              color: isActive ? '#ffffff' : 'var(--text-muted)',
                              cursor: 'pointer'
                            }}
                          >
                            {st.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {actionItem.meetingTitle && (
                  <div
                    style={{
                      marginTop: '16px',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--border-subtle)',
                      fontSize: '0.75rem',
                      color: 'var(--text-subtle)'
                    }}
                  >
                    Привязано к встрече: <span style={{ color: 'var(--text-muted)' }}>{actionItem.meetingTitle}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          {/* Left Actions */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {meeting && (
              <>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                  onClick={() => exportMeetingProtocolToJson(meeting)}
                  title="Скачать структурированный протокол в JSON"
                >
                  <Download size={14} style={{ color: 'var(--accent-secondary)' }} />
                  <span>Скачать JSON</span>
                </button>

                {!confirmDelete ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '6px 10px', color: 'var(--priority-high)' }}
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 size={14} />
                    <span>Удалить встречу</span>
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--priority-high)' }}>Удалить?</span>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ background: 'var(--priority-high)', padding: '4px 8px', fontSize: '0.75rem' }}
                      onClick={() => deleteMeeting(meeting.id)}
                    >
                      Да
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      onClick={() => setConfirmDelete(false)}
                    >
                      Нет
                    </button>
                  </div>
                )}
              </>
            )}

            {actionItem && (
              <>
                {!confirmDelete ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '6px 10px', color: 'var(--priority-high)' }}
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 size={14} />
                    <span>Удалить поручение</span>
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--priority-high)' }}>Точно удалить?</span>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ background: 'var(--priority-high)', padding: '4px 8px', fontSize: '0.75rem' }}
                      onClick={() => deleteActionItem(actionItem.id)}
                    >
                      Да
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      onClick={() => setConfirmDelete(false)}
                    >
                      Нет
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Actions */}
          <button className="btn btn-secondary" onClick={() => setSelectedEvent(null)}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
