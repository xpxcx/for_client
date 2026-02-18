# Портфолио: React + NestJS

## Запуск

### 1. Установка зависимостей

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 2. Backend (порт 3000)

```bash
cd backend
npm run start:dev
```

### 3. Frontend (порт 5173)

В отдельном терминале:

```bash
cd frontend
npm run dev
```

Откройте в браузере адрес, который выведет Vite (обычно http://localhost:5173).

## API

- `GET /api` — приветствие
- `GET /api/content/sections` — список разделов
- `GET /api/content/:id` — контент раздела (about, materials, achievements, news, contact, links)

## Структура

- `backend` — NestJS, глобальный префикс `/api`, CORS для localhost:5173
- `frontend` — React (Vite), react-router-dom, прокси `/api` на backend
