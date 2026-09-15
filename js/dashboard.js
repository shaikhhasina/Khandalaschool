// ==========================================================================
// Dashboard: auth guard + live enquiries list from Firestore
// ==========================================================================

const userEmailEl = document.getElementById('userEmail');
const rowsEl = document.getElementById('enquiryRows');
const totalCountEl = document.getElementById('totalCount');
const newCountEl = document.getElementById('newCount');
const todayCountEl = document.getElementById('todayCount');
const logoutLink = document.getElementById('logoutLink');

// --- Auth guard: bounce to login if not signed in ---
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  userEmailEl.textContent = user.email;
  loadEnquiries();
});

logoutLink.addEventListener('click', async (e) => {
  e.preventDefault();
  await auth.signOut();
  window.location.href = 'login.html';
});

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
         ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function loadEnquiries() {
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

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
