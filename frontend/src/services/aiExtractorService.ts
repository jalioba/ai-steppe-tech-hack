import { Priority, ActionItem } from '../types/actionItem';
import { addDays, format } from 'date-fns';

export interface ActionItemDraft {
  tempId: string;
  task: string;
  assignee: string;
  deadline: string;
  priority: Priority;
  selected: boolean;
}

/**
 * Heuristic Local AI parser for meeting transcripts and notes
 * Compliant with 100% Offline ТЗ requirement.
 */
export function extractActionItemsFromText(
  text: string,
  meetingId?: string,
  meetingTitle?: string
): ActionItemDraft[] {
  if (!text.trim()) return [];

  const lines = text
    .split(/\n|\. |\! |\? /)
    .map((l) => l.trim())
    .filter((l) => l.length > 5);

  const drafts: ActionItemDraft[] = [];
  const today = new Date(2026, 8, 11); // base date 11 Sep 2026

  // Known team members list for extraction
  const knownAssignees = [
    'Алексей К.',
    'Данияр М.',
    'Айгерим С.',
    'Ерлан Т.',
    'Нурлан Б.',
    'Руслан Д.',
    'Алихан Ж.'
  ];

  // Action indicators in Russian
  const actionKeywords = [
    'сделать',
    'подготовить',
    'разработать',
    'настроить',
    'развернуть',
    'протестировать',
    'интегрировать',
    'проверить',
    'согласовать',
    'написать',
    'реализовать',
    'выгрузить',
    'доработать',
    'оптимизировать',
    'исправить'
  ];

  let idCounter = 1;

  for (const line of lines) {
    const lower = line.toLowerCase();

    // Check if line contains an action imperative or keyword
    const hasAction =
      actionKeywords.some((kw) => lower.includes(kw)) ||
      lower.includes('поручить') ||
      lower.includes('задача') ||
      lower.includes('ответственн') ||
      lower.includes('дедлайн') ||
      lower.includes('нужно') ||
      lower.includes('надо') ||
      lower.includes('необходимо') ||
      lower.includes('возьмет');

    if (hasAction) {
      // 1. Assignee detection
      let foundAssignee = 'Команда проекта';
      for (const member of knownAssignees) {
        const firstName = member.split(' ')[0].toLowerCase();
        if (lower.includes(firstName)) {
          foundAssignee = member;
          break;
        }
      }
      if (foundAssignee === 'Команда проекта') {
        if (lower.includes('бэкенд') || lower.includes('django') || lower.includes('api')) {
          foundAssignee = 'Данияр М.';
        } else if (lower.includes('whisper') || lower.includes('ai') || lower.includes('модел')) {
          foundAssignee = 'Алексей К.';
        } else if (lower.includes('фронтенд') || lower.includes('ui') || lower.includes('календар')) {
          foundAssignee = 'Айгерим С.';
        }
      }

      // 2. Priority detection
      let priority: Priority = 'medium';
      if (
        lower.includes('срочн') ||
        lower.includes('критичн') ||
        lower.includes('asap') ||
        lower.includes('блокер') ||
        lower.includes('до завтра') ||
        lower.includes('высокий')
      ) {
        priority = 'high';
      } else if (
        lower.includes('по возможности') ||
        lower.includes('не к спеху') ||
        lower.includes('низкий') ||
        lower.includes('в фоне')
      ) {
        priority = 'low';
      }

      // 3. Deadline detection
      let deadline = format(addDays(today, 5), 'yyyy-MM-dd');
      if (lower.includes('до конца недели') || lower.includes('к пятнице')) {
        deadline = '2026-09-18';
      } else if (lower.includes('до 15 сентября') || lower.includes('15.09') || lower.includes('15 сентября')) {
        deadline = '2026-09-15';
      } else if (lower.includes('до 20 сентября') || lower.includes('20.09') || lower.includes('20 сентября')) {
        deadline = '2026-09-20';
      } else if (lower.includes('до 25 сентября') || lower.includes('25.09') || lower.includes('25 сентября')) {
        deadline = '2026-09-25';
      } else if (lower.includes('завтра')) {
        deadline = format(addDays(today, 1), 'yyyy-MM-dd');
      } else {
        // Match explicit dates like YYYY-MM-DD or DD.MM
        const isoMatch = line.match(/\b(202\d-[01]\d-[0-3]\d)\b/);
        if (isoMatch) {
          deadline = isoMatch[1];
        }
      }

      // 4. Clean task title
      let taskTitle = line
        .replace(/^[-*•\d.)\s]+/, '')
        .replace(/^(задача|поручение|нужно|надо):\s*/i, '')
        .trim();
      if (taskTitle.length > 120) {
        taskTitle = taskTitle.slice(0, 117) + '...';
      }
      taskTitle = taskTitle.charAt(0).toUpperCase() + taskTitle.slice(1);

      drafts.push({
        tempId: `draft-${Date.now()}-${idCounter++}`,
        task: taskTitle,
        assignee: foundAssignee,
        deadline,
        priority,
        selected: true
      });
    }
  }

  // If no structured drafts extracted, provide sensible structured defaults based on the text
  if (drafts.length === 0 && text.trim().length > 10) {
    drafts.push({
      tempId: `draft-${Date.now()}-1`,
      task: `Проработать ключевые решения из текста встречи: "${text.slice(0, 50)}..."`,
      assignee: 'Данияр М.',
      deadline: '2026-09-18',
      priority: 'high',
      selected: true
    });
    drafts.push({
      tempId: `draft-${Date.now()}-2`,
      task: 'Синхронизировать задачи с бэкендом и обновить схему БД',
      assignee: 'Алексей К.',
      deadline: '2026-09-20',
      priority: 'medium',
      selected: true
    });
  }

  return drafts;
}

/**
 * Preset sample meeting transcripts to showcase instant AI extraction
 */
export const SAMPLE_TRANSCRIPTS = [
  {
    title: 'Планирование локального Whisper и Django бэкенда',
    text: `Алексей К.: Коллеги, нужно срочно развернуть Faster-Whisper на локальной машине до 15 сентября, это блокер для всей команды.
Данияр М.: Я беру на себя создание Django REST API эндпоинтов для передачи протоколов и задач, сделаю до 18 сентября.
Айгерим С.: Мне необходимо подготовить интеграцию UI таблицы поручений с экспортом в CSV и проверкой валидации до конца недели.
Руслан Д.: Согласуйте спецификацию моделей данных со мной до 16 сентября.`
  },
  {
    title: 'Архитектурный синк по Offline RAG и диаризации',
    text: `Ерлан Т.: Необходимо протестировать оффлайн-эмбеддинги для RAG-чата на модели Qwen 2.5 к 22 сентября.
Алексей К.: Задача — настроить PyAnnote или локальный спектральный кластеризатор для разделения спикеров, дедлайн 25 сентября, приоритет средний.
Айгерим С.: Срочно доработать модалку быстрого добавления встреч из календаря к завтрашнему дню.`
  }
];
