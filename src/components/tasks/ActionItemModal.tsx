import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Calendar, User, Save, Trash2 } from 'lucide-react';
import { useMeetingContext } from '../../context/MeetingContext';
import { ActionItem, Priority, ActionItemStatus } from '../../types/actionItem';

export const ActionItemModal: React.FC = () => {
  const {
    editingActionItem,
    setEditingActionItem,
    updateActionItem,
    deleteActionItem,
    meetings
  } = useMeetingContext();

  const [task, setTask] = useState('');
  const [assignee, setAssignee] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<ActionItemStatus>('pending');
  const [meetingId, setMeetingId] = useState<string>('');

  useEffect(() => {
    if (editingActionItem) {
      setTask(editingActionItem.task);
      setAssignee(editingActionItem.assignee);
      setDeadline(editingActionItem.deadline);
      setPriority(editingActionItem.priority);
      setStatus(editingActionItem.status);
      setMeetingId(editingActionItem.meetingId || '');
    }
  }, [editingActionItem]);

  if (!editingActionItem) return null;

  const handleClose = () => {
    setEditingActionItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim() || !assignee.trim() || !deadline) return;

    const selectedMeeting = meetings.find((m) => m.id === meetingId);

    updateActionItem(editingActionItem.id, {
      task: task.trim(),
      assignee: assignee.trim(),
      deadline,
      priority,
      status,
      meetingId: meetingId || undefined,
      meetingTitle: selectedMeeting?.title || editingActionItem.meetingTitle
    });

    setEditingActionItem(null);
  };

  const handleDelete = () => {
    if (window.confirm('Вы действительно хотите удалить это поручение?')) {
      deleteActionItem(editingActionItem.id);
      setEditingActionItem(null);
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckSquare size={18} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff' }}>
              Редактирование поручения
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
              <label className="form-label">Суть задачи *</label>
              <textarea
                className="form-input"
                required
                rows={3}
                value={task}
                onChange={(e) => setTask(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Ответственный исполнитель *</label>
              <input
                type="text"
                className="form-input"
                required
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Дедлайн *</label>
                <input
                  type="date"
                  className="form-input"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Приоритет</label>
                <select
                  className="form-input"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                >
                  <option value="high">Высокий</option>
                  <option value="medium">Средний</option>
                  <option value="low">Низкий</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Статус выполнения</label>
                <select
                  className="form-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ActionItemStatus)}
                >
                  <option value="pending">Ожидает</option>
                  <option value="in_progress">В работе</option>
                  <option value="completed">Выполнено</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Связанная встреча</label>
                <select
                  className="form-input"
                  value={meetingId}
                  onChange={(e) => setMeetingId(e.target.value)}
                >
                  <option value="">-- Без привязки --</option>
                  {meetings.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.date} | {m.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ color: 'var(--priority-high)' }}
              onClick={handleDelete}
            >
              <Trash2 size={15} />
              <span>Удалить</span>
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Отмена
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={15} />
                <span>Сохранить изменения</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
