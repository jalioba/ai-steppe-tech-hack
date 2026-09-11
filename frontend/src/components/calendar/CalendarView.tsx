import React from 'react';
import { useMeetingContext } from '../../context/MeetingContext';
import { CalendarHeader } from './CalendarHeader';
import { CalendarFilters } from './CalendarFilters';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { EventModal } from './EventModal';
import { AddMeetingModal } from './AddMeetingModal';
import { AddActionItemModal } from './AddActionItemModal';

export const CalendarView: React.FC = () => {
  const { viewMode } = useMeetingContext();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Header controls: month/week nav, view toggle, ics export */}
      <CalendarHeader />

      {/* Filter bar: meetings, tasks, priorities */}
      <CalendarFilters />

      {/* Calendar Grid View */}
      {viewMode === 'month' ? <MonthView /> : <WeekView />}

      {/* Detail Modals */}
      <EventModal />
      <AddMeetingModal />
      <AddActionItemModal />
    </div>
  );
};
