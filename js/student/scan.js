// Student — Scan Attendance
// Uses html5-qrcode for real camera access + QR decoding.
// TODO(supabase): on decode, instead of the mock validateToken() below, call:
//   1. look up sessions row where qr_token = decoded value and expires_at > now()
//   2. verify an enrollments row exists for (student_id, session.course_id)
//   3. insert into attendance_records (session_id, student_id) — the
//      unique(session_id, student_id) constraint + RLS policy enforce the
//      rest (no duplicate scans, no unenrolled students, no expired sessions)

(function () {
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: 'pages/student/dashboard.html' },
    { key: 'courses', label: 'My Courses', icon: 'book', href: 'pages/student/courses.html' },
    { key: 'scan', label: 'Scan', icon: 'scan', href: 'pages/student/scan.html' },
    { key: 'profile', label: 'Profile', icon: 'user', href: 'pages/student/profile.html' },
  ];

  const user = Shell.render({ role: 'student', active: 'scan', navItems });
  if (!user) return;

  const main = document.getElementById('main-content');
  main.innerHTML = document.getElementById('tpl-scan').innerHTML;

  const els = {
    line: document.getElementById('scan-line'),
    brackets: document.getElementById('corner-brackets'),
    iconCenter: document.getElementById('scan-icon-center'),
    status: document.getElementById('scan-status'),
    actionBtn: document.getElementById('scan-action-btn'),
    cancelBtn: document.getElementById('scan-cancel-btn'),
    readerEl: document.getElementById('qr-reader'),
  };

  let status = 'idle'; // idle | scanning | success | error
  let html5Qr = null;

  function setStatus(next, message) {
    status = next;
    els.line.style.display = next === 'scanning' ? 'block' : 'none';
    els.brackets.classList.toggle('active', next === 'scanning');

    const iconMap = {
      idle: Icons.qrCode('icon icon-lg'),
      scanning: Icons.qrCode('icon icon-lg'),
      success: Icons.checkCircle('icon icon-lg'),
      error: Icons.xCircle('icon icon-lg'),
    };
    els.iconCenter.className = `scan-icon-center ${next}`;
    // Hide the placeholder icon once the live camera feed is visible.
    els.iconCenter.innerHTML = (next === 'scanning') ? '' : iconMap[next];

    els.status.className = `scan-status ${next === 'error' ? 'error' : next === 'success' ? 'success' : ''}`;
    els.status.innerHTML = message || {
      idle: 'Camera ready — tap Start scanning to begin.',
      scanning: `${Icons.scanLine('icon')} Scanning…`,
      success: '',
      error: '',
    }[next];

    if (next === 'success') {
      els.actionBtn.textContent = 'Scan another';
      els.actionBtn.disabled = false;
    } else if (next === 'scanning') {
      els.actionBtn.innerHTML = 'Scanning…';
      els.actionBtn.disabled = true;
    } else {
      els.actionBtn.innerHTML = `${Icons.scanLine('icon')} Start scanning`;
      els.actionBtn.disabled = false;
    }
  }

  // Mock validation of a decoded QR value. Real version checks Supabase.
  function validateToken(decodedText) {
    // Our lecturer-side QR encodes: attendpro://<courseCode>/<durationMin>/<mark>
    return decodedText && decodedText.startsWith('attendpro://');
  }

  async function stopCamera() {
    if (html5Qr) {
      try { await html5Qr.stop(); await html5Qr.clear(); } catch (e) { /* already stopped */ }
      html5Qr = null;
    }
  }

  async function startScan() {
    setStatus('scanning');
    els.readerEl.style.display = 'block';

    try {
      html5Qr = new Html5Qrcode('qr-reader');
      await html5Qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        async (decodedText) => {
          await stopCamera();
          els.readerEl.style.display = 'none';
          if (validateToken(decodedText)) {
            const course = decodedText.split('/')[2] || 'your course';
            setStatus('success', `${Icons.checkCircle('icon')} Attendance marked for ${course}`);
          } else {
            setStatus('error', `${Icons.xCircle('icon')} Invalid or expired QR code. Try again.`);
          }
        },
        () => { /* per-frame decode failures — ignore, keep scanning */ }
      );
    } catch (err) {
      els.readerEl.style.display = 'none';
      setStatus('error', `${Icons.xCircle('icon')} Camera unavailable: ${err.message || 'permission denied'}.`);
    }
  }

  els.actionBtn.addEventListener('click', () => {
    if (status === 'scanning') return;
    startScan();
  });

  els.cancelBtn.addEventListener('click', async () => {
    await stopCamera();
    window.location.href = window.BASE_PATH + 'pages/student/dashboard.html';
  });

  window.addEventListener('beforeunload', stopCamera);

  setStatus('idle');
})();
