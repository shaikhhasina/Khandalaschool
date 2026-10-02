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
// Every field saved by the admission form, in the order shown in the detail panel and the CSV file.
const ADM_GROUPS = [
  ['Student', [
    ['studentName', "Student's full name"], ['aadhar', 'Aadhar number'], ['gender', 'Gender'],
    ['admissionClass', 'Admission in class'], ['prevPercent', 'Previous percentage'],
    ['religion', 'Religion'], ['caste', 'Caste'], ['backwardDetails', 'Backward class details'],
    ['nationality', 'Nationality']
  ]],
  ['Birth details', [
    ['dob', 'Date of birth (figures)'], ['dobWords', 'Date of birth (words)'], ['age', 'Age'],
    ['birthPlace', 'Place of birth'], ['birthTaluka', 'Taluka'], ['birthDistrict', 'District']
  ]],
  ['Parents and address', [
    ['motherName', "Mother's name"], ['motherMobile', "Mother's mobile"], ['fatherMobile', "Father's mobile"],
    ['address', 'Permanent address']
  ]],
  ['Declaration', [
    ['declarationAccepted', 'Declaration accepted'], ['place', 'Place']
  ]],
  ['Application', [
    ['status', 'Status'], ['createdAt', 'Received']
  ]]
];

// Text value of one field. Applications saved with the old form still work
// (they have "contact" instead of motherMobile and no birth/parent details).
function admVal(a, key) {
  switch (key) {
    case 'aadhar': return a.aadhar ? formatAadhar(a.aadhar) : '';
    case 'admissionClass': return a.admissionClass ? 'Class ' + a.admissionClass : '';
    case 'motherMobile': return a.motherMobile || a.contact || '';
    case 'dob': return a.dob ? String(a.dob).split('-').reverse().join('-') : '';
    case 'declarationAccepted': return a.declarationAccepted ? 'Yes' : '';
    case 'status': return a.status === 'reviewed' ? 'Reviewed' : 'New';
    case 'createdAt': return a.createdAt ? formatDate(a.createdAt) : '';
    default: return (a[key] === undefined || a[key] === null) ? '' : String(a[key]);
  }
}
const show = (v) => escapeHtml(v === '' ? '—' : v);

const admRowsEl = document.getElementById('admissionRows');
const admSearchEl = document.getElementById('admSearch');
const detailModal = document.getElementById('detailModal');
const detailBody = document.getElementById('detailBody');
const detailTitle = document.getElementById('detailTitle');
let admDocs = [];   // [{ id, data }]

function renderAdmissions() {
  if (admDocs.length === 0) {
    admRowsEl.innerHTML = '<tr><td colspan="8" class="empty-row">No applications yet. New admission forms will appear here.</td></tr>';
    return;
  }
  const q = (admSearchEl.value || '').trim().toLowerCase();
  const list = admDocs.filter(({ data: a }) => {
    if (!q) return true;
    const hay = [a.studentName, a.motherName, a.motherMobile, a.fatherMobile, a.contact, a.aadhar].join(' ').toLowerCase();
    return hay.includes(q);
  });
  if (list.length === 0) {
    admRowsEl.innerHTML = '<tr><td colspan="8" class="empty-row">No applications match your search.</td></tr>';
    return;
  }
  admRowsEl.innerHTML = list.map(({ id, data: a }) => `
    <tr>
      <td>${show(admVal(a, 'studentName'))}</td>
      <td>${show(admVal(a, 'admissionClass'))}</td>
      <td>${show(admVal(a, 'dob'))}</td>
      <td>${show(admVal(a, 'motherName'))}</td>
      <td>${show(admVal(a, 'motherMobile'))}</td>
      <td>${show(admVal(a, 'fatherMobile'))}</td>
      <td>${show(admVal(a, 'createdAt'))}</td>
      <td><button type="button" class="btn-view" data-id="${escapeHtml(id)}">View</button></td>
    </tr>`).join('');
}

admSearchEl.addEventListener('input', renderAdmissions);

// --- Detail panel: shows every field of one application ---
admRowsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-view');
  if (!btn) return;
  const item = admDocs.find((d) => d.id === btn.dataset.id);
  if (!item) return;
  const a = item.data;
  detailTitle.textContent = a.studentName || 'Application';
  detailBody.innerHTML = ADM_GROUPS.map(([title, fields]) => `
    <h3>${escapeHtml(title)}</h3>
    <dl class="detail-grid">
      ${fields.map(([key, label]) => `
        <div${key === 'address' || key === 'dobWords' ? ' class="full"' : ''}>
          <dt>${escapeHtml(label)}</dt>
          <dd>${show(admVal(a, key))}</dd>
        </div>`).join('')}
    </dl>`).join('');
  detailModal.hidden = false;
});
function closeDetail() { detailModal.hidden = true; }
document.getElementById('detailClose').addEventListener('click', closeDetail);
detailModal.addEventListener('click', (e) => { if (e.target === detailModal) closeDetail(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDetail(); });

// --- Download all applications as a CSV file (opens in Excel) ---
function csvCell(v) {
  v = String(v == null ? '' : v);
  if (/^[=+\-@]/.test(v)) v = "'" + v;   // stop Excel treating text as a formula
  return '"' + v.replace(/"/g, '""') + '"';
}
document.getElementById('admDownload').addEventListener('click', () => {
  if (admDocs.length === 0) { alert('There are no applications to download yet.'); return; }
  const fields = ADM_GROUPS.flatMap(([, f]) => f);
  const lines = [fields.map(([, label]) => csvCell(label)).join(',')];
  admDocs.forEach(({ data: a }) => {
    lines.push(fields.map(([key]) => csvCell(admVal(a, key))).join(','));
  });
  const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'admission-applications-' + new Date().toISOString().slice(0, 10) + '.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
});

function loadAdmissions() {
  const totalEl = document.getElementById('admTotalCount');
  const newEl = document.getElementById('admNewCount');
  const todayEl = document.getElementById('admTodayCount');

  db.collection('admissionApplications')
    .orderBy('createdAt', 'desc')
    .onSnapshot((snapshot) => {
      admDocs = snapshot.docs.map((d) => ({ id: d.id, data: d.data() }));

      let newCount = 0;
      let todayCount = 0;
      const today = new Date().toDateString();
      admDocs.forEach(({ data: a }) => {
        if (a.status === 'new' || !a.status) newCount++;
        if (a.createdAt && a.createdAt.toDate && a.createdAt.toDate().toDateString() === today) todayCount++;
      });
      totalEl.textContent = admDocs.length;
      newEl.textContent = newCount;
      todayEl.textContent = todayCount;

      renderAdmissions();
    }, (err) => {
      console.error(err);
      admRowsEl.innerHTML = `<tr><td colspan="8" class="empty-row">Couldn't load applications: ${escapeHtml(err.message)}</td></tr>`;
    });
}
