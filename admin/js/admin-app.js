// ===== NAIRE ADMIN PANEL =====
// ===== STATE =====
let adminUser = null;
let allData = { members: [], affiliates: [], withdrawals: [], redemptions: [], prizes: [], packages: [], quizzes: [] };
let currentPage = 'dashboard';

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  checkSession();
});

// ===== AUTH =====
async function checkSession() {
  if (!supabase) return;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
      if (data?.is_admin) {
        adminUser = data;
        showAdminApp();
        return;
      }
    }
  } catch (e) { console.log('No active session'); }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  errorEl.textContent = '';

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError || !userRecord?.is_admin) {
      await supabase.auth.signOut();
      errorEl.textContent = '⛔ Akun ini tidak memiliki akses Admin.';
      return;
    }

    adminUser = userRecord;
    showAdminApp();
  } catch (err) {
    errorEl.textContent = err.message || 'Login gagal. Periksa email dan sandi.';
  }
}

async function handleLogout() {
  if (!confirm('Yakin ingin keluar dari Admin Panel?')) return;
  await supabase.auth.signOut();
  adminUser = null;
  document.getElementById('adminApp').classList.remove('active');
  document.getElementById('loginScreen').classList.add('active');
}

function showAdminApp() {
  document.getElementById('loginScreen').classList.remove('active');
  document.getElementById('adminApp').classList.add('active');
  document.getElementById('adminName').textContent = adminUser.name || 'Admin';
  document.getElementById('adminAvatar').textContent = (adminUser.name || 'A')[0].toUpperCase();
  loadAllData().then(() => navigateTo('dashboard'));
}

// ===== SIDEBAR =====
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
}

// ===== NAVIGATION =====
function navigateTo(page) {
  currentPage = page;
  
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');

  const titles = {
    dashboard: { title: 'Dashboard', sub: 'Ringkasan data platform Naire' },
    members: { title: 'Data Member', sub: 'Kelola semua pengguna terdaftar' },
    affiliates: { title: 'Affiliate', sub: 'Kelola program affiliate multi-level' },
    withdrawals: { title: 'Penarikan Saldo', sub: 'Kelola permintaan penarikan' },
    redemptions: { title: 'Penukaran Hadiah', sub: 'Kelola penukaran koin ke hadiah' },
    prizes: { title: 'Kelola Hadiah', sub: 'Tambah, edit, atau hapus hadiah' },
    packages: { title: 'Paket Langganan', sub: 'Kelola paket yang tersedia' },
    quizzes: { title: 'Aktivitas Kuis', sub: 'Lihat aktivitas kuis pengguna' },
    settings: { title: 'Pengaturan', sub: 'Konfigurasi platform' },
  };
  
  document.getElementById('pageTitle').textContent = titles[page]?.title || 'Dashboard';
  document.getElementById('pageSubtitle').textContent = titles[page]?.sub || '';

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');

  const renderers = {
    dashboard: renderDashboard,
    members: renderMembers,
    affiliates: renderAffiliates,
    withdrawals: renderWithdrawals,
    redemptions: renderRedemptions,
    prizes: renderPrizes,
    packages: renderPackages,
    quizzes: renderQuizzes,
    settings: renderSettings,
  };
  
  renderers[page]?.();
}

// ===== LOAD DATA =====
async function loadAllData() {
  try {
    const results = await Promise.allSettled([
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('referrals').select('*').order('created_at', { ascending: false }),
      supabase.from('withdrawals').select('*').order('created_at', { ascending: false }),
      supabase.from('redemptions').select('*').order('created_at', { ascending: false }),
      supabase.from('prizes').select('*').order('created_at', { ascending: false }),
      supabase.from('packages').select('*').order('created_at', { ascending: false }),
      supabase.from('quiz_attempts').select('*').order('created_at', { ascending: false }),
    ]);

    allData.members = results[0].status === 'fulfilled' ? results[0].value.data || [] : [];
    allData.affiliates = results[1].status === 'fulfilled' ? results[1].value.data || [] : [];
    allData.withdrawals = results[2].status === 'fulfilled' ? results[2].value.data || [] : [];
    allData.redemptions = results[3].status === 'fulfilled' ? results[3].value.data || [] : [];
    allData.prizes = results[4].status === 'fulfilled' ? results[4].value.data || [] : [];
    allData.packages = results[5].status === 'fulfilled' ? results[5].value.data || [] : [];
    allData.quizzes = results[6].status === 'fulfilled' ? results[6].value.data || [] : [];
  } catch (e) {
    console.error('Error loading data:', e);
    // Use fallback data
    loadFallbackData();
  }
}

