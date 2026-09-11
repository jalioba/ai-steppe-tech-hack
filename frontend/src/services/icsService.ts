import { Meeting } from '../types/meeting';
import { ActionItem } from '../types/actionItem';

/**
 * RFC 5545 iCalendar (.ics) export service
 * Directly satisfies the ТЗ bonus criteria for calendar integration (.ics export)
 */

function formatIcsDateTime(dateStr: string, timeStr?: string): string {
  // dateStr format: YYYY-MM-DD
  const cleanDate = dateStr.replace(/-/g, '');
  if (!timeStr) {
    return cleanDate;
  }
  // timeStr format: HH:mm
  const cleanTime = timeStr.replace(/:/g, '') + '00';
  return `${cleanDate}T${cleanTime}`;
}

function escapeIcsText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function generateIcsContent(meetings: Meeting[], actionItems: ActionItem[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AI Meeting Intelligence//RU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:AI Meeting Intelligence Schedule',
    'X-WR-TIMEZONE:Asia/Almaty'
  ];

  const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  // 1. Export Meetings
  meetings.forEach((m) => {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:meeting-${m.id}@meetingintel.offline`);
    lines.push(`DTSTAMP:${nowStamp}`);

    if (m.startTime && m.endTime) {
      lines.push(`DTSTART:${formatIcsDateTime(m.date, m.startTime)}`);
      lines.push(`DTEND:${formatIcsDateTime(m.date, m.endTime)}`);
    } else {
      lines.push(`DTSTART;VALUE=DATE:${formatIcsDateTime(m.date)}`);
    }

    lines.push(`SUMMARY:${escapeIcsText(`Встреча: ${m.title}`)}`);

    let description = `Статус: ${m.status}\\n`;
    if (m.participants?.length) {
      description += `Участники: ${m.participants.join(', ')}\\n`;
    }
    if (m.summary) {
      description += `\\nExecutive Summary:\\n${m.summary}\\n`;
    }
    if (m.decisions?.length) {
      description += `\\nПринятые решения:\\n- ${m.decisions.join('\\n- ')}\\n`;
    }

    lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  // 2. Export Action Items (as Deadline Events with priority indicator)
  actionItems.forEach((task) => {
    if (!task.deadline) return;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:task-${task.id}@meetingintel.offline`);
    lines.push(`DTSTAMP:${nowStamp}`);
    lines.push(`DTSTART;VALUE=DATE:${formatIcsDateTime(task.deadline)}`);

    const priorityLabel = task.priority === 'high' ? 'ВЫСОКИЙ' : task.priority === 'medium' ? 'СРЕДНИЙ' : 'НИЗКИЙ';
    lines.push(`SUMMARY:${escapeIcsText(`[Дедлайн / ${priorityLabel}] ${task.task} (${task.assignee})`)}`);

    let description = `Ответственный: ${task.assignee}\\n`;
    description += `Приоритет: ${priorityLabel}\\n`;
    description += `Статус: ${task.status}\\n`;
    description += `Суть поручения: ${task.task}\\n`;

    lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
    lines.push(task.priority === 'high' ? 'PRIORITY:1' : task.priority === 'medium' ? 'PRIORITY:5' : 'PRIORITY:9');
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadIcsFile(meetings: Meeting[], actionItems: ActionItem[], filename = 'ai-meeting-schedule.ics'): void {
  const content = generateIcsContent(meetings, actionItems);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
