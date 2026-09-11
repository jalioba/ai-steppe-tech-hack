import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Users,
  MessageSquare,
  ShieldCheck,
  Bot,
  Volume2
} from 'lucide-react';

interface MeetingRoomProps {
  onEndMeeting: (transcript: string) => void;
}

interface TranscriptLine {
  speaker: string;
  text: string;
  time: string;
}

export const MeetingRoom: React.FC<MeetingRoomProps> = ({ onEndMeeting }) => {
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [activeSpeaker, setActiveSpeaker] = useState<string>('Вы');

  // Realistic live transcript simulation showing consensus forming
  const [transcriptLines, setTranscriptLines] = useState<TranscriptLine[]>([
    {
      speaker: 'Вы (Организатор)',
      text: 'Коллеги, открываем совещание. Главная цель — зафиксировать архитектурные решения по нашему проекту.',
      time: '00:02'
    }
  ]);

  const simulatedRemarks = [
    {
      speaker: 'Данияр М.',
      text: 'По бэкенду предлагаю сразу строить чистый Django REST Framework без костылей. Все эндпоинты протоколов и задач строго по спецификации.',
      delay: 3
    },
    {
      speaker: 'Алексей К.',
      text: 'Полностью согласен. Никаких внешних облачных API — инференс Whisper и модели Qwen запускаем строго 100% локально на машине.',
      delay: 7
    },
    {
      speaker: 'Айгерим С.',
      text: 'По фронтенду: обязательна таблица поручений с экспортом в CSV (UTF-8 BOM для Excel) и интерактивный календарь дедлайнов.',
      delay: 11
    },
    {
      speaker: 'Данияр М.',
      text: 'По диаризации спикеров возник спор: брать ли тяжелый PyAnnote или спектральный кластеризатор? Давайте сравним на 2-минутной записи.',
      delay: 15
    },
    {
      speaker: 'Алексей К.',
      text: 'Договорились. Итого без споров: 100% оффлайн, Django бэкенд, таблица задач и календарь дедлайнов утверждены единогласно!',
      delay: 19
    }
  ];

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Transcript scheduler
  useEffect(() => {
    simulatedRemarks.forEach(({ speaker, text, delay }) => {
      const timeout = setTimeout(() => {
        const timeStr = `00:${delay.toString().padStart(2, '0')}`;
        setActiveSpeaker(speaker);
        setTranscriptLines((prev) => [...prev, { speaker, text, time: timeStr }]);
      }, delay * 1000);
      return () => clearTimeout(timeout);
    });
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleEndCall = () => {
    const fullTranscript = transcriptLines
      .map((l) => `${l.speaker} (${l.time}): ${l.text}`)
      .join('\n');
    onEndMeeting(fullTranscript);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '85vh',
        maxHeight: '760px',
        background: '#0d1117',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border-medium)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}
    >
      {/* 1. Top Bar: Meeting Info & Live Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'rgba(0, 0, 0, 0.5)',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.725rem',
              color: '#f43f5e',
              fontWeight: 600
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#f43f5e',
                animation: 'pulse 1.5s infinite'
              }}
            />
            <span>REC • ИДЕТ ЗАПИСЬ</span>
          </div>

          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff' }}>
            Синхронизация по архитектуре проекта и Django бэкенду
          </h3>

          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '2px 8px',
              borderRadius: '4px'
            }}
          >
            {formatTimer(seconds)}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              color: '#6ee7b7'
            }}
          >
            <ShieldCheck size={14} />
            <span>100% Offline | Аудио не покидает устройство</span>
          </div>
        </div>
      </div>

      {/* 2. Main Video / Audio Grid (Google Meet Layout) */}
      <div
        style={{
          flex: 1,
          padding: '16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: '12px',
          overflow: 'hidden'
        }}
      >
        {/* Tile 1: You */}
        <div
          style={{
            background: '#161b22',
            borderRadius: 'var(--radius-md)',
            border: activeSpeaker === 'Вы' ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '8px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: 700,
              color: '#ffffff'
            }}
          >
            ВЫ
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '12px',
              background: 'rgba(0, 0, 0, 0.6)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isMuted ? <MicOff size={12} color="#f43f5e" /> : <Mic size={12} color="#10b981" />}
            <span>Вы (Организатор)</span>
          </div>
        </div>

        {/* Tile 2: AI Protocolist */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(6, 182, 212, 0.08))',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '8px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(6, 182, 212, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-secondary)',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
            }}
          >
            <Bot size={32} />
          </div>
          <span style={{ fontSize: '0.8rem', color: '#67e8f9', fontWeight: 600 }}>
            Автономный ИИ-Протоколист
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Ollama Qwen 2.5 • Локальный стенографист
          </span>

          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '12px',
              background: 'rgba(0, 0, 0, 0.6)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              color: '#67e8f9',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Volume2 size={12} />
            <span>Слушает и протоколирует</span>
          </div>
        </div>

        {/* Tile 3: Daniyar */}
        <div
          style={{
            background: '#161b22',
            borderRadius: 'var(--radius-md)',
            border: activeSpeaker === 'Данияр М.' ? '2px solid var(--accent-secondary)' : '1px solid var(--border-subtle)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '8px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              fontWeight: 700,
              color: '#ffffff'
            }}
          >
            ДМ
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '12px',
              background: 'rgba(0, 0, 0, 0.6)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Mic size={12} color="#10b981" />
            <span>Данияр М. (Backend)</span>
          </div>
        </div>

        {/* Tile 4: Aigerim */}
        <div
          style={{
            background: '#161b22',
            borderRadius: 'var(--radius-md)',
            border: activeSpeaker === 'Айгерим С.' ? '2px solid var(--accent-secondary)' : '1px solid var(--border-subtle)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '8px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              fontWeight: 700,
              color: '#ffffff'
            }}
          >
            АС
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '12px',
              background: 'rgba(0, 0, 0, 0.6)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Mic size={12} color="#10b981" />
            <span>Айгерим С. (Frontend)</span>
          </div>
        </div>
      </div>

      {/* 3. Live Speech Feed Ticker */}
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.4)',
          borderTop: '1px solid var(--border-subtle)',
          padding: '8px 20px',
          maxHeight: '75px',
          overflowY: 'auto',
          fontSize: '0.775rem',
          color: 'var(--text-muted)'
        }}
      >
        <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>Живая стенограмма: </span>
        {transcriptLines.length > 0 && (
          <span>
            <strong>{transcriptLines[transcriptLines.length - 1].speaker}:</strong>{' '}
            {transcriptLines[transcriptLines.length - 1].text}
          </span>
        )}
      </div>

      {/* 4. Bottom Control Bar (Google Meet Style) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '14px 20px',
          background: 'rgba(10, 14, 23, 0.95)',
          borderTop: '1px solid var(--border-subtle)'
        }}
      >
        {/* Mic Toggle */}
        <button
          className="btn-ghost"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: isMuted ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.08)',
            color: isMuted ? '#f43f5e' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          onClick={() => setIsMuted(!isMuted)}
          title={isMuted ? 'Включить микрофон' : 'Выключить микрофон'}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        {/* Video Toggle */}
        <button
          className="btn-ghost"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: !isVideoOn ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.08)',
            color: !isVideoOn ? '#f43f5e' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          onClick={() => setIsVideoOn(!isVideoOn)}
          title={isVideoOn ? 'Выключить камеру' : 'Включить камеру'}
        >
          {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>

        {/* End Call Button */}
        <button
          type="button"
          onClick={handleEndCall}
          style={{
            padding: '10px 24px',
            borderRadius: 'var(--radius-full)',
            background: '#ef4444',
            color: '#ffffff',
            border: 'none',
            fontWeight: 600,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
            transition: 'background var(--transition-fast)'
          }}
        >
          <PhoneOff size={18} />
          <span>Завершить совещание</span>
        </button>
      </div>
    </div>
  );
};
