// Lecturer — Course View (Sessions / Roster tabs)
// TODO(supabase): fetch this course's sessions via
//   supabase.from('sessions').select('*, attendance_records(count)').eq('course_id', courseId)
// and the roster via
//   supabase.from('enrollments').select('student:profiles(*)').eq('course_id', courseId)
//   then compute each student's attendance_records count / total sessions.

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
  main.innerHTML = document.getElementById('tpl-course-view').innerHTML;

  document.getElementById('back-btn').innerHTML = `${Icons.arrowLeft('icon')} All courses`;
  document.getElementById('back-btn').addEventListener('click', () => {
    window.location.href = window.BASE_PATH + 'pages/lecturer/dashboard.html';
  });

  document.getElementById('course-title').innerHTML = `${course.name} <button class="btn btn-ghost btn-icon" aria-label="Edit course">${Icons.pencil('icon')}</button>`;
  document.getElementById('course-code-badge').textContent = course.code;
  document.getElementById('course-student-count').innerHTML = `${Icons.users('icon')} ${course.studentCount} students`;

  document.getElementById('create-session-btn').innerHTML = `${Icons.plus('icon')} Create Session`;
  document.getElementById('create-session-btn').addEventListener('click', () => {
    window.location.href = `${window.BASE_PATH}pages/lecturer/session.html?courseId=${course.id}`;
  });

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  document.getElementById('sessions-list').innerHTML = course.sessions.map((s) => {
    const pct = Math.round((s.attendanceCount / s.totalStudents) * 100);
    return `
      <div class="session-row">
        <span style="font-weight:600;">${formatDate(s.date)}</span>
        <span class="text-muted">+${s.mark} mark${s.mark > 1 ? 's' : ''}</span>
        <span class="tabular-nums">${s.attendanceCount}/${s.totalStudents} <span style="font-size:0.75rem;font-weight:600;color:${pct >= 75 ? 'var(--color-primary)' : 'var(--color-muted-foreground)'};">(${pct}%)</span></span>
        <span style="text-align:right;"><button class="btn btn-ghost btn-sm">${Icons.eye('icon')} View</button></span>
      </div>
    `;
  }).join('');

  document.getElementById('roster-list').innerHTML = course.roster.map((s) => {
    const eligible = isEligible(s.attendancePct);
    const badgeCls = eligible ? 'badge-default' : 'badge-destructive';
    const badgeIcon = eligible ? Icons.checkCircle('icon') : Icons.xCircle('icon');
    return `
      <li class="roster-row">
        <span class="avatar avatar-sm">${initials(s.name)}</span>
        <div class="grow">
          <span class="name truncate">${s.name}</span>
          <span class="id">${s.studentId}</span>
        </div>
        <div class="bar"><div class="progress"><div class="progress-indicator" style="width:${s.attendancePct}%"></div></div></div>
        <span class="pct">${s.attendancePct}%</span>
        <div class="status"><span class="badge ${badgeCls}">${badgeIcon}${eligible ? 'Eligible' : 'Not Eligible'}</span></div>
      </li>
    `;
  }).join('');

  // Tab switching
  const tabs = document.querySelectorAll('#course-tabs .section-tab');
  const panels = { sessions: document.getElementById('tab-sessions'), roster: document.getElementById('tab-roster') };
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      Object.entries(panels).forEach(([key, el]) => { el.style.display = key === tab.dataset.tab ? 'block' : 'none'; });
    });
  });
})();
