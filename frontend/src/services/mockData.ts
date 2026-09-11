import { Meeting } from '../types/meeting';
import { ActionItem } from '../types/actionItem';

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'meet-1',
    title: 'Планирование архитектуры локального Faster-Whisper и Ollama',
    date: '2026-09-11',
    startTime: '10:00',
    endTime: '11:15',
    participants: ['Алексей К.', 'Данияр М.', 'Айгерим С.'],
    status: 'processed',
    audioFileName: 'meeting_sprint_kickoff_offline.wav',
    audioDuration: '01:15:20',
    language: 'ru',
    summary: 'Команда утвердила переход на Faster-Whisper с квантованием int8 для снижения задержки распознавания до 1.8 секунд на двухминутном аудио. Полностью исключены сетевые обращения к сторонним коммерческим API, гарантируя 100% конфиденциальность данных. Разделение спикеров и мультиязычность для казахского и русского языков будут интегрированы через локальный пайплайн.',
    decisions: [
      'Использовать Faster-Whisper (модель medium) для автономной локальной транскрибации',
      'Интегрировать Ollama с локальной моделью Qwen-2.5-7B для синтеза Executive Summary и протокола',
      'Обеспечить экспорт готового протокола в .csv, .json и .pdf согласно Must-Have требованиям ТЗ',
      'Внедрить генерацию .ics календаря для прямой синхронизации дедлайнов и совещаний'
    ],
    consensusDecisions: [
      {
        id: 'cd-1',
        topic: '100% Автономность',
        decision: 'Строго локальный запуск без обращений к внешним коммерческим API',
        status: 'consensus',
        participantsAgreed: ['Алексей К.', 'Данияр М.', 'Айгерим С.']
      },
      {
        id: 'cd-2',
        topic: 'Архитектура сервисов',
        decision: 'Разделение frontend (React/TS) и backend (Django REST) с чистым интерфейсом API',
        status: 'consensus',
        participantsAgreed: ['Данияр М.', 'Алексей К.']
      },
      {
        id: 'cd-3',
        topic: 'Формат экспорта',
        decision: 'Экспорт поручений в CSV с UTF-8 BOM и JSON по обязательным требованиям ТЗ',
        status: 'consensus',
        participantsAgreed: ['Айгерим С.', 'Данияр М.']
      }
    ],
    transcript: `Алексей К.: Коллеги, давайте зафиксируем: решение должно быть на 100% автономным. Никаких внешних API OpenAI или Claude, только локальный Faster-Whisper и локальная LLM через Ollama.
Данияр М.: Полностью поддерживаю. По бэкенду предлагаю сразу проектировать под Django REST Framework, чтобы потом не переписывать код. Все модели делаем чистыми.
Айгерим С.: Согласна. В интерфейсе обязательны таблица поручений с дедлайнами и календарь с экспортом в .ics. И чтобы можно было экспортировать в CSV без проблем с кодировкой в Excel.
Алексей К.: Принято единогласно. Распределяем задачи и дедлайны.`,
    topics: [
      {
        topic: '1. Скорость обработки аудио',
        notes: 'Тестирование Faster-Whisper показало ускорение в 4.2 раза по сравнению с базовым Whisper. Время обработки 2-минутной записи укладывается в критерии оценки UI/UX.'
      },
      {
        topic: '2. 100% Offline и безопасность',
        notes: 'Приложение функционирует без передачи данных во внешнюю сеть. Все модели весов хранятся локально на устройстве пользователя.'
      },
      {
        topic: '3. Структура протокола и Action Items',
        notes: 'Утверждены строгие поля таблицы поручений: Ответственный, Суть задачи, Срок выполнения и Приоритет.'
      }
    ],
    openQuestions: [
      'Требуется ли поддержка CPU-only инференса для ПК без дискретных видеокарт?',
      'Какой порог уверенности диаризации использовать при наложении голосов участников?'
    ],
    risks: [
      {
        risk: 'Пиковое потребление ОЗУ при одновременной работе Whisper и LLM',
        severity: 'medium'
      }
    ]
  },
  {
    id: 'meet-2',
    title: 'Синхронизация по генерации протоколов и интеграции дедлайнов',
    date: '2026-09-15',
    startTime: '14:30',
    endTime: '15:30',
    participants: ['Айгерим С.', 'Ерлан Т.', 'Алексей К.'],
    status: 'scheduled',
    language: 'mixed',
    topics: [
      {
        topic: 'Проверка формата экспорта отчетов',
        notes: 'Согласование полей для .pdf и .csv таблиц поручений.'
      }
    ]
  },
  {
    id: 'meet-3',
    title: 'Ревью демо-стенда и тестирование на случайном аудио',
    date: '2026-09-18',
    startTime: '16:00',
    endTime: '17:00',
    participants: ['Данияр М.', 'Алексей К.', 'Ерлан Т.'],
    status: 'scheduled',
    language: 'ru'
  },
  {
    id: 'meet-4',
    title: 'Финальный прогон презентации для демо-дня хакатона',
    date: '2026-09-24',
    startTime: '11:00',
    endTime: '12:00',
    participants: ['Вся команда'],
    status: 'scheduled'
  }
];

export const INITIAL_ACTION_ITEMS: ActionItem[] = [
  {
    id: 'task-1',
    meetingId: 'meet-1',
    meetingTitle: 'Планирование архитектуры локального Faster-Whisper и Ollama',
    assignee: 'Алексей К.',
    task: 'Подготовить скрипт автоматической загрузки локальных весов Faster-Whisper для 100% Offline запуска',
    deadline: '2026-09-12',
    priority: 'high',
    status: 'in_progress'
  },
  {
    id: 'task-2',
    meetingId: 'meet-1',
    meetingTitle: 'Планирование архитектуры локального Faster-Whisper и Ollama',
    assignee: 'Айгерим С.',
    task: 'Провести контрольный замер скорости распознавания 2-минутной тестовой записи',
    deadline: '2026-09-14',
    priority: 'high',
    status: 'pending'
  },
  {
    id: 'task-3',
    meetingId: 'meet-1',
    meetingTitle: 'Планирование архитектуры локального Faster-Whisper и Ollama',
    assignee: 'Данияр М.',
    task: 'Спроектировать модуль генерации отчетов в .pdf, .csv и .json с валидацией колонок по ТЗ',
    deadline: '2026-09-16',
    priority: 'high',
    status: 'pending'
  },
  {
    id: 'task-4',
    meetingId: 'meet-1',
    meetingTitle: 'Планирование архитектуры локального Faster-Whisper и Ollama',
    assignee: 'Ерлан Т.',
    task: 'Настроить структурированный системный промпт Ollama для точного извлечения сроков и поручений',
    deadline: '2026-09-19',
    priority: 'medium',
    status: 'pending'
  },
  {
    id: 'task-5',
    meetingId: 'meet-1',
    meetingTitle: 'Планирование архитектуры локального Faster-Whisper и Ollama',
    assignee: 'Алексей К.',
    task: 'Протестировать импорт сгенерированного .ics файла в Google Calendar и Microsoft Outlook',
    deadline: '2026-09-22',
    priority: 'low',
    status: 'pending'
  }
];
