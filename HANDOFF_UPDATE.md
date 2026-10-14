# Handoff update: course enrollment phase

Branch: `feature/course-enrollment`. Read this after `HANDOFF.md`. Where the two disagree, this file is newer.

## What was done

The one blocker in the original handoff (students had no way to join a course) is closed. It was built as a hybrid of the two options in the brief:

- **Catalog.** `catalog_courses` is the school's official course list, seeded with the first-semester 100-level courses for Software Engineering, Computer Science and Cyber Security. Admin-owned.
- **Departments.** Students pick a department once at registration. After that only an admin can change it (enforced by a database trigger, not the UI).
- **Offerings.** A lecturer's "Create Course" now opens a catalog picker. The database overwrites `name` and `code` from the catalog. `courses` is now "a lecturer's offering of a catalog course".
- **Joining.** Students search courses offered to their own department (typo-tolerant, `pg_trgm`) and join through the `join_course()` function. Direct inserts into `enrollments` by students are no longer allowed.
- **Admin role.** Set by hand: `update public.profiles set role = 'admin' where id = '<uid>';`. There is no admin screen yet.

Other fixes made along the way. The original handoff said these worked; they did not:

- `js/lib/client.js` had a stray `import` line that broke every page. Removed.
- Login and registration (`index.html`, `js/auth/auth.js`) were still mock code. Now wired to Supabase through `Store`.
- `sql/policies.sql` had a policy loop (courses and enrollments checked each other) that made the courses page fail with "infinite recursion". Fixed in `001`.
- The signup trigger did not copy `student_id` and trusted `role` from the browser. Fixed in `001`.
- Students could edit their own `role` through the API. Locked in `001` and `003`.
- The session page crashed after creating a session (it cleared the page before reading its own template). Fixed in `js/lecturer/session.js`.
- The QR library URL (`qrcode@1.5.3`) returned 404. Now `qrcode@1.4.4`.
- Live attendance needed `attendance_records` added to the realtime publication (`002`).

## Setup order

1. Create a Supabase project. In the SQL editor run, in this order: `schema.sql`, `policies.sql`, `functions.sql`, `001_fix_policies_and_signup.sql`, `002_realtime.sql`, `003_departments_and_catalog.sql`.
2. Put your project URL and **anon** key in `js/lib/client.js`. Never use the service_role key. Do not commit real keys.
3. For development, turn off Authentication > Providers > Email > Confirm email. Turn it back on before real use.
4. Serve with Live Server or `python3 -m http.server`. The scanner needs `localhost` or HTTPS for camera access.
5. Students who registered before `003` have no department. Set it by hand.

## Tested and working on this branch

Registration and login for both roles, course creation from the catalog, department-scoped search and join (including typos), lecturer roster, QR session creation, scanning, the live feed, duplicate-scan rejection, expiry rejection, rejection of non-enrolled students, and percentage dropping when a session is missed.

From the browser console as a student: updating `role` and `department_id` on one's own profile and inserting into `enrollments` were all rejected (two 400s and a 403). The exact error messages of the two 400s were not read, so they are believed, not confirmed, to be the trigger's messages.

## Known issues, most important first

1. **The QR token is not enforced. Do not call this fraud-proof.** Enrolled students can read `sessions.qr_token`, and the attendance insert policy checks session, enrollment and expiry but never the token. A student can mark attendance for an active session without being in the room. Fix: a `mark_attendance(token)` database function, hide `qr_token` from students, and call it from `Store.markAttendance`.
2. **Anyone can register as a lecturer.** A fake lecturer can create offerings that appear in students' join lists. Needs admin approval (and probably a staff ID).
3. **A course with no sessions shows 100% and eligible.** Wrong default for an eligibility system (`attendancePct` in `store.js`).
4. **Unescaped HTML.** Escaping was added only in `lecturer/dashboard.js` and `student/courses.js`. `shell.js`, `lecturer/course.js` and `lecturer/session.js` still put names into `innerHTML`.
5. **Late joiners** are measured against all earlier sessions. `enrollments.created_at` is the join time and can be used.
6. **Official eligibility** should come from `attendance_percentage()` / `is_eligible()` via RPC, not the browser's calculation.
7. **Cascade deletes** (added in `001`) wipe courses and attendance when a user is deleted. Dev shortcut; replace with soft-delete.
8. **No admin screen.** The catalog and department links are managed in the Supabase Table Editor.
9. **Not built:** course edit (pencil icon), session "View" button, and a remove-student button. The permission (`enrollments_delete_lecturer`) and `Store.removeStudent()` exist; the button does not.
10. **Housekeeping.** The Supabase script tags float on `@2`; pin an exact version. The README and the header comment in `client.js` still describe the old mock setup.