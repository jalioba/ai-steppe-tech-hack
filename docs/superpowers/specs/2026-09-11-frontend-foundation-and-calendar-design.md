# AI Meeting Intelligence — Frontend Foundation & Calendar Specification

## 1. Overview & Context

- **Project**: AI Meeting Intelligence (Autonomous Offline AI Meeting Secretary / Protocolist).
- **Format**: 100% Offline / Self-Hosted application.
- **Current Phase Scope**: Frontend Foundation (App Shell, Layout, Navigation, Design System, Strict Data Typing) & Interactive Calendar View (Meetings, Action Item Deadlines, Filtering, Event Details Modal, RFC 5545 .ics Export).
- **Target Hackathon Scoring Criteria Addressed**:
  - **UI/UX & Performance (10 pts)**: High-aesthetic dark glassmorphism theme, fluid interactions, responsive layouts, clear visual hierarchy.
  - **Functionality (30 pts readiness)**: Prepares the exact data contracts and layout spaces for Whisper transcription, Executive Summary (3–5 sentences), Decisions, Topics/Theses, Open Questions, and Action Items (Assignee, Task, Deadline, Priority).
  - **100% Local / Offline Compliance (20 pts)**: Prominent Offline/Local engine status indicator (Local Whisper + Ollama Ready) demonstrating zero external API leaks.
  - **Bonus Features (15 pts readiness)**: Built-in `.ics` calendar generation for task/meeting export, multi-language selector (RU/KZ/EN), ready for RAG chat and diarization hooks.

---

## 2. Tech Stack & Dependencies

- **Framework**: React 18 / 19 + TypeScript (Strict mode enabled).
- **Build Tool**: Vite (blazing fast HMR, lightweight bundle).
- **Styling**: Vanilla CSS (Tailored CSS design system with CSS custom properties, glassmorphism, micro-animations, no bloated external framework dependencies).
- **Icons**: `lucide-react` (modern, lightweight SVG icons).
- **Date Handling**: `date-fns` (robust calendar math, Monday-first week calculations, leap year & timezone safety).
- **Calendar File Generation**: Native RFC 5545 `.ics` builder utility (downloadable standard iCalendar file).

---

## 3. Data Models (Strict TZ Alignment)

### 3.1 Meeting Data Model (`src/types/meeting.ts`)
```typescript
export type MeetingStatus = 'scheduled' | 'in_progress' | 'processed';

export interface Meeting {
  id: string;
  title: string;
  date: string; // ISO format: YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  participants: string[];
  status: MeetingStatus;
  summary?: string; // Executive Summary (3-5 key sentences according to TZ)
  decisions?: string[]; // Принятые решения
  topics?: { topic: string; notes: string }[]; // Темы и тезисы
  openQuestions?: string[]; // Открытые вопросы
  audioFileName?: string;
  durationMinutes?: number;
}
```

### 3.2 Action Item Model (`src/types/actionItem.ts`)
```typescript
export type Priority = 'high' | 'medium' | 'low';
export type ActionItemStatus = 'pending' | 'in_progress' | 'completed';

export interface ActionItem {
  id: string;
  meetingId: string;
  assignee: string; // Ответственный
  task: string; // Суть задачи
  deadline: string; // Срок выполнения (YYYY-MM-DD)
  priority: Priority; // Приоритет: high | medium | low
  status: ActionItemStatus;
}
```

### 3.3 Calendar Event Model (`src/types/calendar.ts`)
```typescript
export type CalendarViewMode = 'month' | 'week';
export type CalendarFilterType = 'all' | 'meetings' | 'action_items';

export interface CalendarEventItem {
  id: string;
  type: 'meeting' | 'action_item';
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // For meetings: HH:mm - HH:mm
  priority?: Priority; // For action items
  assignee?: string; // For action items
  status: string;
  rawItem: Meeting | ActionItem;
}
```

---

## 4. Component Architecture

```text
src/
├── main.tsx
├── App.tsx
├── index.css
├── types/
│   ├── meeting.ts
│   ├── actionItem.ts
│   └── calendar.ts
├── context/
│   └── MeetingContext.tsx      # State management for meetings, action items, active view, search
├── services/
│   ├── icsService.ts           # Generates .ics file string & triggers browser download
│   └── mockData.ts             # Realistic sample meetings and action items reflecting TZ cases
├── utils/
│   └── dateUtils.ts            # Calendar month grid builder, week grid builder, date formatters
└── components/
    ├── layout/
    │   ├── Sidebar.tsx         # Navigation bar with active state & route switching
    │   ├── Header.tsx          # App header with offline badge, language switcher, quick search
    │   └── OfflineBadge.tsx    # "100% Offline | Local Engine" status indicator
    └── calendar/
        ├── CalendarView.tsx    # Main calendar wrapper with filters, controls, view toggle
        ├── CalendarHeader.tsx  # Month/Year display, prev/today/next controls, view mode selector
        ├── CalendarFilters.tsx # Filter pills (All / Meetings / Tasks / Priority)
        ├── MonthView.tsx       # 7xN grid with padding days, event pills, overflow handler
        ├── WeekView.tsx        # 7-day timeline view with hourly grid and all-day task banner
        ├── DayCell.tsx         # Single date cell in month view
        ├── EventBadge.tsx      # High-aesthetic badge for meetings and action items
        ├── EventModal.tsx      # Quick view / inspection modal when clicking on a meeting or task
        └── AddMeetingModal.tsx # Dialog to quickly schedule a meeting on the calendar
```

---

## 5. UI/UX Design System Specifications

1. **Color Palette**:
   - Background Base: `#0a0e17` (Deep dark slate)
   - Surface / Glass: `rgba(20, 27, 45, 0.75)` with `backdrop-filter: blur(16px)`
   - Border subtle: `rgba(255, 255, 255, 0.08)`
   - Accent Primary: `#6366f1` (Indigo Glow)
   - Accent Secondary: `#06b6d4` (Cyan Pulse)
   - High Priority / Risk: `#f43f5e` (Rose / Red)
   - Medium Priority: `#f59e0b` (Amber)
   - Low Priority / Done: `#10b981` (Emerald)
   - Text Primary: `#f8fafc`
   - Text Muted: `#94a3b8`

2. **Micro-animations & Interactions**:
   - Smooth month/week transitions.
   - Hover glow effects on calendar cells.
   - Distinctive priority indicator dots for Action Items.
   - Toast notification feedback upon exporting `.ics`.

---

## 6. Verification Plan

1. **Build & Type Check**:
   - `npm run build` / `npx tsc --noEmit` exits with 0 errors.
2. **Calendar Grid Accuracy**:
   - Correct days of week starting Monday.
   - Leading/trailing days properly dimmed.
   - Correct highlighting for current date (Today).
3. **Event Rendering**:
   - Meetings and Action Items correctly placed on their respective dates.
   - Badges color-coded by priority (High/Medium/Low).
4. **Interactive Filters & Modal**:
   - Filtering by "Meetings Only" hides action items and vice-versa.
   - Clicking an event opens the details modal with correct data (participants, executive summary, assignee).
5. **.ics Export**:
   - Clicking "Экспорт в .ics" downloads a valid iCalendar `.ics` file containing VEVENT records for meetings and action items.
