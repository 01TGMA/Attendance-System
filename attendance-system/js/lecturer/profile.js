// Lecturer — Profile
// TODO(supabase): pull from `profiles` table + count of `courses` rows and
//   sum of `courses.studentCount` (or a join through enrollments) for this lecturer_id.

(function () {
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: 'pages/lecturer/dashboard.html' },
    { key: 'profile', label: 'Profile', icon: 'user', href: 'pages/lecturer/profile.html' },
  ];

  const user = Shell.render({ role: 'lecturer', active: 'profile', navItems });
  if (!user) return;

  const main = document.getElementById('main-content');
  main.innerHTML = document.getElementById('tpl-lect-profile').innerHTML;

  document.getElementById('profile-avatar').textContent = initials(user.name);
  document.getElementById('profile-name').textContent = user.name;

  const courses = Store.lecturerCourses();
  const totalStudents = courses.reduce((a, c) => a + c.studentCount, 0);

  const rows = [
    { icon: 'mail', label: 'Email', value: user.email },
    { icon: 'building', label: 'Department', value: 'Computer Science' },
    { icon: 'book', label: 'Courses taught', value: `${courses.length} courses` },
    { icon: 'users', label: 'Total students', value: `${totalStudents}` },
  ];

  document.getElementById('profile-rows').innerHTML = rows.map((row) => `
    <div class="profile-row">
      <span class="profile-row-icon">${Icons[row.icon]('icon')}</span>
      <div>
        <dt>${row.label}</dt>
        <dd>${row.value}</dd>
      </div>
    </div>
  `).join('');
})();
