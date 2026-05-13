// ===== BAINVES - Main App =====

// ===== GLOBAL STATE =====
let currentPage = 'beranda';
let isDarkMode = localStorage.getItem('bainves-dark') === 'true';

// Quiz state
let quizQuestions = [];
let quizIndex = 0;
let quizScore = 0;
let quizActive = false;
let quizTotal = 5;

// ===== DUMMY DATA =====
const DUMMY_HADIAH = [
  { id: 1, name: 'Mobil Mewah', icon: '🚗', desc: 'Mobil mewah impian kamu bisa jadi milikmu! Tukarkan poin sekarang juga.', coins: 500000, image: 'images/mobil.svg' },
  { id: 2, name: 'Honda Motor', icon: '🏍️', desc: 'Motor Honda keren untuk mobilitas sehari-hari.', coins: 300000, image: 'images/honda.svg' },
  { id: 3, name: 'Sepeda Listrik', icon: '🛴', desc: 'Sepeda listrik ramah lingkungan dan praktis.', coins: 200000, image: 'images/sepeda_listrik.svg' },
  { id: 4, name: 'Topi Fashion', icon: '🧢', desc: 'Topi trendy untuk melengkapi gaya kamu.', coins: 25000, image: 'images/topi.svg' },
  { id: 5, name: 'Kacamata', icon: '👓', desc: 'Kacamata stylish untuk penampilan keren.', coins: 35000, image: 'images/kacamata.svg' },
  { id: 6, name: 'Baju Casual', icon: '👕', desc: 'Baju casual nyaman untuk sehari-hari.', coins: 45000, image: 'images/baju.svg' },
  { id: 7, name: 'Celana Jeans', icon: '👖', desc: 'Celana jeans kekinian untuk gaya santai.', coins: 55000, image: 'images/celana.svg' },
  { id: 8, name: 'Sepatu Olahraga', icon: '👟', desc: 'Sepatu olahraga nyaman untuk aktivitas.', coins: 85000, image: 'images/sepatu.svg' },
  { id: 9, name: 'Sandal Santai', icon: '🩴', desc: 'Sandal nyaman untuk bersantai di rumah.', coins: 20000, image: 'images/sandal.svg' },
  { id: 10, name: 'Saldo E-Wallet 50K', icon: '💰', desc: 'Saldo e-wallet 50 ribu untuk kebutuhan sehari-hari.', coins: 50000, image: 'images/saldo_50.svg' },
  { id: 11, name: 'Saldo E-Wallet 100K', icon: '💰', desc: 'Saldo e-wallet 100 ribu!', coins: 100000, image: 'images/saldo_100.svg' },
  { id: 12, name: 'Saldo E-Wallet 500K', icon: '💰', desc: 'Saldo e-wallet 500 ribu!', coins: 500000, image: 'images/saldo_500.svg' },
];

const DUMMY_QUESTIONS = [
  { q: 'Apa ibukota Indonesia?', options: ['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Yogyakarta'], correct: 0 },
  { q: 'Siapakah penemu bola lampu?', options: ['Einstein', 'Newton', 'Edison', 'Tesla', 'Faraday'], correct: 2 },
  { q: 'Berapa hasil 12 × 15?', options: ['120', '150', '180', '170', '160'], correct: 2 },
  { q: 'Planet apa yang terdekat dengan matahari?', options: ['Venus', 'Mars', 'Bumi', 'Merkurius', 'Jupiter'], correct: 3 },
  { q: 'Hewan apa yang disebut "raja hutan"?', options: ['Harimau', 'Singa', 'Gajah', 'Macan', 'Serigala'], correct: 1 },
  { q: 'Apa warna bendera Indonesia?', options: ['Merah-Putih', 'Merah-Biru', 'Putih-Hijau', 'Kuning-Hitam', 'Biru-Putih'], correct: 0 },
  { q: 'Siapa presiden pertama RI?', options: ['Soekarno', 'Soeharto', 'B.J. Habibie', 'Gus Dur', 'Megawati'], correct: 0 },
  { q: 'Apa nama planet terbesar?', options: ['Bumi', 'Mars', 'Jupiter', 'Saturnus', 'Neptunus'], correct: 2 },
  { q: 'Berapa hari dalam setahun?', options: ['364', '365', '366', '360', '370'], correct: 1 },
  { q: 'Apa nama alat untuk melihat bintang?', options: ['Mikroskop', 'Teleskop', 'Periskop', 'Endoskop', 'Stetoskop'], correct: 1 },
  { q: 'Siapa penulis proklamasi Indonesia?', options: ['Soekarno', 'Hatta', 'Soekarno-Hatta', 'Tan Malaka', 'Sjahrir'], correct: 2 },
  { q: 'Apa rumus kimia air?', options: ['H2O', 'CO2', 'NaCl', 'H2SO4', 'O2'], correct: 0 },
  { q: 'Dimana menara Eiffel berada?', options: ['London', 'Paris', 'Roma', 'Madrid', 'Berlin'], correct: 1 },
  { q: 'Apa mata uang Jepang?', options: ['Yuan', 'Won', 'Yen', 'Dollar', 'Ringgit'], correct: 2 },
  { q: 'Siapa tokoh utama dalam film "Inception"?', options: ['Dicaprio', 'Pitt', 'Cruise', 'Smith', 'Bale'], correct: 0 },
];

