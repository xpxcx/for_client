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
- `POST /api/contact` — отправка формы обратной связи (body: name, email, category?, message). При успешной отправке данные сохраняются в БД и дублируются в Telegram (если заданы переменные окружения).

**Telegram:** чтобы заявки с формы обратной связи приходили в бота, в `backend/.env` укажите `TELEGRAM_BOT_TOKEN` (токен бота от @BotFather) и `TELEGRAM_CHAT_ID` (ID чата, куда слать уведомления). Как получить chat_id: напишите боту в Telegram любое сообщение (например /start), затем откройте в браузере `https://api.telegram.org/bot<ВАШ_ТОКЕН>/getUpdates` — в ответе в `message.chat.id` будет нужный ID.

## Подготовка к релизу и деплой

### Переменные окружения (backend)

Скопируйте `backend/.env.example` в `backend/.env` и задайте значения:

- `NODE_ENV=production` — для продакшена
- `PORT` — порт сервера (по умолчанию 3000)
- `DB_*` — параметры PostgreSQL
- `JWT_SECRET` — секрет для JWT (не менее 32 символов)
- `FRONTEND_ORIGIN` — полный URL фронтенда (например `https://site.ru`) для CORS

### Сборка и запуск в production

**Backend:**

```bash
cd backend
npm ci
npm run build
NODE_ENV=production node dist/main
```

Или: `npm run start:prod` (после `npm run build`).

**Frontend:**

```bash
cd frontend
npm ci
npm run build
```

В каталоге `frontend/dist` будет статический сайт. Его нужно отдавать через веб-сервер (Nginx, Apache) или раздавать статику из backend. Запросы к `/api` и `/uploads` должны проксироваться на backend (порт 3000) или backend сам отдаёт статику и API.

### База данных

- В production у TypeORM отключён `synchronize` — схему меняйте миграциями или вручную по файлам в `backend/migrations/`.
- Перед первым запуском создайте БД и выполните SQL из `backend/migrations/` и `backend/scripts/` при необходимости.

### Перед публикацией

- В `frontend/index.html` замените `https://your-domain.com` на реальный URL сайта (canonical).
- В `frontend/public/robots.txt` и `frontend/public/sitemap.xml` замените `https://your-domain.com` на реальный URL.

---

## Структура

- `backend` — NestJS, глобальный префикс `/api`, CORS для localhost:5173 и FRONTEND_ORIGIN
- `frontend` — React (Vite), react-router-dom, прокси `/api` на backend