function loadFallbackData() {
  allData.members = [
    { id: '1', name: 'Budi Santoso', email: 'budi@email.com', whatsapp: '08123456789', coins: 15000, xp: 12500, package: 'Paket 1 Tahun', referral_code: 'BUDI123', created_at: '2024-12-01' },
    { id: '2', name: 'Ani Lestari', email: 'ani@email.com', whatsapp: '08234567890', coins: 8500, xp: 7800, package: 'Paket 6 Bulan', referral_code: 'ANI456', created_at: '2024-12-15' },
    { id: '3', name: 'Citra Dewi', email: 'citra@email.com', whatsapp: '08345678901', coins: 22000, xp: 19500, package: 'Paket 1 Tahun', referral_code: 'CITRA789', created_at: '2025-01-05' },
    { id: '4', name: 'Dedi Kurniawan', email: 'dedi@email.com', whatsapp: '08456789012', coins: 3200, xp: 4100, package: 'Paket 1 Bulan', referral_code: 'DEDI012', created_at: '2025-01-20' },
    { id: '5', name: 'Eka Putri', email: 'eka@email.com', whatsapp: '08567890123', coins: 12800, xp: 11000, package: 'Paket 6 Bulan', referral_code: 'EKA345', created_at: '2025-02-01' },
  ];
  allData.affiliates = [
    { id: '1', referrer_name: 'Budi Santoso', referred_name: 'Ani Lestari', level: 1, commission: 6000, package: 'Paket 6 Bulan', created_at: '2024-12-20' },
    { id: '2', referrer_name: 'Budi Santoso', referred_name: 'Citra Dewi', level: 1, commission: 10000, package: 'Paket 1 Tahun', created_at: '2025-01-10' },
    { id: '3', referrer_name: 'Ani Lestari', referred_name: 'Dedi Kurniawan', level: 1, commission: 1500, package: 'Paket 1 Bulan', created_at: '2025-01-25' },
    { id: '4', referrer_name: 'Budi Santoso', referred_name: 'Eka Putri', level: 2, commission: 1000, package: 'Paket 6 Bulan', created_at: '2025-02-05' },
  ];
  allData.withdrawals = [
    { id: '1', user_name: 'Budi Santoso', amount: 50000, bank: 'BCA', account_number: '1234567890', status: 'completed', created_at: '2025-01-15' },
    { id: '2', user_name: 'Ani Lestari', amount: 25000, bank: 'Mandiri', account_number: '0987654321', status: 'pending', created_at: '2025-02-10' },
    { id: '3', user_name: 'Citra Dewi', amount: 100000, bank: 'BNI', account_number: '1122334455', status: 'rejected', created_at: '2025-02-15' },
  ];
  allData.redemptions = [
    { id: '1', user_name: 'Budi Santoso', prize_name: 'Saldo E-Wallet 50.000', coins_spent: 50000, status: 'completed', created_at: '2025-01-20' },
    { id: '2', user_name: 'Ani Lestari', prize_name: 'Topi Peci Premium', coins_spent: 50000, status: 'pending', created_at: '2025-02-05' },
    { id: '3', user_name: 'Eka Putri', prize_name: 'Kacamata Rayban', coins_spent: 200000, status: 'completed', created_at: '2025-02-18' },
  ];
  allData.prizes = [
    { id: '1', name: 'Mobil Honda Civic', description: 'Mobil Honda Civic baru 2025', coin_cost: 5000000, image: '🚗', category: 'Kendaraan', stock: 1, is_active: true, created_at: '2024-11-01' },
    { id: '2', name: 'Sepeda Listrik Quantum', description: 'Sepeda listrik lipat Quantum X1', coin_cost: 1500000, image: '🚲', category: 'Kendaraan', stock: 3, is_active: true, created_at: '2024-11-01' },
    { id: '3', name: 'Topi Peci Premium', description: 'Topi peci bahan wol premium', coin_cost: 50000, image: '🧢', category: 'Fashion', stock: 50, is_active: true, created_at: '2024-11-01' },
    { id: '4', name: 'Kacamata Rayban', description: 'Kacamata hitam polarised original', coin_cost: 200000, image: '🕶️', category: 'Aksesori', stock: 20, is_active: true, created_at: '2024-11-01' },
    { id: '5', name: 'Baju Polo Naire', description: 'Baju polo premium logo Naire', coin_cost: 75000, image: '👕', category: 'Fashion', stock: 100, is_active: true, created_at: '2024-11-01' },
    { id: '6', name: 'Celana Chinos Premium', description: 'Celana chinos fit modern', coin_cost: 100000, image: '👖', category: 'Fashion', stock: 75, is_active: true, created_at: '2024-11-01' },
    { id: '7', name: 'Sepatu Sneakers Sport', description: 'Sepatu sneakers pria/wanita', coin_cost: 300000, image: '👟', category: 'Olahraga', stock: 30, is_active: true, created_at: '2024-11-01' },
    { id: '8', name: 'Sandal Kulit Premium', description: 'Sandal kulit asli untuk sehari-hari', coin_cost: 50000, image: '🩴', category: 'Olahraga', stock: 60, is_active: true, created_at: '2024-11-01' },
    { id: '9', name: 'Saldo E-Wallet 50.000', description: 'Saldo GoPay/OVO/Dana 50rb', coin_cost: 50000, image: '💳', category: 'Saldo', stock: 999, is_active: true, created_at: '2024-11-01' },
    { id: '10', name: 'Saldo E-Wallet 500.000', description: 'Saldo GoPay/OVO/Dana 500rb', coin_cost: 500000, image: '💳', category: 'Saldo', stock: 999, is_active: true, created_at: '2024-11-01' },
    { id: '11', name: 'Saldo E-Wallet 1.000.000', description: 'Saldo GoPay/OVO/Dana 1jt', coin_cost: 1000000, image: '💳', category: 'Saldo', stock: 999, is_active: true, created_at: '2024-11-01' },
    { id: '12', name: 'Saldo E-Wallet 5.000.000', description: 'Saldo GoPay/OVO/Dana 5jt', coin_cost: 5000000, image: '💳', category: 'Saldo', stock: 999, is_active: true, created_at: '2024-11-01' },
  ];
  allData.packages = [
    { id: '1', name: 'Paket 1 Bulan', price: 15000, duration_days: 30, description: 'Akses kuis harian + 500 koin bulanan', is_active: true, created_at: '2024-11-01' },
    { id: '2', name: 'Paket 6 Bulan', price: 60000, duration_days: 180, description: 'Akses kuis harian + 1000 koin bulanan + hadiah eksklusif', is_active: true, created_at: '2024-11-01' },
    { id: '3', name: 'Paket 1 Tahun', price: 100000, duration_days: 365, description: 'Akses kuis harian + 2000 koin bulanan + hadiah premium + prioritas', is_active: true, created_at: '2024-11-01' },
  ];
  allData.quizzes = [
    { id: '1', user_name: 'Budi Santoso', category: 'Sejarah', score: 80, points_earned: 40, created_at: '2025-02-15' },
    { id: '2', user_name: 'Ani Lestari', category: 'Sains', score: 100, points_earned: 50, created_at: '2025-02-15' },
    { id: '3', user_name: 'Citra Dewi', category: 'Matematika', score: 60, points_earned: 30, created_at: '2025-02-14' },
    { id: '4', user_name: 'Dedi Kurniawan', category: 'Geografi', score: 90, points_earned: 45, created_at: '2025-02-14' },
    { id: '5', user_name: 'Eka Putri', category: 'Sejarah', score: 70, points_earned: 35, created_at: '2025-02-13' },
  ];
}

// ===== TOAST =====
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===== REFRESH =====
async function refreshData() {
  showToast('🔄 Memuat ulang data...', 'info');
  await loadAllData();
  navigateTo(currentPage);
  showToast('✅ Data berhasil dimuat ulang', 'success');
}

// ===== SEARCH =====
function globalSearch(query) {
  // Simple highlight - in real app, filter the current table rows
  const rows = document.querySelectorAll('tbody tr');
  if (!query.trim()) {
    rows.forEach(r => r.style.display = '');
    return;
  }
  
  const q = query.toLowerCase().trim();
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(q) ? '' : 'none';
  });
}

// ===== FORMAT HELPERS =====
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatCurrency(num) {
  if (!num) return 'Rp 0';
  return 'Rp ' + Number(num).toLocaleString('id-ID');
}

function formatNumber(num) {
  return Number(num || 0).toLocaleString('id-ID');
}

// ==========================================
// ===== PAGE RENDERERS =====
// ==========================================

