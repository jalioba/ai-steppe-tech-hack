# Design Spec: Action Items Table Studio, Calendar Polish & Live Meeting with AI Consensus

**Date:** 2026-09-11  
**Status:** Approved by User  
**Target:** AI Meeting Intelligence Hackathon Application  

---

## 1. Executive Summary & Goals

This specification defines the architectural design for:
1. **Interactive Calendar Completion:** Full synchronization with tasks, day-click date prefill, quick event creation (meeting or deadline), inline status toggle, editing, and deletion in `EventModal`.
2. **Action Items Table Studio (ТЗ Requirement 4 & 5):**
   - **User creation & editing:** Rich interactive table with sorting, search, filtering by priority and status, manual task addition/editing/deletion, and RFC 4180 CSV / JSON exports.
   - **AI Table generation:** Local AI-powered extractor taking meeting notes or audio transcripts, automatically identifying tasks, assignees, deadlines, and priorities, with an interactive preview and batch import.
3. **Live Meeting Room (Google Meet Style):**
   - Virtual room experience with participants, mic status, live transcript preview, and "End Meeting" workflow.
   - Automatic synthesis of uncontested decisions (**«Решения без споров»**), risks/disputes, and action items.
   - Interactive RAG Q&A chat post-meeting to query final decisions.
4. **Django-Ready Architecture (Zero Crutches):**
   - Clean decoupled API service layer (`src/services/apiService.ts`) with clear REST contracts (`GET/POST /api/meetings/`, `GET/POST /api/action-items/`, etc.).
   - Standard snake_case / camelCase data adapters matching Django REST Framework serializers, enabling a 1-line switch to a real Django backend when ready.

---

## 2. Decoupled Django-Ready Architecture

To ensure zero friction when connecting a Django REST backend:
- All data operations route through an abstracted `apiService`:
  ```typescript
  // src/services/apiService.ts
  export interface ApiService {
    getMeetings(): Promise<Meeting[]>;
    createMeeting(data: CreateMeetingDto): Promise<Meeting>;
    updateMeeting(id: string, data: Partial<Meeting>): Promise<Meeting>;
    deleteMeeting(id: string): Promise<boolean>;

    getActionItems(): Promise<ActionItem[]>;
    createActionItem(data: CreateActionItemDto): Promise<ActionItem>;
    updateActionItem(id: string, data: Partial<ActionItem>): Promise<ActionItem>;
    deleteActionItem(id: string): Promise<boolean>;

    extractActionItemsAi(text: string, meetingId?: string): Promise<ActionItemDraft[]>;
    askMeetingAi(meetingId: string, question: string, contextText?: string): Promise<AiAnswerResponse>;
  }
  ```
- An active implementation `localMockApiService` operates against `localStorage` with offline local AI heuristics, while the codebase is ready to point `VITE_API_URL` to `http://localhost:8000` for Django DRF endpoints.

---

## 3. Data Models (`src/types/`)

### 3.1 Meeting Extended Model (`src/types/meeting.ts`)
```typescript
export interface ConsensusDecision {
  id: string;
  topic: string;
  decision: string;
  status: 'consensus' | 'disputed' | 'open';
  timestamp?: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  participants: string[];
  status: 'scheduled' | 'in_progress' | 'processed';
  summary?: string;
  decisions?: string[];
  consensusDecisions?: ConsensusDecision[]; // "Решения без споров"
  topics?: ProtocolTopic[];
  openQuestions?: string[];
  risks?: ProtocolRisk[];
  transcript?: string;
  audioDurationSeconds?: number;
  createdAt: string;
}
```

### 3.2 ActionItem Model (`src/types/actionItem.ts`)
```typescript
export type Priority = 'high' | 'medium' | 'low';
export type ActionItemStatus = 'pending' | 'in_progress' | 'completed';

export interface ActionItem {
  id: string;
  meetingId?: string;
  meetingTitle?: string;
  task: string;
  assignee: string;
  deadline: string; // YYYY-MM-DD
  priority: Priority;
  status: ActionItemStatus;
  isAiGenerated?: boolean;
  createdAt?: string;
}
```

---

## 4. Component Architecture & UI Flow

### 4.1 Calendar Module Polish
1. **`DayCell.tsx` & `WeekView.tsx`:**
   - Hovering over a cell reveals a quick `+` button.
   - Clicking `+` opens a selection popup: **«Запланировать встречу»** or **«Добавить поручение»**.
   - Prefills the exact date string (`YYYY-MM-DD`) into the creation modals.
