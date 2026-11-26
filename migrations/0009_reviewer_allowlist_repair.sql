-- Repair reviewer allowlist for production databases where migration 0007
-- was not fully applied. Safe to execute more than once.
CREATE TABLE IF NOT EXISTS reviewer_allowlist (
  email TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Authorise the already-created reviewer account.
INSERT INTO reviewer_allowlist (email, display_name, active)
VALUES ('fadl_rahman3@yahoo.com', 'Fadl Rahman Essel', 1)
ON CONFLICT(email) DO UPDATE SET
  display_name = excluded.display_name,
  active = 1;
