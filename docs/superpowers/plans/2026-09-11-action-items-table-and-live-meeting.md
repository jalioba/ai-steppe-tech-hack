# Action Items Table Studio, Calendar Polish & Live Meeting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full-featured Action Items table management (manual + AI-extracted), polish the interactive calendar with day-click date prefill and event lifecycle actions, provide a Google Meet style live meeting simulator with automatic consensus detection («Решения без споров») and post-meeting RAG Q&A, all backed by a decoupled Django REST-ready API service.

**Architecture:** 
- A decoupled `apiService` layer that abstracts all backend interactions (REST contracts matching Django DRF serializers), backed by a local offline adapter.
- Full two-way reactive state in `MeetingContext` for meetings, action items, and live meeting sessions with `localStorage` persistence.
- Modals for creating/editing action items and meetings, an AI extraction studio with interactive preview and batch import, and RFC 4180 CSV / JSON / ICS export services.
- A virtual live meeting room with audio indicators, real-time simulated transcript, consensus decision extraction, and contextual RAG Q&A.

**Tech Stack:** React 18, TypeScript, Vite, `date-fns`, `lucide-react`, Vanilla CSS tokens (dark glassmorphism).

---

### File Structure Map
```text
src/
├── types/
│   ├── meeting.ts            [MODIFY: add ConsensusDecision, transcript, disputes]
│   ├── actionItem.ts         [MODIFY: add isAiGenerated, ActionItemStatus]
│   └── calendar.ts           [KEEP/EXTEND]
├── services/
│   ├── apiService.ts         [NEW: clean decoupled Django-ready REST client & offline adapter]
│   ├── exportService.ts      [NEW: RFC 4180 CSV with BOM & JSON export]
│   ├── aiExtractorService.ts [NEW: local NLP heuristic & prompt parser for action items]
│   ├── icsService.ts         [KEEP]
│   └── mockData.ts           [MODIFY: add live meeting sample & consensus decisions]
├── context/
│   └── MeetingContext.tsx    [MODIFY: add action item CRUD, targetCreateDate, AI generate open, live room state]
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx       [MODIFY: add Live Meeting launch trigger & active badge]
│   │   └── Header.tsx        [MODIFY: quick action button for Live Meeting]
│   ├── calendar/
│   │   ├── DayCell.tsx       [MODIFY: quick menu with prefilled date for Meeting or Task]
│   │   ├── EventModal.tsx    [MODIFY: direct status toggle, edit, delete with confirmation]
│   │   ├── AddMeetingModal.tsx [MODIFY: use targetCreateDate]
│   │   └── AddActionItemModal.tsx [NEW: modal to schedule action item directly from calendar]
│   ├── tasks/
│   │   ├── TasksView.tsx     [NEW: rich Action Items Studio header, filters, count badges]
│   │   ├── ActionItemsTable.tsx [NEW: sortable, filterable table with quick status toggle]
│   │   ├── ActionItemModal.tsx [NEW: create/edit action item form]
│   │   └── AiGenerateTableModal.tsx [NEW: AI table extractor with interactive preview]
│   ├── live/
│   │   ├── LiveMeetingModal.tsx [NEW: container for virtual room & post-meeting summary]
│   │   ├── MeetingRoom.tsx   [NEW: Google Meet UI with participants, mic, live transcript]
│   │   └── MeetingSummaryQnA.tsx [NEW: "Решения без споров", risk radar, action items, AI Q&A chat]
│   └── App.tsx               [MODIFY: wire TasksView, Calendar, and LiveMeetingModal]
```

---

### Task 1: Django-Ready API Layer, Data Types & Export Services

**Files:**
- Modify: `src/types/meeting.ts`
- Modify: `src/types/actionItem.ts`
- Create: `src/services/apiService.ts`
- Create: `src/services/exportService.ts`
- Create: `src/services/aiExtractorService.ts`

- [ ] **Step 1: Extend data types in `src/types/meeting.ts` and `src/types/actionItem.ts`**
Add `ConsensusDecision` interface, extend `Meeting` with `consensusDecisions`, `transcript`, `disputesOrRisks`. Add `isAiGenerated` to `ActionItem`.

