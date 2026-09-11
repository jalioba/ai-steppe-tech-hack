/**
 * Meeting Intelligence types - strictly aligned with ТЗ
 */

export type MeetingStatus = 'scheduled' | 'in_progress' | 'processed';

export interface ProtocolTopic {
  topic: string; // Тема / смысловой блок
  notes: string; // Тезисы и детали обсуждения
}

export interface ProtocolRisk {
  risk: string; // Спорный вопрос или риск
  severity: 'low' | 'medium' | 'high';
}

export interface ConsensusDecision {
  id: string;
  topic: string;
  decision: string;
  status: 'consensus' | 'disputed' | 'open';
  participantsAgreed?: string[];
}

export interface Meeting {
  id: string;
  title: string;
  date: string; // Format: YYYY-MM-DD
  startTime: string; // Format: HH:mm
  endTime: string; // Format: HH:mm
  participants: string[];
  status: MeetingStatus;

  // Must-Have ТЗ: Executive Summary (3–5 ключевых предложений)
  summary?: string;

  // Must-Have ТЗ: Принятые решения — четкий список того, о чем договорились
  decisions?: string[];

  // Решения без споров (Consensus decisions)
  consensusDecisions?: ConsensusDecision[];

  // Must-Have ТЗ: Темы и тезисы — разделение встречи на смысловые блоки
  topics?: ProtocolTopic[];

  // Must-Have ТЗ: Открытые вопросы — темы, не получившие финального решения
  openQuestions?: string[];

  // Бонус ТЗ: Детекция рисков и блокеров
  risks?: ProtocolRisk[];

  // Полный транскрипт встречи для RAG-чата и анализа
  transcript?: string;

  // Аудио метаданные (для будущего этапа локального Whisper)
  audioFileName?: string;
  audioDuration?: string;
  language?: 'ru' | 'kz' | 'en' | 'mixed';
  createdAt?: string;
}
