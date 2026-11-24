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

## Stage 3 public presentation refinements
- Added a live public-entry preview and entry count to the homepage, populated from the existing public gallery API.
- Added an accessible artwork detail dialog in the community gallery so visitors can inspect artwork and read the full concept rationale.
- Improved gallery artwork controls for keyboard focus and added responsive layouts for the homepage preview and artwork viewer.
- No database migration is required for Stage 3.

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


## Stage 4 — Administration workflow
The Command Centre now includes searchable/filterable submissions, visual judge assignment and removal, assignment validation (including withdrawn-entry protection), and a recent activity log. New API routes: `GET /api/admin/assignments`, `DELETE /api/admin/assignments/:id`, and `GET /api/admin/audit`. No database migration is required; these features use the existing `judge_assignments` and `audit_logs` tables.


## Stage 5 — Judges' workspace
- Reworked the judges' page into a focused evaluation dashboard with assigned, completed and outstanding counts.
- Displays each assigned anonymous artwork and its concept rationale in the review card.
- Shows the current scoring weights (25/25/20/15/15) beside the assessment form.
- Loads the judge's previously submitted scores and comments, allowing the judge to review and update their own evaluation.
- Shows weighted score and submission state after a successful save.
- The Worker returns the signed-in judge's existing evaluation with each assigned entry. Withdrawn entries remain excluded by the existing Worker checks.
- No database migration is required. The existing evaluation table and weighted scoring calculation are reused.
- Important: evaluations are saved on submission; this release does not implement draft autosave or a separate draft state. Confirm the scoring rubric with the competition committee before opening judging.


## Stage 6 — Final results and reporting
- Adds migration `0004_official_results.sql`, which stores an official decision separately from the calculated judging status and average score.
- Admin rankings show judge count, average score and lowest/highest submitted scores. Withdrawn entries are excluded.
- Competition rank is calculated from average scores; exact ties share a rank and the next rank is skipped. Entries without an evaluation are unranked.
- Super administrators and competition administrators can record an official decision (pending, winner, runner-up, finalist or not selected). Every decision is written to the audit log.
- Official results can be exported as a CSV containing the score summary and decision. The export endpoint is authenticated and private/no-store.
- This feature does not publish winners publicly. The committee must approve decisions and separately decide when/how results are announced.
- Apply pending migrations with `npm run db:remote` before deploying. Back up the D1 database first.


## Corrective deployment — homepage source and cache
- The Worker now explicitly serves `public/index.html` for `/` and `/index.html` instead of relying on the asset fallback route.
- HTML routes (`/`, `/admin`, `/judges`, `/entries`, `/information`, `/track`) receive `Cache-Control: no-store, no-cache, must-revalidate` to prevent an old homepage document being retained by browser/CDN caches.
- The homepage source is the current submission-first design with the updated navigation and community gallery preview.
- Deploy from the extracted `mka-ghana-50-portal-main` directory, where `wrangler.toml` and `package.json` are located. Do not deploy from the parent folder or an older project copy.


## Visual refresh and public URL
- Updated the site-wide visual palette to a cool blue/sky-blue theme with soft gradients, luminous accents, airy panels and restrained motion. Reduced-motion preferences are respected.
- Rewrote the Competition Information page to reduce long paragraphs and make the brief, eligibility, process and FAQs easier to scan. The `#brief` anchor remains available.
- The current `workers.dev` hostname includes the Cloudflare account subdomain. This cannot be removed by editing the site's HTML or Worker name. For a branded public URL without the personal account subdomain, attach a custom domain/subdomain that the organisation owns (for example, a suitable subdomain of its official domain) under Workers & Pages → select the Worker → Settings → Domains & Routes → Add → Custom Domain. Cloudflare provisions DNS and TLS when eligible. Do not disable the existing workers.dev hostname until the custom domain is verified.
- Changing the account-level workers.dev subdomain is possible in Cloudflare's Workers & Pages settings, but it changes the account subdomain used by Workers across the account, not just this portal. Prefer an organisation-owned custom domain for the competition.
