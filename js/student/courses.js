// Student — My Courses

(async function () {
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: 'pages/student/dashboard.html' },
    { key: 'courses', label: 'My Courses', icon: 'book', href: 'pages/student/courses.html' },
    { key: 'scan', label: 'Scan', icon: 'scan', href: 'pages/student/scan.html' },
    { key: 'profile', label: 'Profile', icon: 'user', href: 'pages/student/profile.html' },
  ];

  const user = await Shell.render({ role: 'student', active: 'courses', navItems });
  if (!user) return;

  const main = document.getElementById('main-content');
  main.innerHTML = document.getElementById('tpl-courses').innerHTML;

  let courses;
  try {
    courses = await Store.studentCourses();
  } catch (err) {
    renderError(main, err);
    return;
  }

  const grid = document.getElementById('course-grid');

  if (courses.length === 0) {
    grid.innerHTML = '<div class="empty-state">You are not enrolled in any courses yet.</div>';
    return;
  }

  grid.innerHTML = courses.map((course) => {
    const pct = attendancePct(course.attendedSessions, course.totalSessions);
    const eligible = isEligible(pct, course.eligibilityThreshold);
    const badgeCls = eligible ? 'badge-default' : 'badge-destructive';
    const badgeIcon = eligible ? Icons.checkCircle('icon') : Icons.xCircle('icon');
    const badgeLabel = eligible ? 'Eligible' : 'Not Eligible';

    return `
      <div class="card">
        <div class="card-header">
          <div class="course-card-title">
            <span class="name truncate">${course.name}</span>
            <span class="badge ${badgeCls}">${badgeIcon}${badgeLabel}</span>
          </div>
          <p class="card-description">${course.code} &middot; ${course.lecturer}</p>
        </div>
        <div class="card-content">
          <div class="flex justify-between" style="font-size:0.875rem;margin-bottom:0.4rem;">
            <span class="text-muted">Attendance</span>
            <span style="font-weight:700;">${pct}%</span>
          </div>
          <div class="progress"><div class="progress-indicator" style="width:${pct}%"></div></div>
          <p class="text-muted" style="font-size:0.75rem;margin:0.4rem 0 0;">${course.attendedSessions} of ${course.totalSessions} sessions attended</p>

          <div class="marks-box">
            <span class="label">Marks earned</span>
            <span class="val">${course.marks}<span class="of"> / ${course.maxMarks}</span></span>
          </div>
        </div>
      </div>
    `;
  }).join('');
})();