- [ ] **Step 2: Create `src/services/exportService.ts`**
Implement `exportActionItemsToCsv(items)` using RFC 4180 with UTF-8 BOM (`\uFEFF`) and headers `Задача;Ответственный;Срок;Приоритет;Статус;Встреча;Источник`. Implement `exportActionItemsToJson(items)`.

- [ ] **Step 3: Create `src/services/aiExtractorService.ts`**
Implement offline action item extractor function `extractActionItemsFromText(text: string)` that analyzes Russian/English text for keywords ("назначить", "сделать", "отвечает", "до пятницы", "срочно") and returns structured draft action items with high/medium/low priority and date offsets.

- [ ] **Step 4: Create `src/services/apiService.ts`**
Define `ApiService` contract and create a local offline implementation backed by `localStorage` that mimics Django REST Framework endpoints (`/api/meetings/`, `/api/action-items/`, `/api/ai/extract-action-items/`, `/api/ai/meeting-chat/`).

- [ ] **Step 5: Verify types and compilation**
Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 6: Commit**
```bash
git add src/types/ src/services/
git commit -m "feat: add Django-ready apiService, exportService, and aiExtractorService"
```

---

### Task 2: Context State Upgrades & CRUD Sync (`MeetingContext.tsx`)

**Files:**
- Modify: `src/context/MeetingContext.tsx`

- [ ] **Step 1: Add CRUD handlers for action items and meetings**
Add:
- `updateActionItem(id: string, updates: Partial<ActionItem>)`
- `deleteActionItem(id: string)`
- `toggleActionItemStatus(id: string)` (cycles through `pending` -> `in_progress` -> `completed`)
- `updateMeeting(id: string, updates: Partial<Meeting>)`
- `deleteMeeting(id: string)`
- `targetCreateDate: string | null` and setter `setTargetCreateDate`
- `isAddActionItemOpen: boolean` and setter
- `isAiGenerateOpen: boolean` and setter
- `isLiveMeetingOpen: boolean` and setter

- [ ] **Step 2: Connect context actions with `apiService` & `localStorage`**
Ensure state persists and exports trigger cleanly.

- [ ] **Step 3: Verify TypeScript compilation**
Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Commit**
```bash
git add src/context/MeetingContext.tsx
git commit -m "feat(context): add complete CRUD, date prefill, and modal states"
```

---

### Task 3: Interactive Calendar Polish & Modals

**Files:**
- Modify: `src/components/calendar/DayCell.tsx`
- Modify: `src/components/calendar/EventModal.tsx`
- Modify: `src/components/calendar/AddMeetingModal.tsx`
- Create: `src/components/calendar/AddActionItemModal.tsx`
- Modify: `src/components/calendar/CalendarView.tsx`

- [ ] **Step 1: Update `DayCell.tsx` with date prefill & dual create menu**
When clicking `+` on a day, show a small action menu or trigger modal with `targetCreateDate` set to that day's `dateString`.

- [ ] **Step 2: Create `AddActionItemModal.tsx`**
A modal to directly schedule an action item / deadline on the selected date with fields: Task, Assignee, Deadline, Priority, Meeting selector.

- [ ] **Step 3: Update `AddMeetingModal.tsx`**
Ensure it initializes with `targetCreateDate` when available.

- [ ] **Step 4: Update `EventModal.tsx` with interactive actions**
- For Action Items: Add status dropdown / toggle button, edit button, and delete button with confirmation.
- For Meetings: Add edit button, direct task completion toggles for tied action items, and delete button.

- [ ] **Step 5: Verify Calendar interactions and build**
Run: `npm run build`
Expected: Success.

- [ ] **Step 6: Commit**
```bash
git add src/components/calendar/
git commit -m "feat(calendar): add day-click date prefill, AddActionItemModal, and interactive EventModal actions"
```

---

### Task 4: Action Items Table Studio (User & AI Creation)

**Files:**
- Create: `src/components/tasks/ActionItemsTable.tsx`
- Create: `src/components/tasks/ActionItemModal.tsx`
- Create: `src/components/tasks/AiGenerateTableModal.tsx`
- Create: `src/components/tasks/TasksView.tsx`

- [ ] **Step 1: Build `ActionItemsTable.tsx`**
Table displaying:
- Checkbox/icon to toggle status instantly.
- Task title + meeting subtitle.
- Assignee badge.
- Deadline with countdown ("Сегодня", "Через 2 дня", "Просрочено").
- Priority badge.
- Source badge (`Пользователь` vs `🤖 ИИ`).
- Action buttons: Edit, Delete, "Перейти в календарь".