const RIWAYAT_KUIS = [
  { type: 'quiz', icon: '📝', title: 'Pengetahuan Umum', subtitle: '5 soal • 4 benar', value: '+40 🪙', positive: true },
  { type: 'quiz', icon: '📝', title: 'Matematika Dasar', subtitle: '5 soal • 3 benar', value: '+30 🪙', positive: true },
  { type: 'redeem', icon: '🎁', title: 'Tukar Topi', subtitle: '25.000 koin', value: '-25K 🪙', positive: false },
  { type: 'quiz', icon: '📝', title: 'Sejarah Indonesia', subtitle: '5 soal • 5 benar', value: '+50 🪙', positive: true },
  { type: 'points', icon: '⭐', title: 'Poin Harian', subtitle: 'Bonus login hari ke-3', value: '+15 🪙', positive: true },
  { type: 'redeem', icon: '🎁', title: 'Tukar Saldo 50K', subtitle: '50.000 koin', value: '-50K 🪙', positive: false },
];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // Load dark mode
  if (isDarkMode) {
    document.body.classList.add('dark');
    document.getElementById('themeIcon').textContent = '☀️';
    document.getElementById('themeLabel').textContent = 'Mode Terang';
  }
  
  // Populate prize marquee
  populatePrizeMarquee();
  
  // Scroll nav effect
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('landingNav');
    if (nav) {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }
  });
});

// ===== PRIZE MARQUEE =====
function populatePrizeMarquee() {
  const container = document.getElementById('prizeMarquee');
  if (!container) return;
  
  const chips = DUMMY_HADIAH.map(h => `
    <div class="prize-chip">
      <span class="chip-icon">${h.icon}</span>
      <span class="chip-label">${h.name}</span>
      <span class="chip-price">${h.coins.toLocaleString()} 🪙</span>
    </div>
  `).join('');
  
  // Double for seamless scroll
  container.innerHTML = chips + chips;
}

// ===== NAVIGATION =====
function navigateTo(page) {
  currentPage = page;
  
  // Update bottom nav
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const navBtn = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navBtn) navBtn.classList.add('active');
  
  // Render page
  const content = document.getElementById('mainContent');
  switch(page) {
    case 'beranda': renderBeranda(content); break;
    case 'riwayat': renderRiwayat(content); break;
    case 'kuis': renderKuis(content); break;
    case 'affiliate': renderAffiliate(content); break;
    case 'profil': renderProfil(content); break;
  }
}

