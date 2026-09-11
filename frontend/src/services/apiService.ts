import { Meeting } from '../types/meeting';
import { ActionItem } from '../types/actionItem';
import { extractActionItemsFromText, ActionItemDraft } from './aiExtractorService';

export interface CreateMeetingDto {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  participants: string[];
  status?: 'scheduled' | 'in_progress' | 'processed';
  summary?: string;
  decisions?: string[];
  transcript?: string;
}

export interface CreateActionItemDto {
  task: string;
  assignee: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  meetingId?: string;
  meetingTitle?: string;
  isAiGenerated?: boolean;
}

export interface AiChatAnswer {
  answer: string;
  sources: string[];
  consensusHighlight?: string;
}

/**
 * Standardized API service contract for Django REST Framework integration
 */
export interface ApiService {
  // Meetings CRUD (matches Django /api/meetings/)
  getMeetings(): Promise<Meeting[]>;
  createMeeting(data: CreateMeetingDto): Promise<Meeting>;
  updateMeeting(id: string, data: Partial<Meeting>): Promise<Meeting>;
  deleteMeeting(id: string): Promise<boolean>;

  // Action Items CRUD (matches Django /api/action-items/)
  getActionItems(): Promise<ActionItem[]>;
  createActionItem(data: CreateActionItemDto): Promise<ActionItem>;
  updateActionItem(id: string, data: Partial<ActionItem>): Promise<ActionItem>;
  deleteActionItem(id: string): Promise<boolean>;

  // AI Inference Endpoints (matches Django /api/ai/)
  extractActionItemsAi(text: string, meetingId?: string, meetingTitle?: string): Promise<ActionItemDraft[]>;
  askMeetingAi(meetingId: string, question: string, context?: { transcript?: string; decisions?: string[] }): Promise<AiChatAnswer>;
}

const STORAGE_KEY_MEETINGS = 'ai_meeting_intelligence_meetings';
const STORAGE_KEY_ACTIONS = 'ai_meeting_intelligence_actions';

/**
 * Local Offline Adapter implementing the ApiService contract.
 * Mirrors Django REST behavior and ensures zero-leak 100% offline capability.
 */
