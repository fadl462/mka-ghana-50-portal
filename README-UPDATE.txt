MKA GHANA @ 50 PORTAL — IMPLEMENTATION UPDATE

This update adds the public community gallery, one-like-per-browser duplicate prevention, contestant self-withdrawal, and the agreed submission rules.

RULES IMPLEMENTED
- Contestants may submit multiple independent entries; the old two-entry cap is no longer enforced.
- Each submission accepts exactly one image file: PNG, JPEG/JPG, or WebP. PDF and SVG are rejected.
- Server checks the file signature as well as the declared MIME type.
- Every entry has its own reference number.
- Entries are publicly visible in the Community Gallery unless withdrawn.
- Community likes are appreciation only. The official judging workflow remains separate and determines competition results.
- A visitor can like an entry once per browser visitor identifier. This is a lightweight duplicate deterrent, not strong identity verification; clearing browser storage or using another browser/device can create a new visitor identifier.
- Contestants may withdraw their own entries using a signed owner token issued at submission and retained in that browser's local storage. The reference number and email alone cannot withdraw an entry.
- Withdrawal is a soft status change. The entry disappears from the public gallery and public image route, cannot receive new likes, and remains in admin records/audit logs.

DEPLOYMENT
1. Review the source and test locally.
2. Apply the new D1 migration:
   npm run db:remote
3. Deploy:
   npm run deploy

New public page: /entries
New APIs:
- GET /api/public/entries
- GET /api/public/entry-file/:id
- POST /api/public/entries/:id/like
- POST /api/submission/withdraw (requires the owner bearer token)

IMPORTANT SECURITY NOTES
- Configure a strong, random SESSION_SECRET in Cloudflare Worker secrets. The same secret signs admin sessions and contestant withdrawal tokens. Changing it invalidates existing sessions and owner tokens.
- Owner tokens are stored in the browser that submitted the entry. Clearing browser data or changing devices removes access to self-withdrawal for that entry. Provide a verified email recovery flow before public launch if contestants need recovery across devices.
- Like uniqueness is browser-based and is not a reliable measure of unique people. Do not use likes to rank or select winners.
- Before public launch, add rate limiting, abuse monitoring, secure email recovery, backups/restore testing, stronger origin restrictions, and an independent security review.
