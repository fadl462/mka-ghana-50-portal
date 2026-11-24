MKA GHANA @ 50 — MODERN PORTAL REDESIGN

This ZIP contains the redesigned public-facing files only:
  public/index.html       New homepage with the submission form as the primary experience
  public/information.html Dedicated competition information page
  public/track.html       Dedicated entry tracking page
  public/styles.css       New responsive emerald / jubilee gold / ivory visual system
  public/app.js           Multi-step entry workflow, validation, file upload preview and confirmation
  public/info.js          Loads the approved brief from the existing public settings API
  public/track.js         Dedicated status lookup experience

IMPORTANT INTEGRATION NOTE
The existing Worker currently serves /admin and /judges as page aliases, but not /information or /track. Add these two routes in src/worker.js immediately before its final `return env.ASSETS.fetch(req)` line:

  if (u.pathname === '/information') return env.ASSETS.fetch(new Request(new URL('/information.html', req.url)));
  if (u.pathname === '/track') return env.ASSETS.fetch(new Request(new URL('/track.html', req.url)));

No database migration is required. The existing submission, tracking, settings, R2 upload, admin and judge APIs are retained. Keep the existing public/mka-logo.png file in the repository; it is intentionally not duplicated in this patch ZIP.

Deploy only after checking the final approved competition rules, consent wording and privacy notice. The existing API currently stores participant details and artwork, so ensure the committee approves its privacy and retention approach before opening submissions.
Git integration test – MKA Ghana @ 50.
