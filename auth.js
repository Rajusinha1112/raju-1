// ============================================
//   LEARNIFY - Auth Module (auth.js)
// ============================================

const Auth = (() => {

  // ─── Seed default data if empty ───
  const seedData = () => {
    if (!localStorage.getItem('lf_users')) {
      const users = [
        { id: 'u1', name: 'Demo Student', email: 'student@demo.com', password: 'demo123', role: 'student', avatar: 'DS', joinedAt: '2024-01-15', enrolledCourses: ['c1','c2'] },
        { id: 'u2', name: 'Priya Sharma', email: 'priya@demo.com', password: 'demo123', role: 'student', avatar: 'PS', joinedAt: '2024-02-10', enrolledCourses: ['c1'] },
        { id: 'u3', name: 'Rahul Verma', email: 'rahul@demo.com', password: 'demo123', role: 'student', avatar: 'RV', joinedAt: '2024-03-05', enrolledCourses: ['c2','c3'] },
      ];
      localStorage.setItem('lf_users', JSON.stringify(users));
    }
    if (!localStorage.getItem('lf_admin')) {
      const admin = { id: 'a1', name: 'Admin User', email: 'admin@learnify.com', password: 'admin123', role: 'admin' };
      localStorage.setItem('lf_admin', JSON.stringify(admin));
    }
    if (!localStorage.getItem('lf_courses')) {
      const courses = [
        { id: 'c1', title: 'Complete Web Development Bootcamp', instructor: 'Anil Kumar', category: 'Web Dev', price: 1499, originalPrice: 4999, rating: 4.8, students: 1240, duration: '42 hrs', lessons: 180, level: 'Beginner', emoji: '💻', description: 'Master HTML, CSS, JavaScript, React, Node.js and more in this comprehensive bootcamp.', tags: ['HTML','CSS','JavaScript','React','Node.js'], published: true, createdAt: '2024-01-10' },
        { id: 'c2', title: 'Python for Data Science & ML', instructor: 'Sneha Patel', category: 'Data Science', price: 0, originalPrice: 3999, rating: 4.9, students: 2850, duration: '38 hrs', lessons: 142, level: 'Intermediate', emoji: '🐍', description: 'Learn Python, NumPy, Pandas, Matplotlib and Machine Learning from scratch.', tags: ['Python','NumPy','Pandas','ML'], published: true, createdAt: '2024-01-20' },
        { id: 'c3', title: 'UI/UX Design Masterclass', instructor: 'Vikram Singh', category: 'Design', price: 999, originalPrice: 2999, rating: 4.7, students: 875, duration: '28 hrs', lessons: 96, level: 'Beginner', emoji: '🎨', description: 'Design beautiful interfaces using Figma. Learn design principles, prototyping and user research.', tags: ['Figma','Design','Prototyping'], published: true, createdAt: '2024-02-01' },
        { id: 'c4', title: 'React Native Mobile Development', instructor: 'Kavita Rao', category: 'Mobile', price: 1299, originalPrice: 3499, rating: 4.6, students: 620, duration: '32 hrs', lessons: 120, level: 'Intermediate', emoji: '📱', description: 'Build cross-platform mobile apps for iOS and Android using React Native.', tags: ['React Native','iOS','Android'], published: true, createdAt: '2024-02-15' },
        { id: 'c5', title: 'AWS Cloud Practitioner', instructor: 'Arjun Nair', category: 'Cloud', price: 1799, originalPrice: 5999, rating: 4.9, students: 1100, duration: '24 hrs', lessons: 88, level: 'Beginner', emoji: '☁️', description: 'Prepare for the AWS Certified Cloud Practitioner exam. Covers all AWS core services.', tags: ['AWS','Cloud','DevOps'], published: true, createdAt: '2024-03-01' },
        { id: 'c6', title: 'Digital Marketing Complete Guide', instructor: 'Meera Joshi', category: 'Marketing', price: 799, originalPrice: 2499, rating: 4.5, students: 1580, duration: '20 hrs', lessons: 75, level: 'Beginner', emoji: '📢', description: 'Master SEO, Social Media Marketing, Google Ads, and Email Marketing strategies.', tags: ['SEO','Social Media','Google Ads'], published: false, createdAt: '2024-03-10' },
      ];
      localStorage.setItem('lf_courses', JSON.stringify(courses));
    }
    if (!localStorage.getItem('lf_progress')) {
      const progress = {
        'u1_c1': { progress: 65, lastLesson: 3, completedLessons: [0,1,2] },
        'u1_c2': { progress: 30, lastLesson: 1, completedLessons: [0] },
        'u2_c1': { progress: 85, lastLesson: 5, completedLessons: [0,1,2,3,4] },
        'u3_c2': { progress: 50, lastLesson: 2, completedLessons: [0,1] },
        'u3_c3': { progress: 20, lastLesson: 0, completedLessons: [] },
      };
      localStorage.setItem('lf_progress', JSON.stringify(progress));
    }
  };

  // ─── Get all users ───
  const getUsers = () => JSON.parse(localStorage.getItem('lf_users') || '[]');

  // ─── Save users ───
  const saveUsers = (users) => localStorage.setItem('lf_users', JSON.stringify(users));

  // ─── Register new student ───
  const register = (name, email, password) => {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      return { success: false, msg: 'This email is already registered.' };
    }
    const newUser = {
      id: 'u' + Date.now(),
      name, email, password,
      role: 'student',
      avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      joinedAt: new Date().toISOString().split('T')[0],
      enrolledCourses: []
    };
    users.push(newUser);
    saveUsers(users);
    return { success: true, user: newUser };
  };

  // ─── Login student ───
  const login = (email, password) => {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return { success: false, msg: 'Invalid email or password.' };
    sessionStorage.setItem('lf_current_user', JSON.stringify(user));
    return { success: true, user };
  };

  // ─── Login admin ───
  const adminLogin = (email, password) => {
    const admin = JSON.parse(localStorage.getItem('lf_admin') || 'null');
    if (!admin || admin.email !== email || admin.password !== password) {
      return { success: false, msg: 'Invalid admin credentials.' };
    }
    sessionStorage.setItem('lf_current_admin', JSON.stringify(admin));
    return { success: true, admin };
  };

  // ─── Get current logged-in user ───
  const getCurrentUser = () => JSON.parse(sessionStorage.getItem('lf_current_user') || 'null');

  // ─── Get current admin ───
  const getCurrentAdmin = () => JSON.parse(sessionStorage.getItem('lf_current_admin') || 'null');

  // ─── Logout ───
  const logout = () => { sessionStorage.removeItem('lf_current_user'); window.location.href = '../login.html'; };
  const adminLogout = () => { sessionStorage.removeItem('lf_current_admin'); window.location.href = 'admin-login.html'; };

  // ─── Guard: redirect if not logged in ───
  const requireStudent = () => {
    const user = getCurrentUser();
    if (!user) { window.location.href = '../login.html'; return null; }
    return user;
  };
  const requireAdmin = () => {
    const admin = getCurrentAdmin();
    if (!admin) { window.location.href = 'admin-login.html'; return null; }
    return admin;
  };

  // ─── Update user in localStorage ───
  const updateUser = (updatedUser) => {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === updatedUser.id);
    if (idx !== -1) {
      users[idx] = updatedUser;
      saveUsers(users);
      sessionStorage.setItem('lf_current_user', JSON.stringify(updatedUser));
    }
  };

  // Init
  seedData();

  return { register, login, adminLogin, getCurrentUser, getCurrentAdmin, logout, adminLogout, requireStudent, requireAdmin, getUsers, updateUser, seedData };

})();

// ─── Form helpers ───
const showAlert = (id, msg, type = 'error') => {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = `alert alert-${type} show`;
  setTimeout(() => el.classList.remove('show'), 4000);
};

const setLoading = (btn, loading) => {
  if (loading) {
    btn.dataset.text = btn.textContent;
    btn.innerHTML = '<span class="spinner"></span>';
    btn.disabled = true;
  } else {
    btn.textContent = btn.dataset.text || 'Submit';
    btn.disabled = false;
  }
};