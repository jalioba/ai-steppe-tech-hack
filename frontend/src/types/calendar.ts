import { Meeting } from './meeting';
import { ActionItem, Priority } from './actionItem';

export type CalendarViewMode = 'month' | 'week';
export type CalendarFilterType = 'all' | 'meetings' | 'action_items';

export interface CalendarEventItem {
  id: string;
  type: 'meeting' | 'action_item';
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // e.g. "10:00 - 11:00"
  priority?: Priority;
  assignee?: string;
  status: string;
  rawItem: Meeting | ActionItem;
}

export interface DayInfo {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEventItem[];
}
