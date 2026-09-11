import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Meeting } from '../types/meeting';
import { ActionItem, Priority } from '../types/actionItem';
import { CalendarEventItem, CalendarFilterType, CalendarViewMode } from '../types/calendar';
import { INITIAL_MEETINGS, INITIAL_ACTION_ITEMS } from '../services/mockData';
import { downloadIcsFile } from '../services/icsService';

export type NavTab = 'calendar' | 'meetings' | 'upload' | 'tasks' | 'chat';
export type AppLanguage = 'ru' | 'kz' | 'en';

interface MeetingContextType {
  meetings: Meeting[];
  actionItems: ActionItem[];
  activeNav: NavTab;
  setActiveNav: (tab: NavTab) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Calendar State
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  viewMode: CalendarViewMode;
  setViewMode: (mode: CalendarViewMode) => void;
  calendarFilter: CalendarFilterType;
  setCalendarFilter: (filter: CalendarFilterType) => void;
  priorityFilter: Priority | 'all';
  setPriorityFilter: (priority: Priority | 'all') => void;

  // Modals & Selected Event
  selectedEvent: CalendarEventItem | null;
  setSelectedEvent: (event: CalendarEventItem | null) => void;
  isAddMeetingOpen: boolean;
  setIsAddMeetingOpen: (open: boolean) => void;

  // Actions
  addMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  addActionItem: (item: Omit<ActionItem, 'id'>) => void;
  exportIcs: () => void;

  // Computed
  calendarEvents: CalendarEventItem[];
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

const STORAGE_KEY_MEETINGS = 'ai_meeting_intelligence_meetings';
const STORAGE_KEY_ACTIONS = 'ai_meeting_intelligence_actions';

export const MeetingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial state with localStorage fallback
  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_MEETINGS);
      return cached ? JSON.parse(cached) : INITIAL_MEETINGS;
    } catch {
      return INITIAL_MEETINGS;
    }
  });

  const [actionItems, setActionItems] = useState<ActionItem[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_ACTIONS);
      return cached ? JSON.parse(cached) : INITIAL_ACTION_ITEMS;
    } catch {
      return INITIAL_ACTION_ITEMS;
    }
  });

  const [activeNav, setActiveNav] = useState<NavTab>('calendar');
  const [language, setLanguage] = useState<AppLanguage>('ru');
  const [searchQuery, setSearchQuery] = useState('');

  // Calendar State
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 11)); // 11 September 2026
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [calendarFilter, setCalendarFilter] = useState<CalendarFilterType>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');

  // Modals
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MEETINGS, JSON.stringify(meetings));
    } catch (e) {
      console.error('Failed to persist meetings', e);
    }
  }, [meetings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIONS, JSON.stringify(actionItems));
    } catch (e) {
      console.error('Failed to persist action items', e);
    }
  }, [actionItems]);

  const addMeeting = (newMeetingData: Omit<Meeting, 'id'>) => {
    const newMeeting: Meeting = {
      ...newMeetingData,
      id: `meet-${Date.now()}`
    };
    setMeetings((prev) => [newMeeting, ...prev]);
  };

  const addActionItem = (newItemData: Omit<ActionItem, 'id'>) => {
    const newItem: ActionItem = {
      ...newItemData,
      id: `task-${Date.now()}`
    };
    setActionItems((prev) => [newItem, ...prev]);
  };

  const exportIcs = () => {
    downloadIcsFile(meetings, actionItems, `ai-meeting-schedule-${new Date().toISOString().slice(0, 10)}.ics`);
  };

  // Convert meetings & action items into unified calendar events
  const calendarEvents = useMemo(() => {
    const events: CalendarEventItem[] = [];

    if (calendarFilter === 'all' || calendarFilter === 'meetings') {
      meetings.forEach((m) => {
        if (
          !searchQuery ||
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.participants.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()))
        ) {
          events.push({
            id: m.id,
            type: 'meeting',
            title: m.title,
            date: m.date,
            time: m.startTime && m.endTime ? `${m.startTime} - ${m.endTime}` : undefined,
            status: m.status,
            rawItem: m
          });
        }
      });
    }

    if (calendarFilter === 'all' || calendarFilter === 'action_items') {
      actionItems.forEach((task) => {
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        const matchesSearch =
          !searchQuery ||
          task.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.assignee.toLowerCase().includes(searchQuery.toLowerCase());

        if (matchesPriority && matchesSearch && task.deadline) {
          events.push({
            id: task.id,
            type: 'action_item',
            title: task.task,
            date: task.deadline,
            priority: task.priority,
            assignee: task.assignee,
            status: task.status,
            rawItem: task
          });
        }
      });
    }

    return events;
  }, [meetings, actionItems, calendarFilter, priorityFilter, searchQuery]);

  return (
    <MeetingContext.Provider
      value={{
        meetings,
        actionItems,
        activeNav,
        setActiveNav,
        language,
        setLanguage,
        searchQuery,
        setSearchQuery,
        currentDate,
        setCurrentDate,
        viewMode,
        setViewMode,
        calendarFilter,
        setCalendarFilter,
        priorityFilter,
        setPriorityFilter,
        selectedEvent,
        setSelectedEvent,
        isAddMeetingOpen,
        setIsAddMeetingOpen,
        addMeeting,
        addActionItem,
        exportIcs,
        calendarEvents
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeetingContext = (): MeetingContextType => {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error('useMeetingContext must be used within a MeetingProvider');
  }
  return context;
};
