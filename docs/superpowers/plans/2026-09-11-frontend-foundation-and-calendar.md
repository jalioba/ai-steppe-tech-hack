# Frontend Foundation & Interactive Calendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the React + TypeScript frontend foundation and full-featured interactive Calendar module for AI Meeting Intelligence, strictly adhering to the technical specification (ТЗ) and hackathon scoring criteria (UI/UX 10/10, Offline indicator, RFC 5545 `.ics` export, Action Items & Meetings).

**Architecture:** A modular React 18+ SPA bundled with Vite, styled with a custom vanilla CSS design system (dark glassmorphism, responsive grids, micro-animations). State is managed through a typed `MeetingContext` with `localStorage` persistence, pre-configured for future offline FastAPI/Whisper/Ollama integration. Calendar logic leverages `date-fns` for robust Monday-first grid calculations and an RFC 5545 `.ics` generator.

**Tech Stack:** React 18/19, TypeScript, Vite, `date-fns`, `lucide-react`, Vanilla CSS (design system tokens).

---

### File Structure Map
```text
ai-steppe-tech-hack/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types/
    │   ├── meeting.ts
    │   ├── actionItem.ts
    │   └── calendar.ts
    ├── services/
    │   ├── icsService.ts
    │   └── mockData.ts
    ├── utils/
    │   └── dateUtils.ts
    ├── context/
    │   └── MeetingContext.tsx
    └── components/
        ├── layout/
        │   ├── Sidebar.tsx
        │   ├── Header.tsx
        │   └── OfflineBadge.tsx
        └── calendar/
            ├── CalendarView.tsx
            ├── CalendarHeader.tsx
            ├── CalendarFilters.tsx
            ├── MonthView.tsx
            ├── WeekView.tsx
            ├── DayCell.tsx
            ├── EventBadge.tsx
            ├── EventModal.tsx
            └── AddMeetingModal.tsx
```

---

### Task 1: Initialize Vite React TypeScript Project and Dependencies

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`

- [ ] **Step 1: Create package.json with dependencies**
Create `package.json` with React, TypeScript, Vite, `lucide-react`, and `date-fns`.

- [ ] **Step 2: Create Vite and TypeScript configurations**
Create `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, and `index.html` with Inter font loaded.

- [ ] **Step 3: Run npm install**
Run: `npm install`
Expected: Dependencies installed with zero errors.

- [ ] **Step 4: Commit**
```bash
git add package.json package-lock.json tsconfig.json tsconfig.node.json vite.config.ts index.html
git commit -m "chore: initialize vite react ts project with lucide-react and date-fns"
```

---

### Task 2: Core Design System & Global Styles (`src/index.css`)

**Files:**
- Create: `src/index.css`

- [ ] **Step 1: Implement global CSS variables, dark glassmorphism, and responsive utilities**
Implement comprehensive tokens:
- Background: `#0a0e17`, Surface: `rgba(17, 24, 39, 0.75)`, Border: `rgba(255, 255, 255, 0.08)`.
- Accents: Indigo `#6366f1`, Cyan `#06b6d4`, Rose `#f43f5e`, Amber `#f59e0b`, Emerald `#10b981`.
- Custom scrollbars, modal backdrops, button variants, tooltip, badge styles, and smooth micro-transitions.

- [ ] **Step 2: Verify CSS loads without syntax errors**
Run: `npm run build`
Expected: Build succeeds or validates CSS syntax.

- [ ] **Step 3: Commit**
```bash
git add src/index.css
git commit -m "style: implement dark glassmorphism design system tokens in index.css"
```

---

### Task 3: Strict Data Types Aligned with ТЗ (`src/types/`)

**Files:**
- Create: `src/types/meeting.ts`
- Create: `src/types/actionItem.ts`
- Create: `src/types/calendar.ts`

- [ ] **Step 1: Create `src/types/meeting.ts`**
Define `MeetingStatus`, `ProtocolTopic`, `ProtocolRisk`, and `Meeting` interface including Executive Summary, Decisions, Topics/Theses, Open questions, and audio metadata.

