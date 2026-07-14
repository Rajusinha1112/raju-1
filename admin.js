// ============================================
//   LEARNIFY - Admin Module (admin.js)
// ============================================

const Admin = (() => {

  // ─── Init admin dashboard ───
  const initDashboard = () => {
    const admin = Auth.requireAdmin();
    if (!admin) return;
    document.querySelectorAll('[data-admin-name]').forEach(el => el.textContent = admin.name);

    const courses = Courses.getAll();
    const users = Auth.getUsers();

    document.getElementById('stat-courses').textContent = courses.length;
    document.getElementById('stat-students').textContent = users.length;
    document.getElementById('stat-published').textContent = courses.filter(c => c.published).length;
    document.getElementById('stat-revenue').textContent = '₹' +
      users.reduce((acc, u) => acc + (u.enrolledCourses || []).reduce((sum, cid) => {
        const c = Courses.getById(cid); return sum + (c?.price || 0);
      }, 0), 0).toLocaleString('en-IN');

    renderRecentCourses(courses);
    renderRecentStudents(users);
    renderChart(courses, users);
    Dashboard.initSidebarToggle();
    Dashboard.initLogout();
  };

  // ─── Render chart bars ───
  const renderChart = (courses, users) => {
    const el = document.getElementById('revenue-chart');
    if (!el) return;
    const months = ['Jan','Feb','Mar','Apr','May','Jun'];
    const vals = [12000, 28000, 18000, 45000, 35000, 52000];
    const max = Math.max(...vals);
    el.innerHTML = `
      <div class="chart-bars">
        ${months.map((m, i) => `<div class="chart-bar" style="height:${(vals[i]/max)*100}%" data-val="₹${(vals[i]/1000).toFixed(0)}k"></div>`).join('')}
      </div>
      <div class="chart-labels">
        ${months.map(m => `<div class="chart-label">${m}</div>`).join('')}
      </div>`;
  };

  // ─── Recent courses table ───
  const renderRecentCourses = (courses) => {
    const el = document.getElementById('recent-courses');
    if (!el) return;
    el.innerHTML = courses.slice(-4).reverse().map(c => `
      <tr>
        <td><strong>${c.emoji} ${c.title}</strong></td>
        <td>${c.instructor}</td>
        <td>${c.students}</td>
        <td><span class="badge ${c.published ? 'badge-success' : 'badge-muted'}">${c.published ? '✓ Published' : 'Draft'}</span></td>
        <td><div class="action-btns">
          <a href="manage-courses.html" class="action-btn" title="Edit">✏️</a>
        </div></td>
      </tr>`).join('');
  };

  // ─── Recent students table ───
  const renderRecentStudents = (users) => {
    const el = document.getElementById('recent-students');
    if (!el) return;
    el.innerHTML = users.slice(-4).reverse().map(u => `
      <tr>
        <td><strong>${u.avatar} ${u.name}</strong></td>
        <td>${u.email}</td>
        <td>${(u.enrolledCourses || []).length}</td>
        <td>${u.joinedAt}</td>
      </tr>`).join('');
  };

  // ─── Init Manage Courses ───
  const initManageCourses = () => {
    const admin = Auth.requireAdmin();
    if (!admin) return;
    Dashboard.initSidebarToggle();
    Dashboard.initLogout();
    renderCoursesTable();

    document.getElementById('search-courses')?.addEventListener('input', renderCoursesTable);
    document.getElementById('filter-category')?.addEventListener('change', renderCoursesTable);
    document.getElementById('filter-status')?.addEventListener('change', renderCoursesTable);
  };

  const renderCoursesTable = () => {
    const el = document.getElementById('courses-tbody');
    if (!el) return;
    let courses = Courses.getAll();
    const q = document.getElementById('search-courses')?.value.toLowerCase() || '';
    const cat = document.getElementById('filter-category')?.value || '';
    const status = document.getElementById('filter-status')?.value || '';

    if (q) courses = courses.filter(c => c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q));
    if (cat) courses = courses.filter(c => c.category === cat);
    if (status === 'published') courses = courses.filter(c => c.published);
    if (status === 'draft') courses = courses.filter(c => !c.published);

    el.innerHTML = courses.map(c => `
      <tr>
        <td><strong>${c.emoji} ${c.title}</strong></td>
        <td>${c.category}</td>
        <td>${c.instructor}</td>
        <td>${c.students}</td>
        <td>${c.price === 0 ? '<span class="text-success">Free</span>' : '₹' + c.price.toLocaleString('en-IN')}</td>
        <td><span class="badge ${c.published ? 'badge-success' : 'badge-muted'}">${c.published ? 'Published' : 'Draft'}</span></td>
        <td>
          <div class="action-btns">
            <button class="action-btn" onclick="Admin.editCourse('${c.id}')" title="Edit">✏️</button>
            <button class="action-btn" onclick="Admin.togglePublish('${c.id}')" title="${c.published ? 'Unpublish' : 'Publish'}">${c.published ? '🔒' : '🔓'}</button>
            <button class="action-btn danger" onclick="Admin.deleteCourse('${c.id}')" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>`).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:2rem">No courses found</td></tr>';
  };

  const editCourse = (id) => { window.location.href = `add-course.html?edit=${id}`; };
  const togglePublish = (id) => { Courses.togglePublish(id); renderCoursesTable(); };
  const deleteCourse = (id) => {
    if (confirm('Delete this course? This action cannot be undone.')) {
      Courses.remove(id); renderCoursesTable();
    }
  };

  // ─── Init Manage Students ───
  const initManageStudents = () => {
    const admin = Auth.requireAdmin();
    if (!admin) return;
    Dashboard.initSidebarToggle();
    Dashboard.initLogout();
    renderStudentsTable();

    document.getElementById('search-students')?.addEventListener('input', renderStudentsTable);
  };

  const renderStudentsTable = () => {
    const el = document.getElementById('students-tbody');
    if (!el) return;
    let users = Auth.getUsers();
    const q = document.getElementById('search-students')?.value.toLowerCase() || '';
    if (q) users = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));

    el.innerHTML = users.map(u => {
      const enrolled = u.enrolledCourses || [];
      const courseNames = enrolled.map(cid => Courses.getById(cid)?.title || '').filter(Boolean);
      return `<tr>
        <td><div style="display:flex;align-items:center;gap:0.75rem">
          <div class="avatar" style="width:36px;height:36px;font-size:0.85rem">${u.avatar}</div>
          <strong>${u.name}</strong>
        </div></td>
        <td>${u.email}</td>
        <td>${u.joinedAt}</td>
        <td>${enrolled.length}</td>
        <td><div style="font-size:0.78rem;color:var(--text-muted)">${courseNames.slice(0,2).join(', ')}${courseNames.length > 2 ? ` +${courseNames.length-2} more` : ''}</div></td>
        <td><div class="action-btns">
          <button class="action-btn" onclick="Admin.viewStudent('${u.id}')" title="View">👁️</button>
          <button class="action-btn danger" onclick="Admin.removeStudent('${u.id}')" title="Remove">🗑️</button>
        </div></td>
      </tr>`;
    }).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:2rem">No students found</td></tr>';
  };

  const viewStudent = (id) => {
    const users = Auth.getUsers();
    const u = users.find(u => u.id === id);
    if (!u) return;
    const enrolled = (u.enrolledCourses || []).map(cid => Courses.getById(cid)?.title).filter(Boolean);
    alert(`Student: ${u.name}\nEmail: ${u.email}\nJoined: ${u.joinedAt}\nEnrolled: ${enrolled.join(', ') || 'None'}`);
  };

  const removeStudent = (id) => {
    if (!confirm('Remove this student? All their data will be deleted.')) return;
    const users = Auth.getUsers().filter(u => u.id !== id);
    localStorage.setItem('lf_users', JSON.stringify(users));
    renderStudentsTable();
  };

  // ─── Init Add/Edit Course ───
  const initAddCourse = () => {
    const admin = Auth.requireAdmin();
    if (!admin) return;
    Dashboard.initSidebarToggle();
    Dashboard.initLogout();

    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit');

    if (editId) {
      const course = Courses.getById(editId);
      if (course) prefillForm(course);
      document.getElementById('form-title').textContent = 'Edit Course';
      document.getElementById('btn-submit').textContent = 'Update Course';
    }

    document.getElementById('course-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = document.getElementById('btn-submit');
      setLoading(btn, true);
      setTimeout(() => {
        const data = {
          title: document.getElementById('f-title').value,
          instructor: document.getElementById('f-instructor').value,
          category: document.getElementById('f-category').value,
          level: document.getElementById('f-level').value,
          price: parseInt(document.getElementById('f-price').value) || 0,
          originalPrice: parseInt(document.getElementById('f-origprice').value) || 0,
          duration: document.getElementById('f-duration').value,
          lessons: parseInt(document.getElementById('f-lessons').value) || 0,
          description: document.getElementById('f-desc').value,
          emoji: document.getElementById('f-emoji').value || '📚',
          tags: document.getElementById('f-tags').value.split(',').map(t => t.trim()).filter(Boolean),
          published: document.getElementById('f-published').checked,
          rating: parseFloat(document.getElementById('f-rating')?.value) || 0,
        };
        if (editId) {
          Courses.update(editId, data);
          showAlert('form-alert', 'Course updated successfully!', 'success');
        } else {
          Courses.add(data);
          showAlert('form-alert', 'Course added successfully!', 'success');
          document.getElementById('course-form').reset();
        }
        setLoading(btn, false);
      }, 800);
    });
  };

  const prefillForm = (c) => {
    document.getElementById('f-title').value = c.title;
    document.getElementById('f-instructor').value = c.instructor;
    document.getElementById('f-category').value = c.category;
    document.getElementById('f-level').value = c.level;
    document.getElementById('f-price').value = c.price;
    document.getElementById('f-origprice').value = c.originalPrice;
    document.getElementById('f-duration').value = c.duration;
    document.getElementById('f-lessons').value = c.lessons;
    document.getElementById('f-desc').value = c.description;
    document.getElementById('f-emoji').value = c.emoji;
    document.getElementById('f-tags').value = (c.tags || []).join(', ');
    document.getElementById('f-published').checked = c.published;
    if (document.getElementById('f-rating')) document.getElementById('f-rating').value = c.rating;
  };

  return { initDashboard, initManageCourses, initManageStudents, initAddCourse, editCourse, togglePublish, deleteCourse, viewStudent, removeStudent };

})();