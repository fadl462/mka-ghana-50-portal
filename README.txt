MKA Ghana @ 50 — Reviewer login fix and login-page usability update

Files changed:
- migrations/0009_reviewer_login_repair.sql
- public/admin.html
- public/admin.js
- public/judges.html
- public/judges.js
- public/styles.css

Root cause confirmed from the supplied source:
The reviewer login endpoint performs an INNER JOIN against reviewer_allowlist.
The production database previously returned "no such table: reviewer_allowlist".
Also, the password hash previously inserted for this reviewer had an invalid
salt length. The 0009 SQL migration repairs both conditions for the existing
reviewer account without storing the plaintext password.

Apply database repair:
1. Open Cloudflare Dashboard > D1 > mka-ghana-50 > Console.
2. Open migrations/0009_reviewer_login_repair.sql and copy all SQL.
3. Paste it into the D1 Console and click Execute.
4. Confirm successful execution.

Then upload/deploy the five files under public/ plus src/worker.js is NOT changed.
The migration SQL must be applied to D1; uploading frontend files alone will
not repair the database.

Correct login destinations:
- Reviewer workspace: https://mka-ghana-50-portal.workers.dev/judges
- Administrator command centre: https://mka-ghana-50-portal.workers.dev/admin

The /admin page now clearly links reviewers to /judges. Both login pages retain
the email address in the current browser session after refresh, but do not store
the password. The reviewer page shows clearer sign-in progress and errors.

Security:
The password is stored only as a PBKDF2-SHA256 hash (150,000 iterations).
Because the original password was shared in chat, change it after successful
testing and update its hash through a secure admin-managed process.
