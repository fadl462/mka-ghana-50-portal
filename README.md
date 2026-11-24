# MKA Ghana @ 50 – Creative Competition Portal

Cloudflare Workers + D1 + R2 implementation starter for the MKA Ghana @ 50 logo design competition.

## Included
- Neutral public landing page using the supplied MKA Ghana logo
- Configurable competition theme, creative brief and submission opening switch
- Participant entry form, Atfal guardian fields and consent checkbox
- One PNG/JPG/WebP image per submission, stored in private R2 storage
- Unlimited independent submissions per participant (no per-participant cap)
- Public community gallery with search, pagination and appreciation likes
- Contestant self-withdrawal using a signed owner token held by the submitting browser
- Unique entry reference and participant status tracking
- Admin sign-in, dashboard, submission preview, status management and CSV export
- Competition settings management
- Judge account creation, assigned-entry workspace, weighted evaluations and rankings
- D1 migrations, audit log and privacy-preserving request rate-limit counters



## Submission and community rules implemented
- Contestants may submit multiple independent entries; there is no per-participant cap.
- Each submission accepts exactly one image file: PNG, JPEG/JPG, or WebP. PDF and SVG files are rejected.
- The server checks the file signature as well as the declared MIME type.
- Every entry receives its own unique reference number.
- Entries are publicly visible in the Community Gallery unless withdrawn.
- Community likes are for appreciation only. Official judging remains separate and determines competition results.
- A visitor can like an entry once per browser visitor identifier. This is a lightweight duplicate deterrent, not strong identity verification; clearing browser storage or using another browser/device can create a new identifier.
- Contestants may withdraw their own entries using a signed owner token issued at submission and retained in that browser's local storage. A reference number and email address alone cannot withdraw an entry.
- Withdrawal is a soft status change. The entry disappears from the public gallery and public image route, cannot receive new likes, and remains in admin records/audit logs.

## Deployment notes for the community features
1. Review the source and test locally.
2. Apply the D1 migration with `npm run db:remote` (this applies any pending migrations, including `0003_security_rate_limits.sql`).
3. Deploy with `npm run deploy`.

New public page: `/entries`.

New APIs:
- `GET /api/public/entries`
- `GET /api/public/entry-file/:id`
- `POST /api/public/entries/:id/like`
- `POST /api/submission/withdraw` (requires the owner bearer token)

## Stage 2 contestant experience refinements\n- Artwork selection now shows an image preview, filename and file size before submission.\n- Invalid file types and files above the configured limit are rejected immediately in the browser, with a clear message. Server-side validation remains authoritative.\n- Tracking results use clearer status labels and submission timestamps.\n- Withdrawal guidance explicitly explains that the original browser holds the private owner key; reference and email alone cannot authorise withdrawal.\n\n## Security hardening in migration 0003
- Adds per-IP, per-endpoint request throttling for administrator login, submissions, tracking, withdrawal and likes. IP addresses are keyed-hashed with `SESSION_SECRET`; raw IPs are not stored in the rate-limit table.
- Rejects oversized submission requests early when the request supplies a `Content-Length` header, before multipart parsing. The per-file size check remains in place.
- Like writes use `INSERT OR IGNORE`; duplicate likes are reported as already liked rather than being falsely acknowledged as a new like.
- Administrator login now fails clearly when `SESSION_SECRET` is not configured.

## Before production
This is a functional first implementation and requires configuration, testing and a security/privacy review before real participant data is collected. In particular, obtain committee approval for eligibility, privacy notice, parental consent, retention, IP transfer/licensing, judging and appeals rules. Review Ghana's applicable data protection requirements, especially for Atfal/minors. Confirm who is authorised to see participant details and original artwork.

## Requirements
Node.js 20+, Cloudflare account, Wrangler CLI, D1 and R2.

## 1. Create resources
```bash
npm install
npx wrangler login
npx wrangler d1 create mka-ghana-50
npx wrangler r2 bucket create mka-ghana-50-entries
```
Replace `REPLACE_WITH_D1_DATABASE_ID` in `wrangler.toml` with the database ID returned by Wrangler.

## 2. Set secrets
```bash
npx wrangler secret put SESSION_SECRET
npx wrangler secret put ADMIN_EMAIL
npx wrangler secret put ADMIN_PASSWORD
```
Use a unique random session secret (32+ characters) and a strong admin password. Never commit secrets. The first admin login bootstraps the super-admin record. Changing Worker secrets later does not automatically reset an existing database password.

## 3. Apply database migration
```bash
npm run db:remote
```
For local development use `npm run db:local`.

## 4. Run and deploy
```bash
npm run dev
npm run deploy
```
The Worker serves the public portal at `/`, community gallery at `/entries`, admin at `/admin`, and judges' workspace at `/judges`.

## 5. Open submissions
Sign in at `/admin`, open Competition settings, set `submission_open` to `true`, update the theme and brief only after approval, then save. The portal is closed by default.

## Judge workflow
Create judges under the Judges tab. Assign a submission to a judge using the authenticated endpoint `POST /api/admin/assignments` with JSON `{ "submissionId": "...", "judgeId": "..." }`. The judge then signs in at `/judges` and evaluates assigned entries. Assignment UI and expanded judge administration are recommended next enhancements.

## API
- `GET /api/health`, `GET /api/public/settings`, `GET /api/public/entries`
- `GET /api/public/entry-file/:id`, `POST /api/public/entries/:id/like`
- `POST /api/submission/withdraw` (signed owner token required)
- `POST /api/submit` (multipart form), `POST /api/track`
- `POST /api/admin/login`, `GET /api/admin/me`, `GET /api/admin/overview`
- `GET /api/admin/submissions`, `GET /api/admin/file/:id`, `PATCH /api/admin/submissions/:id/status`
- `GET/PATCH /api/admin/settings`, `GET/POST /api/admin/judges`
- `POST /api/admin/assignments`, `GET /api/admin/rankings`, `GET /api/admin/export.csv`
- `GET /api/judge/entries`, `GET /api/judge/file/:id`, `POST /api/judge/evaluate`

## Important implementation notes
- Proposed scoring weights are 25/25/20/15/15. Confirm these before the competition opens.
- Admin and judge sessions expire after 8 hours.
- Artwork is kept in a private R2 bucket. Public gallery artwork is served through a route that checks the submission is not withdrawn; admin and judge artwork routes remain authenticated.
- Contestant withdrawal tokens are retained in the original submitting browser. If browser storage is cleared or the contestant changes devices, the current build has no recovery mechanism. Add verified email-based recovery before launch.
- Likes use a browser identifier for duplicate deterrence; they do not prove unique human voters and must never determine competition winners.
- The first version has a basic assignment API; a visual assignment screen is a planned improvement.
- The current release includes basic request rate limiting. Still add email-based owner recovery, upload malware scanning, email notifications, formal password reset, backup/restore testing, stronger origin restrictions and an independent security review before public launch.
