-- Contestant-facing feedback is stored separately from confidential evaluation comments.
CREATE TABLE IF NOT EXISTS reviewer_feedback (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  judge_id TEXT NOT NULL REFERENCES admin_users(id),
  message TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','published')),
  notification_status TEXT NOT NULL DEFAULT 'not_sent' CHECK (notification_status IN ('not_sent','not_configured','sent','failed')),
  email_sent_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(submission_id, judge_id)
);
CREATE INDEX IF NOT EXISTS idx_reviewer_feedback_submission_visibility
  ON reviewer_feedback(submission_id, visibility, created_at);
