# Eirene – Calm Productivity

**Курсовая работа на курсе «Т-Академия Фронтенда»**

**Автор:** Степанов Артём Андреевич  
**Название приложения:** Eirene

---

## Ссылка на готовое приложение

- **Фронтенд (Netify):** [https://legendary-croquembouche-eb86b4.netlify.app/](https://legendary-croquembouche-eb86b4.netlify.app/)
- **Бэкенд (Render):** [https://eirene-cywb.onrender.com/](https://eirene-cywb.onrender.com/)

## Данные от тестового аккаунта

- **Email: test-eirene@gmail.com**
- **Password: test123**

---

## Задача, решаемая приложением

Eirene помогает людям, которые испытывают стресс от перегруженности задачами. Приложение внедряет принципы **спокойной продуктивности** (calm productivity):

- автоматическая приоритизация задач (алгоритм Hard → Soft → Дата → Приоритет);
- ограничение активных задач (не более 5);
- разделение жёстких и мягких дедлайнов;
- минималистичный режим фокуса;
- поддерживающие формулировки вместо тревожных напоминаний

---

## Целевая аудитория

- Студенты, работники, которые чувствуют усталость и стресс от бесконечных списков дел
- Люди, которые предпочитают работать без спешки и хаоса
- Пользователи, которым нужны не просто приложение для напоминания, а инструмент для снижения тревожности при управлении задачами

---

## Основные возможности

- **Полноценный CRUD** задач, проектов, подзадач
- **Умный дашборд** – на главном экране показываются только топ‑3 задачи (Hard Deadline > Soft > Дата > Приоритет).
- **Лимит активных задач** – нельзя взять в работу больше 5 задач одновременно, система мягко предложит завершить текущие.
- **Soft / Hard дедлайны** – жесткий дедлайн помечается как важный (в уведомлениях: «Лучше выполнить в срок»), мягкий – с поддерживающим комментарием «Можно перенести, если нужно»
- **Focus Mode** – полноэкранный режим без сайдбара и лишних элементов, только задача и подзадачи.
- **Гибкие представления задач** – список, канбан-доска, календарь
- **Уведомления** – внутри приложения и email‑рассылка за день до дедлайна (мягкие формулировки, например «Напоминание» вместо «СРОЧНО»)
- **Адаптивный дизайн** – корректно работает на десктопе, планшетах и мобильных устройствах

---

## Технологический стек

### Фронтенд

- React 19 + TypeScript + Vite
- Redux Toolkit (RTK Query)
- Tailwind CSS
- React Hook Form + Zod
- Sentry (мониторинг ошибок)

### Бэкенд

- Node.js + Express + TypeScript
- MongoDB + Mongoose (Atlas)
- JWT (HttpOnly cookies)
- Winston (логирование)
- Nodemailer (email‑уведомления)
- Zod (валидация)

### Деплой и CI/CD

- GitLab CI (линтинг, тесты, сборка, деплой фронта на Pages)
- Render (бэкенд)
- GitLab Pages (фронтенд)
- Sentry (ошибки)

---

## Инструкция по запуску проекта (локально)

### Требования

- Node.js 20+ и npm
- MongoDB (локально или Atlas)

### 1. Клонирование репозитория

```bash
git clone https://gitlab.education.tbank.ru/frontend-academy-2-2026/homework-forks/a.stepanov/final-project-2-semester.git
cd final-project-2-semester
```

### 2.Настройка Backend (/server)

```bash
cd server
npm install
cp .env.example .env
```

**Отредактируйте .env:**

```env
PORT=5000
NODE_ENV=development
MONGO_URI=...
JWT_SECRET=jwt-secret-access-key
JWT_REFRESH_SECRET=jwt-secret-refresh-key
CLIENT_URL=http://localhost:5173
PREVIEW_PROD_CLIENT_URL=http://localhost:4173(ОПЦИОНАЛЬНО)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=...
SMTP_FROM=... <noreply@your-email>
SENTRY_DSN=https://...@sentry.io/...
```

**Запуск в режиме разработки**

```
npm run dev
```

**Сборка и запуск в production**

```
npm run build
npm start
```

### 3. Настройка Frontend (/client)

```bash
cd ../client
npm install
cp .env.example .env
```

**Отредактируйте .env**

```env
VITE_API_URL=http://localhost:5000
VITE_API_TIMEOUT=10000
VITE_SENTRY_DSN=https://...@sentry.io/...
```

**Запуск в режиме разработки**

```bash
npm run dev
```

**Сборка и превью**

```bash
npm run build
npm run preview
```

### 4. Тестирование и линтинг

**Фронтенд**

```bash
cd client
npm run lint
npm run test
npm run test:coverage (с отчетом покрытия)
```

**Бэкенд**

```bash
cd client
npm run lint
npm run test (с отчетом покрытия)
```

### 5. Документация API

**После запуска бэкенда Swagger UI доступен по адресу:** [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
