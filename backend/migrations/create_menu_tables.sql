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
