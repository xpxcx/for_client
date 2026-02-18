-- Создание таблицы новостей
-- Выполнить в БД portfolio

CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  text TEXT NOT NULL,
  date DATE NOT NULL,
  "achievementId" INTEGER NULL
);

-- Комментарии к таблице и столбцам
COMMENT ON TABLE news IS 'Новости сайта';
COMMENT ON COLUMN news.id IS 'Уникальный идентификатор';
COMMENT ON COLUMN news.title IS 'Заголовок новости';
COMMENT ON COLUMN news.text IS 'Текст новости';
COMMENT ON COLUMN news.date IS 'Дата новости';
COMMENT ON COLUMN news."achievementId" IS 'ID связанного достижения (если новость создана из достижения)';
