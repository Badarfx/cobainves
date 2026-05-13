// ===== BAINVES - Auth (Supabase) =====
let isLoginMode = false;
let currentUser = null;
let userData = null;
let authListener = null;

// ===== AUTH UI =====
function showAuth(mode) {
  document.getElementById('landingPage').classList.remove('active');
  document.getElementById('authPage').classList.add('active');
  document.getElementById('appMain').classList.remove('active');
  
  if (mode === 'login') {
    isLoginMode = true;
    document.getElementById('authTitle').textContent = 'Masuk';
    document.getElementById('authDesc').textContent = 'Masuk ke akun Bainves kamu!';
    document.getElementById('authBtn').textContent = 'Masuk';
    document.getElementById('registerFields').style.display = 'none';
    document.getElementById('referralField').style.display = 'none';
    document.getElementById('authSwitchText').textContent = 'Belum punya akun?';
    document.getElementById('authSwitchLink').textContent = 'Daftar';
  } else {
    isLoginMode = false;
    document.getElementById('authTitle').textContent = 'Daftar Akun';
    document.getElementById('authDesc').textContent = 'Daftar dan mulai dapatkan hadiah!';
    document.getElementById('authBtn').textContent = 'Daftar';
    document.getElementById('registerFields').style.display = 'block';
    document.getElementById('referralField').style.display = 'block';
    document.getElementById('authSwitchText').textContent = 'Sudah punya akun?';
    document.getElementById('authSwitchLink').textContent = 'Masuk';
  }
  
  document.getElementById('authError').classList.remove('show');
  document.getElementById('authError').textContent = '';
}

function hideAuth() {
  document.getElementById('authPage').classList.remove('active');
  document.getElementById('landingPage').classList.add('active');
}

function toggleAuthMode() {
  showAuth(isLoginMode ? 'register' : 'login');
}

// ===== HANDLE AUTH =====
async function handleAuth(e) {
  e.preventDefault();
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  const errorEl = document.getElementById('authError');
  errorEl.classList.remove('show');
  
  const btn = document.getElementById('authBtn');
  btn.disabled = true;
  btn.textContent = 'Memproses...';

  try {
    if (isLoginMode) {
      // LOGIN
      const { data, error } = await supabase.auth.signInWithPassword({
        email, password
      });
      if (error) throw error;
      
      await loadUserData(data.user);
      enterApp();
    } else {
      // REGISTER
      const name = document.getElementById('regName').value.trim();
      const phone = document.getElementById('regPhone').value.trim();
      const referralCode = document.getElementById('regReferral').value.trim();
      
      if (!name) throw new Error('Nama lengkap harus diisi');
      if (!phone) throw new Error('Nomor WhatsApp harus diisi');

      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { name, phone } }
      });
      if (error) throw error;
      if (!data.user) throw new Error('Gagal mendaftar');
      
      // Generate unique referral code
      const myRefCode = generateRefCode(name);
      
      // Simpan data user ke tabel users
      const userDoc = {
        uid: data.user.id,
        email: email,
        name: name,
        phone: phone,
        referral_code: myRefCode,
        referred_by: referralCode || null,
        coins: 0,
        total_quiz_done: 0,
        total_correct: 0,
        paket: 'none',
        paket_aktif: false,
        affiliate_balance: 0,
        total_withdrawn: 0,
        affiliate_clicks: 0,
        affiliate_joins: 0,
        created_at: new Date().toISOString()
      };
      
      const { error: insertError } = await supabase
        .from('users')
        .insert([userDoc]);
      
      if (insertError) {
        console.warn('Insert user warning:', insertError);
        // Mungkin karena RLS — lanjutkan saja
      }
      
      // Process referral for upline (10 levels)
      if (referralCode) {
        await processReferral(referralCode, data.user.id, 1);
      }
      
      await loadUserData(data.user);
      enterApp();
    }
  } catch (err) {
    errorEl.textContent = getAuthErrorMessage(err);
    errorEl.classList.add('show');
  } finally {
    btn.disabled = false;
    btn.textContent = isLoginMode ? 'Masuk' : 'Daftar';
  }
}

// ===== GENERATE REF CODE =====
function generateRefCode(name) {
  const prefix = name.substring(0, 2).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return prefix + rand;
}

// ===== PROCESS REFERRAL (10 LEVELS) =====
async function processReferral(refCode, newUserId, level) {
  if (level > 10) return;
  
  try {
    const { data: uplines, error } = await supabase
      .from('users')
      .select('*')
      .eq('referral_code', refCode)
      .limit(1);
    
    if (error || !uplines || uplines.length === 0) return;
    
    const upline = uplines[0];
    const levelField = `affiliate_level_${level}`;
    
    // Get current array
    const currentArr = upline[levelField] || [];
    currentArr.push(newUserId);
    
    await supabase
      .from('users')
      .update({
        [levelField]: currentArr,
        affiliate_joins: (upline.affiliate_joins || 0) + 1
      })
      .eq('id', upline.id);
    
    // Record transaction
    await supabase
      .from('affiliate_transactions')
      .insert([{
        user_id: upline.id,
        referred_user_id: newUserId,
        level: level,
        amount: 0,
        status: 'joined',
        created_at: new Date().toISOString()
      }]);
    
    // Continue upline
    if (upline.referred_by && level < 10) {
      await processReferral(upline.referred_by, newUserId, level + 1);
    }
  } catch (err) {
    console.error('Referral processing error:', err);
  }
}