// ===== BERANDA =====
function renderBeranda(el) {
  const isPaketAktif = userData?.paket_aktif;
  const coins = userData?.coins || 0;
  
  // Filter hadiah berdasarkan koin user
  const hadiahCards = DUMMY_HADIAH.map(h => `
    <div class="hadiah-card" onclick="showHadiahDetail(${h.id})">
      <img src="${h.image}" alt="${h.name}" class="hadiah-img" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><text y=%2280%22 font-size=%2280%22>${h.icon}</text></svg>'" />
      <div class="hadiah-info">
        <h4>${h.name}</h4>
        <div class="hadiah-desc">${h.desc.substring(0, 40)}...</div>
        <div class="hadiah-koin">🪙 ${h.coins.toLocaleString()}</div>
      </div>
    </div>
  `).join('');
  
  el.innerHTML = `
    <!-- Hero Banner -->
    <div class="hero-banner animate-in">
      <h2>💰 Tukar Poinmu!</h2>
      <p>Kumpulkan poin dan dapatkan hadiah mewah dari Bainves!</p>
      <button class="btn btn-sm btn-secondary" style="background:rgba(255,255,255,0.2);color:#fff;border-color:rgba(255,255,255,0.3);" onclick="navigateTo('kuis')">
        Ikuti Kuis 📝
      </button>
    </div>

    <!-- Paket -->
    <div class="section">
      <div class="section-header">
        <h3 class="section-title">📦 Paket Langganan</h3>
      </div>
      <div class="paket-grid">
        ${AFFILIATE_PACKAGES.map(p => `
          <div class="paket-card ${p.popular ? 'paket-popular' : ''}" onclick="buyPackage('${p.id}')">
            <div class="paket-price">Rp ${p.price.toLocaleString()}</div>
            <div class="paket-duration">${p.duration}</div>
            <div class="paket-desc">🪙 +${p.coinBonus} koin bonus</div>
            <div class="paket-badge">${isPaketAktif && userData?.paket === p.id ? '✅ AKTIF' : 'BELI'}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Daftar Hadiah -->
    <div class="section">
      <div class="section-header">
        <h3 class="section-title">🎁 Tukar Hadiah</h3>
        <span style="font-size:0.75rem;font-weight:700;color:var(--warning);">🪙 ${coins.toLocaleString()}</span>
      </div>
      <div class="hadiah-grid">${hadiahCards}</div>
    </div>
  `;
}

// ===== HADIAH DETAIL =====
function showHadiahDetail(id) {
  const h = DUMMY_HADIAH.find(x => x.id === id);
  if (!h) return;
  
  const canRedeem = (userData?.coins || 0) >= h.coins;
  
  openModal(`
    <img src="${h.image}" alt="${h.name}" class="hadiah-detail-img" onerror="this.style.display='none'" />
    <div class="hadiah-detail-title">${h.icon} ${h.name}</div>
    <div class="hadiah-detail-desc">${h.desc}</div>
    <div class="hadiah-detail-koin">🪙 ${h.coins.toLocaleString()} Koin</div>
    <button class="btn btn-full ${canRedeem ? 'btn-primary' : 'btn-secondary'}" onclick="${canRedeem ? `redeemHadiah(${h.id})` : ''}" ${!canRedeem ? 'disabled' : ''}>
      ${canRedeem ? '🎯 Tukar Sekarang' : '❌ Koin Tidak Cukup'}
    </button>
    ${!canRedeem ? `<p style="text-align:center;font-size:0.75rem;color:var(--text-light);margin-top:8px;">Kamu butuh ${(h.coins - (userData?.coins || 0)).toLocaleString()} koin lagi</p>` : ''}
  `);
}

async function redeemHadiah(id) {
  const h = DUMMY_HADIAH.find(x => x.id === id);
  if (!h || !currentUser) return;
  
  if ((userData?.coins || 0) < h.coins) {
    showToast('Koin tidak mencukupi!');
    closeModal();
    return;
  }
  
  try {
    const newCoins = (userData?.coins || 0) - h.coins;
    await db.collection('users').doc(currentUser.uid).update({
      coins: newCoins
    });
    
    await db.collection('redemptions').add({
      userId: currentUser.uid,
      userName: userData?.name || '',
      hadiahId: h.id,
      hadiahName: h.name,
      hadiahIcon: h.icon,
      coinsSpent: h.coins,
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    userData.coins = newCoins;
    updateCoinDisplay();
    closeModal();
    showToast(`🎉 Berhasil menukar ${h.name}! Menunggu verifikasi admin.`);
    navigateTo('beranda');
  } catch (err) {
    showToast('Gagal: ' + err.message);
  }
}

// ===== RIWAYAT =====
function renderRiwayat(el) {
  const todayPoints = 125; // Dummy
  
  el.innerHTML = `
    <!-- Points Today -->
    <div class="hero-banner animate-in" style="background:linear-gradient(135deg,var(--accent),#dc2626);margin-bottom:20px;">
      <h2>⭐ ${todayPoints} Poin</h2>
      <p>Poin yang kamu kumpulkan hari ini. Jawab kuis untuk menambah poin!</p>
    </div>

    <!-- Tabs -->
    <div class="riwayat-tabs" id="riwayatTabs">
      <button class="riwayat-tab active" onclick="filterRiwayat('all', this)">Semua</button>
      <button class="riwayat-tab" onclick="filterRiwayat('quiz', this)">Kuis</button>
      <button class="riwayat-tab" onclick="filterRiwayat('redeem', this)">Tukar Hadiah</button>
      <button class="riwayat-tab" onclick="filterRiwayat('points', this)">Poin</button>
    </div>

    <div class="riwayat-list" id="riwayatList">
      ${renderRiwayatItems('all')}
    </div>
  `;
}

function renderRiwayatItems(filter) {
  const filtered = filter === 'all' ? RIWAYAT_KUIS : RIWAYAT_KUIS.filter(r => r.type === filter);
  
  if (filtered.length === 0) {
    return '<p style="text-align:center;color:var(--text-light);padding:30px;">Belum ada riwayat</p>';
  }
  
  return filtered.map(r => `
    <div class="riwayat-item">
      <div class="riwayat-item-left">
        <div class="riwayat-icon ${r.type}">${r.icon}</div>
        <div class="riwayat-info">
          <h4>${r.title}</h4>
          <p>${r.subtitle}</p>
        </div>
      </div>
      <div class="riwayat-value ${r.positive ? 'positive' : 'negative'}">${r.value}</div>
    </div>
  `).join('');
}

function filterRiwayat(filter, btn) {
  document.querySelectorAll('.riwayat-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('riwayatList').innerHTML = renderRiwayatItems(filter);
}

// ===== KUIS =====
function renderKuis(el) {
  if (quizActive) {
    renderQuizActive(el);
    return;
  }
  
  el.innerHTML = `
    <div class="section">
      <div class="section-header">
        <h3 class="section-title">📝 Kuis Harian</h3>
      </div>
      <p style="color:var(--text-light);margin-bottom:16px;">Jawab ${quizTotal} soal pilihan ganda dan dapatkan poin! Setiap jawaban benar = +10 🪙</p>
      
      <div class="hero-banner animate-in" style="background:linear-gradient(135deg,#7c3aed,#db2777);margin-bottom:20px;">
        <h2>🎯 Siap Uji Pengetahuan?</h2>
        <p>${quizTotal} soal acak • Pilihan ganda A-E • Dapatkan poin!</p>
        <button class="btn btn-sm btn-secondary" style="background:rgba(255,255,255,0.2);color:#fff;border-color:rgba(255,255,255,0.3);" onclick="startQuiz()">
          Mulai Kuis 🚀
        </button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
        <div class="affiliate-card">
          <div class="af-value">+${quizTotal * 10} 🪙</div>
          <div class="af-label">Max Poin</div>
        </div>
        <div class="affiliate-card">
          <div class="af-value">${quizTotal}</div>
          <div class="af-label">Total Soal</div>
        </div>
        <div class="affiliate-card">
          <div class="af-value">5</div>
          <div class="af-label">Pilihan</div>
        </div>
      </div>
    </div>
  `;
}

function startQuiz() {
  // Shuffle and pick questions
  const shuffled = [...DUMMY_QUESTIONS].sort(() => Math.random() - 0.5);
  quizQuestions = shuffled.slice(0, quizTotal);
  quizIndex = 0;
  quizScore = 0;
  quizActive = true;
  navigateTo('kuis');
}

function renderQuizActive(el) {
  if (quizIndex >= quizQuestions.length) {
    renderQuizResult(el);
    return;
  }
  
  const q = quizQuestions[quizIndex];
  const progress = (quizIndex / quizQuestions.length) * 100;
  const labels = ['A', 'B', 'C', 'D', 'E'];
  
  el.innerHTML = `
    <div class="quiz-question-card animate-in">
      <div class="quiz-progress-bar">
        <div class="quiz-progress-fill" style="width:${progress}%"></div>
      </div>
      <div class="quiz-q-num">Soal ${quizIndex + 1} / ${quizQuestions.length}</div>
      <div class="quiz-q-text">${q.q}</div>
      <div class="quiz-options" id="quizOptions">
        ${q.options.map((opt, i) => `
          <div class="quiz-option" onclick="answerQuiz(${i})" data-idx="${i}">
            <div class="qo-letter">${labels[i]}</div>
            ${opt}
          </div>
        `).join('')}
      </div>
      <div style="text-align:center;margin-top:12px;">
        <span style="font-size:0.75rem;color:var(--text-light);">Skor: ${quizScore} benar</span>
      </div>
    </div>
  `;
}

function answerQuiz(idx) {
  const q = quizQuestions[quizIndex];
  const options = document.querySelectorAll('.quiz-option');
  
  options.forEach(opt => opt.classList.add('disabled'));
  
  if (idx === q.correct) {
    options[idx].classList.add('correct');
    quizScore++;
  } else {
    options[idx].classList.add('incorrect');
    options[q.correct].classList.add('correct');
  }
  
  setTimeout(async () => {
    quizIndex++;
    
    if (quizIndex >= quizQuestions.length) {
      // Quiz done!
      const coinsEarned = quizScore * 10;
      
      // Update coins in Firebase
      if (currentUser) {
        try {
          const newCoins = (userData?.coins || 0) + coinsEarned;
          await db.collection('users').doc(currentUser.uid).update({
            coins: newCoins,
            totalQuizDone: firebase.firestore.FieldValue.increment(1),
            totalCorrect: firebase.firestore.FieldValue.increment(quizScore)
          });
          userData.coins = newCoins;
          updateCoinDisplay();
        } catch (err) {
          console.error('Save quiz result error:', err);
        }
      }
      
      // Record quiz history
      if (currentUser) {
        try {
          await db.collection('quiz_history').add({
            userId: currentUser.uid,
            score: quizScore,
            total: quizQuestions.length,
            coinsEarned: coinsEarned,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        } catch (err) {}
      }
      
      renderQuizResult(document.getElementById('mainContent'));
    } else {
      renderQuizActive(document.getElementById('mainContent'));
    }
  }, 1000);
}

function renderQuizResult(el) {
  const total = quizQuestions.length;
  const pct = Math.round((quizScore / total) * 100);
  const perfect = quizScore === total;
  const coinsEarned = quizScore * 10;
  
  if (perfect) showConfetti();
  
  el.innerHTML = `
    <div class="quiz-question-card animate-scale" style="text-align:center;padding:40px 24px;">
      <div class="qr-icon">${perfect ? '🎉' : quizScore >= 3 ? '👏' : '💪'}</div>
      <div style="font-size:0.7rem;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:1px;">Hasil Kuis</div>
      <div class="qr-score">${quizScore}/${total}</div>
      <div class="qr-label">${perfect ? 'Sempurna! Semua jawaban benar! 🎯' : quizScore >= 3 ? 'Kerja bagus! Tingkatkan terus! 🔥' : 'Jangan menyerah, coba lagi! 💪'}</div>
      <div style="font-size:2.5rem;font-weight:900;margin:16px 0;color:var(--warning);">+${coinsEarned} 🪙</div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
        <div style="background:var(--bg);padding:12px 20px;border-radius:12px;min-width:100px;">
          <div style="font-weight:900;font-size:1.1rem;">${pct}%</div>
          <div style="font-size:0.65rem;color:var(--text-light);">Akurasi</div>
        </div>
        <div style="background:var(--bg);padding:12px 20px;border-radius:12px;min-width:100px;">
          <div style="font-weight:900;font-size:1.1rem;">${quizScore * 10}</div>
          <div style="font-size:0.65rem;color:var(--text-light);">Poin</div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:20px;">
        <button class="btn btn-primary btn-full" onclick="startQuiz()">🔄 Coba Lagi</button>
        <button class="btn btn-secondary btn-full" onclick="quizActive=false;navigateTo('beranda')">🏠 Kembali</button>
      </div>
    </div>
  `;
}

// ===== AFFILIATE =====
async function renderAffiliate(el) {
  if (!userData) {
    el.innerHTML = '<p style="text-align:center;padding:30px;color:var(--text-light);">Silakan login untuk melihat affiliate</p>';
    return;
  }
  
  const stats = await getAffiliateStats();
  
  el.innerHTML = `
    <!-- Affiliate Banner -->
    <div class="hero-banner animate-in" style="background:linear-gradient(135deg,#059669,#10b981);margin-bottom:20px;">
      <h2>👥 Program Affiliate</h2>
      <p>Ajak teman dan dapatkan komisi 10% multi-level hingga 10 level!</p>
    </div>

    <!-- Summary Cards -->
    <div class="affiliate-summary">
      <div class="affiliate-card animate-in">
        <div class="af-value">🪙 ${(stats?.balance || 0).toLocaleString()}</div>
        <div class="af-label">Saldo Affiliate</div>
      </div>
      <div class="affiliate-card animate-in" style="animation-delay:0.1s;">
        <div class="af-value">${stats?.joins || 0}</div>
        <div class="af-label">Total Bergabung</div>
      </div>
      <div class="affiliate-card animate-in" style="animation-delay:0.2s;">
        <div class="af-value">${stats?.clicks || 0}</div>
        <div class="af-label">Klik Link</div>
      </div>
      <div class="affiliate-card animate-in" style="animation-delay:0.3s;">
        <div class="af-value">🏆 ${(stats?.totalEarnings || 0).toLocaleString()}</div>
        <div class="af-label">Total Pendapatan</div>
      </div>
    </div>

    <!-- Link Affiliate -->
    <div class="affiliate-link-box">
      <h4>🔗 Link Affiliate Kamu</h4>
      <div class="affiliate-link-field">
        <input type="text" id="affiliateLinkInput" value="${window.location.origin}${window.location.pathname}?ref=${userData?.referral_code || ''}" readonly />
        <button onclick="copyAffiliateLink()">Salin</button>
      </div>
      <p style="font-size:0.7rem;color:var(--text-light);margin-top:8px;">
        Kode Referral: <strong>${userData?.referral_code || '-'}</strong>
      </p>
    </div>

    <!-- Paket untuk dibeli -->
    <div class="section">
      <div class="section-header">
        <h3 class="section-title">📦 Paket</h3>
      </div>
      <div class="paket-grid" style="grid-template-columns:1fr;">
        ${AFFILIATE_PACKAGES.map(p => `
          <div class="paket-card ${p.popular ? 'paket-popular' : ''}" onclick="buyPackage('${p.id}')" style="flex-direction:row;display:flex;align-items:center;justify-content:space-between;text-align:left;padding:16px 20px;">
            <div>
              <div style="font-weight:800;font-size:1rem;">${p.name}</div>
              <div style="font-size:0.7rem;color:var(--text-light);">${p.duration} • 🪙 +${p.coinBonus}</div>
            </div>
            <div style="text-align:right;">
              <div class="paket-price" style="font-size:1.2rem;">Rp ${p.price.toLocaleString()}</div>
              <button class="btn btn-sm btn-primary" style="padding:6px 16px;font-size:0.7rem;margin-top:4px;" onclick="event.stopPropagation();buyPackage('${p.id}')">BELI</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Withdraw -->
    <div style="display:flex;gap:8px;margin-bottom:16px;">
      <button class="btn btn-accent" style="flex:1;" onclick="withdrawAffiliate(${stats?.balance || 0})">💳 Tarik Saldo</button>
      <button class="btn btn-secondary" style="flex:1;" onclick="copyAffiliateLink()">📋 Salin Link</button>
    </div>

    <!-- Multi-Level Breakdown -->
    <div class="section">
      <div class="section-header">
        <h3 class="section-title">📊 Multi-Level (10 Level)</h3>
        <span style="font-size:0.75rem;color:var(--text-light);">Komisi 10%</span>
      </div>
      ${stats?.levelBreakdown && stats.levelBreakdown.length > 0 
        ? stats.levelBreakdown.map(lvl => `
          <div class="affiliate-level">
            <div>
              <div class="al-level">Level ${lvl.level}</div>
              <div class="al-count">${lvl.count} anggota</div>
            </div>
            <div class="al-earn">🪙 +${lvl.earnings.toLocaleString()}</div>
          </div>
        `).join('')
        : '<p style="text-align:center;padding:20px;color:var(--text-light);font-size:0.85rem;">Belum ada affiliate. Ajak teman dan dapatkan komisi!</p>'
      }
    </div>
  `;
}

// ===== PROFIL =====
function renderProfil(el) {
  el.innerHTML = `
    <div class="profile-header-card animate-in">
      <img src="https://i.pravatar.cc/200?u=${currentUser?.uid || 'default'}" 
           class="profile-avatar" alt="Avatar" 
           onclick="editProfilePhoto()"
           id="profileAvatar" />
      <div class="profile-name-text" id="profileName">${userData?.name || 'Pengguna'}</div>
      <div class="profile-email-text">${userData?.email || ''}</div>
      <div style="margin-top:8px;font-size:0.85rem;color:var(--warning);font-weight:700;">🪙 ${(userData?.coins || 0).toLocaleString()} Koin</div>
    </div>

    <div class="profile-menu">
      <div style="padding:8px 4px 4px;font-size:0.7rem;font-weight:700;color:var(--text-light);text-transform:uppercase;letter-spacing:0.5px;">Akun</div>
      
      <button class="profile-menu-item" onclick="editProfile('name')">
        <span class="pmi-icon">✏️</span>
        <span class="pmi-label">Edit Nama</span>
        <span class="pmi-value" style="font-size:0.75rem;color:var(--text-light);margin-right:8px;">${userData?.name || ''}</span>
        <span class="pmi-arrow">›</span>
      </button>
      
      <button class="profile-menu-item" onclick="editProfile('phone')">
        <span class="pmi-icon">📱</span>
        <span class="pmi-label">Nomor WhatsApp</span>
        <span class="pmi-value" style="font-size:0.75rem;color:var(--text-light);margin-right:8px;">${userData?.phone || ''}</span>
        <span class="pmi-arrow">›</span>
      </button>
      
      <button class="profile-menu-item" onclick="editProfile('password')">
        <span class="pmi-icon">🔒</span>
        <span class="pmi-label">Ubah Kata Sandi</span>
        <span class="pmi-arrow">›</span>
      </button>
      
      <button class="profile-menu-item" onclick="editProfile('photo')">
        <span class="pmi-icon">🖼️</span>
        <span class="pmi-label">Ganti Foto</span>
        <span class="pmi-arrow">›</span>
      </button>

      <div style="padding:8px 4px 4px;font-size:0.7rem;font-weight:700;color:var(--text-light);text-transform:uppercase;letter-spacing:0.5px;">Lainnya</div>

      <button class="profile-menu-item" onclick="toggleTheme()">
        <span class="pmi-icon" id="profileThemeIcon">${isDarkMode ? '☀️' : '🌙'}</span>
        <span class="pmi-label">${isDarkMode ? 'Mode Terang' : 'Mode Gelap'}</span>
        <span class="pmi-arrow">›</span>
      </button>

      <button class="profile-menu-item" onclick="changeLanguage()">
        <span class="pmi-icon">🌐</span>
        <span class="pmi-label">Bahasa Indonesia</span>
        <span class="pmi-arrow">›</span>
      </button>

      <button class="profile-menu-item" style="color:var(--danger);" onclick="confirmExit()">
        <span class="pmi-icon">🚪</span>
        <span class="pmi-label">Keluar</span>
        <span class="pmi-arrow">›</span>
      </button>
    </div>
  `;
}

// ===== PROFILE EDIT =====
function editProfile(field) {
  switch(field) {
    case 'name':
      openModal(`
        <h2>✏️ Edit Nama</h2>
        <p>Ubah nama tampilan kamu</p>
        <input type="text" id="editNameInput" class="form-input" value="${userData?.name || ''}" />
        <button class="btn btn-primary btn-full" onclick="saveProfileName()">Simpan</button>
      `);
      break;
    case 'phone':
      openModal(`
        <h2>📱 Edit WhatsApp</h2>
        <p>Ubah nomor WhatsApp kamu</p>
        <input type="tel" id="editPhoneInput" class="form-input" value="${userData?.phone || ''}" placeholder="08xxxxxxxxxx" />
        <button class="btn btn-primary btn-full" onclick="saveProfilePhone()">Simpan</button>
      `);
      break;
    case 'password':
      openModal(`
        <h2>🔒 Ubah Kata Sandi</h2>
        <p>Masukkan kata sandi baru</p>
        <input type="password" id="newPasswordInput" class="form-input" placeholder="Kata sandi baru (min. 6 karakter)" minlength="6" />
        <input type="password" id="confirmPasswordInput" class="form-input" placeholder="Konfirmasi kata sandi" />
        <button class="btn btn-primary btn-full" onclick="saveProfilePassword()">Simpan</button>
      `);
      break;
    case 'photo':
      editProfilePhoto();
      break;
  }
}

async function saveProfileName() {
  const name = document.getElementById('editNameInput').value.trim();
  if (!name) return;
  try {
    await updateUserField('name', name);
    userData.name = name;
    document.getElementById('sideName').textContent = name;
    closeModal();
    showToast('✅ Nama berhasil diubah');
    navigateTo('profil');
  } catch (err) {
    showToast('Gagal: ' + err.message);
  }
}

async function saveProfilePhone() {
  const phone = document.getElementById('editPhoneInput').value.trim();
  if (!phone) return;
  try {
    await updateUserField('phone', phone);
    userData.phone = phone;
    closeModal();
    showToast('✅ Nomor WhatsApp berhasil diubah');
    navigateTo('profil');
  } catch (err) {
    showToast('Gagal: ' + err.message);
  }
}

async function saveProfilePassword() {
  const newPass = document.getElementById('newPasswordInput').value;
  const confirmPass = document.getElementById('confirmPasswordInput').value;
  
  if (newPass.length < 6) {
    showToast('Kata sandi minimal 6 karakter');
    return;
  }
  if (newPass !== confirmPass) {
    showToast('Konfirmasi kata sandi tidak cocok');
    return;
  }
  
  try {
    await currentUser.updatePassword(newPass);
    closeModal();
    showToast('✅ Kata sandi berhasil diubah');
  } catch (err) {
    showToast('Gagal: ' + getAuthErrorMessage(err));
  }
}

function editProfilePhoto() {
  openModal(`
    <h2>🖼️ Ganti Foto Profil</h2>
    <p>Masukkan URL foto baru:</p>
    <input type="url" id="photoUrlInput" class="form-input" placeholder="https://example.com/photo.jpg" />
    <button class="btn btn-primary btn-full" onclick="saveProfilePhoto()">Simpan</button>
  `);
}

function saveProfilePhoto() {
  const url = document.getElementById('photoUrlInput').value.trim();
  if (!url) return;
  document.getElementById('profileAvatar').src = url;
  closeModal();
  showToast('✅ Foto profil diperbarui');
}

// ===== THEME TOGGLE =====
function toggleTheme() {
  isDarkMode = !isDarkMode;
  document.body.classList.toggle('dark', isDarkMode);
  localStorage.setItem('bainves-dark', isDarkMode);
  
  document.getElementById('themeIcon').textContent = isDarkMode ? '☀️' : '🌙';
  document.getElementById('themeLabel').textContent = isDarkMode ? 'Mode Terang' : 'Mode Gelap';
  
  const profileIcon = document.getElementById('profileThemeIcon');
  if (profileIcon) profileIcon.textContent = isDarkMode ? '☀️' : '🌙';
  
  const profileLabel = document.querySelector('.profile-menu-item span.pmi-label');
  // Just navigate to refresh
  navigateTo('profil');
}

// ===== LANGUAGE =====
function changeLanguage() {
  openModal(`
    <h2>🌐 Pilih Bahasa</h2>
    <div class="profile-menu">
      <button class="profile-menu-item" onclick="closeModal()">
        <span class="pmi-icon">🇮🇩</span>
        <span class="pmi-label">Bahasa Indonesia</span>
        <span class="pmi-value" style="font-size:0.7rem;color:var(--success);">✓ Aktif</span>
      </button>
      <button class="profile-menu-item" onclick="closeModal()">
        <span class="pmi-icon">🇬🇧</span>
        <span class="pmi-label">English</span>
        <span class="pmi-value" style="font-size:0.7rem;color:var(--text-light);">Coming Soon</span>
      </button>
    </div>
  `);
}

// ===== NOTIF =====
function showNotif() {
  document.getElementById('notifDrawer').classList.add('open');
}
function closeNotif() {
  document.getElementById('notifDrawer').classList.remove('open');
}

// ===== SIDEBAR =====
function openSidebar() {
  document.getElementById('sidebarOverlay').classList.add('open');
}
function closeSidebar() {
  document.getElementById('sidebarOverlay').classList.remove('open');
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

// ===== TOAST =====
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.remove(), 2500);
}

// ===== CONFETTI =====
function showConfetti() {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  const colors = ['#2563eb', '#f97316', '#10b981', '#ef4444', '#eab308', '#ec4899', '#7c3aed'];
  
  container.innerHTML = Array(30).fill(0).map((_, i) => 
    `<div class="confetti-piece" style="left:${Math.random() * 100}%;animation-delay:${Math.random() * 0.7}s;background:${colors[i % colors.length]};width:${6 + Math.random() * 8}px;height:${6 + Math.random() * 8}px;border-radius:${Math.random() > 0.5 ? '50%' : '2px'}"></div>`
  ).join('');
  
  document.body.appendChild(container);
  setTimeout(() => container.remove(), 3500);
}

// ===== LANDING SCROLL =====
function scrollLanding(target) {
  // Just navigate to auth on mobile
  showAuth('register');
}

// ===== CHECK REFERRAL ON URL =====
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref) {
    setTimeout(() => {
      showAuth('register');
      const refField = document.getElementById('regReferral');
      if (refField) refField.value = ref;
    }, 500);
  }
});
