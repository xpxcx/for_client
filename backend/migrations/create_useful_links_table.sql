-- Создание таблицы полезных ссылок
-- Выполнить в БД portfolio

CREATE TABLE IF NOT EXISTS useful_links (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  url VARCHAR(1000) NOT NULL,
  description TEXT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Комментарии к таблице и столбцам
COMMENT ON TABLE useful_links IS 'Полезные ссылки';
COMMENT ON COLUMN useful_links.id IS 'Уникальный идентификатор';
COMMENT ON COLUMN useful_links.title IS 'Название ссылки';
COMMENT ON COLUMN useful_links.url IS 'URL ссылки';
COMMENT ON COLUMN useful_links.description IS 'Описание ссылки';
COMMENT ON COLUMN useful_links."createdAt" IS 'Дата и время добавления';
