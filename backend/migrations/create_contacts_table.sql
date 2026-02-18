-- Создание таблицы контактов (обратная связь)
-- Выполнить в БД portfolio

CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  category VARCHAR(50) NULL,
  message TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Комментарии к таблице и столбцам
COMMENT ON TABLE contacts IS 'Сообщения обратной связи';
COMMENT ON COLUMN contacts.id IS 'Уникальный идентификатор';
COMMENT ON COLUMN contacts.name IS 'Имя отправителя';
COMMENT ON COLUMN contacts.email IS 'Email отправителя';
COMMENT ON COLUMN contacts.category IS 'Категория отправителя (student, parent, colleague, other)';
COMMENT ON COLUMN contacts.message IS 'Текст сообщения';
COMMENT ON COLUMN contacts."createdAt" IS 'Дата и время отправки';
