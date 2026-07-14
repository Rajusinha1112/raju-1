// ============================================
//   LEARNIFY - Dashboard Module (dashboard.js)
// ============================================

const Dashboard = (() => {

  // ─── Init student dashboard ───
  const initStudent = () => {
    const user = Auth.requireStudent();
    if (!user) return;

    // Fill user info
    document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = user.name);
    document.querySelectorAll('[data-user-avatar]').forEach(el => el.textContent = user.avatar);
    document.querySelectorAll('[data-user-email]').forEach(el => el.textContent = user.email);

    const enrolled = Courses.getEnrolled(user.id);
    const completed = enrolled.filter(c => (Courses.getProgress(user.id, c.id).progress || 0) === 100);

    document.getElementById('stat-enrolled').textContent = enrolled.length;
    document.getElementById('stat-completed').textContent = completed.length;
    document.getElementById('stat-inprogress').textContent = enrolled.length - completed.length;

    // Avg progress
    const avgPct = enrolled.length
      ? Math.round(enrolled.reduce((acc, c) => acc + (Courses.getProgress(user.id, c.id).progress || 0), 0) / enrolled.length)
      : 0;
    document.getElementById('stat-avgprogress').textContent = avgPct + '%';

    renderEnrolledList(user, enrolled);
    renderProgressChart(user, enrolled);
    renderActivity(user);
  };

  // ─── Render enrolled courses ───
  const renderEnrolledList = (user, enrolled) => {
    const el = document.getElementById('enrolled-list');
    if (!el) return;
    if (!enrolled.length) {
      el.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text-muted)">
        <div style="font-size:2.5rem;margin-bottom:0.5rem">📚</div>
        <p>No courses enrolled yet. <a href="../courses.html" style="color:var(--gold)">Browse courses</a></p>
      </div>`;
      return;
    }
    el.innerHTML = enrolled.map(course => {
      const prog = Courses.getProgress(user.id, course.id);
      return `<div class="enrolled-item">
        <div class="enrolled-thumb">${course.emoji || '📚'}</div>
        <div class="enrolled-info">
          <div class="enrolled-title">${course.title}</div>
          <div class="enrolled-instructor">${course.instructor}</div>
          <div class="enrolled-progress">
            <div class="progress-bar"><div class="progress-fill" style="width:${prog.progress}%"></div></div>
            <span class="enrolled-pct">${prog.progress}%</span>
          </div>
        </div>
        <a href="../video-player.html?id=${course.id}" class="btn btn-primary btn-sm">Continue</a>
      </div>`;
    }).join('');
  };

  // ─── Render progress chart ───
  const renderProgressChart = (user, enrolled) => {
    const el = document.getElementById('progress-chart');
    if (!el || !enrolled.length) return;
    el.innerHTML = `<div class="course-progress-list">
      ${enrolled.map(c => {
        const pct = Courses.getProgress(user.id, c.id).progress || 0;
        return `<div class="cprogress-item">
          <div class="cprogress-info">
            <span class="cprogress-name">${c.title.length > 35 ? c.title.slice(0,35)+'…' : c.title}</span>
            <span class="cprogress-pct">${pct}%</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        </div>`;
      }).join('')}
    </div>`;
  };

  // ─── Render activity feed ───
  const renderActivity = (user) => {
    const el = document.getElementById('activity-list');
    if (!el) return;
    const activities = [
      { icon: '📖', cls: 'gold', text: `Enrolled in <strong>${Courses.getEnrolled(user.id)[0]?.title || 'a course'}</strong>`, time: '2 hrs ago' },
      { icon: '✅', cls: 'success', text: `Completed <strong>Lesson 3</strong>`, time: 'Yesterday' },
      { icon: '🏆', cls: 'gold', text: `Earned a <strong>progress badge</strong>`, time: '2 days ago' },
      { icon: '🔖', cls: 'info', text: `Bookmarked a lesson`, time: '3 days ago' },
    ];
    el.innerHTML = activities.map(a => `
      <div class="activity-item">
        <div class="activity-icon ${a.cls}">${a.icon}</div>
        <div>
          <div class="activity-text">${a.text}</div>
          <div class="activity-time">${a.time}</div>
        </div>
      </div>`).join('');
  };

  // ─── Sidebar toggle ───
  const initSidebarToggle = () => {
    const toggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      sidebar?.classList.toggle('open');
      overlay?.classList.toggle('show');
    });
    overlay?.addEventListener('click', () => {
      sidebar?.classList.remove('open');
      overlay?.classList.remove('show');
    });
  };

  // ─── Tabs ───
  const initTabs = () => {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const pane = document.getElementById(target);
        if (pane) pane.classList.add('active');
      });
    });
  };

  // ─── Accordion ───
  const initAccordion = () => {
    document.querySelectorAll('.accordion-header').forEach(header => {
      header.addEventListener('click', () => {
        const isOpen = header.classList.contains('open');
        document.querySelectorAll('.accordion-header').forEach(h => {
          h.classList.remove('open');
          const body = h.nextElementSibling;
          if (body) body.classList.remove('open');
        });
        if (!isOpen) {
          header.classList.add('open');
          const body = header.nextElementSibling;
          if (body) body.classList.add('open');
        }
      });
    });
  };

  // ─── Logout button ───
  const initLogout = () => {
    document.querySelectorAll('[data-logout]').forEach(btn => {
      btn.addEventListener('click', () => Auth.logout());
    });
    document.querySelectorAll('[data-admin-logout]').forEach(btn => {
      btn.addEventListener('click', () => Auth.adminLogout());
    });
  };

  // ─── Video player ───
  const initVideoPlayer = () => {
    const user = Auth.requireStudent();
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('id');
    if (!courseId) { window.location.href = 'student-dashboard.html'; return; }

    const course = Courses.getById(courseId);
    if (!course || !Courses.isEnrolled(user.id, courseId)) {
      window.location.href = 'courses.html'; return;
    }

    // Fill page
    document.getElementById('course-title').textContent = course.title;
    document.getElementById('course-instructor').textContent = course.instructor;

    const prog = Courses.getProgress(user.id, courseId);
    updateProgressDisplay(prog.progress);

    renderLessonList(course, prog, user.id, courseId);
    loadLesson(prog.lastLesson || 0, course, user.id, courseId);
  };

  const updateProgressDisplay = (pct) => {
    const el = document.getElementById('course-progress');
    const bar = document.getElementById('progress-bar');
    if (el) el.textContent = pct + '%';
    if (bar) bar.style.width = pct + '%';
  };

  const renderLessonList = (course, prog, userId, courseId) => {
    const lessons = generateLessons(course);
    const el = document.getElementById('lesson-list');
    if (!el) return;
    el.innerHTML = lessons.map((l, i) => {
      const done = prog.completedLessons?.includes(i);
      const active = i === (prog.lastLesson || 0);
      return `<div class="lesson-item ${done ? 'completed' : ''} ${active ? 'active' : ''}" onclick="Dashboard.loadLesson(${i}, window._course, '${userId}', '${courseId}')">
        <div class="lesson-icon">${done ? '✅' : active ? '▶' : '📄'}</div>
        <div class="lesson-info">
          <div class="lesson-title">${l.title}</div>
          <div class="lesson-dur">${l.duration}</div>
        </div>
      </div>`;
    }).join('');
  };

  const loadLesson = (index, course, userId, courseId) => {
    const lessons = generateLessons(course);
    const lesson = lessons[index];
    if (!lesson) return;
    window._course = course;

    document.getElementById('lesson-title').textContent = lesson.title;
    document.getElementById('lesson-desc').textContent = lesson.desc;

    // Mark as completed
    const prog = Courses.getProgress(userId, courseId);
    const completed = new Set(prog.completedLessons || []);
    completed.add(index);
    const newPct = Math.round((completed.size / lessons.length) * 100);
    Courses.saveProgress(userId, courseId, { progress: newPct, lastLesson: index, completedLessons: [...completed] });
    updateProgressDisplay(newPct);
    renderLessonList(course, { ...prog, lastLesson: index, completedLessons: [...completed] }, userId, courseId);
  };

  const generateLessons = (course) => {
    const base = [
      { title: 'Introduction & Overview', duration: '8 min', desc: 'Welcome to the course! In this lesson we cover what you will learn and how to make the most of this course.' },
      { title: 'Setting Up Your Environment', duration: '12 min', desc: 'Install all required tools and configure your development environment step by step.' },
      { title: 'Core Concepts - Part 1', duration: '20 min', desc: 'Dive into the fundamental concepts that form the foundation of this topic.' },
      { title: 'Core Concepts - Part 2', duration: '22 min', desc: 'Continue exploring core concepts with practical examples and exercises.' },
      { title: 'Hands-On Project: Building Basics', duration: '35 min', desc: 'Apply what you have learned to build a real-world mini project from scratch.' },
      { title: 'Advanced Techniques', duration: '28 min', desc: 'Level up with advanced patterns, best practices and optimization tips.' },
      { title: 'Debugging & Troubleshooting', duration: '18 min', desc: 'Learn to identify and fix common issues efficiently.' },
      { title: 'Final Project', duration: '45 min', desc: 'Put everything together in a complete, portfolio-ready final project.' },
    ];
    return base;
  };

  return { initStudent, initSidebarToggle, initTabs, initAccordion, initLogout, initVideoPlayer, loadLesson };

})();