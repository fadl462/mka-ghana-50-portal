-- Switch reviewer sign-in from email OTP to administrator-issued passwords.
-- The password is stored only as a PBKDF2-SHA256 hash (150,000 iterations), never in plaintext.
UPDATE admin_users
SET password_hash='73c2ff5ad491d599985d537f9bbfcfcb:59e6c1179ec7972d25d6f2b1bc3196d6256af52257bc96a7b09e5c9b21ac26c3',
    display_name='Fadl Rahman Essel',
    role='judge',
    active=1
WHERE lower(email)='fadl_rahman3@yahoo.com';

INSERT OR IGNORE INTO admin_users(id,email,display_name,password_hash,role,active)
VALUES('reviewer-fadl-rahman3','fadl_rahman3@yahoo.com','Fadl Rahman Essel','73c2ff5ad491d599985d537f9bbfcfcb:59e6c1179ec7972d25d6f2b1bc3196d6256af52257bc96a7b09e5c9b21ac26c3','judge',1);

INSERT INTO reviewer_allowlist(email,display_name,active)
VALUES('fadl_rahman3@yahoo.com','Fadl Rahman Essel',1)
ON CONFLICT(email) DO UPDATE SET display_name=excluded.display_name,active=1;