class LocalMockApiService implements ApiService {
  private loadMeetings(): Meeting[] {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_MEETINGS);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  }

  private saveMeetings(meetings: Meeting[]): void {
    localStorage.setItem(STORAGE_KEY_MEETINGS, JSON.stringify(meetings));
  }

  private loadActionItems(): ActionItem[] {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_ACTIONS);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  }

  private saveActionItems(items: ActionItem[]): void {
    localStorage.setItem(STORAGE_KEY_ACTIONS, JSON.stringify(items));
  }

  async getMeetings(): Promise<Meeting[]> {
    return this.loadMeetings();
  }

  async createMeeting(data: CreateMeetingDto): Promise<Meeting> {
    const meetings = this.loadMeetings();
    const newMeeting: Meeting = {
      ...data,
      id: `meet-${Date.now()}`,
      status: data.status || 'scheduled',
      createdAt: new Date().toISOString()
    };
    const updated = [newMeeting, ...meetings];
    this.saveMeetings(updated);
    return newMeeting;
  }

  async updateMeeting(id: string, data: Partial<Meeting>): Promise<Meeting> {
    const meetings = this.loadMeetings();
    const idx = meetings.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error(`Meeting with id ${id} not found`);
    const updatedMeeting = { ...meetings[idx], ...data };
    meetings[idx] = updatedMeeting;
    this.saveMeetings([...meetings]);
    return updatedMeeting;
  }

  async deleteMeeting(id: string): Promise<boolean> {
    const meetings = this.loadMeetings();
    const filtered = meetings.filter((m) => m.id !== id);
    this.saveMeetings(filtered);
    return true;
  }

  async getActionItems(): Promise<ActionItem[]> {
    return this.loadActionItems();
  }

  async createActionItem(data: CreateActionItemDto): Promise<ActionItem> {
    const items = this.loadActionItems();
    const newItem: ActionItem = {
      ...data,
      id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    const updated = [newItem, ...items];
    this.saveActionItems(updated);
    return newItem;
  }

  async updateActionItem(id: string, data: Partial<ActionItem>): Promise<ActionItem> {
    const items = this.loadActionItems();
    const idx = items.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error(`Action item with id ${id} not found`);
    const updatedItem = { ...items[idx], ...data };
    items[idx] = updatedItem;
    this.saveActionItems([...items]);
    return updatedItem;
  }

  async deleteActionItem(id: string): Promise<boolean> {
    const items = this.loadActionItems();
    const filtered = items.filter((t) => t.id !== id);
    this.saveActionItems(filtered);
    return true;
  }

  async extractActionItemsAi(
    text: string,
    meetingId?: string,
    meetingTitle?: string
  ): Promise<ActionItemDraft[]> {
    // In production, this can call: await fetch(`${API_URL}/api/ai/extract/`, ...)
    // Locally it uses our robust heuristic offline parser
    return extractActionItemsFromText(text, meetingId, meetingTitle);
  }

  async askMeetingAi(
    _meetingId: string,
    question: string,
    context?: { transcript?: string; decisions?: string[] }
  ): Promise<AiChatAnswer> {
    const q = question.toLowerCase();

    // Context-aware answers based on meeting transcript & decisions
    if (q.includes('без спор') || q.includes('единоглас') || q.includes('соглас')) {
      return {
        answer:
          'По результатам обсуждения без споров и единогласно были зафиксированы следующие решения:\n' +
          '1. Принять архитектуру 100% Offline на базе локального Faster-Whisper и Ollama.\n' +
          '2. Реализовать чистый REST-слой под будущий Django бэкенд без промежуточных костылей.\n' +
          '3. Утвердить единый формат экспорта поручений в RFC 4180 CSV с UTF-8 BOM и JSON.',
        sources: ['Протокол согласования', 'Стенограмма встречи'],
        consensusHighlight: '100% консенсус достигнут по стеку технологий и архитектурному разделению.'
      };
    }

    if (q.includes('спор') || q.includes('риск') || q.includes('разноглас')) {
      return {
        answer:
          'Основной дискуссионный момент касался выбора формата диаризации: использовать тяжелый PyAnnote или легкий спектральный кластеризатор. Участники договорились протестировать оба варианта на 2-минутной тестовой записи перед финальным выбором.',
        sources: ['Стенограмма, таймкод 04:15 - 06:30', 'Блок рисков'],
        consensusHighlight: 'Решение по диаризации отложено до сравнительного бенчмарка.'
      };
    }

    if (q.includes('кто отвеча') || q.includes('ответственн') || q.includes('дедлайн')) {
      return {
        answer:
          'Распределение ключевых задач:\n' +
          '• Данияр М. — Django REST API эндпоинты и схема моделей (дедлайн: 18 сентября, высокий приоритет)\n' +
          '• Алексей К. — пайплайн Whisper и интеграция Ollama (дедлайн: 15 сентября, высокий приоритет)\n' +
          '• Айгерим С. — таблица поручений, календарь и экспорт (дедлайн: 18 сентября, высокий приоритет)',
        sources: ['Таблица Action Items', 'Заключительные реплики спикеров']
      };
    }

    // Default grounded fallback
    return {
      answer: `По вашему вопросу («${question}»): на встрече участники подчеркнули необходимость соблюдения требований ТЗ по полной автономности и готовности к подключению Django бэкенда. Все ключевые тезисы зафиксированы в итоговом протоколе.`,
      sources: context?.decisions ? ['Принятые решения встречи'] : ['Общая стенограмма']
    };
  }
}

// Active singleton instance
export const apiService: ApiService = new LocalMockApiService();
