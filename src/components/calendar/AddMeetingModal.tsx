import React, { useState } from 'react';
import { X, Calendar, Clock, Users, Plus } from 'lucide-react';
import { useMeetingContext } from '../../context/MeetingContext';

export const AddMeetingModal: React.FC = () => {
  const { isAddMeetingOpen, setIsAddMeetingOpen, addMeeting, currentDate } = useMeetingContext();

  const defaultDateStr = currentDate.toISOString().slice(0, 10);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDateStr);
  const [startTime, setStartTime] = useState('11:00');
  const [endTime, setEndTime] = useState('12:00');
  const [participantsText, setParticipantsText] = useState('');

  if (!isAddMeetingOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const participants = participantsText
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    addMeeting({
      title: title.trim(),
      date,
      startTime,
      endTime,
      participants: participants.length > 0 ? participants : ['Вы'],
      status: 'scheduled'
    });

    setIsAddMeetingOpen(false);
    setTitle('');
    setParticipantsText('');
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsAddMeetingOpen(false)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} style={{ color: 'var(--accent-secondary)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff' }}>
              Запланировать встречу
            </h3>
          </div>
          <button
            className="btn-ghost"
            onClick={() => setIsAddMeetingOpen(false)}
            style={{ width: '32px', height: '32px', padding: 0, cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Тема / Название встречи *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="например: Демо прототипа Whisper и синхронизация по API"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Дата проведения *</label>
                <input
                  type="date"
                  className="form-input"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Время (Начало - Конец)</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="time"
                    className="form-input"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <span style={{ color: 'var(--text-subtle)' }}>-</span>
                  <input
                    type="time"
                    className="form-input"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Участники (через запятую)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%' }}
                  placeholder="Данияр М., Айгерим С., Ерлан Т."
                  value={participantsText}
                  onChange={(e) => setParticipantsText(e.target.value)}
                />
              </div>
            </div>

            <div
              style={{
                padding: '12px 14px',
                background: 'rgba(6, 182, 212, 0.05)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.75rem',
                color: '#67e8f9',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Clock size={14} style={{ flexShrink: 0 }} />
              <span>
                Событие появится в календаре и будет включено в экспорт файла <code>.ics</code>.
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddMeetingOpen(false)}
            >
              Отмена
            </button>
            <button type="submit" className="btn btn-primary">
              <Plus size={16} />
              <span>Создать встречу</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
