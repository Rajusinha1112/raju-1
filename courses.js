// ============================================
//   LEARNIFY - Courses Module (courses.js)
// ============================================

const Courses = (() => {

  // ─── Get all courses ───
  const getAll = () => JSON.parse(localStorage.getItem('lf_courses') || '[]');

  // ─── Get published courses ───
  const getPublished = () => getAll().filter(c => c.published);

  // ─── Get course by ID ───
  const getById = (id) => getAll().find(c => c.id === id) || null;

  // ─── Save all courses ───
  const saveAll = (courses) => localStorage.setItem('lf_courses', JSON.stringify(courses));

  // ─── Add course ───
  const add = (data) => {
    const courses = getAll();
    const newCourse = {
      id: 'c' + Date.now(),
      ...data,
      students: 0,
      rating: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    courses.push(newCourse);
    saveAll(courses);
    return newCourse;
  };

  // ─── Update course ───
  const update = (id, data) => {
    const courses = getAll();
    const idx = courses.findIndex(c => c.id === id);
    if (idx !== -1) {
      courses[idx] = { ...courses[idx], ...data };
      saveAll(courses);
      return courses[idx];
    }
    return null;
  };

  // ─── Delete course ───
  const remove = (id) => {
    const courses = getAll().filter(c => c.id !== id);
    saveAll(courses);
    // Also remove from all student enrollments
    const users = Auth.getUsers();
    users.forEach(u => { u.enrolledCourses = (u.enrolledCourses || []).filter(cid => cid !== id); });
    localStorage.setItem('lf_users', JSON.stringify(users));
  };

  // ─── Toggle publish ───
  const togglePublish = (id) => {
    const courses = getAll();
    const c = courses.find(c => c.id === id);
    if (c) { c.published = !c.published; saveAll(courses); }
  };

  // ─── Filter courses ───
  const filter = (courses, { query, category, level, price } = {}) => {
    return courses.filter(c => {
      if (query && !c.title.toLowerCase().includes(query.toLowerCase()) &&
          !c.instructor.toLowerCase().includes(query.toLowerCase())) return false;
      if (category && category !== 'all' && c.category !== category) return false;
      if (level && level !== 'all' && c.level !== level) return false;
      if (price === 'free' && c.price !== 0) return false;
      if (price === 'paid' && c.price === 0) return false;
      return true;
    });
  };

  // ─── Enroll student ───
  const enroll = (userId, courseId) => {
    const users = Auth.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return false;
    if (!user.enrolledCourses) user.enrolledCourses = [];
    if (user.enrolledCourses.includes(courseId)) return false;
    user.enrolledCourses.push(courseId);
    Auth.updateUser(user);
    return true;
  };

  // ─── Check enrollment ───
  const isEnrolled = (userId, courseId) => {
    const users = Auth.getUsers();
    const user = users.find(u => u.id === userId);
    return user ? (user.enrolledCourses || []).includes(courseId) : false;
  };

  // ─── Get progress ───
  const getProgress = (userId, courseId) => {
    const progress = JSON.parse(localStorage.getItem('lf_progress') || '{}');
    return progress[`${userId}_${courseId}`] || { progress: 0, lastLesson: 0, completedLessons: [] };
  };

  // ─── Save progress ───
  const saveProgress = (userId, courseId, data) => {
    const progress = JSON.parse(localStorage.getItem('lf_progress') || '{}');
    progress[`${userId}_${courseId}`] = { ...progress[`${userId}_${courseId}`], ...data };
    localStorage.setItem('lf_progress', JSON.stringify(progress));
  };

  // ─── Get enrolled courses for student ───
  const getEnrolled = (userId) => {
    const users = Auth.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user || !user.enrolledCourses) return [];
    return user.enrolledCourses.map(cid => getById(cid)).filter(Boolean);
  };

  // ─── Category list ───
  const getCategories = () => {
    const all = getAll();
    return [...new Set(all.map(c => c.category))];
  };

  // ─── Render star rating ───
  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let stars = '';
    for (let i = 0; i < full; i++) stars += '★';
    if (half) stars += '½';
    while (stars.length < 5) stars += '☆';
    return `<span class="stars">${stars} <span style="color:var(--text-muted)">${rating.toFixed(1)}</span></span>`;
  };

  // ─── Format price ───
  const formatPrice = (price) => price === 0 ? '<span class="course-price free">FREE</span>' : `<span class="course-price">₹${price.toLocaleString('en-IN')}</span>`;

  // ─── Build course card HTML ───
  const buildCard = (course, showEnroll = true) => {
    return `
    <div class="card course-card" data-id="${course.id}">
      <div class="course-thumb">${course.emoji || '📚'}</div>
      <div class="course-body">
        <span class="course-tag">${course.category}</span>
        <div class="course-title">${course.title}</div>
        <div class="course-instructor">By ${course.instructor}</div>
        <div class="course-meta">
          <span>🕐 ${course.duration}</span>
          <span>📖 ${course.lessons} lessons</span>
          <span>📊 ${course.level}</span>
        </div>
        ${renderStars(course.rating || 0)}
        <div class="course-footer">
          ${formatPrice(course.price)}
          ${showEnroll ? `<a href="course-details.html?id=${course.id}" class="btn btn-primary btn-sm">View Course</a>` : ''}
        </div>
      </div>
    </div>`;
  };

  return { getAll, getPublished, getById, saveAll, add, update, remove, togglePublish, filter, enroll, isEnrolled, getProgress, saveProgress, getEnrolled, getCategories, renderStars, formatPrice, buildCard };

})();