- [ ] **Step 2: Build `ActionItemModal.tsx`**
Form to create or edit an action item, with priority selector and assignee autocomplete.

- [ ] **Step 3: Build `AiGenerateTableModal.tsx`**
- Input: Textarea to paste meeting notes/transcript OR dropdown to select existing meeting transcript.
- "Извлечь поручения ИИ" runs `extractActionItemsFromText`.
- Shows preview table with editable inputs and select-all checkboxes.
- "Добавить выбранные в систему" adds them to state and calendar.

- [ ] **Step 4: Build `TasksView.tsx`**
Assemble header (stats, search, priority filter, status filter, CSV/JSON export buttons, Add manual button, AI Generate button) and table.

- [ ] **Step 5: Verify build**
Run: `npm run build`
Expected: Clean build.

- [ ] **Step 6: Commit**
```bash
git add src/components/tasks/
git commit -m "feat(tasks): implement Action Items Table Studio with manual and AI creation"
```

---

### Task 5: Live Google Meet Style Room & Consensus Q&A

**Files:**
- Create: `src/components/live/MeetingRoom.tsx`
- Create: `src/components/live/MeetingSummaryQnA.tsx`
- Create: `src/components/live/LiveMeetingModal.tsx`

- [ ] **Step 1: Build `MeetingRoom.tsx`**
- Google Meet UI style: dark viewport, audio pulse visualizer.
- 4 participant tiles: "Вы (Организатор)", "ИИ-Протоколист (Ollama/Whisper)", "Данияр М.", "Айгерим С.".
- Live transcript bar showing incoming simulated remarks with timestamps.
- Timer (00:00) and bottom control bar: Mic mute/unmute, Video toggle, End Meeting button.

- [ ] **Step 2: Build `MeetingSummaryQnA.tsx`**
Shown immediately upon ending the meeting:
- Tab 1: **Решения без споров (Consensus Decisions)** — list of uncontested agreements with checkmarks.
- Tab 2: **Спорные вопросы и риски (Disputes & Risks)** — areas of debate and resolved status.
- Tab 3: **Сгенерированные поручения** — button to save them to the main Action Items table.
- Interactive RAG Chat input: ask questions to the AI about the meeting, with fast answers grounded in the transcript.

- [ ] **Step 3: Assemble `LiveMeetingModal.tsx`**
Manage switching from active room to post-meeting summary and saving the generated protocol as a new Meeting in state.

- [ ] **Step 4: Verify build**
Run: `npm run build`
Expected: 0 errors.

- [ ] **Step 5: Commit**
```bash
git add src/components/live/
git commit -m "feat(live): add Google Meet style live room, consensus extraction, and post-meeting Q&A chat"
```

---

### Task 6: UI Shell Integration & Final Polish

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Update `Sidebar.tsx` & `Header.tsx`**
Add prominent button **«Онлайн-совещание (Live)»** with pulsating recording badge.

- [ ] **Step 2: Update `App.tsx`**
Replace placeholder tasks view with new `TasksView`. Include `LiveMeetingModal` and test cross-tab navigation.

- [ ] **Step 3: Verify complete type checking and production build**
Run: `npm run build`
Expected: Vite build succeeds with 0 errors.

- [ ] **Step 4: Commit**
```bash
git add src/components/layout/ src/App.tsx
git commit -m "feat: wire LiveMeetingModal, TasksView studio, and navigation in App.tsx"
```

---

### Task 7: Full Verification & Demonstration

- [ ] **Step 1: Test Calendar operations**
Verify day cell click prefill, adding meeting, adding action item, editing, changing status, and deleting.

- [ ] **Step 2: Test Action Items Studio**
Verify user manual task creation, sorting, filtering, editing, CSV export, and JSON export.

- [ ] **Step 3: Test AI Table Generation**
Paste text, trigger AI extraction, verify draft preview, and batch add to table and calendar.

- [ ] **Step 4: Test Live Meeting & AI Consensus Q&A**
Launch live meeting, watch transcript, end meeting, verify "Решения без споров", test AI chat questions.
