import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Meeting } from '../types/meeting';
import { ActionItem, Priority, ActionItemStatus } from '../types/actionItem';
import { CalendarEventItem, CalendarFilterType, CalendarViewMode } from '../types/calendar';
import { downloadIcsFile } from '../services/icsService';
import { exportActionItemsToCsv, exportActionItemsToJson } from '../services/exportService';
import { apiService, CreateMeetingDto, CreateActionItemDto } from '../services/apiService';

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
  isAddActionItemOpen: boolean;
  setIsAddActionItemOpen: (open: boolean) => void;
  isAiGenerateOpen: boolean;
  setIsAiGenerateOpen: (open: boolean) => void;
  isLiveMeetingOpen: boolean;
  setIsLiveMeetingOpen: (open: boolean) => void;
  targetCreateDate: string | null;
  setTargetCreateDate: (date: string | null) => void;
  editingActionItem: ActionItem | null;
  setEditingActionItem: (item: ActionItem | null) => void;

  // Actions
  addMeeting: (meetingData: CreateMeetingDto) => Promise<Meeting>;
  updateMeeting: (id: string, updates: Partial<Meeting>) => Promise<Meeting>;
  deleteMeeting: (id: string) => Promise<boolean>;

  addActionItem: (itemData: CreateActionItemDto) => Promise<ActionItem>;
  updateActionItem: (id: string, updates: Partial<ActionItem>) => Promise<ActionItem>;
  deleteActionItem: (id: string) => Promise<boolean>;
  toggleActionItemStatus: (id: string) => Promise<ActionItem | undefined>;
  batchAddActionItems: (items: CreateActionItemDto[]) => Promise<ActionItem[]>;

  // Exports
  exportIcs: () => void;
  exportCsv: () => void;
  exportJson: () => void;

  // Computed
  calendarEvents: CalendarEventItem[];
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const MeetingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
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
  const [isAddActionItemOpen, setIsAddActionItemOpen] = useState(false);
  const [isAiGenerateOpen, setIsAiGenerateOpen] = useState(false);
  const [isLiveMeetingOpen, setIsLiveMeetingOpen] = useState(false);
  const [targetCreateDate, setTargetCreateDate] = useState<string | null>(null);
  const [editingActionItem, setEditingActionItem] = useState<ActionItem | null>(null);

  // Load initial data through apiService
  useEffect(() => {
    let isMounted = true;
    Promise.all([apiService.getMeetings(), apiService.getActionItems()]).then(
      ([meetingsData, actionItemsData]) => {
        if (isMounted) {
          setMeetings(meetingsData);
          setActionItems(actionItemsData);
        }
      }
    );
    return () => {
      isMounted = false;
    };
  }, []);

  // Meeting Actions
  const addMeeting = async (meetingData: CreateMeetingDto): Promise<Meeting> => {
    const created = await apiService.createMeeting(meetingData);
    setMeetings((prev) => [created, ...prev]);
    return created;
  };

  const updateMeeting = async (id: string, updates: Partial<Meeting>): Promise<Meeting> => {
    const updated = await apiService.updateMeeting(id, updates);
    setMeetings((prev) => prev.map((m) => (m.id === id ? updated : m)));
    if (selectedEvent && selectedEvent.id === id) {
      setSelectedEvent((prev) =>
        prev
          ? {
              ...prev,
              title: updated.title,
              date: updated.date,
              time: `${updated.startTime} - ${updated.endTime}`,
              status: updated.status,
              rawItem: updated
            }
          : null
      );
    }
    return updated;
  };

  const deleteMeeting = async (id: string): Promise<boolean> => {
    await apiService.deleteMeeting(id);
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    if (selectedEvent?.id === id) {
      setSelectedEvent(null);
    }
    return true;
  };

  // Action Items Actions
  const addActionItem = async (itemData: CreateActionItemDto): Promise<ActionItem> => {
    const created = await apiService.createActionItem(itemData);
    setActionItems((prev) => [created, ...prev]);
    return created;
  };

  const updateActionItem = async (id: string, updates: Partial<ActionItem>): Promise<ActionItem> => {
    const updated = await apiService.updateActionItem(id, updates);
    setActionItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    if (selectedEvent && selectedEvent.id === id) {
      setSelectedEvent((prev) =>
        prev
          ? {
              ...prev,
              title: updated.task,
              date: updated.deadline,
              priority: updated.priority,
              status: updated.status,
              rawItem: updated
            }
          : null
      );
    }
    return updated;
  };

  const deleteActionItem = async (id: string): Promise<boolean> => {
    await apiService.deleteActionItem(id);
    setActionItems((prev) => prev.filter((t) => t.id !== id));
    if (selectedEvent?.id === id) {
      setSelectedEvent(null);
    }
    return true;
  };

  const toggleActionItemStatus = async (id: string): Promise<ActionItem | undefined> => {
    const item = actionItems.find((t) => t.id === id);
    if (!item) return undefined;

    const nextStatus: Record<ActionItemStatus, ActionItemStatus> = {
      pending: 'in_progress',
      in_progress: 'completed',
      completed: 'pending'
    };

    return updateActionItem(id, { status: nextStatus[item.status] });
  };

  const batchAddActionItems = async (items: CreateActionItemDto[]): Promise<ActionItem[]> => {
    const createdList: ActionItem[] = [];
    for (const itemData of items) {
      const created = await apiService.createActionItem(itemData);
      createdList.push(created);
    }
    setActionItems((prev) => [...createdList, ...prev]);
    return createdList;
  };

  // Exports
  const exportIcs = () => {
    downloadIcsFile(
      meetings,
      actionItems,
      `ai-meeting-schedule-${new Date().toISOString().slice(0, 10)}.ics`
    );
  };

  const exportCsv = () => {
    exportActionItemsToCsv(actionItems);
  };

  const exportJson = () => {
    exportActionItemsToJson(actionItems);
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
        isAddActionItemOpen,
        setIsAddActionItemOpen,
        isAiGenerateOpen,
        setIsAiGenerateOpen,
        isLiveMeetingOpen,
        setIsLiveMeetingOpen,
        targetCreateDate,
        setTargetCreateDate,
        editingActionItem,
        setEditingActionItem,
        addMeeting,
        updateMeeting,
        deleteMeeting,
        addActionItem,
        updateActionItem,
        deleteActionItem,
        toggleActionItemStatus,
        batchAddActionItems,
        exportIcs,
        exportCsv,
        exportJson,
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
