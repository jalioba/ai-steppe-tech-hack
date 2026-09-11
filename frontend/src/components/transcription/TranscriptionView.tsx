import React, { useRef, useState, useEffect } from 'react';
import { useMeetingContext } from '../../context/MeetingContext';
import {
  Play,
  Pause,
  UploadCloud,
  Sparkles,
  Edit2,
  Check,
  Clock,
  Volume2,
  Users,
  Calendar as CalendarIcon,
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface Segment {
  id: string;
  speakerId: string;
  speakerName: string;
  startTime: number;
  endTime: number;
  text: string;
}

const DEFAULT_SEGMENTS: Segment[] = [
  {
    id: 'seg-1',
    speakerId: 'spk-1',
    speakerName: 'Алексей К. (PM)',
    startTime: 0,
    endTime: 14,
    text: 'Коллеги, открываем совещание по проекту "AI meeting". Наша главная задача — обеспечить 100% Offline запуск сервиса на базе WhisperX и локальной Ollama Qwen2.'
  },
  {
    id: 'seg-2',
    speakerId: 'spk-2',
    speakerName: 'Данияр М. (ML)',
    startTime: 15,
    endTime: 38,
    text: 'Инференс Faster-Whisper с int8 квантованием занимает 1.8 секунды на двухминутной записи. Диаризация спикеров выделяет голоса с точностью выше 94%.'
  },
  {
    id: 'seg-3',
    speakerId: 'spk-3',
    speakerName: 'Айгерим С. (Frontend)',
    startTime: 39,
    endTime: 65,
    text: 'По интерфейсу мы собрали интерактивный календарь дедлайнов, студию таблицы поручений и RAG-чат со сжатым и полным режимами выгрузки.'
  },
  {
    id: 'seg-4',
    speakerId: 'spk-1',
    speakerName: 'Алексей К. (PM)',
    startTime: 66,
    endTime: 95,
    text: 'Отлично. Поручения: Данияр, подготовь скрипт автоматической загрузки весов до 12 сентября. Айгерим, замер скорости до 14 сентября.'
  }
];

export const TranscriptionView: React.FC = () => {
  const { meetings, setActiveNav, setIsAiGenerateOpen } = useMeetingContext();
  const currentMeeting = meetings[0];

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(95);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [segments, setSegments] = useState<Segment[]>(DEFAULT_SEGMENTS);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('meeting_sprint_kickoff_offline.wav');

  const [editingSpeakerId, setEditingSpeakerId] = useState<string | null>(null);
  const [editingSpeakerName, setEditingSpeakerName] = useState<string>('');

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      // simulated playback
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isPlaying && !audioUrl) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, audioUrl, duration, playbackSpeed]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current && audioUrl) {
      audioRef.current.currentTime = val;
    }
  };

  const jumpToTime = (time: number) => {
    setCurrentTime(time);
    if (audioRef.current && audioUrl) {
      audioRef.current.currentTime = time;
    }
    setIsPlaying(true);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setAudioUrl(URL.createObjectURL(file));
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const saveRename = (spkId: string) => {
    if (editingSpeakerName.trim()) {
      setSegments(prev =>
        prev.map(s => (s.speakerId === spkId ? { ...s, speakerName: editingSpeakerName.trim() } : s))
      );
    }
    setEditingSpeakerId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
          onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Top Header Card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff' }}>
              Транскрибация аудио и разбор спикеров
            </h2>
            <span className="badge badge-indigo">WhisperX + Diarization</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Синхронное воспроизведение аудио, таймкоды реплик и автоматическая разметка спикеров
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="file"
            ref={fileInputRef}
            accept="audio/mp3,audio/wav,audio/m4a,.mp3,.wav,.m4a"
            style={{ display: 'none' }}
            onChange={onFileSelect}
          />
          <button
            className="btn btn-secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={16} />
            <span>Загрузить MP3 / WAV</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={() => setIsAiGenerateOpen(true)}
          >
            <Sparkles size={16} />
            <span>Сформировать протокол ИИ</span>
          </button>
        </div>
      </div>

      {/* Audio Player Studio Bar */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 24px',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              className="btn-primary"
              onClick={togglePlay}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: 'none'
              }}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
            </button>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#ffffff' }}>
                {fileName}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                {currentMeeting ? currentMeeting.title : 'Автономная сессия'} • {segments.length} реплик
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {[1.0, 1.25, 1.5, 2.0].map(speed => (
              <button
                key={speed}
                onClick={() => {
                  setPlaybackSpeed(speed);
                  if (audioRef.current) audioRef.current.playbackRate = speed;
                }}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: playbackSpeed === speed ? 'var(--accent-primary)' : 'var(--border-subtle)',
                  background: playbackSpeed === speed ? 'var(--accent-primary)' : 'transparent',
                  color: playbackSpeed === speed ? '#ffffff' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            style={{
              flex: 1,
              accentColor: 'var(--accent-primary)',
              cursor: 'pointer'
            }}
          />
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Segments Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {segments.map(seg => {
          const isActive = currentTime >= seg.startTime && currentTime <= seg.endTime;
          return (
            <div
              key={seg.id}
              onClick={() => jumpToTime(seg.startTime)}
              style={{
                padding: '14px 18px',
                background: isActive ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-card)',
                border: '1px solid',
                borderColor: isActive ? 'var(--accent-primary)' : 'var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                backdropFilter: 'blur(12px)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                position: 'relative'
              }}
            >
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '3px',
                    background: 'var(--accent-primary)',
                    borderTopLeftRadius: 'var(--radius-md)',
                    borderBottomLeftRadius: 'var(--radius-md)'
                  }}
                />
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {editingSpeakerId === seg.speakerId ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        className="form-input"
                        style={{ padding: '2px 8px', fontSize: '0.8rem', height: '26px' }}
                        value={editingSpeakerName}
                        autoFocus
                        onChange={e => setEditingSpeakerName(e.target.value)}
                        onBlur={() => saveRename(seg.speakerId)}
                        onKeyDown={e => e.key === 'Enter' && saveRename(seg.speakerId)}
                      />
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '2px' }}
                        onClick={() => saveRename(seg.speakerId)}
                      >
                        <Check size={14} color="var(--priority-low)" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="badge badge-indigo">
                        <Users size={12} />
                        {seg.speakerName}
                      </span>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '2px', color: 'var(--text-subtle)' }}
                        title="Переименовать спикера"
                        onClick={e => {
                          e.stopPropagation();
                          setEditingSpeakerId(seg.speakerId);
                          setEditingSpeakerName(seg.speakerName);
                        }}
                      >
                        <Edit2 size={12} />
                      </button>
                    </>
                  )}
                </div>

                <div
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    color: 'var(--accent-secondary)',
                    background: 'rgba(6, 182, 212, 0.1)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Clock size={11} />
                  <span>
                    {formatTime(seg.startTime)} - {formatTime(seg.endTime)}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                {seg.text}
              </p>
            </div>
          );
        })}
      </div>

      {/* Bottom Shortcuts */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
        <button
          className="btn btn-secondary"
          onClick={() => setActiveNav('calendar')}
        >
          <CalendarIcon size={16} />
          <span>Календарь дедлайнов</span>
        </button>
        <button
          className="btn btn-primary"
          onClick={() => setActiveNav('tasks')}
        >
          <span>Таблица поручений</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
