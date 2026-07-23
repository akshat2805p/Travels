// =======================
// Jai Kashi Tours — Unified Dashboard
// Handles both Admin and User roles
// =======================

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    window.location.href = 'index.html#login';
    return;
  }

  const user = JSON.parse(userStr);

  // Populate sidebar identity
  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-avatar').textContent = user.name.charAt(0).toUpperCase();
  document.getElementById('user-id').textContent = `ID: ${user.id}`;

  if (user.role === 'admin') {
    // ── Admin flow ──
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'flex');
    document.querySelectorAll('.user-only').forEach(el => el.style.display = 'none');
    switchPanel('users');
    fetchUsers();
    fetchFinances();
    fetchLogs();
  } else {
    // ── Normal user flow ──
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    switchPanel('profile');

    // Populate profile
    try {
      const res = await fetch(getApiUrl('/api/user/me'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const me = await res.json();
      if (!me.error) {
        const pName = document.getElementById('profile-name');
        const pEmail = document.getElementById('profile-email');
        const pDate = document.getElementById('profile-date');
        const wBal = document.getElementById('wallet-balance');
        if (pName) pName.textContent = me.name;
        if (pEmail) pEmail.textContent = me.email;
        if (pDate) pDate.textContent = new Date(me.created_at).toLocaleDateString();
        if (wBal) wBal.textContent = `₹${me.balance || 0}`;
      }
    } catch (e) {
      console.error('Profile fetch error', e);
    }

    // Fetch bookings
    fetchBookings();
  }
});

// =======================
// Navigation
// =======================
window.switchPanel = function (panelId) {
  document.querySelectorAll('.sidebar-link').forEach(el => el.classList.remove('active'));
  const linkEl = document.getElementById('link-' + panelId);
  if (linkEl) linkEl.classList.add('active');

  document.querySelectorAll('.dashboard-panel').forEach(el => el.classList.remove('active'));
  const panelEl = document.getElementById('panel-' + panelId);
  if (panelEl) panelEl.classList.add('active');
};

window.handleLogout = function () {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  window.location.href = 'index.html';
};

