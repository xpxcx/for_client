-- Таблицы раздела «О себе»
CREATE TABLE IF NOT EXISTS about_profile (
  id SERIAL PRIMARY KEY,
  page_title VARCHAR(500) NOT NULL DEFAULT 'Раздел о себе',
  full_name VARCHAR(500) NULL,
  birth_date VARCHAR(100) NULL,
  image_url VARCHAR(500) NULL
);

CREATE TABLE IF NOT EXISTS about_education (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER NOT NULL DEFAULT 0,
  institution VARCHAR(500) NOT NULL,
  document VARCHAR(500) NOT NULL,
  qualification VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS about_experience (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER NOT NULL DEFAULT 0,
  place_of_work VARCHAR(500) NOT NULL,
  position VARCHAR(500) NOT NULL,
  period VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS about_body (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER NOT NULL DEFAULT 0,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL
);

-- Таблицы меню и пунктов контента разделов
CREATE TABLE IF NOT EXISTS menu_section (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  path VARCHAR(255) NOT NULL,
  description VARCHAR(500) NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS section_item (
  id VARCHAR(100) PRIMARY KEY,
  section_id VARCHAR(100) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description VARCHAR(1000) NULL,
  link VARCHAR(1000) NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_section_item_section_id ON section_item (section_id);