// ===== DASHBOARD =====
function renderDashboard() {
  const totalMembers = allData.members.length;
  const totalAffiliates = allData.affiliates.filter(a => a.level === 1).length;
  const totalWithdrawals = allData.withdrawals.filter(w => w.status === 'pending').length;
  const totalRedemptions = allData.redemptions.filter(r => r.status === 'pending').length;
  const totalPrizes = allData.prizes.length;
  const totalRevenue = allData.members.reduce((sum, m) => {
    const pkg = allData.packages.find(p => p.name === m.package);
    return sum + (pkg?.price || 0);
  }, 0);
  const totalCoinsCirculated = allData.members.reduce((sum, m) => sum + (m.coins || 0), 0);
  const totalCommissions = allData.affiliates.reduce((sum, a) => sum + (a.commission || 0), 0);
  const recentMembers = [...allData.members].slice(0, 5);
  const recentActivity = [
    ...allData.withdrawals.map(w => ({ type: 'withdrawal', text: `Penarikan ${formatCurrency(w.amount)} oleh ${w.user_name}`, status: w.status, time: w.created_at })),
    ...allData.redemptions.map(r => ({ type: 'redemption', text: `${r.user_name} menukar ${r.prize_name}`, status: r.status, time: r.created_at })),
    ...allData.quizzes.slice(0, 5).map(q => ({ type: 'quiz', text: `${q.user_name} menyelesaikan kuis ${q.category} (${q.score}%)`, status: 'completed', time: q.created_at })),
  ].sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0)).slice(0, 8);

  const el = document.getElementById('pageContent');
  el.innerHTML = `
    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">👥</div>
        <div class="stat-info">
          <div class="stat-label">Total Member</div>
          <div class="stat-value">${formatNumber(totalMembers)}</div>
          <div class="stat-change up">↑ Aktif</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">💰</div>
        <div class="stat-info">
          <div class="stat-label">Total Pendapatan</div>
          <div class="stat-value">${formatCurrency(totalRevenue)}</div>
          <div class="stat-change up">↑ Dari paket</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">🔗</div>
        <div class="stat-info">
          <div class="stat-label">Affiliate Aktif</div>
          <div class="stat-value">${formatNumber(totalAffiliates)}</div>
          <div class="stat-change up">↑ ${formatCurrency(totalCommissions)} komisi</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple">🏆</div>
        <div class="stat-info">
          <div class="stat-label">Total Hadiah</div>
          <div class="stat-value">${formatNumber(totalPrizes)}</div>
          <div class="stat-change">${formatNumber(totalCoinsCirculated)} koin beredar</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red">💰</div>
        <div class="stat-info">
          <div class="stat-label">Penarikan Menunggu</div>
          <div class="stat-value">${formatNumber(totalWithdrawals)}</div>
          <div class="stat-change ${totalWithdrawals > 0 ? 'down' : 'up'}">${totalWithdrawals > 0 ? '⚠️ Perlu diproses' : '✅ Tidak ada'}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon yellow">🎁</div>
        <div class="stat-info">
          <div class="stat-label">Penukaran Menunggu</div>
          <div class="stat-value">${formatNumber(totalRedemptions)}</div>
          <div class="stat-change ${totalRedemptions > 0 ? 'down' : 'up'}">${totalRedemptions > 0 ? '⚠️ Perlu diproses' : '✅ Tidak ada'}</div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <button class="quick-action" onclick="navigateTo('members')">
        <span class="qa-icon">👥</span> Lihat Member
      </button>
      <button class="quick-action" onclick="navigateTo('prizes')">
        <span class="qa-icon">🏆</span> Kelola Hadiah
      </button>
      <button class="quick-action" onclick="navigateTo('withdrawals')">
        <span class="qa-icon">💰</span> Penarikan
      </button>
      <button class="quick-action" onclick="openAddPrizeModal()">
        <span class="qa-icon">➕</span> Tambah Hadiah
      </button>
      <button class="quick-action" onclick="openAddPackageModal()">
        <span class="qa-icon">📦</span> Tambah Paket
      </button>
      <button class="quick-action" onclick="openMakeAdminModal()">
        <span class="qa-icon">🔐</span> Jadikan Admin
      </button>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
      <!-- Recent Members -->
      <div class="table-card">
        <div class="table-header">
          <h3>👥 Member Terbaru</h3>
          <button class="btn-sm" onclick="navigateTo('members')">Lihat Semua</button>
        </div>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Paket</th>
                <th>Koin</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              ${recentMembers.map(m => `
                <tr>
                  <td><strong>${m.name || '-'}</strong></td>
                  <td>${m.package || '-'}</td>
                  <td>${formatNumber(m.coins)}</td>
                  <td>${formatDate(m.created_at)}</td>
                </tr>
              `).join('') || '<tr><td colspan="4" class="empty-state">Belum ada data</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="table-card">
        <div class="table-header">
          <h3>🔄 Aktivitas Terbaru</h3>
        </div>
        <div class="activity-list">
          ${recentActivity.map(a => {
            const statusColors = { completed: 'bg-green-500', pending: 'bg-yellow-500', rejected: 'bg-red-500', processing: 'bg-blue-500' };
            return `
              <div class="activity-item">
                <div class="activity-dot ${statusColors[a.status] || 'bg-gray-400'}"></div>
                <div class="activity-content">
                  <div class="activity-text">${a.text}</div>
                  <div class="activity-time">${formatDate(a.time)}</div>
                </div>
              </div>
            `;
          }).join('') || '<div class="empty-state"><p>Belum ada aktivitas</p></div>'}
        </div>
      </div>
    </div>
  `;
}

