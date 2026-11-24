PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS submission_likes (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  voter_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(submission_id, voter_hash)
);
CREATE INDEX IF NOT EXISTS idx_submission_likes_submission_id ON submission_likes(submission_id);
INSERT OR IGNORE INTO competition_settings(key,value) VALUES('max_upload_mb','12');
DELETE FROM competition_settings WHERE key='max_entries_per_participant';