2. **`EventModal.tsx`:**
   - **Action Item view:** Adds an interactive status pill dropdown (`Ожидает` / `В работе` / `Выполнено`), an «Редактировать» button opening the edit modal, and an «Удалить» button with confirmation.
   - **Meeting view:** Adds an «Редактировать» button, direct task completion checkboxes for linked tasks, and an «Удалить» button.

### 4.2 Action Items Table Studio (`src/components/tasks/`)
- **`TasksView.tsx`:**
  - **Header Bar:**
    - Title with total & completed task count badges.
    - Search bar (filters by task text, assignee, or meeting title).
    - Status filters (`Все`, `Ожидает`, `В работе`, `Выполнено`).
    - Priority filters (`Все`, `Высокий`, `Средний`, `Низкий`).
    - Action buttons:
      - `+ Добавить поручение` (manual creation modal).
      - `🤖 Сгенерировать через ИИ` (AI extraction modal).
      - `Экспорт (.csv / .json)` dropdown.
  - **Table View (`ActionItemsTable.tsx`):**
    - Columns:
      1. Статус (clickable checkbox / pill for instant transition).
      2. Суть задачи (Task text, with meeting badge if linked).
      3. Ответственный (Assignee chip with avatar color).
      4. Срок выполнения (Deadline with relative badge, e.g. "Через 3 дня" or "Просрочено").
      5. Приоритет (Color-coded badge: Rose / Amber / Emerald).
      6. Источник (Пользователь / 🤖 ИИ).
      7. Действия (Кнопка перехода в календарь, редактирование, удаление).
- **`ActionItemModal.tsx`:** Modal for creating and editing individual action items.
- **`AiGenerateTableModal.tsx`:**
  - Step 1: Input text (transcript, meeting notes, or select from existing meeting).
  - Step 2: "Извлечь поручения" triggers local heuristic NLP / LLM extraction.
  - Step 3: Interactive preview table with editable fields and inclusion checkboxes.
  - Step 4: "Добавить выбранные в таблицу и календарь" saves to state.

### 4.3 Live Meeting Room (Google Meet Style) (`src/components/live/`)
- **`LiveMeetingModal.tsx`:**
  - Accessible via a prominent button: **«Начать онлайн-совещание»**.
  - **Screen 1: Live Meeting Room:**
    - Audio waveform / pulse animation.
    - Grid of participants (User, AI Protocolist, mock team members with talking states).
    - Live transcript feed showing remarks in real-time.
    - Timer (MM:SS) and controls (Mute mic, Camera, Live Notes, End Meeting).
  - **Screen 2: Post-Meeting AI Protocol & Consensus Analysis:**
    - Triggered upon "Завершить совещание".
    - Section 1: **Решения без споров (Consensus Decisions)** — highlighted uncontested decisions.
    - Section 2: **Спорные вопросы и риски (Disputes & Risks)**.
    - Section 3: **Сгенерированные поручения (Action Items)** with button to save to main table.
    - Section 4: **Интерактивный чат с ИИ (RAG Q&A)** — input bar where users can ask questions (e.g., "Какие итоговые решения были приняты без споров?", "Кто отвечает за бэкенд?"). The AI responds accurately based on the meeting transcript.

---

## 5. Export Services (`src/services/exportService.ts`)

- **CSV Export:** Generates RFC 4180 UTF-8 with BOM (ensuring proper display in Microsoft Excel on Windows/Mac) with headers:
  `"Задача";"Ответственный";"Срок выполнения";"Приоритет";"Статус";"Встреча";"Источник"`
- **JSON Export:** Standard formatted JSON download containing full array of action items.
- **ICS Export:** Unified with existing `icsService.ts` for calendar export.

---

## 6. Verification Plan

1. **Type Checking & Build:**
   - `npx tsc --noEmit` exits with 0 errors.
   - `npm run build` succeeds cleanly.
2. **Interactive Testing:**
   - Add meeting & task from calendar with specific prefilled date.
   - Change task status from calendar `EventModal` and verify update in `TasksView`.
   - Create manual task in `TasksView`, verify it appears in Calendar on the deadline date.
   - Launch AI Table Generator, paste text, verify extraction, approve items, check their presence in both table and calendar.
   - Start Live Meeting room, let it record, end meeting, review "Решения без споров", and test AI Q&A chat.
   - Test CSV and JSON exports.
