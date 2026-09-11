import React, { useState } from 'react';
import {
  X,
  Bot,
  Sparkles,
  CheckSquare,
  ArrowRight,
  RefreshCw,
  Plus,
  Check,
  FileText
} from 'lucide-react';
import { useMeetingContext } from '../../context/MeetingContext';
import { extractActionItemsFromText, ActionItemDraft } from '../../services/aiExtractorService';
import { Priority } from '../../types/actionItem';

export const AiGenerateTableModal: React.FC = () => {
  const {
    isAiGenerateOpen,
    setIsAiGenerateOpen,
    batchAddActionItems,
    meetings
  } = useMeetingContext();

  const [rawText, setRawText] = useState('');
  const [selectedMeetingId, setSelectedMeetingId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [drafts, setDrafts] = useState<ActionItemDraft[]>([]);
  const [step, setStep] = useState<'input' | 'preview'>('input');

  if (!isAiGenerateOpen) return null;

  const handleClose = () => {
    setIsAiGenerateOpen(false);
    setStep('input');
    setDrafts([]);
    setRawText('');
  };

  const handleSelectMeeting = (mId: string) => {
    setSelectedMeetingId(mId);
    const m = meetings.find((meet) => meet.id === mId);
    if (m?.transcript) {
      setRawText(m.transcript);
    } else if (m?.summary) {
      setRawText(m.summary);
    }
  };

  const handleRunAiExtraction = () => {
    if (!rawText.trim()) return;

    setIsProcessing(true);
    setTimeout(() => {
      const selectedMeeting = meetings.find((m) => m.id === selectedMeetingId);
      const extracted = extractActionItemsFromText(
        rawText,
        selectedMeeting?.id,
        selectedMeeting?.title
      );
      setDrafts(extracted);
      setIsProcessing(false);
      setStep('preview');
    }, 400);
  };

  const handleToggleDraft = (tempId: string) => {
    setDrafts((prev) =>
      prev.map((d) => (d.tempId === tempId ? { ...d, selected: !d.selected } : d))
    );
  };

  const handleUpdateDraft = (
    tempId: string,
    field: keyof ActionItemDraft,
    val: any
  ) => {
    setDrafts((prev) =>
      prev.map((d) => (d.tempId === tempId ? { ...d, [field]: val } : d))
    );
  };

  const handleToggleSelectAll = () => {
    const allSelected = drafts.every((d) => d.selected);
    setDrafts((prev) => prev.map((d) => ({ ...d, selected: !allSelected })));
  };

  const handleImportToTable = async () => {
    const selectedDrafts = drafts.filter((d) => d.selected);
    if (selectedDrafts.length === 0) return;

    const selectedMeeting = meetings.find((m) => m.id === selectedMeetingId);

    await batchAddActionItems(
      selectedDrafts.map((d) => ({
        task: d.task,
        assignee: d.assignee,
        deadline: d.deadline,
        priority: d.priority,
        meetingId: selectedMeeting?.id,
        meetingTitle: selectedMeeting?.title,
        isAiGenerated: true
      }))
    );

    handleClose();
  };

  const selectedCount = drafts.filter((d) => d.selected).length;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div
        className="modal-card"
        style={{ maxWidth: step === 'preview' ? '860px' : '680px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)'
              }}
            >
              <Bot size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff' }}>
                ИИ-Генератор таблицы поручений
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Автономное извлечение Action Items из стенограммы или заметок (100% Offline)
              </p>
            </div>
          </div>
          <button
            className="btn-ghost"
            onClick={handleClose}
            style={{ width: '32px', height: '32px', padding: 0, cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {step === 'input' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {meetings.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Выбрать стенограмму из обработанной встречи:</label>
                <select
                  className="form-input"
                  value={selectedMeetingId}
                  onChange={(e) => handleSelectMeeting(e.target.value)}
                >
                  <option value="">-- Выберите встречу --</option>
                  {meetings.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.date} | {m.title}
                    </option>
                  ))}
                </select>
              </div>
              )}

              {/* Textarea */}
              <div className="form-group">
                <label className="form-label">Текст встречи, диалог или тезисы *</label>
                <textarea
                  className="form-input"
                  rows={7}
                  placeholder="Вставьте сюда расшифровку аудиозаписи, заметки или договоренности со встречи..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div
                style={{
                  padding: '10px 14px',
                  background: 'rgba(16, 185, 129, 0.06)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.775rem',
                  color: '#6ee7b7',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Sparkles size={15} style={{ flexShrink: 0 }} />
                <span>
                  ИИ автоматически определит ответственных, описания задач, дедлайны и приоритеты. Вы сможете проверить и отредактировать результат перед импортом.
                </span>
              </div>
            </div>
          ) : (
            /* PREVIEW STEP */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    onClick={handleToggleSelectAll}
                  >
                    {drafts.every((d) => d.selected) ? 'Снять выделение' : 'Выбрать все'}
                  </button>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Найдено поручений: <strong>{drafts.length}</strong> (выбрано: {selectedCount})
                  </span>
                </div>

                <button
                  type="button"
                  className="btn-ghost"
                  style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => setStep('input')}
                >
                  <RefreshCw size={13} />
                  <span>Назад к тексту</span>
                </button>
              </div>

              {/* Drafts Editable Grid */}
              <div
                style={{
                  maxHeight: '360px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        fontSize: '0.7rem',
                        color: 'var(--text-subtle)',
                        textTransform: 'uppercase'
                      }}
                    >
                      <th style={{ padding: '8px 12px', width: '36px' }}>✓</th>
                      <th style={{ padding: '8px 12px' }}>Суть задачи</th>
                      <th style={{ padding: '8px 12px', width: '150px' }}>Ответственный</th>
                      <th style={{ padding: '8px 12px', width: '140px' }}>Срок (Дедлайн)</th>
                      <th style={{ padding: '8px 12px', width: '120px' }}>Приоритет</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drafts.map((d) => (
                      <tr
                        key={d.tempId}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          background: d.selected ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                          opacity: d.selected ? 1 : 0.4
                        }}
                      >
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={d.selected}
                            onChange={() => handleToggleDraft(d.tempId)}
                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                          />
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <input
                            type="text"
                            className="form-input"
                            style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                            value={d.task}
                            onChange={(e) => handleUpdateDraft(d.tempId, 'task', e.target.value)}
                          />
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <input
                            type="text"
                            className="form-input"
                            style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                            value={d.assignee}
                            onChange={(e) => handleUpdateDraft(d.tempId, 'assignee', e.target.value)}
                          />
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <input
                            type="date"
                            className="form-input"
                            style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                            value={d.deadline}
                            onChange={(e) => handleUpdateDraft(d.tempId, 'deadline', e.target.value)}
                          />
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <select
                            className="form-input"
                            style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                            value={d.priority}
                            onChange={(e) => handleUpdateDraft(d.tempId, 'priority', e.target.value as Priority)}
                          >
                            <option value="high">Высокий</option>
                            <option value="medium">Средний</option>
                            <option value="low">Низкий</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={handleClose}>
            Отмена
          </button>

          {step === 'input' ? (
            <button
              type="button"
              className="btn btn-primary"
              disabled={!rawText.trim() || isProcessing}
              onClick={handleRunAiExtraction}
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={15} className="spin" />
                  <span>Обработка ИИ...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Извлечь поручения через ИИ</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              disabled={selectedCount === 0}
              onClick={handleImportToTable}
            >
              <Check size={16} />
              <span>Добавить в таблицу и календарь ({selectedCount})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
