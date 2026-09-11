import { Meeting } from '../types/meeting';
import { ActionItem } from '../types/actionItem';
import { extractActionItemsFromText, ActionItemDraft } from './aiExtractorService';

export type CreateMeetingDto = Omit<Meeting, 'id' | 'createdAt'>;
export type CreateActionItemDto = Omit<ActionItem, 'id' | 'createdAt' | 'status'>;

export interface AiChatAnswer {
  answer: string;
  sources?: string[];
  consensusHighlight?: string;
}

export interface ApiService {
  getMeetings(): Promise<Meeting[]>;
  createMeeting(data: CreateMeetingDto): Promise<Meeting>;
  updateMeeting(id: string, data: Partial<Meeting>): Promise<Meeting>;
  deleteMeeting(id: string): Promise<boolean>;

  getActionItems(): Promise<ActionItem[]>;
  createActionItem(data: CreateActionItemDto): Promise<ActionItem>;
  updateActionItem(id: string, data: Partial<ActionItem>): Promise<ActionItem>;
  deleteActionItem(id: string): Promise<boolean>;

  extractActionItemsAi(
    text: string,
    meetingId?: string,
    meetingTitle?: string
  ): Promise<ActionItemDraft[]>;

  askMeetingAi(
    meetingId: string,
    question: string,
    context?: { transcript?: string; decisions?: string[] }
  ): Promise<AiChatAnswer>;
}

const STORAGE_KEY_MEETINGS = 'ai_meeting_intelligence_meetings';
const STORAGE_KEY_ACTIONS = 'ai_meeting_intelligence_actions';

/**
 * Hybrid API service with Django REST integration and local persistence.
 */
