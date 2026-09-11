import { Priority } from '../types/actionItem';
import { addDays, format, endOfMonth } from 'date-fns';

export interface ActionItemDraft {
  tempId: string;
  task: string;
  assignee: string;
  deadline: string;
  priority: Priority;
  selected: boolean;
}

const RU_MONTHS: Record<string, number> = {
  'янв': 0, 'января': 0, 'январе': 0,
  'фев': 1, 'февраля': 1, 'феврале': 1,
  'мар': 2, 'марта': 2, 'марте': 2,
  'апр': 3, 'апреля': 3, 'апреле': 3,
  'май': 4, 'мая': 4, 'мае': 4,
  'июн': 5, 'июня': 5, 'июне': 5,
  'июл': 6, 'июля': 6, 'июле': 6,
  'авг': 7, 'августа': 7, 'августе': 7,
  'сен': 8, 'сентября': 8, 'сентябре': 8,
  'окт': 9, 'октября': 9, 'октябре': 9,
  'ноя': 10, 'ноября': 10, 'ноябре': 10,
  'дек': 11, 'декабря': 11, 'декабре': 11
};

/**
 * Parses deadline from text with relative phrases and explicit dates.
 * If not specified, automatically assigns a deadline based on priority.
 */
export function extractDeadlineFromPhrase(phrase: string, priority: Priority = 'medium', baseDate: Date = new Date()): string {
  const lower = phrase.toLowerCase();

  // 1. ISO date YYYY-MM-DD
  const isoMatch = phrase.match(/\b(202\d-[01]\d-[0-3]\d)\b/);
  if (isoMatch) return isoMatch[1];

  // 2. DD.MM or DD.MM.YYYY
  const dotMatch = phrase.match(/\b([0-3]?\d)\.([01]?\d)(?:\.(202\d|\d{2}))?\b/);
  if (dotMatch) {
    const day = parseInt(dotMatch[1], 10);
    const month = parseInt(dotMatch[2], 10) - 1;
    let year = dotMatch[3] ? parseInt(dotMatch[3], 10) : baseDate.getFullYear();
    if (year < 100) year += 2000;
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return format(d, 'yyyy-MM-dd');
  }

  // 3. DD Month (Russian)
  const monthMatch = lower.match(/(\d{1,2})\s+(январ[яе]|феврал[яе]|март[ае]|апрел[яе]|ма[яе]|июн[яе]|июл[яе]|август[ае]|сентябр[яе]|октябр[яе]|ноябр[яе]|декабр[яе])/);
  if (monthMatch) {
    const day = parseInt(monthMatch[1], 10);
    const monthWord = monthMatch[2];
    for (const [k, mIndex] of Object.entries(RU_MONTHS)) {
      if (monthWord.startsWith(k)) {
        const d = new Date(baseDate.getFullYear(), mIndex, day);
        if (!isNaN(d.getTime())) return format(d, 'yyyy-MM-dd');
      }
    }
  }

  // 4. Relative expressions
  if (lower.includes('послезавтра')) {
    return format(addDays(baseDate, 2), 'yyyy-MM-dd');
  }
  if (lower.includes('завтра')) {
    return format(addDays(baseDate, 1), 'yyyy-MM-dd');
  }

  const daysMatch = lower.match(/через\s+(\d+)\s+(?:дн|ден|дня)/);
  if (daysMatch) {
    return format(addDays(baseDate, parseInt(daysMatch[1], 10)), 'yyyy-MM-dd');
  }

  if (lower.includes('через две недели')) {
    return format(addDays(baseDate, 14), 'yyyy-MM-dd');
  }
  if (lower.includes('через неделю')) {
    return format(addDays(baseDate, 7), 'yyyy-MM-dd');
  }

  if (lower.includes('конца недели') || lower.includes('концу недели') || lower.includes('к пятнице') || lower.includes('до пятницы')) {
    const dayOfWeek = baseDate.getDay(); // 0 is Sunday, 5 is Friday
    let diff = 5 - dayOfWeek;
    if (diff <= 0) diff += 7;
    return format(addDays(baseDate, diff), 'yyyy-MM-dd');
  }

  if (lower.includes('конца месяца') || lower.includes('концу месяца')) {
    return format(endOfMonth(baseDate), 'yyyy-MM-dd');
  }

  // 5. Intelligent AI default deadline
  if (priority === 'high') {
    return format(addDays(baseDate, 2), 'yyyy-MM-dd');
  } else if (priority === 'low') {
    return format(addDays(baseDate, 7), 'yyyy-MM-dd');
  } else {
    return format(addDays(baseDate, 5), 'yyyy-MM-dd');
  }
}

/**
 * Dynamic Local AI parser for audio transcripts and notes
 */
export function extractActionItemsFromText(
  text: string,
  _meetingId?: string,
  _meetingTitle?: string
): ActionItemDraft[] {
  if (!text.trim()) return [];

  const lines = text
    .split(/\n|\. |\! |\? /)
    .map((l) => l.trim())
    .filter((l) => l.length > 5);

  const drafts: ActionItemDraft[] = [];
  const today = new Date();

  // Action indicators
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
    'исправить',
    'внедрить',
    'запустить',
    'поручить',
    'задача',
    'дедлайн',
    'срок',
    'нужно',
    'надо',
    'необходимо'
  ];

  let idCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    // Check if line contains an action keyword
    const hasAction = actionKeywords.some((kw) => lower.includes(kw));

    if (hasAction) {
      // 1. Assignee detection from speaker or speech turn
      let foundAssignee = 'Исполнитель';
      let taskBody = line;

      if (line.includes(':')) {
        const parts = line.split(':');
        foundAssignee = parts[0].trim();
        taskBody = parts.slice(1).join(':').trim();
      } else {
        // Look for speaker pattern in the text
        const speakerMatch = line.match(/(Спикер\s*\d+|Участник\s*\d+)/i);
        if (speakerMatch) {
          foundAssignee = speakerMatch[1];
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
        lower.includes('высокий') ||
        lower.includes('важно')
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
      const deadline = extractDeadlineFromPhrase(line, priority, today);

      // 4. Clean task title
      let taskTitle = taskBody
        .replace(/^[-*•\d.)\s]+/, '')
        .replace(/^(задача|поручение|нужно|надо|необходимо):\s*/i, '')
        .trim();
      if (taskTitle.length > 120) {
        taskTitle = taskTitle.slice(0, 117) + '...';
      }
      taskTitle = taskTitle.charAt(0).toUpperCase() + taskTitle.slice(1);

      drafts.push({
        tempId: `draft-${Date.now()}-${idCounter++}`,
        task: taskTitle || 'Выполнить задачу из аудио',
        assignee: foundAssignee,
        deadline,
        priority,
        selected: true
      });
    }
  }

  // If no specific action lines matched, generate action item from first lines of audio
  if (drafts.length === 0 && text.trim().length > 10) {
    const preview = text.split('\n')[0].replace(/^[^:]+:\s*/, '').slice(0, 60);
    drafts.push({
      tempId: `draft-${Date.now()}-1`,
      task: `Проработать ключевые вопросы по аудио: "${preview}..."`,
      assignee: 'Спикер 1',
      deadline: extractDeadlineFromPhrase(preview, 'high', today),
      priority: 'high',
      selected: true
    });
  }

  return drafts;
}
