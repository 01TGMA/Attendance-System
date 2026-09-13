// Student — Profile
// TODO(supabase): pull from `profiles` table (full_name, student_id) joined
//   with a count of `enrollments` rows, instead of the mock user + studentCourses().

(function () {
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: 'pages/student/dashboard.html' },
    { key: 'courses', label: 'My Courses', icon: 'book', href: 'pages/student/courses.html' },
    { key: 'scan', label: 'Scan', icon: 'scan', href: 'pages/student/scan.html' },
    { key: 'profile', label: 'Profile', icon: 'user', href: 'pages/student/profile.html' },
  ];

  const user = Shell.render({ role: 'student', active: 'profile', navItems });
  if (!user) return;

  const main = document.getElementById('main-content');
  main.innerHTML = document.getElementById('tpl-profile').innerHTML;

  document.getElementById('profile-avatar').textContent = initials(user.name);
  document.getElementById('profile-name').textContent = user.name;

  const rows = [
    { icon: 'mail', label: 'Email', value: user.email },
    { icon: 'idCard', label: 'Student ID', value: user.studentId || '—' },
    { icon: 'graduationCap', label: 'Program', value: 'BSc Computer Science' },
    { icon: 'book', label: 'Enrolled courses', value: `${Store.studentCourses().length} courses` },
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
