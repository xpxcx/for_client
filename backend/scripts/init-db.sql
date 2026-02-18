-- ============================================================
-- 1) Создание базы данных (один раз, от пользователя postgres)
--    Если база уже есть — можно пропустить этот блок.
-- ============================================================
CREATE DATABASE portfolio
  WITH ENCODING 'UTF8'
  LC_COLLATE = 'ru_RU.UTF-8'
  LC_CTYPE = 'ru_RU.UTF-8'
  TEMPLATE = template0;

-- ============================================================
-- 2) Таблицы (выполнять уже в базе portfolio: psql -d portfolio -f init-db.sql
--    или в psql: \c portfolio , затем вставить только блок ниже)
-- ============================================================

-- Таблица достижений
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL,
  "imageUrl" VARCHAR(500) NULL
);

-- Комментарии к таблице и столбцам
COMMENT ON TABLE achievements IS 'Достижения педагога';
COMMENT ON COLUMN achievements.id IS 'Уникальный идентификатор';
COMMENT ON COLUMN achievements.title IS 'Название достижения';
COMMENT ON COLUMN achievements.description IS 'Описание';
COMMENT ON COLUMN achievements.date IS 'Дата достижения';
COMMENT ON COLUMN achievements."imageUrl" IS 'URL или путь к фотографии';
