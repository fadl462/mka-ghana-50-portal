-- Reviewer login repair: create the allowlist and reset the initial
-- reviewer password hash using the portal's PBKDF2-SHA256/150000 format.
-- Safe to execute more than once.
CREATE TABLE IF NOT EXISTS reviewer_allowlist (
  email TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

UPDATE admin_users
SET password_hash='4a31b4294ba17e2e47665dff9be6008d:88e80f169e0704db0b4ae37663d668d5c104742af6ae3effc79c75f01ab832e1',
    display_name='Fadl Rahman Essel',
    role='judge',
    active=1
WHERE lower(email)='fadl_rahman3@yahoo.com';

INSERT OR IGNORE INTO admin_users
  (id,email,display_name,password_hash,role,active)
VALUES
  ('reviewer-fadl-rahman3','fadl_rahman3@yahoo.com','Fadl Rahman Essel',
   '4a31b4294ba17e2e47665dff9be6008d:88e80f169e0704db0b4ae37663d668d5c104742af6ae3effc79c75f01ab832e1','judge',1);

INSERT INTO reviewer_allowlist (email, display_name, active)
VALUES ('fadl_rahman3@yahoo.com','Fadl Rahman Essel',1)
ON CONFLICT(email) DO UPDATE SET
  display_name=excluded.display_name,
  active=1;
