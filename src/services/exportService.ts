import { ActionItem } from '../types/actionItem';
import { Meeting } from '../types/meeting';

/**
 * Trigger browser file download from Blob
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export Action Items to RFC 4180 CSV with UTF-8 BOM for Microsoft Excel compatibility
 */
export function exportActionItemsToCsv(items: ActionItem[], filename?: string): void {
  const defaultName = `action-items-${new Date().toISOString().slice(0, 10)}.csv`;
  const name = filename || defaultName;

  // UTF-8 BOM to prevent Cyrillic encoding issues in Excel
  const BOM = '\uFEFF';

  const headers = [
    'Суть задачи (Task)',
    'Ответственный',
    'Срок выполнения (Deadline)',
    'Приоритет',
    'Статус',
    'Связанная встреча',
    'Источник'
  ];

  const escapeCsv = (str: string | undefined | null) => {
    if (!str) return '""';
    const text = String(str).replace(/"/g, '""');
    return `"${text}"`;
  };

  const priorityLabels: Record<string, string> = {
    high: 'Высокий',
    medium: 'Средний',
    low: 'Низкий'
  };

  const statusLabels: Record<string, string> = {
    pending: 'Ожидает',
    in_progress: 'В работе',
    completed: 'Выполнено'
  };

  const rows = items.map((item) => [
    escapeCsv(item.task),
    escapeCsv(item.assignee),
    escapeCsv(item.deadline),
    escapeCsv(priorityLabels[item.priority] || item.priority),
    escapeCsv(statusLabels[item.status] || item.status),
    escapeCsv(item.meetingTitle || 'Без привязки'),
    escapeCsv(item.isAiGenerated ? '🤖 ИИ' : 'Пользователь')
  ]);

  const csvContent = BOM + [headers.map((h) => `"${h}"`).join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, name);
}

/**
 * Export Action Items to formatted JSON file
 */
export function exportActionItemsToJson(items: ActionItem[], filename?: string): void {
  const defaultName = `action-items-${new Date().toISOString().slice(0, 10)}.json`;
  const name = filename || defaultName;

  const jsonContent = JSON.stringify(items, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, name);
}

/**
 * Export full meeting protocol to JSON
 */
export function exportMeetingProtocolToJson(meeting: Meeting): void {
  const filename = `protocol-${meeting.id}-${new Date().toISOString().slice(0, 10)}.json`;
  const jsonContent = JSON.stringify(meeting, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, filename);
}
