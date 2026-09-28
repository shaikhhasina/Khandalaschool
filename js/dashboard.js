// ==========================================================================
// Dashboard: auth guard + live lists from Firestore
//   admissionEnquiries    <- Contact page enquiry form
//   admissionApplications <- Admission form
// ==========================================================================

const userEmailEl = document.getElementById('userEmail');
const logoutLink = document.getElementById('logoutLink');
const pageTitle = document.getElementById('pageTitle');

const enquiriesView = document.getElementById('enquiriesView');
const admissionsView = document.getElementById('admissionsView');
const tabEnquiries = document.getElementById('tabEnquiries');
const tabAdmissions = document.getElementById('tabAdmissions');

// --- Auth guard: bounce to login if not signed in ---
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  userEmailEl.textContent = user.email;
  loadEnquiries();
  loadAdmissions();
});

logoutLink.addEventListener('click', async (e) => {
  e.preventDefault();
  await auth.signOut();
  window.location.href = 'login.html';
});

// --- Tabs ---
function showTab(which) {
  const isEnq = which === 'enquiries';
  enquiriesView.hidden = !isEnq;
  admissionsView.hidden = isEnq;
  tabEnquiries.classList.toggle('active', isEnq);
  tabAdmissions.classList.toggle('active', !isEnq);
  pageTitle.textContent = isEnq ? 'Admission Enquiries' : 'Admission Applications';
}
tabEnquiries.addEventListener('click', (e) => { e.preventDefault(); showTab('enquiries'); });
tabAdmissions.addEventListener('click', (e) => { e.preventDefault(); showTab('admissions'); });

// --- Helpers ---
function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
         ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatAadhar(v) {
  const d = String(v || '').replace(/\D/g, '');
  return d.length === 12 ? d.replace(/(\d{4})(?=\d)/g, '$1 ') : (v || '—');
}

// --- Enquiries ---
function loadEnquiries() {
  const rowsEl = document.getElementById('enquiryRows');
  const totalCountEl = document.getElementById('totalCount');
  const newCountEl = document.getElementById('newCount');
  const todayCountEl = document.getElementById('todayCount');

  db.collection('admissionEnquiries')
    .orderBy('createdAt', 'desc')
    .onSnapshot((snapshot) => {
      if (snapshot.empty) {
        rowsEl.innerHTML = '<tr><td colspan="7" class="empty-row">No enquiries yet. New submissions from the website will appear here.</td></tr>';
        totalCountEl.textContent = '0';
        newCountEl.textContent = '0';
        todayCountEl.textContent = '0';
        return;
      }

      let rowsHtml = '';
      let newCount = 0;
      let todayCount = 0;
      const today = new Date().toDateString();

      snapshot.forEach((doc) => {
        const e = doc.data();
        if (e.status === 'new' || !e.status) newCount++;
        if (e.createdAt && e.createdAt.toDate && e.createdAt.toDate().toDateString() === today) todayCount++;

        const statusClass = (e.status === 'reviewed') ? 'reviewed' : 'new';
        const statusLabel = (e.status === 'reviewed') ? 'Reviewed' : 'New';

        rowsHtml += `
          <tr>
            <td>${escapeHtml(e.studentName || '—')}</td>
            <td>${escapeHtml(e.parentName || '—')}</td>
            <td>${escapeHtml(e.mobile || '—')}</td>
            <td>${escapeHtml(e.classApplying || '—')}</td>
            <td>${escapeHtml(e.message || '—')}</td>
            <td><span class="badge ${statusClass}">${statusLabel}</span></td>
            <td>${formatDate(e.createdAt)}</td>
          </tr>`;
      });

      rowsEl.innerHTML = rowsHtml;
      totalCountEl.textContent = snapshot.size;
      newCountEl.textContent = newCount;
      todayCountEl.textContent = todayCount;
    }, (err) => {
      console.error(err);
      rowsEl.innerHTML = `<tr><td colspan="7" class="empty-row">Couldn't load enquiries: ${escapeHtml(err.message)}</td></tr>`;
    });
}

// --- Admission applications ---
function loadAdmissions() {
  const rowsEl = document.getElementById('admissionRows');
  const totalEl = document.getElementById('admTotalCount');
  const newEl = document.getElementById('admNewCount');
  const todayEl = document.getElementById('admTodayCount');

  db.collection('admissionApplications')
    .orderBy('createdAt', 'desc')
    .onSnapshot((snapshot) => {
      if (snapshot.empty) {
        rowsEl.innerHTML = '<tr><td colspan="12" class="empty-row">No applications yet. New admission forms will appear here.</td></tr>';
        totalEl.textContent = '0';
        newEl.textContent = '0';
        todayEl.textContent = '0';
        return;
      }

      let rowsHtml = '';
      let newCount = 0;
      let todayCount = 0;
      const today = new Date().toDateString();

      snapshot.forEach((doc) => {
        const a = doc.data();
        if (a.status === 'new' || !a.status) newCount++;
        if (a.createdAt && a.createdAt.toDate && a.createdAt.toDate().toDateString() === today) todayCount++;

        rowsHtml += `
          <tr>
            <td>${escapeHtml(a.studentName || '—')}</td>
            <td>${escapeHtml(a.age || '—')}</td>
            <td>${escapeHtml(a.gender || '—')}</td>
            <td>${a.admissionClass ? 'Class ' + escapeHtml(a.admissionClass) : '—'}</td>
            <td>${escapeHtml(a.prevPercent || '—')}</td>
            <td>${escapeHtml(a.dob || '—')}</td>
            <td>${escapeHtml(a.caste || '—')}</td>
            <td>${escapeHtml(a.religion || '—')}</td>
            <td>${escapeHtml(formatAadhar(a.aadhar))}</td>
            <td>${escapeHtml(a.contact || '—')}</td>
            <td>${escapeHtml(a.address || '—')}</td>
            <td>${formatDate(a.createdAt)}</td>
          </tr>`;
      });

      rowsEl.innerHTML = rowsHtml;
      totalEl.textContent = snapshot.size;
      newEl.textContent = newCount;
      todayEl.textContent = todayCount;
    }, (err) => {
      console.error(err);
      rowsEl.innerHTML = `<tr><td colspan="12" class="empty-row">Couldn't load applications: ${escapeHtml(err.message)}</td></tr>`;
    });
}
