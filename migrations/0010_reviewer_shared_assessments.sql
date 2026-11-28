-- Shared reviewer scorecards and reviewer-only overwrite history.
-- Existing evaluations remain intact.
ALTER TABLE evaluations ADD COLUMN overwrite_reason TEXT;

CREATE TABLE IF NOT EXISTS reviewer_assessment_revisions (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  judge_id TEXT NOT NULL REFERENCES admin_users(id),
  previous_total_score REAL NOT NULL,
  previous_comments TEXT,
  reason TEXT NOT NULL,
  revised_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_reviewer_revisions_submission
  ON reviewer_assessment_revisions(submission_id, revised_at DESC);