- [ ] **Step 2: Create `src/types/actionItem.ts`**
Define `Priority` ('high' | 'medium' | 'low'), `ActionItemStatus`, and `ActionItem` with fields: `id`, `meetingId`, `assignee` (Ответственный), `task` (Суть задачи), `deadline` (Срок выполнения), `priority`, `status`.

- [ ] **Step 3: Create `src/types/calendar.ts`**
Define `CalendarViewMode` ('month' | 'week'), `CalendarFilterType` ('all' | 'meetings' | 'action_items'), and unified `CalendarEventItem`.

- [ ] **Step 4: Verify type compilation**
Run: `npx tsc --noEmit`
Expected: Exits cleanly with code 0.

- [ ] **Step 5: Commit**
```bash
git add src/types/
git commit -m "feat(types): add strict data models for meetings, action items, and calendar"
```

---

### Task 4: Date Utilities & RFC 5545 `.ics` Export Service

**Files:**
- Create: `src/utils/dateUtils.ts`
- Create: `src/services/icsService.ts`

- [ ] **Step 1: Implement `src/utils/dateUtils.ts`**
Using `date-fns`:
- `getMonthGrid(year, month)`: Returns an array of day objects including leading/trailing overflow days starting Monday.
- `getWeekDays(date)`: Returns the 7 days of the active week.
- `formatDate(date, formatStr)`: Formats dates with RU localization support.
- `isSameDay(d1, d2)`, `isToday(d)`.

- [ ] **Step 2: Implement `src/services/icsService.ts`**
Implement standard RFC 5545 iCalendar generator:
- Formats `VEVENT` entries for Meetings (with start/end timestamps, summary, description, participants).
- Formats `VEVENT` / `VTODO` entries for Action Items (with deadline timestamp, assignee, priority).
- Triggers browser blob download of `.ics` file.

- [ ] **Step 3: Verify utilities**
Run: `npx tsc --noEmit`
Expected: 0 type errors.

- [ ] **Step 4: Commit**
```bash
git add src/utils/dateUtils.ts src/services/icsService.ts
git commit -m "feat: add dateUtils grid builder and RFC 5545 .ics export service"
```

---

### Task 5: Mock Data & Reactive State (`src/context/MeetingContext.tsx`)

**Files:**
- Create: `src/services/mockData.ts`
- Create: `src/context/MeetingContext.tsx`

- [ ] **Step 1: Create `src/services/mockData.ts`**
Populate realistic meetings and action items reflecting realistic business and technical scenarios from ТЗ:
- "Планирование спринта и локального Whisper пайплайна" (Processed, summary, decisions, action items with deadlines in current month).
- "Синхронизация по интеграции Ollama и тестам диаризации" (Scheduled for upcoming date).
- Action items assigned to team members ("Алексей К.", "Данияр М.", "Айгерим С.") with high/medium/low priorities and deadlines.

- [ ] **Step 2: Implement `src/context/MeetingContext.tsx`**
Context providing:
- `meetings: Meeting[]`, `actionItems: ActionItem[]`
- `activeTab: 'calendar' | 'meetings' | 'tasks' | 'upload' | 'chat'`
- `calendarFilter: CalendarFilterType`, `priorityFilter: Priority | 'all'`
- `selectedDate: Date`, `viewMode: CalendarViewMode`
- Methods: `addMeeting`, `addActionItem`, `updateMeeting`, `deleteMeeting`, `exportIcs`
- Automatic synchronization with `localStorage`.

- [ ] **Step 3: Verify TypeScript compilation**
Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Commit**
```bash
git add src/services/mockData.ts src/context/MeetingContext.tsx
git commit -m "feat: add realistic mock data and typed MeetingContext with localStorage"
```

---

### Task 6: App Foundation & Layout Components