// ===== PROCESS COMMISSION =====
async function processCommission(userId, packagePrice) {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('uid', userId)
      .limit(1);
    
    if (error || !users || users.length === 0) return;
    const user = users[0];
    if (!user.referred_by) return;
    
    const commissionRate = 0.10;
    const commission = Math.round(packagePrice * commissionRate);
    
    let currentRefCode = user.referred_by;
    for (let level = 1; level <= 10; level++) {
      if (!currentRefCode) break;
      
      const { data: uplines, error: uErr } = await supabase
        .from('users')
        .select('*')
        .eq('referral_code', currentRefCode)
        .limit(1);
      
      if (uErr || !uplines || uplines.length === 0) break;
      
      const upline = uplines[0];
      
      // Update balance
      await supabase
        .from('users')
        .update({
          affiliate_balance: (upline.affiliate_balance || 0) + commission
        })
        .eq('id', upline.id);
      
      // Record
      await supabase
        .from('affiliate_transactions')
        .insert([{
          user_id: upline.id,
          from_user_id: userId,
          level: level,
          amount: commission,
          status: 'commission',
          description: `Komisi level ${level} dari pembelian paket`,
          created_at: new Date().toISOString()
        }]);
      
      currentRefCode = upline.referred_by || '';
    }
  } catch (err) {
    console.error('Commission processing error:', err);
  }
}

// ===== LOAD USER DATA =====
async function loadUserData(user) {
  currentUser = user;
  
  if (!user) {
    userData = null;
    return null;
  }
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('uid', user.id)
    .single();
  
  if (error || !data) {
    userData = null;
    return null;
  }
  
  userData = data;
  return data;
}

// ===== UPDATE USER FIELD =====
async function updateUserField(field, value) {
  if (!currentUser) return;
  
  if (typeof value === 'object' && value.__op === 'increment') {
    // Handle increment operations
    const { data, error } = await supabase.rpc('increment_field', {
      user_uid: currentUser.id,
      field_name: field,
      amount: value.amount
    });
    if (error) {
      // Fallback: read current, add, update
      const { data: user } = await supabase.from('users').select(field).eq('uid', currentUser.id).single();
      if (user) {
        const newVal = (user[field] || 0) + value.amount;
        await supabase.from('users').update({ [field]: newVal }).eq('uid', currentUser.id);
        if (userData) userData[field] = newVal;
      }
    } else {
      if (userData) userData[field] = (userData[field] || 0) + value.amount;
    }
    return;
  }
  
  const { error } = await supabase
    .from('users')
    .update({ [field]: value })
    .eq('uid', currentUser.id);
  
  if (!error && userData) {
    userData[field] = value;
  }
}

// Helper untuk increment
function incrementField(amount) {
  return { __op: 'increment', amount };
}

// ===== GET AUTH ERROR MESSAGE =====
function getAuthErrorMessage(err) {
  const messages = {
    'email-already-in-use': 'Email sudah terdaftar',
    'invalid-email': 'Email tidak valid',
    'user-disabled': 'Akun dinonaktifkan',
    'user-not-found': 'Email belum terdaftar',
    'wrong-password': 'Kata sandi salah',
    'weak-password': 'Kata sandi minimal 6 karakter',
    'too-many-requests': 'Terlalu banyak percobaan, coba lagi nanti',
    'Invalid login credentials': 'Email atau kata sandi salah',
    'Email not confirmed': 'Email belum diverifikasi. Cek inbox/spam kamu!'
  };
  return messages[err.message] || messages[err.code] || err.message || 'Terjadi kesalahan';
}

// ===== ENTER APP =====
function enterApp() {
  document.getElementById('authPage').classList.remove('active');
  document.getElementById('landingPage').classList.remove('active');
  document.getElementById('appMain').classList.add('active');
  
  document.getElementById('sideName').textContent = userData?.name || 'Pengguna';
  updateCoinDisplay();
  navigateTo('beranda');
}

// ===== UPDATE COINS =====
function updateCoinDisplay() {
  const coins = userData?.coins || 0;
  document.getElementById('headerCoins').textContent = coins.toLocaleString();
  document.getElementById('sideCoins').textContent = coins.toLocaleString();
}

// ===== AUTH STATE LISTENER =====
async function initAuthListener() {
  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      await loadUserData(session.user);
      if (!document.getElementById('appMain').classList.contains('active')) {
        enterApp();
      }
    } else {
      currentUser = null;
      userData = null;
      document.getElementById('appMain').classList.remove('active');
      document.getElementById('authPage').classList.remove('active');
      document.getElementById('landingPage').classList.add('active');
    }
  });
  authListener = data;
  
  // Check existing session
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await loadUserData(user);
  }
}

// ===== LOGOUT =====
async function logout() {
  try {
    await supabase.auth.signOut();
    showToast('Berhasil keluar');
  } catch (err) {
    showToast('Gagal keluar: ' + err.message);
  }
}

function confirmExit() {
  closeSidebar();
  openModal(`
    <h2>🚪 Keluar</h2>
    <p>Yakin ingin keluar dari akun kamu?</p>
    <div style="display:flex;gap:10px;margin-top:16px;">
      <button class="btn btn-secondary btn-full" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary btn-full" style="background:var(--danger);" onclick="closeModal();logout()">Keluar</button>
    </div>
  `);
}

// ===== INIT LISTENER ON LOAD =====
document.addEventListener('DOMContentLoaded', initAuthListener);
