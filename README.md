# Портфолио: React + NestJS

**Важно:** Сначала запустите backend, затем frontend. Иначе в консоли Vite будут ошибки `ECONNREFUSED` (прокси не может подключиться к порту 3000). Если backend не запущен, сайт всё равно откроется: меню подставится из запасного списка, на главной будет «Сервер недоступен».

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
- `GET /api/content/sections` — список разделов меню
- `GET /api/content/:id` — контент раздела (about, materials, achievements, links)
- `GET /api/news` — список новостей
- `POST /api/contact` — отправка формы обратной связи (body: name, email, category?, message)

## Структура

- `backend` — NestJS, глобальный префикс `/api`, CORS для localhost:5173
- `frontend` — React (Vite), react-router-dom, прокси `/api` на backend
