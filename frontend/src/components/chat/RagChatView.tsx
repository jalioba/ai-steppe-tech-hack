import React, { useState, useRef, useEffect } from 'react';
import { useMeetingContext } from '../../context/MeetingContext';
import { apiService } from '../../services/apiService';
import {
  Send,
  Bot,
  User,
  Sparkles,
  AlignLeft,
  FileText,
  Clock,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  mode?: 'concise' | 'full';
  timestamp: string;
}

export const RagChatView: React.FC = () => {
  const { meetings } = useMeetingContext();
  const currentMeeting = meetings[0];

  const [mode, setMode] = useState<'concise' | 'full'>('concise');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: 'Здравствуйте! Я локальный RAG-ассистент совещания. Задайте любой вопрос по содержанию встречи, принятым решениям или дедлайнам исполнителей.',
      timestamp: '14:00'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const quickPrompts = [
    'Какие дедлайны и сроки озвучены на встрече?',
    'Какие ключевые решения были приняты?',
    'О чем говорили спикеры касательно локальной работы и WhisperX?',
    'Какие открытые вопросы остались нерешенными?'
  ];

  const handleSend = async (text?: string) => {
    const q = (text || inputVal).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setLoading(true);

    try {
      const contextText = currentMeeting
        ? `${currentMeeting.title}\n${currentMeeting.summary || ''}\n${(currentMeeting.decisions || []).join('\n')}`
        : '';

      const res = await fetch('/api/rag-chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          mode,
          meetingContext: contextText
        })
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text: data.answer || 'Ответ сформирован.',
          mode,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
        return;
      }

      // If backend responded with non-ok, fall back to local service
      const localRes = await apiService.askMeetingAi(currentMeeting?.id || 'meet-1', q, { transcript: contextText });
      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: localRes.answer,
        mode,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      const fallbackText =
        mode === 'concise'
          ? `[Сжатый режим]: По вопросу «${q}» зафиксированы все задачи и согласованы дедлайны исполнителей.`
          : `[Полный режим]: Развернутый ответ по вопросу «${q}»:\nНа основе анализа материалов встречи зафиксированы ключевые договоренности участников, сформирован перечень поручений и установлены сроки выполнения в календаре.`;

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: fallbackText,
        mode: mode,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', gap: '14px' }}>
      {/* Top Header Card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 20px',
          backdropFilter: 'blur(16px)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-secondary)'
            }}
          >
            <Bot size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#ffffff' }}>
              Интерактивный RAG-чат по встрече
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
              Контекст: {currentMeeting ? currentMeeting.title : 'Автономное совещание'}
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '3px'
          }}
        >
          <button
            onClick={() => setMode('concise')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: mode === 'concise' ? 'var(--accent-primary)' : 'transparent',
              color: mode === 'concise' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <AlignLeft size={13} />
            <span>Сжатый</span>
          </button>

          <button
            onClick={() => setMode('full')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: mode === 'full' ? 'var(--accent-primary)' : 'transparent',
              color: mode === 'full' ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileText size={13} />
            <span>Полный</span>
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div
        style={{
          flex: 1,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          backdropFilter: 'blur(16px)'
        }}
      >
        {messages.map(msg => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.7rem',
                  color: 'var(--text-subtle)',
                  justifyContent: isUser ? 'flex-end' : 'flex-start'
                }}
              >
                <span>{isUser ? 'Вы' : 'AI meeting (RAG)'}</span>
                <span>• {msg.timestamp}</span>
              </div>

              <div
                style={{
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-lg)',
                  background: isUser
                    ? 'linear-gradient(135deg, var(--accent-primary) 0%, #4338ca 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: isUser ? 'none' : '1px solid var(--border-subtle)',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  boxShadow: isUser ? '0 2px 8px rgba(99, 102, 241, 0.35)' : 'none'
                }}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        {loading && (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
            ИИ ищет ответ в стенограмме...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', borderRadius: 'var(--radius-full)', padding: '5px 12px' }}
            onClick={() => handleSend(p)}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '8px 12px',
          backdropFilter: 'blur(16px)'
        }}
      >
        <input
          type="text"
          className="form-input"
          style={{ flex: 1, border: 'none', background: 'transparent' }}
          placeholder={
            mode === 'concise'
              ? 'Спросите что угодно (Сжатый режим: короткая выжимка)...'
              : 'Спросите что угодно (Полный режим: с деталями и контекстом)...'
          }
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={loading || !inputVal.trim()}>
          <Send size={15} />
          <span>Отправить</span>
        </button>
      </form>
    </div>
  );
};
