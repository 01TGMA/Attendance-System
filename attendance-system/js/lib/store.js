// ==========================================================================
// Store: mock data + auth/session state.
// This file is the seam that gets swapped for real Supabase calls later —
// every function here has a matching TODO noting what it will become.
// ==========================================================================

const ATTENDANCE_THRESHOLD = 75;

function attendancePct(attended, total) {
  if (total === 0) return 100;
  return Math.round((attended / total) * 100);
}

function isEligible(pct) {
  return pct >= ATTENDANCE_THRESHOLD;
}

function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// ---------- Mock dataset (stand-in for Supabase tables) ----------

const studentCourses = [
  { id: 'cs301', name: 'Data Structures & Algorithms', code: 'CS301', lecturer: 'Dr. Amara Okafor', attendedSessions: 27, totalSessions: 30, marks: 42, maxMarks: 50 },
  { id: 'cs315', name: 'Database Systems', code: 'CS315', lecturer: 'Prof. Liam Chen', attendedSessions: 20, totalSessions: 28, marks: 31, maxMarks: 40 },
  { id: 'cs320', name: 'Operating Systems', code: 'CS320', lecturer: 'Dr. Sofia Marín', attendedSessions: 15, totalSessions: 26, marks: 18, maxMarks: 40 },
  { id: 'ma210', name: 'Linear Algebra', code: 'MA210', lecturer: 'Dr. Ravi Menon', attendedSessions: 22, totalSessions: 24, marks: 36, maxMarks: 45 },
];

function makeRoster(count) {
  const names = ['Ava Thompson', 'Noah Williams', 'Mia Rodriguez', 'Ethan Patel', 'Isla Nguyen', 'Lucas Silva', 'Zara Ahmed', 'Oliver Brooks', 'Priya Sharma', 'Daniel Kim', 'Grace Bennett', 'Mateo Rossi', 'Chloe Dubois', 'Aiden Murphy', 'Layla Hassan', 'Ben Carter'];
  const pcts = [92, 88, 81, 76, 70, 64, 96, 85, 79, 73, 68, 90, 83, 77, 60, 87];
  return Array.from({ length: count }, (_, i) => ({
    id: `stu-${i + 1}`,
    name: names[i % names.length],
    studentId: `2023${String(1000 + i)}`,
    attendancePct: pcts[i % pcts.length],
  }));
}

function makeSessions(count, total) {
  const base = new Date('2025-08-25T09:00:00');
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i * 3);
    return {
      id: `sess-${i + 1}`,
      date: d.toISOString(),
      mark: [1, 2, 1, 3, 2, 1, 2][i % 7],
      durationMin: [5, 10, 5, 15][i % 4],
      attendanceCount: total - (i % 5),
      totalStudents: total,
    };
  }).reverse();
}

const lecturerCourses = [
  { id: 'cs301', name: 'Data Structures & Algorithms', code: 'CS301', studentCount: 48, sessions: makeSessions(6, 48), roster: makeRoster(12) },
  { id: 'cs410', name: 'Distributed Systems', code: 'CS410', studentCount: 32, sessions: makeSessions(4, 32), roster: makeRoster(10) },
  { id: 'cs360', name: 'Software Engineering', code: 'CS360', studentCount: 56, sessions: makeSessions(8, 56), roster: makeRoster(14) },
];

// ---------- Auth/session (mock — swap for supabase.auth later) ----------

const Store = {
  // TODO(supabase): replace with supabase.auth.getSession() / onAuthStateChange
  getUser() {
    const raw = localStorage.getItem('ap_user');
    return raw ? JSON.parse(raw) : null;
  },
  // TODO(supabase): replace with supabase.auth.signInWithPassword / signUp
  login(user) {
    localStorage.setItem('ap_user', JSON.stringify(user));
  },
  // TODO(supabase): replace with supabase.auth.signOut()
  logout() {
    localStorage.removeItem('ap_user');
  },
  requireAuth(expectedRole) {
    const base = window.BASE_PATH || './';
    const user = this.getUser();
    if (!user) {
      window.location.href = base + 'index.html';
      return null;
    }
    if (expectedRole && user.role !== expectedRole) {
      window.location.href = base + (user.role === 'student' ? 'pages/student/dashboard.html' : 'pages/lecturer/dashboard.html');
      return null;
    }
    return user;
  },
  // ---- data getters (TODO(supabase): replace with `.from(table).select()` calls) ----
  studentCourses() { return studentCourses; },
  lecturerCourses() { return lecturerCourses; },
  lecturerCourseById(id) { return lecturerCourses.find((c) => c.id === id); },
};

