CREATE TABLE IF NOT EXISTS email_verifications (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(10) NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  type VARCHAR(20) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_email_verifications_email_type ON email_verifications (email, type);
