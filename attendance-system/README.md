# Smart Attendance Management & Examination Eligibility System

Stack: HTML / CSS / vanilla JS + Supabase (Auth, Postgres, Realtime)
Design: converted from the v0-generated React/Tailwind UI (green `#16A34A` + white theme).

## ✅ Current state — Phase 1 UI is built and running on mock data

All 8 screens are implemented as static pages driven by `js/lib/store.js`
(mock data + localStorage-based fake auth). Nothing touches a network yet —
open `index.html` in a local server and click through the whole app.

**Try it:**
```bash
cd attendance-system
python3 -m http.server 8080
# visit http://localhost:8080
```
Log in as either role (any email/password works — it's mocked). Student flow:
Dashboard → My Courses → Scan (real camera QR reader) → Profile.
Lecturer flow: Dashboard → Manage a course → Sessions/Roster tabs → Create
Session → live QR code with countdown + simulated live check-ins.

## Folder Structure

```
attendance-system/
├── index.html                  # Login / Register (role tabs: student/lecturer)
├── pages/
│   ├── student/
│   │   ├── dashboard.html      # Attendance %, marks, eligibility status
│   │   ├── courses.html        # Per-course attendance + marks cards
│   │   ├── scan.html           # Real camera QR scanner (html5-qrcode)
│   │   └── profile.html
│   └── lecturer/
│       ├── dashboard.html      # Course grid + "Create Course"
│       ├── course.html         # Sessions tab + Roster tab (?courseId=...)
│       ├── session.html        # Create session form → live QR + countdown + arrivals feed
│       └── profile.html
├── css/
│   ├── style.css               # Design tokens + base components (buttons, cards, badges, inputs, tabs, avatar, progress)
│   └── dashboard.css           # App shell, auth layout, scan page, session live view, all page-specific layout
├── js/
│   ├── lib/
│   │   ├── icons.js            # Inline SVG icon set (no external icon font/CDN needed)
│   │   ├── store.js            # Mock data + auth session (the seam that becomes Supabase calls)
│   │   ├── shell.js            # Renders header + sidebar/bottom nav on every dashboard page
│   │   └── client.js           # Supabase client init — NOT wired in yet, needs your project URL/key
│   ├── auth/auth.js             # Login/register form logic, role tabs
│   ├── student/{dashboard,courses,scan,profile}.js
│   └── lecturer/{dashboard,course,session,profile}.js
├── sql/
│   ├── schema.sql               # Tables: profiles, courses, enrollments, sessions, attendance_records
│   ├── policies.sql             # RLS: enrollment check, session expiry, ownership — Phase 2
│   └── functions.sql            # attendance_percentage() / is_eligible() — Phase 3
└── .env.example
```

## Every `TODO(supabase)` marks a seam

Search the JS files for `TODO(supabase)` — each one is a comment at the exact
call site explaining what mock logic to rip out and what real Supabase query
replaces it. That's the map for the next phase.

## Wiring Supabase in — next steps in order

1. Create a Supabase project → run `sql/schema.sql` in the SQL editor.
2. Fill in `js/lib/client.js` with your project URL + anon key.
3. Add `<script type="module" src=".../js/lib/client.js">` where needed, or
   convert it to a plain (non-module) script that sets `window.supabase`.
4. Replace `Store.login/logout/getUser` in `store.js` with
   `supabase.auth.signInWithPassword / signUp / signOut / getSession`.
5. Replace `Store.studentCourses()` / `Store.lecturerCourses()` with real
   `.from(table).select()` queries (see the TODO comment at each call site).
6. Run `sql/policies.sql` — this is what actually enforces "no duplicate
   scans / no expired sessions / no unenrolled students", not the client JS.
7. Swap the simulated live-arrivals `setInterval` in `session.js` for a
   Supabase Realtime subscription on `attendance_records` inserts.
8. Run `sql/functions.sql` and use `attendance_percentage()` / `is_eligible()`
   instead of the client-side `attendancePct()` / `isEligible()` helpers for
   anything that must be tamper-proof (the eligibility badge shown to a
   student should ultimately be server-computed, not just client math).

## Notes
- No backend server needed — Supabase Postgres + RLS is the "backend."
- Never trust client-side JS for expiry/duplicate checks — enforce via RLS/SQL functions.
- QR generation: `qrcode` library via CDN (`js/lecturer/session.js`).
- QR scanning: `html5-qrcode` via CDN (`js/student/scan.js`) — real camera access, requires HTTPS or localhost.
