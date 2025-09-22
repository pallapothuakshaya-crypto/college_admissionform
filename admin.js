const loginBtn = document.getElementById('loginBtn');
const loginMsg = document.getElementById('loginMsg');
const loginBox = document.getElementById('loginBox');
const dashboard = document.getElementById('dashboard');
const passwordInput = document.getElementById('password');
const tableBody = document.querySelector('#submissionsTable tbody');
const searchInput = document.getElementById('search');
const exportBtn = document.getElementById('exportBtn');

let submissionsCache = [];

loginBtn.addEventListener('click', login);

function getAuthHeader() {
  const pass = localStorage.getItem('admin_pass') || passwordInput.value;
  return pass ? { 'x-admin-pass': pass } : {};
}

async function login() {
  const pass = passwordInput.value.trim();
  if (!pass) {
    loginMsg.textContent = 'Enter password';
    return;
  }

  // Try to fetch submissions with provided password
  try {
    const res = await fetch('/api/submissions', {
      headers: getAuthHeader()
    });

    if (res.status === 401) {
      loginMsg.textContent = 'Wrong password';
      return;
    }

    const data = await res.json();
    localStorage.setItem('admin_pass', pass);
    loginBox.style.display = 'none';
    dashboard.style.display = 'block';
    submissionsCache = data;
    renderTable(data);
  } catch (err) {
    loginMsg.textContent = 'Error logging in';
    console.error(err);
  }
}

async function loadSubmissions() {
  try {
    const res = await fetch('/api/submissions', { headers: getAuthHeader() });
    if (res.status === 401) {
      alert('Session expired or wrong password. Re-login.');
      localStorage.removeItem('admin_pass');
      dashboard.style.display = 'none';
      loginBox.style.display = 'block';
      return;
    }
    const data = await res.json();
    submissionsCache = data;
    renderTable(data);
  } catch (err) {
    console.error(err);
  }
}

function renderTable(data) {
  const q = (searchInput?.value || '').toLowerCase();
  const filtered = data.filter(d => {
    return !q || d.name.toLowerCase().includes(q) || d.course.toLowerCase().includes(q);
  });

  tableBody.innerHTML = '';
  filtered.forEach(row => {
    const tr = document.createElement('tr');

    const photoTd = document.createElement('td');
    const img = document.createElement('img');
    img.src = row.photo || '';
    img.alt = row.name;
    photoTd.appendChild(img);

    const time = new Date(row.time).toLocaleString();

    tr.innerHTML = `
      <td></td>
      <td>${escapeHtml(row.name)}</td>
      <td>${escapeHtml(row.course)}</td>
      <td>${escapeHtml(row.email)}</td>
      <td>${escapeHtml(row.phone)}</td>
      <td>${time}</td>
    `;

    tr.firstChild.replaceWith(photoTd); // replace the empty first td with photoTd
    tableBody.appendChild(tr);

    // click photo to download
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => {
      downloadDataUrl(row.photo, `${row.name.replace(/\s+/g,'_')}_photo.png`);
    });
  });
}

function escapeHtml(str='') {
  return (''+str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function downloadDataUrl(dataUrl, filename){
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

searchInput?.addEventListener('input', () => renderTable(submissionsCache));
exportBtn?.addEventListener('click', () => {
  if (!submissionsCache.length) return alert('No data to export');
  const rows = submissionsCache.map(r => [r.name, r.course, r.email, r.phone, r.address, r.dob, r.gender, new Date(r.time).toISOString()]);
  const csv = [['Name','Course','Email','Phone','Address','DOB','Gender','Time'], ...rows]
    .map(r => r.map(cell => `"${(''+cell).replace(/"/g,'""')}"`).join(',')).join('\n');

  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'submissions.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// If admin already logged in (saved in localStorage), auto load
if (localStorage.getItem('admin_pass')) {
  document.getElementById('password').value = localStorage.getItem('admin_pass') || '';
  login();
}