// =======================
// User: Bookings
// =======================
async function fetchBookings() {
  const token = localStorage.getItem('token');
  try {
    const bRes = await fetch(getApiUrl('/api/user/bookings'), {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const bookings = await bRes.json();
    const container = document.getElementById('bookings-list');
    if (!container) return;

    if (!bookings || bookings.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted);">No bookings found.</p>';
    } else {
      container.innerHTML = bookings.map(b => `
        <div class="booking-item">
          <div>
            <h4 style="color: var(--text-primary); margin-bottom: 5px;">${b.package_name}</h4>
            <p style="font-size: 0.85rem; color: var(--text-secondary);"><i class="fas fa-calendar"></i> ${b.date}</p>
          </div>
          <div style="text-align: right;">
            <p style="font-weight: bold; color: var(--primary);">₹${b.price}</p>
            <p style="font-size: 0.8rem; color: ${b.status === 'Upcoming' ? '#3498db' : '#25d366'};">${b.status}</p>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Bookings fetch error', err);
  }
}

// =======================
// User: Wallet
// =======================
window.addFunds = async function () {
  const amount = prompt("Enter amount to add to wallet (₹):");
  if (!amount || isNaN(amount) || amount <= 0) return alert("Invalid amount.");

  const token = localStorage.getItem('token');
  try {
    const res = await fetch(getApiUrl('/api/user/add_funds'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount: Number(amount) })
    });
    const data = await res.json();
    if (data.error) return alert(data.error);
    alert(data.message);
    window.location.reload();
  } catch (err) {
    alert("Server error.");
  }
};

// =======================
// User: Messages
// =======================
window.sendMessage = function () {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  const subject = encodeURIComponent("Inquiry from Dashboard");
  const body = encodeURIComponent(text);
  window.location.href = `mailto:admin@jaikashitours.com?subject=${subject}&body=${body}`;
  input.value = '';
};

// =======================
// Admin: Fetch Logs
// =======================
async function fetchLogs() {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(getApiUrl('/api/admin/logs'), {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const logs = await res.json();
    const tbody = document.getElementById('logs-table-body');
    if (!tbody) return;

    if (!logs || logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">No track records found.</td></tr>';
      return;
    }

    tbody.innerHTML = logs.map(l => `
      <tr>
        <td>${new Date(l.timestamp).toLocaleString()}</td>
        <td>${l.name || 'Unknown'}</td>
        <td>${l.email || 'N/A'}</td>
        <td><span style="background: var(--primary); color: var(--dark); padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">${l.action}</span></td>
        <td>${l.details || ''}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error("Error fetching logs", err);
  }
}

// =======================
// Admin: Fetch Users
// =======================
async function fetchUsers() {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(getApiUrl('/api/admin/users'), {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const users = await res.json();
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    tbody.innerHTML = users.map(u => `
      <tr>
        <td>${u.id}</td>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td><span style="background: ${u.role === 'admin' ? 'var(--accent)' : 'rgba(52,152,219,0.2)'}; color: ${u.role === 'admin' ? '#fff' : '#3498db'}; padding: 3px 10px; border-radius: 4px; font-size: 0.8rem;">${u.role}</span></td>
        <td>₹${u.balance}</td>
        <td>
          ${u.role !== 'admin' ? `<button class="rb-btn rb-btn-danger" onclick="deleteUser(${u.id})"><i class="fas fa-trash-alt"></i> Delete</button>` : '<span style="color:#3a3830;">—</span>'}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

window.deleteUser = async function (id) {
  if (!confirm("Are you sure you want to delete this user?")) return;
  const token = localStorage.getItem('token');
  try {
    await fetch(getApiUrl(`/api/admin/users/${id}`), {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    alert("User deleted.");
    fetchUsers();
  } catch (err) {
    alert("Error deleting user.");
  }
};

// =======================
// Admin: Finance
// =======================
async function fetchFinances() {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(getApiUrl('/api/admin/finance'), {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const finances = await res.json();

    let income = 0;
    let expense = 0;

    const tbody = document.getElementById('finance-table-body');
    if (tbody) {
      tbody.innerHTML = finances.map(f => {
        if (f.type === 'income') income += f.amount;
        else expense += f.amount;
        return `
          <tr>
            <td>${new Date(f.date).toLocaleDateString()}</td>
            <td style="color: ${f.type === 'income' ? '#25d366' : '#e74c3c'}">${f.type.toUpperCase()}</td>
            <td>${f.description}</td>
            <td>₹${f.amount}</td>
          </tr>
        `;
      }).join('');
    }

    const incEl = document.getElementById('total-income');
    const expEl = document.getElementById('total-expense');
    const netEl = document.getElementById('net-profit');
    if (incEl) incEl.textContent = `₹${income}`;
    if (expEl) expEl.textContent = `₹${expense}`;
    if (netEl) netEl.textContent = `₹${income - expense}`;
  } catch (err) {
    console.error(err);
  }
}

window.addTransaction = async function () {
  const type = document.getElementById('trans-type').value;
  const amount = document.getElementById('trans-amount').value;
  const desc = document.getElementById('trans-desc').value;

  if (!amount || !desc) return alert("Please fill all fields.");

  const token = localStorage.getItem('token');
  try {
    await fetch(getApiUrl('/api/admin/finance'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type, amount: Number(amount), description: desc })
    });
    alert("Transaction added!");
    document.getElementById('trans-amount').value = '';
    document.getElementById('trans-desc').value = '';
    fetchFinances();
  } catch (err) {
    alert("Error adding transaction.");
  }
};

// =======================
// Admin: Excel Backup
// =======================
window.downloadBackup = async function () {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(getApiUrl('/api/admin/export'), {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Export failed");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "JaiKashi_Backup.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    alert("Failed to download backup.");
  }
};

// =======================
// Map & Tracking (Google Maps iFrame)
// =======================
window.trackMe = function (e) {
  if (e) e.preventDefault();
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const iframe = document.getElementById('map-iframe');
      if (iframe) {
        iframe.src = `https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      }
    },
    () => {
      alert("Unable to retrieve your location. Ensure permissions are granted.");
    }
  );
};

window.searchLocation = async function (e) {
  if (e) e.preventDefault();
  const query = document.getElementById('map-search').value;
  if (!query) return;

  try {
    const token = localStorage.getItem('token');
    fetch(getApiUrl('/api/user/track_search'), {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ location: query })
    }).catch(err => console.error("Tracking error", err));

    const iframe = document.getElementById('map-iframe');
    if (iframe) {
      iframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
    }
  } catch (err) {
    alert("Error searching location.");
  }
};