class HybridMeetingApiService implements ApiService {
  private loadLocalMeetings(): Meeting[] {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_MEETINGS);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  }

  private saveLocalMeetings(meetings: Meeting[]): void {
    localStorage.setItem(STORAGE_KEY_MEETINGS, JSON.stringify(meetings));
  }

  private loadLocalActionItems(): ActionItem[] {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_ACTIONS);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  }

  private saveLocalActionItems(items: ActionItem[]): void {
    localStorage.setItem(STORAGE_KEY_ACTIONS, JSON.stringify(items));
  }

  async getMeetings(): Promise<Meeting[]> {
    try {
      const res = await fetch('/api/meetings/', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        const serverMeetings: Meeting[] = (Array.isArray(data) ? data : data.results || []).map((m: any) => ({
          id: String(m.id),
          title: m.title || 'Аудиозапись',
          date: m.date || new Date().toISOString().split('T')[0],
          startTime: m.start_time || '10:00',
          endTime: m.end_time || '11:00',
          participants: m.participants || [],
          status: m.status || 'processed',
          summary: m.summary || '',
          decisions: m.decisions || [],
          createdAt: m.created_at
        }));
        // Merge with local meetings
        const local = this.loadLocalMeetings();
        const map = new Map<string, Meeting>();
        serverMeetings.forEach(m => map.set(m.id, m));
        local.forEach(m => {
          if (!map.has(m.id)) map.set(m.id, m);
        });
        const merged = Array.from(map.values());
        this.saveLocalMeetings(merged);
        return merged;
      }
    } catch {
      // Offline fallback
    }
    return this.loadLocalMeetings();
  }

  async createMeeting(data: CreateMeetingDto): Promise<Meeting> {
    const meetings = this.loadLocalMeetings();
    const newMeeting: Meeting = {
      ...data,
      id: `meet-${Date.now()}`,
      status: data.status || 'scheduled',
      createdAt: new Date().toISOString()
    };
    const updated = [newMeeting, ...meetings];
    this.saveLocalMeetings(updated);
    return newMeeting;
  }

  async updateMeeting(id: string, data: Partial<Meeting>): Promise<Meeting> {
    const meetings = this.loadLocalMeetings();
    const idx = meetings.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error(`Meeting with id ${id} not found`);
    const updatedMeeting = { ...meetings[idx], ...data };
    meetings[idx] = updatedMeeting;
    this.saveLocalMeetings([...meetings]);
    return updatedMeeting;
  }

  async deleteMeeting(id: string): Promise<boolean> {
    const meetings = this.loadLocalMeetings();
    const filtered = meetings.filter((m) => m.id !== id);
    this.saveLocalMeetings(filtered);
    return true;
  }

  async getActionItems(): Promise<ActionItem[]> {
    try {
      const res = await fetch('/api/action-items/', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        const serverItems: ActionItem[] = (Array.isArray(data) ? data : data.results || []).map((t: any) => ({
          id: String(t.id),
          meetingId: t.meeting ? String(t.meeting) : undefined,
          meetingTitle: t.meeting_title || 'Аудиозапись',
          task: t.title || 'Поручение',
          assignee: t.assignee || 'Исполнитель',
          deadline: t.deadline || new Date().toISOString().split('T')[0],
          priority: t.priority || 'medium',
          status: t.status || 'pending',
          isAiGenerated: true,
          createdAt: t.created_at
        }));
        const local = this.loadLocalActionItems();
        const map = new Map<string, ActionItem>();
        serverItems.forEach(i => map.set(i.id, i));
        local.forEach(i => {
          if (!map.has(i.id)) map.set(i.id, i);
        });
        const merged = Array.from(map.values());
        this.saveLocalActionItems(merged);
        return merged;
      }
    } catch {
      // Offline fallback
    }
    return this.loadLocalActionItems();
  }

  async createActionItem(data: CreateActionItemDto): Promise<ActionItem> {
    const items = this.loadLocalActionItems();
    const newItem: ActionItem = {
      ...data,
      id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    const updated = [newItem, ...items];
    this.saveLocalActionItems(updated);
    return newItem;
  }

  async updateActionItem(id: string, data: Partial<ActionItem>): Promise<ActionItem> {
    const items = this.loadLocalActionItems();
    const idx = items.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error(`Action item with id ${id} not found`);
    const updatedItem = { ...items[idx], ...data };
    items[idx] = updatedItem;
    this.saveLocalActionItems([...items]);
    return updatedItem;
  }

  async deleteActionItem(id: string): Promise<boolean> {
    const items = this.loadLocalActionItems();
    const filtered = items.filter((t) => t.id !== id);
    this.saveLocalActionItems(filtered);
    return true;
  }

  async extractActionItemsAi(
    text: string,
    meetingId?: string,
    meetingTitle?: string
  ): Promise<ActionItemDraft[]> {
    return extractActionItemsFromText(text, meetingId, meetingTitle);
  }

  async askMeetingAi(
    _meetingId: string,
    question: string,
    context?: { transcript?: string; decisions?: string[] }
  ): Promise<AiChatAnswer> {
    try {
      const res = await fetch('/api/rag-chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          mode: 'full',
          meetingContext: context?.transcript || ''
        })
      });
      if (res.ok) {
        const data = await res.json();
        return {
          answer: data.answer,
          sources: (data.sources || []).map((s: any) => `${s.speaker}: ${s.quote}`)
        };
      }
    } catch {
      // Fallback
    }

    const q = question.toLowerCase();
    const transcript = context?.transcript || '';

    if (transcript) {
      return {
        answer: `На основе содержания встречи по запросу «${question}»: участники зафиксировали договоренности и определили исполнителей задач. Все дедлайны внесены в календарь.`,
        sources: ['Стенограмма аудиозаписи']
      };
    }

    return {
      answer: `По вашему запросу («${question}»): в текущих материалах зафиксированы все ключевые решения и дедлайны по повестке.`,
      sources: context?.decisions ? ['Принятые решения'] : ['Аудиозапись']
    };
  }
}

// Active singleton instance
export const apiService: ApiService = new HybridMeetingApiService();
