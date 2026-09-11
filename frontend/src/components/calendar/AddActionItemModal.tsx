import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Calendar, User, AlertCircle, Plus } from 'lucide-react';
import { useMeetingContext } from '../../context/MeetingContext';
import { Priority } from '../../types/actionItem';

const TEAM_PRESETS = [
  'Алексей К.',
  'Данияр М.',
  'Айгерим С.',
  'Ерлан Т.',
  'Руслан Д.'
];

export const AddActionItemModal: React.FC = () => {
  const {
    isAddActionItemOpen,
    setIsAddActionItemOpen,
    addActionItem,
    targetCreateDate,
    setTargetCreateDate,
    meetings,
    currentDate
  } = useMeetingContext();

  const defaultDateStr = targetCreateDate || currentDate.toISOString().slice(0, 10);

  const [task, setTask] = useState('');
  const [assignee, setAssignee] = useState('');
  const [deadline, setDeadline] = useState(defaultDateStr);
  const [priority, setPriority] = useState<Priority>('medium');
  const [meetingId, setMeetingId] = useState<string>('');

  useEffect(() => {
    if (isAddActionItemOpen) {
      setDeadline(targetCreateDate || currentDate.toISOString().slice(0, 10));
    }
  }, [isAddActionItemOpen, targetCreateDate, currentDate]);

  if (!isAddActionItemOpen) return null;

  const handleClose = () => {
    setIsAddActionItemOpen(false);
    setTargetCreateDate(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim() || !assignee.trim() || !deadline) return;

    const selectedMeeting = meetings.find((m) => m.id === meetingId);

    addActionItem({
      task: task.trim(),
      assignee: assignee.trim(),
      deadline,
      priority,
      meetingId: meetingId || undefined,
      meetingTitle: selectedMeeting?.title,
      isAiGenerated: false
    });

    setIsAddActionItemOpen(false);
    setTargetCreateDate(null);
    setTask('');
    setAssignee('');
    setMeetingId('');
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckSquare size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff' }}>
              Добавить поручение (Action Item)
            </h3>
          </div>
          <button
            className="btn-ghost"
            onClick={handleClose}
            style={{ width: '32px', height: '32px', padding: 0, cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Суть задачи (Task) *</label>
              <textarea
                className="form-input"
                required
                rows={3}
                placeholder="например: Провести замер времени инференса Whisper на 2-минутном файле"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                autoFocus
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ответственный исполнитель *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="Имя или роль исполнителя"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              />
              {/* Quick Preset Chips */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', alignSelf: 'center' }}>
                  Быстрый выбор:
                </span>
                {TEAM_PRESETS.map((member) => (
                  <button
                    key={member}
                    type="button"
                    onClick={() => setAssignee(member)}
                    style={{
                      background: assignee === member ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)',
                      color: assignee === member ? '#ffffff' : 'var(--text-muted)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '2px 8px',
                      fontSize: '0.7rem',
                      cursor: 'pointer'
                    }}
                  >
                    {member}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Срок выполнения (Дедлайн) *</label>
                <input
                  type="date"
                  className="form-input"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Приоритет *</label>
                <select
                  className="form-input"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                >
                  <option value="high">Высокий (High)</option>
                  <option value="medium">Средний (Medium)</option>
                  <option value="low">Низкий (Low)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Привязать к встрече (опционально)</label>
              <select
                className="form-input"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
              >
                <option value="">-- Без привязки к встрече --</option>
                {meetings.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.date} | {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn-primary">
              <Plus size={16} />
              <span>Добавить поручение</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
