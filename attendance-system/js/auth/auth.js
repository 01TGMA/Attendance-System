// Auth screen: role tabs (student/lecturer) + login/register toggle.
// TODO(supabase): replace the submit handler with real
//   supabase.auth.signInWithPassword({ email, password })  — login
//   supabase.auth.signUp({ email, password, options: { data: { full_name, role } } }) — register
// and read the resulting session/user instead of building a fake user object.

(function () {
  document.getElementById('brand-icon').innerHTML = Icons.graduationCap('icon');
  document.getElementById('tab-student').innerHTML = `${Icons.user('icon')} Student`;
  document.getElementById('tab-lecturer').innerHTML = `${Icons.graduationCap('icon')} Lecturer`;

  // If already logged in, skip straight to the right dashboard.
  const existing = Store.getUser();
  if (existing) {
    window.location.href = existing.role === 'student'
      ? 'pages/student/dashboard.html'
      : 'pages/lecturer/dashboard.html';
    return;
  }

  let mode = 'login'; // 'login' | 'register'
  let role = 'student'; // 'student' | 'lecturer'

  const els = {
    heading: document.getElementById('heading-title'),
    nameField: document.getElementById('name-field'),
    studentIdField: document.getElementById('student-id-field'),
    submitBtn: document.getElementById('submit-btn'),
    switchText: document.getElementById('switch-text'),
    switchMode: document.getElementById('switch-mode'),
    tabStudent: document.getElementById('tab-student'),
    tabLecturer: document.getElementById('tab-lecturer'),
    form: document.getElementById('auth-form'),
  };

  function renderMode() {
    const isLogin = mode === 'login';
    els.heading.textContent = isLogin ? 'Welcome back' : 'Create your account';
    els.nameField.style.display = isLogin ? 'none' : 'flex';
    els.studentIdField.style.display = !isLogin && role === 'student' ? 'flex' : 'none';
    els.submitBtn.textContent = isLogin ? 'Login' : 'Create account';
    els.switchText.textContent = isLogin ? 'New to AttendPro? ' : 'Already have an account? ';
    els.switchMode.textContent = isLogin ? 'Register' : 'Login';
  }

  function renderRole() {
    els.tabStudent.classList.toggle('active', role === 'student');
    els.tabLecturer.classList.toggle('active', role === 'lecturer');
    els.studentIdField.style.display = mode === 'register' && role === 'student' ? 'flex' : 'none';
  }

  els.tabStudent.addEventListener('click', () => { role = 'student'; renderRole(); });
  els.tabLecturer.addEventListener('click', () => { role = 'lecturer'; renderRole(); });
  els.switchMode.addEventListener('click', () => { mode = mode === 'login' ? 'register' : 'login'; renderMode(); });

  els.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const studentId = document.getElementById('studentId').value;

    // Mock fallback identities so the demo works with empty fields —
    // remove this once real Supabase auth is wired in.
    const fallbackName = role === 'student' ? 'Jordan Lee' : 'Dr. Amara Okafor';
    const fallbackEmail = role === 'student' ? 'jordan.lee@uni.edu' : 'a.okafor@uni.edu';

    const user = {
      name: (mode === 'register' && name) ? name : fallbackName,
      email: email || fallbackEmail,
      role,
      studentId: role === 'student' ? (studentId || '20231042') : undefined,
    };

    Store.login(user);
    window.location.href = role === 'student'
      ? 'pages/student/dashboard.html'
      : 'pages/lecturer/dashboard.html';
  });

  renderMode();
  renderRole();
})();
