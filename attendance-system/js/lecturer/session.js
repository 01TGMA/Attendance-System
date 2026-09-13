// Lecturer — Create Session + Live QR View
// TODO(supabase):
//   - On form submit: insert into `sessions` (course_id, mark_value, expires_at = now()+duration).
//     Use the returned row's qr_token (uuid) as the QR code payload instead of the
//     mock `attendpro://CODE/duration/mark` string below.
//   - Live arrivals: subscribe to realtime inserts on `attendance_records`
//     filtered by session_id, e.g.
//       supabase.channel('session-'+sessionId)
//         .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance_records', filter: `session_id=eq.${sessionId}` }, handleArrival)
//         .subscribe()
//     replacing the setInterval-based fake arrivals simulation below.
//   - "End Session": update sessions.expires_at = now() so it can no longer accept scans.

(function () {
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: 'pages/lecturer/dashboard.html' },
    { key: 'profile', label: 'Profile', icon: 'user', href: 'pages/lecturer/profile.html' },
  ];

  const user = Shell.render({ role: 'lecturer', active: 'dashboard', navItems });
  if (!user) return;

  const params = new URLSearchParams(window.location.search);
  const courseId = params.get('courseId');
  const course = Store.lecturerCourseById(courseId) || Store.lecturerCourses()[0];

  const main = document.getElementById('main-content');
  main.innerHTML = document.getElementById('tpl-session-form').innerHTML;

  document.getElementById('back-btn').innerHTML = `${Icons.arrowLeft('icon')} Back to course`;
  document.getElementById('back-btn').addEventListener('click', () => {
    window.location.href = `${window.BASE_PATH}pages/lecturer/course.html?courseId=${course.id}`;
  });
  document.getElementById('course-subtitle').textContent = `${course.name} \u00b7 ${course.code}`;

  document.getElementById('session-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const mark = Number(document.getElementById('mark').value) || 1;
    const duration = Number(document.getElementById('duration').value) || 10;
    goLive(course, mark, duration);
  });

  function goLive(course, mark, duration) {
    // Replace the whole page body with the full-screen live view.
    document.body.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.innerHTML = document.getElementById('tpl-session-live').innerHTML;
    document.body.appendChild(wrap);

    document.getElementById('live-brand-icon').innerHTML = Icons.graduationCap('icon');
    document.getElementById('live-icon-users').innerHTML = Icons.users('icon');
    document.getElementById('icon-timer').innerHTML = Icons.timer('icon');
    document.getElementById('icon-award').innerHTML = Icons.award('icon');
    document.getElementById('live-course-name').textContent = course.name;
    document.getElementById('live-course-code').textContent = `${course.code} \u00b7 Scan to mark attendance`;
    document.getElementById('mark-value-display').textContent = `+${mark}`;

    // Mock session token — real version uses the sessions.qr_token from Supabase.
    const sessionValue = `attendpro://${course.code}/${duration}/${mark}`;
    const canvasHolder = document.getElementById('qr-canvas-holder');
    const canvas = document.createElement('canvas');
    canvasHolder.appendChild(canvas);
    QRCode.toCanvas(canvas, sessionValue, { width: 260, margin: 1, color: { dark: '#1c2333', light: '#ffffff' } });

    let remaining = duration * 60;
    const countdownEl = document.getElementById('countdown');
    const qrInner = document.getElementById('qr-frame-inner');
    const qrExpired = document.getElementById('qr-expired');

    function formatMMSS(total) {
      const m = Math.floor(total / 60);
      const s = total % 60;
      return `${m}:${String(s).padStart(2, '0')}`;
    }
    countdownEl.textContent = formatMMSS(remaining);

    const tick = setInterval(() => {
      remaining = Math.max(0, remaining - 1);
      countdownEl.textContent = formatMMSS(remaining);
      if (remaining === 0) {
        clearInterval(tick);
        canvasHolder.style.display = 'none';
        qrExpired.style.display = 'flex';
        qrExpired.innerHTML = `${Icons.clock('icon icon-lg')}<p style="font-weight:600;margin:0.4rem 0 0;">Session expired</p><p class="text-muted" style="margin:0;font-size:0.875rem;">QR code is no longer valid</p>`;
      }
    }, 1000);

    // Simulated live arrivals (stand-in for the Supabase realtime subscription).
    const arrivalsList = document.getElementById('arrivals-list');
    const checkinCount = document.getElementById('checkin-count');
    const roster = [...course.roster];
    let arrivals = [];
    checkinCount.textContent = `0/${course.studentCount} checked in`;

    const addArrival = setInterval(() => {
      if (arrivals.length >= roster.length || remaining === 0) { clearInterval(addArrival); return; }
      const next = roster[arrivals.length];
      const at = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' });
      arrivals = [{ ...next, at }, ...arrivals];
      checkinCount.textContent = `${arrivals.length}/${course.studentCount} checked in`;

      arrivalsList.innerHTML = arrivals.map((a) => `
        <li class="arrival-row animate-fade-slide-in">
          <span class="avatar avatar-sm">${initials(a.name)}</span>
          <div class="grow">
            <span class="name truncate">${a.name}</span>
            <span class="id">${a.studentId}</span>
          </div>
          <span class="time">${a.at}</span>
          ${Icons.checkCircle('icon check')}
        </li>
      `).join('');
    }, 2200);

    document.getElementById('end-session-btn').addEventListener('click', () => {
      clearInterval(tick);
      clearInterval(addArrival);
      window.location.href = `${window.BASE_PATH}pages/lecturer/course.html?courseId=${course.id}`;
    });
  }
})();
