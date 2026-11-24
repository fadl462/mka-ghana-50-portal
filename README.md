# MKA Ghana @ 50 – Creative Competition Portal

Cloudflare Workers + D1 + R2 implementation starter for the MKA Ghana @ 50 logo design competition.

## Included
- Neutral public landing page using the supplied MKA Ghana logo
- Configurable competition theme, creative brief and submission opening switch
- Participant entry form, Atfal guardian fields and consent checkbox
- PNG/JPG/PDF/SVG upload to private R2 storage
- Unique entry reference and participant status tracking
- Admin sign-in, dashboard, submission preview, status management and CSV export
- Competition settings management
- Judge account creation, assigned-entry workspace, weighted evaluations and rankings
- D1 migration and audit log table

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
The Worker serves the public portal at `/`, admin at `/admin`, and judges' workspace at `/judges`.

## 5. Open submissions
Sign in at `/admin`, open Competition settings, set `submission_open` to `true`, update the theme and brief only after approval, then save. The portal is closed by default.

## Judge workflow
Create judges under the Judges tab. Assign a submission to a judge using the authenticated endpoint `POST /api/admin/assignments` with JSON `{ "submissionId": "...", "judgeId": "..." }`. The judge then signs in at `/judges` and evaluates assigned entries. Assignment UI and expanded judge administration are recommended next enhancements.

## API
- `GET /api/health`, `GET /api/public/settings`
- `POST /api/submit` (multipart form), `POST /api/track`
- `POST /api/admin/login`, `GET /api/admin/me`, `GET /api/admin/overview`
- `GET /api/admin/submissions`, `GET /api/admin/file/:id`, `PATCH /api/admin/submissions/:id/status`
- `GET/PATCH /api/admin/settings`, `GET/POST /api/admin/judges`
- `POST /api/admin/assignments`, `GET /api/admin/rankings`, `GET /api/admin/export.csv`
- `GET /api/judge/entries`, `GET /api/judge/file/:id`, `POST /api/judge/evaluate`

## Important implementation notes
- Proposed scoring weights are 25/25/20/15/15. Confirm these before the competition opens.
- Admin and judge sessions expire after 8 hours.
- Artwork is kept in a private R2 bucket and served only through authenticated API routes.
- The first version has a basic assignment API; a visual assignment screen is a planned improvement.
- Add rate limiting, upload malware scanning, email notifications, formal password reset, backup/restore testing, stronger origin restrictions and an independent security review before public launch.
