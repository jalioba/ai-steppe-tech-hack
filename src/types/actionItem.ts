/**
 * Action Items (Таблица поручений) - strictly aligned with ТЗ
 */

export type Priority = 'high' | 'medium' | 'low';
export type ActionItemStatus = 'pending' | 'in_progress' | 'completed';

export interface ActionItem {
  id: string;
  meetingId?: string;
  meetingTitle?: string;

  // ТЗ: Ответственный
  assignee: string;

  // ТЗ: Суть задачи
  task: string;

  // ТЗ: Срок выполнения (если озвучен) в формате YYYY-MM-DD
  deadline: string;

  // ТЗ: Приоритет (high / medium / low)
  priority: Priority;

  // Статус выполнения
  status: ActionItemStatus;

  // Флаг происхождения (создано ИИ или пользователем)
  isAiGenerated?: boolean;
  createdAt?: string;
}