**Files:**
- Create: `src/components/layout/OfflineBadge.tsx`
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/Header.tsx`

- [ ] **Step 1: Create `OfflineBadge.tsx`**
Renders glowing status indicator: "100% Offline | Local Engine Active", demonstrating self-hosted zero-leak architecture.

- [ ] **Step 2: Create `Sidebar.tsx`**
Renders app logo with AI wave badge, navigation links with icons (`Calendar`, `FileText` for Protocols, `UploadCloud` for Audio processing, `CheckSquare` for Action Items, `Bot` for RAG Chat), and system memory/model status.

- [ ] **Step 3: Create `Header.tsx`**
Renders active section title, quick search input, Offline badge, language selector (RU / KZ / EN), and user profile.

- [ ] **Step 4: Verify layout build**
Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 5: Commit**
```bash
git add src/components/layout/
git commit -m "feat(layout): add Sidebar, Header, and OfflineBadge components"
```

---

### Task 7: Interactive Calendar Module

**Files:**
- Create: `src/components/calendar/EventBadge.tsx`
- Create: `src/components/calendar/DayCell.tsx`
- Create: `src/components/calendar/MonthView.tsx`
- Create: `src/components/calendar/WeekView.tsx`
- Create: `src/components/calendar/CalendarHeader.tsx`
- Create: `src/components/calendar/CalendarFilters.tsx`
- Create: `src/components/calendar/EventModal.tsx`
- Create: `src/components/calendar/AddMeetingModal.tsx`
- Create: `src/components/calendar/CalendarView.tsx`

- [ ] **Step 1: Build `EventBadge.tsx` and `DayCell.tsx`**
Renders meeting pills with time/icon, and task pills with priority dots (High = rose, Medium = amber, Low = emerald) and assignee name. Handles overflow ("+N more").

- [ ] **Step 2: Build `MonthView.tsx` and `WeekView.tsx`**
- `MonthView`: 7 columns (Пн–Вс), headers, dynamic day cells, subtle grid borders.
- `WeekView`: 7 day columns with an all-day tasks section at the top and hourly time slots (08:00 to 20:00).

- [ ] **Step 3: Build `CalendarHeader.tsx` and `CalendarFilters.tsx`**
- Month navigation (Prev, Next, Today), current Month Year title.
- View switch buttons (Month / Week).
- Export `.ics` button with download icon.
- Add Meeting button with `+` icon.
- Filter pills: All / Meetings / Action Items, plus priority chips.

- [ ] **Step 4: Build `EventModal.tsx` and `AddMeetingModal.tsx`**
- `EventModal`: Inspects clicked meeting (participants, Executive summary, decisions, action items) or action item (assignee, task, deadline, status).
- `AddMeetingModal`: Form to schedule a new meeting on the calendar with title, date, start/end time, and participants.

- [ ] **Step 5: Assemble `CalendarView.tsx`**
Connects all sub-components into a unified responsive calendar interface.

- [ ] **Step 6: Verify TypeScript compilation**
Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 7: Commit**
```bash
git add src/components/calendar/
git commit -m "feat(calendar): implement month/week views, event badges, modals, and filters"
```

---

### Task 8: Assemble `App.tsx`, Wire Entrypoint, and Full Verification

**Files:**
- Create: `src/main.tsx`
- Create: `src/App.tsx`

- [ ] **Step 1: Implement `src/App.tsx` and `src/main.tsx`**
Integrate `MeetingProvider`, `Sidebar`, `Header`, and view routing (active `CalendarView` as primary). Include placeholder cards for other tabs (Protocols, Upload, Tasks) with visual notes indicating they are ready for the core pipeline stage.

- [ ] **Step 2: Run complete type-check and production build**
Run: `npm run build`
Expected: Vite build succeeds with zero errors, producing optimized bundle in `dist/`.

- [ ] **Step 3: Launch dev server and verify in browser**
Run: `npm run dev` in background and test UI rendering, calendar navigation, filtering, event modal inspection, and `.ics` file download.

- [ ] **Step 4: Final commit**
```bash
git add src/App.tsx src/main.tsx
git commit -m "feat: connect App root with MeetingProvider and complete calendar integration"
```
