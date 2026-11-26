-- Reviewer email OTP authentication. No public registration is provided.
CREATE TABLE IF NOT EXISTS reviewer_allowlist (
  email TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS reviewer_login_otps (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  consumed_at INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_reviewer_login_otps_email ON reviewer_login_otps(email, created_at);

-- Initial authorised reviewer. The password hash is a random, unusable placeholder;
-- reviewer access is exclusively through email OTP.
INSERT OR IGNORE INTO admin_users(id,email,display_name,password_hash,role,active)
VALUES('reviewer-fadl-rahman3','fadl_rahman3@yahoo.com','Fadl Rahman Essel','060c31a6f6fdb0f5dff5dcfb0719816d:55742634dda2722d094d6f3fce081ed676a634615a630de0b0fc45a6113e3654','judge',1);
INSERT OR IGNORE INTO reviewer_allowlist(email,display_name,active)
VALUES('fadl_rahman3@yahoo.com','Fadl Rahman Essel',1);
