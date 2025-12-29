// src/data/portfolioData.ts

export const COMPETENCIES = [
  {
    id: 1,
    title: "Архитектура и Автоматизация",
    icon: "Server",
    items: [
      "Event-Driven архитектура",
      "Паттерны оркестрации (Dispatcher/Worker)",
      "State Machines (FSM)",
      "Отказоустойчивые пайплайны"
    ]
  },
  {
    id: 2,
    title: "Движок Автоматизации",
    icon: "Workflow",
    items: [
      "Сложные сценарии (n8n Expert)",
      "Глобальная обработка ошибок",
      "Кастомная логика (Code Nodes)",
      "Webhooks, Queues & Batching"
    ]
  },
  {
    id: 3,
    title: "Backend и Инфраструктура",
    icon: "Database",
    items: [
      "PostgreSQL / Redis",
      "Очереди сообщений RabbitMQ",
      "Docker / Docker Compose",
      "S3 Storage (MinIO)",
      "Настройка VPS и безопасность"
    ]
  },
  {
    id: 4,
    title: "AI / LLM Интеграции",
    icon: "BrainCircuit",
    items: [
      "OpenAI, Ollama, Anthropic",
      "RAG системы (Qdrant Vector DB)",
      "Prompt Engineering",
      "Structured Output (JSON Repair)",
      "Генерация медиа (ComfyUI)"
    ]
  },
  {
    id: 5,
    title: "Экосистема Telegram",
    icon: "MessageCircle",
    items: [
      "Telegram Bot API (Deep Dive)",
      "Mini Apps / Web Apps",
      "Прием платежей",
      "Безопасность токенов и данных"
    ]
  },
  {
    id: 6,
    title: "Надежность (Reliability)",
    icon: "ShieldCheck",
    items: [
      "Стратегии Retry и Idempotency",
      "Мониторинг состояний",
      "Root Cause Analysis",
      "Автоматическое восстановление"
    ]
  }
];

export const SOLUTIONS = [
  {
    id: 1,
    title: "Автономные SMM Экосистемы",
    icon: "Zap",
    description: "Полная автоматизация контент-маркетинга. Планирование, копирайтинг, генерация медиа, согласование и постинг без участия человека."
  },
  {
    id: 2,
    title: "Сложные Telegram Платформы",
    icon: "Bot",
    description: "Enterprise-решения в мессенджере. HR-сервисы, доски объявлений, закрытые сообщества с платной подпиской и личными кабинетами."
  },
  {
    id: 3,
    title: "AI Ассистенты и Агенты",
    icon: "Brain",
    description: "Кастомные нейро-сотрудники на базе ваших данных (RAG). Работают по четкой бизнес-логике, не выдумывают факты, интегрированы в CRM."
  },
  {
    id: 4,
    title: "Аудит и Рефакторинг",
    icon: "Wrench",
    description: "Лечение автоматизаций, которые «постоянно падают». Анализ архитектуры, поиск узких мест и пересборка в стабильную систему."
  }
];

export const APPROACH = [
  {
    id: 1,
    title: "Надежность важнее скорости",
    description: "Система, которая работает стабильно, приносит деньги. Код, который падает — приносит убытки. Я строю надолго."
  },
  {
    id: 2,
    title: "Low-Code + Архитектура",
    description: "Скорость сборки low-code инструментов (n8n) плюс надежность хардкорной разработки. Лучшее из двух миров."
  },
  {
    id: 3,
    title: "Продуктовое мышление",
    description: "Я думаю о конечных пользователях и бизнес-задачах, а не просто закрываю тикеты. Технология должна приносить пользу."
  },
  {
    id: 4,
    title: "Инженерный баланс",
    description: "Никакого оверинжиниринга. Используем сложные инструменты (Docker, RabbitMQ) только там, где это реально нужно проекту."
  }
];