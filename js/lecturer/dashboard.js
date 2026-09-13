// Lecturer — Dashboard (course grid)
// TODO(supabase): replace Store.lecturerCourses() with
//   supabase.from('courses').select('*, sessions(*), enrollments(count)').eq('lecturer_id', user.id)
// "Create Course" TODO(supabase): open a form that inserts into `courses`.

(function () {
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: 'pages/lecturer/dashboard.html' },
    { key: 'profile', label: 'Profile', icon: 'user', href: 'pages/lecturer/profile.html' },
  ];

  const user = Shell.render({ role: 'lecturer', active: 'dashboard', navItems });
  if (!user) return;

  const main = document.getElementById('main-content');
  main.innerHTML = document.getElementById('tpl-lect-dashboard').innerHTML;

  document.getElementById('create-course-btn').innerHTML = `${Icons.plus('icon')} Create Course`;
  document.getElementById('create-course-btn').addEventListener('click', () => {
    alert('Course creation form goes here once Supabase is wired in (insert into `courses`).');
  });

  const courses = Store.lecturerCourses();
  const grid = document.getElementById('lect-course-grid');

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
