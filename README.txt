MKA Ghana @ 50 — Reviewer Login Repair

This package contains one idempotent SQL repair file:
migrations/0009_reviewer_allowlist_repair.sql

Why this is needed:
The current Worker reviewer login queries reviewer_allowlist, but the production
D1 database returned "no such table: reviewer_allowlist". The existing reviewer
account in admin_users is present and active; the allowlist table is missing.

Apply without PowerShell:
1. Open Cloudflare Dashboard > D1 > mka-ghana-50 > Console.
2. Open the SQL file in this ZIP and copy its complete contents.
3. Paste into the D1 Console and click Execute.
4. Confirm it reports successful execution.

Then use the reviewer workspace URL:
https://mka-ghana-50-portal.workers.dev/judges

Do not use /admin for reviewer sign-in. /admin is the competition Command Centre.

The SQL does not reset or expose the reviewer's password. It only creates the
missing allowlist table and activates the already-existing reviewer email.
