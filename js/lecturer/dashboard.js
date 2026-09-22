// Lecturer — Dashboard (course grid)

(async function () {
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: 'pages/lecturer/dashboard.html' },
    { key: 'profile', label: 'Profile', icon: 'user', href: 'pages/lecturer/profile.html' },
  ];

  const user = await Shell.render({ role: 'lecturer', active: 'dashboard', navItems });
  if (!user) return;

  const main = document.getElementById('main-content');
  main.innerHTML = document.getElementById('tpl-lect-dashboard').innerHTML;

  document.getElementById('create-course-btn').innerHTML = `${Icons.plus('icon')} Create Course`;
  document.getElementById('create-course-btn').addEventListener('click', async () => {
    const name = prompt('Course name (e.g. Data Structures & Algorithms):');
    if (!name) return;
    const code = prompt('Course code (e.g. CS301):');
    if (!code) return;
    try {
      const { error } = await window.sb.from('courses').insert({
        lecturer_id: user.id, name, code,
      });
      if (error) throw error;
      window.location.reload();
    } catch (err) {
      alert('Could not create course: ' + err.message);
    }
  });

  const grid = document.getElementById('lect-course-grid');
  grid.innerHTML = '<div class="empty-state">Loading courses…</div>';

  let courses;
  try {
    courses = await Store.lecturerCourses();
  } catch (err) {
    renderError(grid, err);
    return;
  }

  if (courses.length === 0) {
    grid.innerHTML = '<div class="empty-state">You have not created any courses yet.</div>';
    return;
  }

  grid.innerHTML = courses.map((course) => `
    <div class="card">
      <div class="card-header">
        <span class="code-chip">${course.code}</span>
        <h3 class="card-title" style="font-size:1.05rem;">${course.name}</h3>
        <div class="course-card-desc">
          <span>${Icons.users('icon')} ${course.studentCount} students</span>
          <span>${Icons.calendar('icon')} ${course.sessions.length} sessions</span>
        </div>
      </div>
      <div class="card-content">
        <button class="btn btn-outline btn-block manage-btn" data-course="${course.id}">
          Manage ${Icons.arrowRight('icon')}
        </button>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.manage-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      window.location.href = `${window.BASE_PATH}pages/lecturer/course.html?courseId=${btn.dataset.course}`;
    });
  });
})();