// ===== MEMBERS =====
function renderMembers() {
  const el = document.getElementById('pageContent');
  el.innerHTML = `
    <div class="quick-actions">
      <button class="quick-action" onclick="openMakeAdminModal()">
        <span class="qa-icon">🔐</span> Jadikan Admin
      </button>
      <button class="quick-action" onclick="openAddCoinsModal()">
        <span class="qa-icon">🪙</span> Tambah Koin
      </button>
    </div>

    <div class="table-card">
      <div class="table-header">
        <h3>👥 Semua Member (${allData.members.length})</h3>
        <div class="table-actions">
          <button class="btn-sm" onclick="exportCSV('members')">📥 Export CSV</button>
        </div>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>WhatsApp</th>
              <th>Paket</th>
              <th>Koin</th>
              <th>XP</th>
              <th>Kode Referral</th>
              <th>Admin</th>
              <th>Tanggal Daftar</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${allData.members.map(m => `
              <tr>
                <td><strong>${m.name || '-'}</strong></td>
                <td>${m.email || '-'}</td>
                <td>${m.whatsapp || '-'}</td>
                <td>${m.package ? `<span class="badge badge-info">${m.package}</span>` : '-'}</td>
                <td>${formatNumber(m.coins)}</td>
                <td>${formatNumber(m.xp)}</td>
                <td><code style="font-size:11px;background:var(--gray-100);padding:2px 6px;border-radius:4px;">${m.referral_code || '-'}</code></td>
                <td>${m.is_admin ? '<span class="badge badge-success">✅ Admin</span>' : '<span class="badge badge-gray">User</span>'}</td>
                <td>${formatDate(m.created_at)}</td>
                <td>
                  <button class="btn-sm" onclick="viewMemberDetail('${m.id}')">👁️</button>
                  ${!m.is_admin ? `<button class="btn-sm success" onclick="quickMakeAdmin('${m.id}', '${m.name || m.email}')">🔐</button>` : ''}
                </td>
              </tr>
            `).join('') || '<tr><td colspan="10"><div class="empty-state"><h3>Belum ada member</h3></div></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function viewMemberDetail(id) {
  const member = allData.members.find(m => m.id === id);
  if (!member) return;
  
  const memberAffiliates = allData.affiliates.filter(a => a.referrer_name === member.name);
  const memberQuizzes = allData.quizzes.filter(q => q.user_name === member.name);
  const totalCommission = memberAffiliates.reduce((s, a) => s + (a.commission || 0), 0);

  openModal(`
    <h2>🔍 Detail Member</h2>
    <div style="display:grid;gap:16px;">
      <div style="display:flex;align-items:center;gap:16px;padding:16px;background:var(--gray-50);border-radius:12px;">
        <div style="width:56px;height:56px;border-radius:12px;background:linear-gradient(135deg,var(--primary),#7c3aed);display:flex;align-items:center;justify-content:center;font-size:24px;color:white;font-weight:700;">${(member.name || 'U')[0]}</div>
        <div>
          <div style="font-size:18px;font-weight:700;">${member.name || '-'}</div>
          <div style="font-size:13px;color:var(--gray-500);">${member.email || '-'}</div>
          <div style="font-size:13px;color:var(--gray-500);">📱 ${member.whatsapp || '-'}</div>
        </div>
      </div>
      
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
        <div style="padding:16px;background:var(--primary-bg);border-radius:12px;text-align:center;">
          <div style="font-size:22px;font-weight:800;color:var(--primary);">${formatNumber(member.coins)}</div>
          <div style="font-size:12px;color:var(--gray-500);">🪙 Koin</div>
        </div>
        <div style="padding:16px;background:var(--success-bg);border-radius:12px;text-align:center;">
          <div style="font-size:22px;font-weight:800;color:var(--success);">${formatNumber(member.xp)}</div>
          <div style="font-size:12px;color:var(--gray-500);">⭐ XP</div>
        </div>
        <div style="padding:16px;background:var(--info-bg);border-radius:12px;text-align:center;">
          <div style="font-size:22px;font-weight:800;color:var(--info);">${formatCurrency(totalCommission)}</div>
          <div style="font-size:12px;color:var(--gray-500);">💰 Komisi</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;">
        <div><strong>Paket:</strong> ${member.package || '-'}</div>
        <div><strong>Kode Referral:</strong> <code>${member.referral_code || '-'}</code></div>
        <div><strong>Tanggal Daftar:</strong> ${formatDate(member.created_at)}</div>
        <div><strong>Status Admin:</strong> ${member.is_admin ? '✅ Ya' : '❌ Tidak'}</div>
      </div>

      <div style="border-top:1px solid var(--gray-100);padding-top:16px;">
        <strong style="font-size:14px;">📊 Statistik Affiliate (${memberAffiliates.length} referral)</strong>
        ${memberAffiliates.length > 0 ? memberAffiliates.map(a => `
          <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;border-bottom:1px solid var(--gray-50);">
            <span>${a.referred_name} (Level ${a.level})</span>
            <span style="font-weight:600;color:var(--success);">+${formatCurrency(a.commission)}</span>
          </div>
        `).join('') : '<p style="color:var(--gray-400);font-size:13px;margin-top:8px;">Belum ada referral</p>'}
      </div>

      <div style="border-top:1px solid var(--gray-100);padding-top:16px;">
        <strong style="font-size:14px;">📝 Riwayat Kuis (${memberQuizzes.length})</strong>
        ${memberQuizzes.length > 0 ? memberQuizzes.map(q => `
          <div style="display:flex;justify-content:space-between;padding:8px 0;font-size:13px;border-bottom:1px solid var(--gray-50);">
            <span>${q.category}</span>
            <span>Skor: <strong>${q.score}%</strong> | +${q.points_earned} pts</span>
          </div>
        `).join('') : '<p style="color:var(--gray-400);font-size:13px;margin-top:8px;">Belum ada aktivitas kuis</p>'}
      </div>
    </div>
  `);
}

async function quickMakeAdmin(id, name) {
  if (!confirm(`Jadikan ${name} sebagai Admin?`)) return;
  try {
    await supabase.from('users').update({ is_admin: true }).eq('id', id);
    showToast(`✅ ${name} sekarang adalah Admin!`, 'success');
    await loadAllData();
    navigateTo('members');
  } catch (e) {
    showToast('❌ Gagal: ' + e.message, 'error');
  }
}

// ===== AFFILIATES =====
function renderAffiliates() {
  const totalCommission = allData.affiliates.reduce((s, a) => s + (a.commission || 0), 0);
  const level1Count = allData.affiliates.filter(a => a.level === 1).length;
  const level2Count = allData.affiliates.filter(a => a.level === 2).length;
  const level3Plus = allData.affiliates.filter(a => (a.level || 0) >= 3).length;

  const el = document.getElementById('pageContent');
  el.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon green">💰</div>
        <div class="stat-info">
          <div class="stat-label">Total Komisi Dibayarkan</div>
          <div class="stat-value">${formatCurrency(totalCommission)}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue">🔗</div>
        <div class="stat-info">
          <div class="stat-label">Level 1 (Langsung)</div>
          <div class="stat-value">${formatNumber(level1Count)}</div>
          <div class="stat-change up">10% komisi</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">🔗</div>
        <div class="stat-info">
          <div class="stat-label">Level 2+ (Multi-level)</div>
          <div class="stat-value">${formatNumber(level2Count + level3Plus)}</div>
          <div class="stat-change">${level2Count} level 2, ${level3Plus} level 3+</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple">📊</div>
        <div class="stat-info">
          <div class="stat-label">Total Transaksi Affiliate</div>
          <div class="stat-value">${formatNumber(allData.affiliates.length)}</div>
        </div>
      </div>
    </div>

    <div class="table-card">
      <div class="table-header">
        <h3>🔗 Riwayat Komisi Affiliate</h3>
        <div class="table-actions">
          <button class="btn-sm" onclick="exportCSV('affiliates')">📥 Export CSV</button>
        </div>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Referrer</th>
              <th>Referred</th>
              <th>Level</th>
              <th>Paket</th>
              <th>Komisi (10%)</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            ${allData.affiliates.map(a => `
              <tr>
                <td><strong>${a.referrer_name || '-'}</strong></td>
                <td>${a.referred_name || '-'}</td>
                <td><span class="badge ${a.level === 1 ? 'badge-success' : 'badge-info'}">Level ${a.level || 1}</span></td>
                <td>${a.package || '-'}</td>
                <td style="color:var(--success);font-weight:700;">+${formatCurrency(a.commission)}</td>
                <td>${formatDate(a.created_at)}</td>
              </tr>
            `).join('') || '<tr><td colspan="6"><div class="empty-state"><h3>Belum ada transaksi affiliate</h3></div></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ===== WITHDRAWALS =====
function renderWithdrawals() {
  const pending = allData.withdrawals.filter(w => w.status === 'pending');
  const processed = allData.withdrawals.filter(w => w.status !== 'pending');
  const totalPendingAmount = pending.reduce((s, w) => s + (w.amount || 0), 0);

  const el = document.getElementById('pageContent');
  el.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon orange">⏳</div>
        <div class="stat-info">
          <div class="stat-label">Menunggu Diproses</div>
          <div class="stat-value">${formatNumber(pending.length)}</div>
          <div class="stat-change down">${formatCurrency(totalPendingAmount)}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">✅</div>
        <div class="stat-info">
          <div class="stat-label">Telah Diproses</div>
          <div class="stat-value">${formatNumber(processed.filter(w => w.status === 'completed').length)}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red">❌</div>
        <div class="stat-info">
          <div class="stat-label">Ditolak</div>
          <div class="stat-value">${formatNumber(processed.filter(w => w.status === 'rejected').length)}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple">📊</div>
        <div class="stat-info">
          <div class="stat-label">Total Penarikan</div>
          <div class="stat-value">${formatNumber(allData.withdrawals.length)}</div>
        </div>
      </div>
    </div>

    <!-- Pending -->
    <div class="table-card">
      <div class="table-header">
        <h3>⏳ Penarikan Menunggu (${pending.length})</h3>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Jumlah</th>
              <th>Bank</th>
              <th>No. Rekening</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${pending.length > 0 ? pending.map(w => `
              <tr>
                <td><strong>${w.user_name || '-'}</strong></td>
                <td style="font-weight:700;color:var(--danger);">${formatCurrency(w.amount)}</td>
                <td>${w.bank || '-'}</td>
                <td><code>${w.account_number || '-'}</code></td>
                <td>${formatDate(w.created_at)}</td>
                <td>
                  <button class="btn-sm success" onclick="approveWithdrawal('${w.id}')">✅ Setujui</button>
                  <button class="btn-sm danger" onclick="rejectWithdrawal('${w.id}')">❌ Tolak</button>
                </td>
              </tr>
            `).join('') : '<tr><td colspan="6"><div class="empty-state"><h3>Tidak ada penarikan menunggu</h3><p>Semua permintaan sudah diproses</p></div></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Processed -->
    <div class="table-card">
      <div class="table-header">
        <h3>✅ Riwayat Penarikan</h3>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Jumlah</th>
              <th>Bank</th>
              <th>Status</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            ${processed.length > 0 ? processed.map(w => `
              <tr>
                <td><strong>${w.user_name || '-'}</strong></td>
                <td style="font-weight:700;">${formatCurrency(w.amount)}</td>
                <td>${w.bank || '-'}</td>
                <td>
                  ${w.status === 'completed' ? '<span class="badge badge-success">✅ Selesai</span>' : 
                    w.status === 'rejected' ? '<span class="badge badge-danger">❌ Ditolak</span>' : 
                    '<span class="badge badge-warning">⏳ Menunggu</span>'}
                </td>
                <td>${formatDate(w.created_at)}</td>
              </tr>
            `).join('') : '<tr><td colspan="5"><div class="empty-state"><h3>Belum ada riwayat</h3></div></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function approveWithdrawal(id) {
  if (!confirm('Setujui penarikan ini?')) return;
  try {
    await supabase.from('withdrawals').update({ status: 'completed' }).eq('id', id);
    showToast('✅ Penarikan disetujui!', 'success');
    await loadAllData();
    renderWithdrawals();
  } catch (e) {
    showToast('❌ Gagal: ' + e.message, 'error');
  }
}

async function rejectWithdrawal(id) {
  if (!confirm('Tolak penarikan ini?')) return;
  try {
    await supabase.from('withdrawals').update({ status: 'rejected' }).eq('id', id);
    showToast('❌ Penarikan ditolak', 'info');
    await loadAllData();
    renderWithdrawals();
  } catch (e) {
    showToast('❌ Gagal: ' + e.message, 'error');
  }
}

// ===== REDEMPTIONS =====
function renderRedemptions() {
  const pending = allData.redemptions.filter(r => r.status === 'pending');
  const processed = allData.redemptions.filter(r => r.status !== 'pending');

  const el = document.getElementById('pageContent');
  el.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon orange">⏳</div>
        <div class="stat-info">
          <div class="stat-label">Menunggu Diproses</div>
          <div class="stat-value">${formatNumber(pending.length)}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">✅</div>
        <div class="stat-info">
          <div class="stat-label">Telah Diproses</div>
          <div class="stat-value">${formatNumber(processed.filter(r => r.status === 'completed').length)}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple">🪙</div>
        <div class="stat-info">
          <div class="stat-label">Total Koin Ditukar</div>
          <div class="stat-value">${formatNumber(allData.redemptions.reduce((s, r) => s + (r.coins_spent || 0), 0))}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue">📊</div>
        <div class="stat-info">
          <div class="stat-label">Total Penukaran</div>
          <div class="stat-value">${formatNumber(allData.redemptions.length)}</div>
        </div>
      </div>
    </div>

    <!-- Pending -->
    <div class="table-card">
      <div class="table-header">
        <h3>⏳ Penukaran Menunggu (${pending.length})</h3>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Hadiah</th>
              <th>Koin Ditukar</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${pending.length > 0 ? pending.map(r => `
              <tr>
                <td><strong>${r.user_name || '-'}</strong></td>
                <td>${r.prize_name || '-'}</td>
                <td style="font-weight:700;">${formatNumber(r.coins_spent)} 🪙</td>
                <td>${formatDate(r.created_at)}</td>
                <td>
                  <button class="btn-sm success" onclick="approveRedemption('${r.id}')">✅ Setujui</button>
                  <button class="btn-sm danger" onclick="rejectRedemption('${r.id}')">❌ Tolak</button>
                </td>
              </tr>
            `).join('') : '<tr><td colspan="5"><div class="empty-state"><h3>Tidak ada penukaran menunggu</h3></div></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <!-- History -->
    <div class="table-card">
      <div class="table-header">
        <h3>✅ Riwayat Penukaran</h3>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Hadiah</th>
              <th>Koin</th>
              <th>Status</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            ${processed.length > 0 ? processed.map(r => `
              <tr>
                <td><strong>${r.user_name || '-'}</strong></td>
                <td>${r.prize_name || '-'}</td>
                <td>${formatNumber(r.coins_spent)} 🪙</td>
                <td>
                  ${r.status === 'completed' ? '<span class="badge badge-success">✅ Selesai</span>' : 
                    '<span class="badge badge-danger">❌ Ditolak</span>'}
                </td>
                <td>${formatDate(r.created_at)}</td>
              </tr>
            `).join('') : '<tr><td colspan="5"><div class="empty-state"><h3>Belum ada riwayat</h3></div></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function approveRedemption(id) {
  if (!confirm('Setujui penukaran hadiah ini?')) return;
  try {
    await supabase.from('redemptions').update({ status: 'completed' }).eq('id', id);
    showToast('✅ Penukaran disetujui!', 'success');
    await loadAllData();
    renderRedemptions();
  } catch (e) {
    showToast('❌ Gagal: ' + e.message, 'error');
  }
}

async function rejectRedemption(id) {
  if (!confirm('Tolak penukaran hadiah ini?')) return;
  try {
    await supabase.from('redemptions').update({ status: 'rejected' }).eq('id', id);
    showToast('❌ Penukaran ditolak', 'info');
    await loadAllData();
    renderRedemptions();
  } catch (e) {
    showToast('❌ Gagal: ' + e.message, 'error');
  }
}

// ===== PRIZES =====
function renderPrizes() {
  const active = allData.prizes.filter(p => p.is_active !== false);
  const inactive = allData.prizes.filter(p => p.is_active === false);

  const el = document.getElementById('pageContent');
  el.innerHTML = `
    <div class="quick-actions">
      <button class="quick-action" onclick="openAddPrizeModal()">
        <span class="qa-icon">➕</span> Tambah Hadiah
      </button>
    </div>

    <div class="table-card">
      <div class="table-header">
        <h3>🏆 Daftar Hadiah Aktif (${active.length})</h3>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Ikon</th>
              <th>Nama</th>
              <th>Kategori</th>
              <th>Koin Dibutuhkan</th>
              <th>Stok</th>
              <th>Deskripsi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${active.map(p => `
              <tr>
                <td style="font-size:24px;">${p.image || '🎁'}</td>
                <td><strong>${p.name}</strong></td>
                <td><span class="badge badge-info">${p.category || '-'}</span></td>
                <td style="font-weight:700;">${formatNumber(p.coin_cost)} 🪙</td>
                <td>${p.stock || 0}</td>
                <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.description || '-'}</td>
                <td>
                  <button class="btn-sm" onclick="openEditPrizeModal('${p.id}')">✏️</button>
                  <button class="btn-sm danger" onclick="togglePrize('${p.id}', '${p.name}', false)">🚫 Nonaktifkan</button>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="7"><div class="empty-state"><h3>Belum ada hadiah</h3></div></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    ${inactive.length > 0 ? `
    <div class="table-card">
      <div class="table-header">
        <h3>🚫 Hadiah Nonaktif (${inactive.length})</h3>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Ikon</th>
              <th>Nama</th>
              <th>Koin</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${inactive.map(p => `
              <tr>
                <td style="font-size:24px;">${p.image || '🎁'}</td>
                <td><strong>${p.name}</strong></td>
                <td>${formatNumber(p.coin_cost)} 🪙</td>
                <td><button class="btn-sm success" onclick="togglePrize('${p.id}', '${p.name}', true)">✅ Aktifkan</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    ` : ''}
  `;
}

function openAddPrizeModal() {
  openModal(`
    <h2>➕ Tambah Hadiah Baru</h2>
    <form onsubmit="savePrize(event)" id="prizeForm">
      <div class="form-group">
        <label>Nama Hadiah</label>
        <input type="text" id="prizeName" required placeholder="Contoh: Sepeda Listrik Quantum" />
      </div>
      <div class="form-group">
        <label>Kategori</label>
        <select id="prizeCategory" required>
          <option value="">Pilih kategori...</option>
          <option value="Kendaraan">Kendaraan</option>
          <option value="Fashion">Fashion</option>
          <option value="Aksesori">Aksesori</option>
          <option value="Olahraga">Olahraga</option>
          <option value="Saldo">Saldo E-Wallet</option>
          <option value="Elektronik">Elektronik</option>
          <option value="Lainnya">Lainnya</option>
        </select>
      </div>
      <div class="form-group">
        <label>Koin Dibutuhkan</label>
        <input type="number" id="prizeCost" required min="1000" placeholder="Contoh: 50000" />
      </div>
      <div class="form-group">
        <label>Stok</label>
        <input type="number" id="prizeStock" required min="1" value="10" />
      </div>
      <div class="form-group">
        <label>Ikon/Emoji</label>
        <input type="text" id="prizeImage" placeholder="🚗" value="🎁" />
      </div>
      <div class="form-group">
        <label>Deskripsi</label>
        <textarea id="prizeDesc" placeholder="Deskripsi hadiah..." rows="3"></textarea>
      </div>
      <button type="submit" class="btn-form">💾 Simpan Hadiah</button>
    </form>
  `);
}

function openEditPrizeModal(id) {
  const prize = allData.prizes.find(p => p.id === id);
  if (!prize) return;

  openModal(`
    <h2>✏️ Edit Hadiah</h2>
    <form onsubmit="updatePrize(event, '${id}')" id="prizeForm">
      <div class="form-group">
        <label>Nama Hadiah</label>
        <input type="text" id="prizeName" value="${prize.name}" required />
      </div>
      <div class="form-group">
        <label>Kategori</label>
        <select id="prizeCategory" required>
          <option value="">Pilih kategori...</option>
          ${['Kendaraan','Fashion','Aksesori','Olahraga','Saldo','Elektronik','Lainnya'].map(cat => 
            `<option value="${cat}" ${prize.category === cat ? 'selected' : ''}>${cat}</option>`
          ).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Koin Dibutuhkan</label>
        <input type="number" id="prizeCost" value="${prize.coin_cost}" required min="1000" />
      </div>
      <div class="form-group">
        <label>Stok</label>
        <input type="number" id="prizeStock" value="${prize.stock || 10}" required min="1" />
      </div>
      <div class="form-group">
        <label>Ikon/Emoji</label>
        <input type="text" id="prizeImage" value="${prize.image || '🎁'}" />
      </div>
      <div class="form-group">
        <label>Deskripsi</label>
        <textarea id="prizeDesc" rows="3">${prize.description || ''}</textarea>
      </div>
      <button type="submit" class="btn-form">💾 Update Hadiah</button>
    </form>
  `);
}

async function savePrize(e) {
  e.preventDefault();
  const data = {
    name: document.getElementById('prizeName').value,
    category: document.getElementById('prizeCategory').value,
    coin_cost: parseInt(document.getElementById('prizeCost').value),
    stock: parseInt(document.getElementById('prizeStock').value),
    image: document.getElementById('prizeImage').value || '🎁',
    description: document.getElementById('prizeDesc').value,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  try {
    await supabase.from('prizes').insert([data]);
    showToast('✅ Hadiah berhasil ditambahkan!', 'success');
    closeModal();
    await loadAllData();
    renderPrizes();
  } catch (e) {
    // Fallback: tambahkan ke data lokal
    data.id = Date.now().toString();
    allData.prizes.unshift(data);
    showToast('✅ Hadiah ditambahkan (mode offline)', 'success');
    closeModal();
    renderPrizes();
  }
}

async function updatePrize(e, id) {
  e.preventDefault();
  const data = {
    name: document.getElementById('prizeName').value,
    category: document.getElementById('prizeCategory').value,
    coin_cost: parseInt(document.getElementById('prizeCost').value),
    stock: parseInt(document.getElementById('prizeStock').value),
    image: document.getElementById('prizeImage').value || '🎁',
    description: document.getElementById('prizeDesc').value,
  };

  try {
    await supabase.from('prizes').update(data).eq('id', id);
    showToast('✅ Hadiah berhasil diupdate!', 'success');
    closeModal();
    await loadAllData();
    renderPrizes();
  } catch (e) {
    const idx = allData.prizes.findIndex(p => p.id === id);
    if (idx >= 0) allData.prizes[idx] = { ...allData.prizes[idx], ...data };
    showToast('✅ Hadiah diupdate (mode offline)', 'success');
    closeModal();
    renderPrizes();
  }
}

async function togglePrize(id, name, activate) {
  const action = activate ? 'aktifkan' : 'nonaktifkan';
  if (!confirm(`${action} hadiah "${name}"?`)) return;
  
  try {
    await supabase.from('prizes').update({ is_active: activate }).eq('id', id);
    showToast(`✅ Hadiah "${name}" di${action}kan!`, 'success');
    await loadAllData();
    renderPrizes();
  } catch (e) {
    const idx = allData.prizes.findIndex(p => p.id === id);
    if (idx >= 0) allData.prizes[idx].is_active = activate;
    showToast(`✅ Hadiah di${action}kan (mode offline)`, 'success');
    renderPrizes();
  }
}

// ===== PACKAGES =====
function renderPackages() {
  const el = document.getElementById('pageContent');
  el.innerHTML = `
    <div class="quick-actions">
      <button class="quick-action" onclick="openAddPackageModal()">
        <span class="qa-icon">➕</span> Tambah Paket
      </button>
    </div>

    <div class="stats-grid">
      ${allData.packages.map(p => `
        <div class="stat-card">
          <div class="stat-icon blue">📦</div>
          <div class="stat-info">
            <div class="stat-label">${p.name}</div>
            <div class="stat-value">${formatCurrency(p.price)}</div>
            <div class="stat-change">${p.duration_days || 30} hari</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            <button class="btn-sm" onclick="openEditPackageModal('${p.id}')">✏️</button>
            <button class="btn-sm danger" onclick="togglePackage('${p.id}','${p.name}', ${!p.is_active})">
              ${p.is_active ? '🚫' : '✅'}
            </button>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="table-card">
      <div class="table-header">
        <h3>📦 Detail Paket</h3>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nama Paket</th>
              <th>Harga</th>
              <th>Durasi</th>
              <th>Deskripsi</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${allData.packages.map(p => `
              <tr>
                <td><strong>${p.name}</strong></td>
                <td style="font-weight:700;color:var(--success);">${formatCurrency(p.price)}</td>
                <td>${p.duration_days || 30} hari</td>
                <td style="max-width:250px;">${p.description || '-'}</td>
                <td>${p.is_active !== false ? '<span class="badge badge-success">Aktif</span>' : '<span class="badge badge-danger">Nonaktif</span>'}</td>
                <td>
                  <button class="btn-sm" onclick="openEditPackageModal('${p.id}')">✏️</button>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="6"><div class="empty-state"><h3>Belum ada paket</h3></div></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openAddPackageModal() {
  openModal(`
    <h2>➕ Tambah Paket Baru</h2>
    <form onsubmit="savePackage(event)" id="packageForm">
      <div class="form-group">
        <label>Nama Paket</label>
        <input type="text" id="pkgName" required placeholder="Contoh: Paket 3 Bulan" />
      </div>
      <div class="form-group">
        <label>Harga (Rp)</label>
        <input type="number" id="pkgPrice" required min="1000" placeholder="Contoh: 30000" />
      </div>
      <div class="form-group">
        <label>Durasi (hari)</label>
        <input type="number" id="pkgDuration" required min="1" value="30" />
      </div>
      <div class="form-group">
        <label>Deskripsi</label>
        <textarea id="pkgDesc" placeholder="Keuntungan paket..." rows="3"></textarea>
      </div>
      <button type="submit" class="btn-form">💾 Simpan Paket</button>
    </form>
  `);
}

function openEditPackageModal(id) {
  const pkg = allData.packages.find(p => p.id === id);
  if (!pkg) return;

  openModal(`
    <h2>✏️ Edit Paket</h2>
    <form onsubmit="updatePackage(event, '${id}')" id="packageForm">
      <div class="form-group">
        <label>Nama Paket</label>
        <input type="text" id="pkgName" value="${pkg.name}" required />
      </div>
      <div class="form-group">
        <label>Harga (Rp)</label>
        <input type="number" id="pkgPrice" value="${pkg.price}" required min="1000" />
      </div>
      <div class="form-group">
        <label>Durasi (hari)</label>
        <input type="number" id="pkgDuration" value="${pkg.duration_days || 30}" required min="1" />
      </div>
      <div class="form-group">
        <label>Deskripsi</label>
        <textarea id="pkgDesc" rows="3">${pkg.description || ''}</textarea>
      </div>
      <button type="submit" class="btn-form">💾 Update Paket</button>
    </form>
  `);
}

async function savePackage(e) {
  e.preventDefault();
  const data = {
    name: document.getElementById('pkgName').value,
    price: parseInt(document.getElementById('pkgPrice').value),
    duration_days: parseInt(document.getElementById('pkgDuration').value),
    description: document.getElementById('pkgDesc').value,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  try {
    await supabase.from('packages').insert([data]);
    showToast('✅ Paket berhasil ditambahkan!', 'success');
    closeModal();
    await loadAllData();
    renderPackages();
  } catch (e) {
    allData.packages.unshift({ id: Date.now().toString(), ...data });
    showToast('✅ Paket ditambahkan (mode offline)', 'success');
    closeModal();
    renderPackages();
  }
}

async function updatePackage(e, id) {
  e.preventDefault();
  const data = {
    name: document.getElementById('pkgName').value,
    price: parseInt(document.getElementById('pkgPrice').value),
    duration_days: parseInt(document.getElementById('pkgDuration').value),
    description: document.getElementById('pkgDesc').value,
  };

  try {
    await supabase.from('packages').update(data).eq('id', id);
    showToast('✅ Paket berhasil diupdate!', 'success');
    closeModal();
    await loadAllData();
    renderPackages();
  } catch (e) {
    const idx = allData.packages.findIndex(p => p.id === id);
    if (idx >= 0) allData.packages[idx] = { ...allData.packages[idx], ...data };
    showToast('✅ Paket diupdate (mode offline)', 'success');
    closeModal();
    renderPackages();
  }
}

async function togglePackage(id, name, activate) {
  const action = activate ? 'aktifkan' : 'nonaktifkan';
  if (!confirm(`${action} paket "${name}"?`)) return;
  
  try {
    await supabase.from('packages').update({ is_active: activate }).eq('id', id);
    showToast(`✅ Paket "${name}" di${action}kan!`, 'success');
    await loadAllData();
    renderPackages();
  } catch (e) {
    const idx = allData.packages.findIndex(p => p.id === id);
    if (idx >= 0) allData.packages[idx].is_active = activate;
    showToast(`✅ Paket di${action}kan (mode offline)`, 'success');
    renderPackages();
  }
}

// ===== QUIZZES =====
function renderQuizzes() {
  const totalPoints = allData.quizzes.reduce((s, q) => s + (q.points_earned || 0), 0);
  const avgScore = allData.quizzes.length > 0 
    ? Math.round(allData.quizzes.reduce((s, q) => s + (q.score || 0), 0) / allData.quizzes.length) 
    : 0;

  const el = document.getElementById('pageContent');
  el.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon purple">📝</div>
        <div class="stat-info">
          <div class="stat-label">Total Kuis Dikerjakan</div>
          <div class="stat-value">${formatNumber(allData.quizzes.length)}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">⭐</div>
        <div class="stat-info">
          <div class="stat-label">Total Poin Dibagikan</div>
          <div class="stat-value">${formatNumber(totalPoints)}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue">📊</div>
        <div class="stat-info">
          <div class="stat-label">Rata-rata Skor</div>
          <div class="stat-value">${avgScore}%</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">👥</div>
        <div class="stat-info">
          <div class="stat-label">Pengguna Aktif Kuis</div>
          <div class="stat-value">${new Set(allData.quizzes.map(q => q.user_name)).size}</div>
        </div>
      </div>
    </div>

    <div class="table-card">
      <div class="table-header">
        <h3>📝 Aktivitas Kuis Terbaru</h3>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Kategori</th>
              <th>Skor</th>
              <th>Poin Didapat</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            ${allData.quizzes.map(q => `
              <tr>
                <td><strong>${q.user_name || '-'}</strong></td>
                <td><span class="badge badge-info">${q.category || '-'}</span></td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <div style="flex:1;max-width:100px;height:6px;background:var(--gray-200);border-radius:3px;overflow:hidden;">
                      <div style="width:${q.score || 0}%;height:100%;background:${(q.score || 0) >= 80 ? 'var(--success)' : (q.score || 0) >= 50 ? 'var(--warning)' : 'var(--danger)'};border-radius:3px;"></div>
                    </div>
                    <span style="font-weight:700;font-size:13px;">${q.score || 0}%</span>
                  </div>
                </td>
                <td style="color:var(--success);font-weight:700;">+${q.points_earned || 0}</td>
                <td>${formatDate(q.created_at)}</td>
              </tr>
            `).join('') || '<tr><td colspan="5"><div class="empty-state"><h3>Belum ada aktivitas kuis</h3></div></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ===== SETTINGS =====
function renderSettings() {
  const el = document.getElementById('pageContent');
  el.innerHTML = `
    <div class="section-card">
      <div class="section-header">
        <h3>⚙️ Pengaturan Platform</h3>
      </div>
      <div class="section-body">
        <div class="form-group">
          <label>Nama Platform</label>
          <input type="text" value="Naire Trivia Quiz" />
        </div>
        <div class="form-group">
          <label>Komisi Affiliate (%)</label>
          <input type="number" value="10" min="1" max="100" />
          <p style="font-size:12px;color:var(--gray-400);margin-top:4px;">Persentase komisi untuk setiap level affiliate</p>
        </div>
        <div class="form-group">
          <label>Level Affiliate Maksimal</label>
          <input type="number" value="10" min="1" max="20" />
          <p style="font-size:12px;color:var(--gray-400);margin-top:4px;">Jumlah level multi-level affiliate (saat ini: 10 level)</p>
        </div>
        <div class="form-group">
          <label>Koin per Jawaban Benar</label>
          <input type="number" value="5" min="1" />
        </div>
        <div class="form-group">
          <label>XP per Jawaban Benar</label>
          <input type="number" value="10" min="1" />
        </div>
        <button class="btn-form" style="max-width:200px;">💾 Simpan Pengaturan</button>
      </div>
    </div>

    <div class="section-card">
      <div class="section-header">
        <h3>🔐 Kelola Admin</h3>
      </div>
      <div class="section-body">
        <button class="btn-form" style="max-width:250px;background:var(--info);" onclick="openMakeAdminModal()">
          🔐 Jadikan User sebagai Admin
        </button>
        <p style="font-size:13px;color:var(--gray-400);margin-top:8px;">
            Masukkan email pengguna yang ingin dijadikan admin. Pengguna harus sudah terdaftar.
          </p>
        </div>
      </div>
    </div>
  `;
}

function openMakeAdminModal() {
  openModal(`
    <h2>🔐 Jadikan Admin</h2>
    <p style="color:var(--gray-500);font-size:14px;margin-bottom:16px;">Masukkan email pengguna yang ingin dijadikan Administrator.</p>
    <form onsubmit="makeAdmin(event)">
      <div class="form-group">
        <label>Email Pengguna</label>
        <input type="email" id="adminEmailInput" required placeholder="user@email.com" />
      </div>
      <button type="submit" class="btn-form">✅ Jadikan Admin</button>
    </form>
  `);
}

async function makeAdmin(e) {
  e.preventDefault();
  const email = document.getElementById('adminEmailInput').value.trim();
  
  try {
    // Cari user berdasarkan email
    const { data: users, error } = await supabase.from('users').select('id, name').eq('email', email);
    if (error) throw error;
    if (!users || users.length === 0) {
      showToast('❌ User dengan email tersebut tidak ditemukan', 'error');
      return;
    }
    
    await supabase.from('users').update({ is_admin: true }).eq('id', users[0].id);
    showToast(`✅ ${users[0].name || email} sekarang adalah Admin!`, 'success');
    closeModal();
    await loadAllData();
  } catch (e) {
    // Fallback: coba di data lokal
    const member = allData.members.find(m => m.email === email);
    if (member) {
      member.is_admin = true;
      showToast(`✅ ${member.name || email} sekarang adalah Admin! (offline)`, 'success');
      closeModal();
      renderMembers();
    } else {
      showToast('❌ User tidak ditemukan', 'error');
    }
  }
}

function openAddCoinsModal() {
  openModal(`
    <h2>🪙 Tambah Koin ke Member</h2>
    <form onsubmit="addCoins(event)">
      <div class="form-group">
        <label>Email Member</label>
        <input type="email" id="coinsEmailInput" required placeholder="member@email.com" />
      </div>
      <div class="form-group">
        <label>Jumlah Koin</label>
        <input type="number" id="coinsAmount" required min="100" value="1000" />
      </div>
      <button type="submit" class="btn-form">🪙 Tambah Koin</button>
    </form>
  `);
}

async function addCoins(e) {
  e.preventDefault();
  const email = document.getElementById('coinsEmailInput').value.trim();
  const amount = parseInt(document.getElementById('coinsAmount').value);

  try {
    const { data: users } = await supabase.from('users').select('id, name, coins').eq('email', email);
    if (!users || users.length === 0) {
      showToast('❌ User tidak ditemukan', 'error');
      return;
    }
    
    await supabase.rpc('increment_field', { target_user_id: users[0].id, field_name: 'coins', increment_by: amount });
    showToast(`✅ ${amount} koin ditambahkan ke ${users[0].name || email}!`, 'success');
    closeModal();
    await loadAllData();
  } catch (e) {
    const member = allData.members.find(m => m.email === email);
    if (member) {
      member.coins = (member.coins || 0) + amount;
      showToast(`✅ ${amount} koin ditambahkan ke ${member.name || email}! (offline)`, 'success');
      closeModal();
    } else {
      showToast('❌ User tidak ditemukan', 'error');
    }
  }
}

// ===== EXPORT CSV =====
function exportCSV(type) {
  let data = [];
  let headers = [];
  
  switch(type) {
    case 'members':
      headers = ['Nama','Email','WhatsApp','Paket','Koin','XP','Kode Referral','Admin','Tanggal Daftar'];
      data = allData.members.map(m => [m.name, m.email, m.whatsapp, m.package, m.coins, m.xp, m.referral_code, m.is_admin ? 'Ya' : 'Tidak', m.created_at]);
      break;
    case 'affiliates':
      headers = ['Referrer','Referred','Level','Paket','Komisi','Tanggal'];
      data = allData.affiliates.map(a => [a.referrer_name, a.referred_name, a.level, a.package, a.commission, a.created_at]);
      break;
    default:
      showToast('❌ Tipe tidak didukung', 'error');
      return;
  }

  const csvContent = [headers.join(','), ...data.map(row => row.map(cell => `"${cell || ''}"`).join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  showToast(`📥 Data ${type} berhasil diexport!`, 'success');
}

// ===== MODAL =====
function openModal(html) {
  document.getElementById('modalContent').innerHTML = html;
  document.getElementById('modalOverlay').classList.add('open');
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('modalOverlay')) return;
  document.getElementById('modalOverlay').classList.remove('open');
}

// ===== DEMO LOGIN: If no Supabase config, auto-login with demo data =====
// This allows the admin panel to work immediately without Supabase setup
document.addEventListener('DOMContentLoaded', () => {
  // If SUPABASE_URL is still default, enable demo mode
  setTimeout(() => {
    if (typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL.includes('YOUR_PROJECT')) {
      // Show demo notice on login screen
      document.querySelector('.login-subtitle').textContent = '🔧 Mode Demo — Konfigurasi Supabase untuk live data';
    }
  }, 500);
});