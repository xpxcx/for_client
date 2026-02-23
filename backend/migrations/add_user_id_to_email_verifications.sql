ALTER TABLE email_verifications ADD COLUMN IF NOT EXISTS "userId" INTEGER NULL;
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id_type ON email_verifications ("userId", type);
