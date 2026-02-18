-- Контакты педагога (телефон и email), отдельно от таблицы обращений
CREATE TABLE IF NOT EXISTS educator_contacts (
  id SERIAL PRIMARY KEY,
  phone VARCHAR(100),
  email VARCHAR(255)
);

-- Социальные сети (название соцсети и ссылка)
CREATE TABLE IF NOT EXISTS social_networks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  url VARCHAR(500) NOT NULL
);
