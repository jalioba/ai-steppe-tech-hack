import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  isValid
} from 'date-fns';
import { ru } from 'date-fns/locale/ru';
import { DayInfo, CalendarEventItem } from '../types/calendar';

export const WEEKDAY_NAMES_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
export const WEEKDAY_NAMES_KZ = ['Дс', 'Сс', 'Ср', 'Бс', 'Жм', 'Сн', 'Жс'];
export const WEEKDAY_NAMES_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function getWeekdayNames(lang: string = 'ru'): string[] {
  if (lang === 'kz') return WEEKDAY_NAMES_KZ;
  if (lang === 'en') return WEEKDAY_NAMES_EN;
  return WEEKDAY_NAMES_RU;
}

/**
 * Builds a month grid for the given date, with padding days from previous and next months
 * Week starts on Monday (weekStartsOn: 1)
 */
export function getMonthGrid(currentDate: Date, events: CalendarEventItem[] = []): DayInfo[] {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  
  // Week starting Monday
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return days.map((day) => {
    const dateString = format(day, 'yyyy-MM-dd');
    const dayEvents = events.filter((ev) => ev.date === dateString);

    return {
      date: day,
      dateString,
      dayNumber: day.getDate(),
      isCurrentMonth: isSameMonth(day, monthStart),
      isToday: isToday(day),
      events: dayEvents
    };
  });
}

/**
 * Gets the 7 days of the week containing the given date (Monday through Sunday)
 */
export function getWeekDays(currentDate: Date, events: CalendarEventItem[] = []): DayInfo[] {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return days.map((day) => {
    const dateString = format(day, 'yyyy-MM-dd');
    const dayEvents = events.filter((ev) => ev.date === dateString);

    return {
      date: day,
      dateString,
      dayNumber: day.getDate(),
      isCurrentMonth: true,
      isToday: isToday(day),
      events: dayEvents
    };
  });
}

export function formatMonthYear(date: Date, lang: string = 'ru'): string {
  const formatted = format(date, 'LLLL yyyy', { locale: ru });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const parsed = parseISO(dateStr);
  if (!isValid(parsed)) return dateStr;
  return format(parsed, 'd MMMM yyyy', { locale: ru });
}

export { isSameDay, isToday, parseISO, isValid };
