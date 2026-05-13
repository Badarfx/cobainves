// ===== BAINVES - Affiliate System (Supabase) =====

const AFFILIATE_PACKAGES = [
  { id: 'basic', name: 'Paket Basic', price: 15000, duration: '1 Bulan', coinBonus: 500, popular: false },
  { id: 'silver', name: 'Paket Silver', price: 60000, duration: '6 Bulan', coinBonus: 2500, popular: true },
  { id: 'gold', name: 'Paket Gold', price: 100000, duration: '1 Tahun', coinBonus: 5000, popular: false },
];

// ===== BUY PACKAGE =====
async function buyPackage(paketId) {
  if (!currentUser) {
    showToast('Silakan login terlebih dahulu');
    return;
  }
  
  const paket = AFFILIATE_PACKAGES.find(p => p.id === paketId);
  if (!paket) return;

  openModal(`
    <h2>🛒 ${paket.name}</h2>
    <p>Kamu akan membeli paket <strong>${paket.name}</strong> dengan harga:</p>
    <div style="font-size:2rem;font-weight:900;color:var(--primary);text-align:center;margin:16px 0;">
      Rp ${paket.price.toLocaleString()}
    </div>
    <p style="text-align:center;color:var(--text-light);font-size:0.85rem;">
      Durasi: ${paket.duration}<br/>
      Bonus: 🪙 ${paket.coinBonus} koin
    </p>
    <div style="display:flex;gap:10px;margin-top:20px;">
      <button class="btn btn-secondary btn-full" onclick="closeModal()">Batal</button>
      <button class="btn btn-primary btn-full" onclick="confirmBuyPackage('${paket.id}')">Bayar Sekarang</button>
    </div>
  `);
}

async function confirmBuyPackage(paketId) {
  const paket = AFFILIATE_PACKAGES.find(p => p.id === paketId);
  if (!paket) return;

  try {
    closeModal();
    showToast('Memproses pembayaran...');
    await new Promise(r => setTimeout(r, 1500));
    
    const newCoins = (userData?.coins || 0) + paket.coinBonus;
    const durasiMs = paket.id === 'basic' ? 30 : paket.id === 'silver' ? 180 : 365;
    
    await supabase
      .from('users')
      .update({
        coins: newCoins,
        paket: paket.id,
        paket_aktif: true,
        paket_aktif_until: new Date(Date.now() + durasiMs * 86400000).toISOString()
      })
      .eq('uid', currentUser.id);
    
    userData.coins = newCoins;
    userData.paket = paket.id;
    userData.paket_aktif = true;
    updateCoinDisplay();
    
    // Process commissions
    await processCommission(currentUser.id, paket.price);
    
    // Record transaction
    await supabase
      .from('transactions')
      .insert([{
        user_id: currentUser.id,
        type: 'paket',
        paket_id: paket.id,
        amount: paket.price,
        coin_bonus: paket.coinBonus,
        created_at: new Date().toISOString()
      }]);
    
    showToast(`✅ ${paket.name} berhasil diaktifkan! 🪙 +${paket.coinBonus} koin`);
    navigateTo(currentPage);
  } catch (err) {
    showToast('Gagal: ' + err.message);
  }
}

// ===== WITHDRAW AFFILIATE BALANCE =====
async function withdrawAffiliate(amount) {
  if (!currentUser || !userData) return;
  
  const balance = userData.affiliate_balance || 0;
  if (amount > balance) {
    showToast('Saldo affiliate tidak mencukupi');
    return;
  }
  
  if (amount < 50000) {
    openModal(`
      <h2>💳 Penarikan Saldo</h2>
      <p>Minimal penarikan adalah <strong>Rp 50.000</strong></p>
      <button class="btn btn-primary btn-full" onclick="closeModal()">Mengerti</button>
    `);
    return;
  }

  openModal(`
    <h2>💳 Penarikan Saldo</h2>
    <p>Masukkan detail penarikan:</p>
    <div class="form-group">
      <label>Jumlah Penarikan</label>
      <input type="number" id="withdrawAmount" class="form-input" value="${amount}" min="50000" max="${balance}" />
    </div>
    <div class="form-group">
      <label>Metode</label>
      <select id="withdrawMethod" class="form-input">
        <option value="dana">DANA</option>
        <option value="gopay">GoPay</option>
        <option value="ovo">OVO</option>
        <option value="bank">Transfer Bank</option>
      </select>
    </div>
    <div class="form-group">
      <label>Nomor Tujuan</label>
      <input type="text" id="withdrawPhone" class="form-input" placeholder="08xxxxxxxxxx" value="${userData.phone || ''}" />
    </div>
    <div style="display:flex;gap:10px;margin-top:16px;">
      <button class="btn btn-secondary btn-full" onclick="closeModal()">Batal</button>
      <button class="btn btn-accent btn-full" onclick="confirmWithdraw()">Kirim Penarikan</button>
    </div>
  `);
}

async function confirmWithdraw() {
  const amount = parseInt(document.getElementById('withdrawAmount').value);
  const method = document.getElementById('withdrawMethod').value;
  const phone = document.getElementById('withdrawPhone').value.trim();
  
  if (!amount || amount < 50000) { showToast('Minimal penarikan Rp 50.000'); return; }
  if (!phone) { showToast('Nomor tujuan harus diisi'); return; }
  
  try {
    await supabase.from('withdrawals').insert([{
      user_id: currentUser.id,
      user_name: userData.name,
      amount: amount,
      method: method,
      phone: phone,
      status: 'pending',
      created_at: new Date().toISOString()
    }]);
    
    await supabase
      .from('users')
      .update({
        affiliate_balance: (userData.affiliate_balance || 0) - amount,
        total_withdrawn: (userData.total_withdrawn || 0) + amount
      })
      .eq('uid', currentUser.id);
    
    userData.affiliate_balance = (userData.affiliate_balance || 0) - amount;
    userData.total_withdrawn = (userData.total_withdrawn || 0) + amount;
    
    closeModal();
    showToast('✅ Permintaan penarikan dikirim! Menunggu verifikasi admin.');
    navigateTo('affiliate');
  } catch (err) {
    showToast('Gagal: ' + err.message);
  }
}

// ===== COPY AFFILIATE LINK =====
function copyAffiliateLink() {
  if (!currentUser) return;
  const link = `${window.location.origin}${window.location.pathname}?ref=${userData?.referral_code || ''}`;
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(link).then(() => showToast('✅ Link affiliate disalin!'))
      .catch(() => fallbackCopy(link));
  } else {
    fallbackCopy(link);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
  showToast('✅ Link affiliate disalin!');
}

// ===== SHOW COINS =====
function showCoins() {
  openModal(`
    <h2>🪙 Koin Saya</h2>
    <div style="text-align:center;padding:20px;">
      <div style="font-size:4rem;font-weight:900;color:var(--warning);">${(userData?.coins || 0).toLocaleString()}</div>
      <p style="color:var(--text-light);">Koin</p>
    </div>
    <p style="font-size:0.85rem;color:var(--text-light);text-align:center;">Dapatkan lebih banyak koin dengan menjawab kuis dan mengajak teman!</p>
    <button class="btn btn-primary btn-full" style="margin-top:16px;" onclick="closeModal();navigateTo('kuis')">Ikuti Kuis 🎯</button>
  `);
}

// ===== GET AFFILIATE STATS =====
async function getAffiliateStats() {
  if (!currentUser || !userData) return null;
  
  let totalEarnings = 0;
  const levelBreakdown = [];
  
  for (let i = 1; i <= 10; i++) {
    const levelField = `affiliate_level_${i}`;
    const levelUsers = userData[levelField] || [];
    const levelCount = Array.isArray(levelUsers) ? levelUsers.length : 0;
    
    // Count transactions for earnings per level
    let levelEarnings = 0;
    const { data: txns } = await supabase
      .from('affiliate_transactions')
      .select('amount')
      .eq('user_id', currentUser.id)
      .eq('level', i)
      .eq('status', 'commission');
    
    if (txns) {
      levelEarnings = txns.reduce((sum, t) => sum + (t.amount || 0), 0);
    }
    
    if (levelCount > 0 || levelEarnings > 0) {
      totalEarnings += levelEarnings;
      levelBreakdown.push({ level: i, count: levelCount, earnings: levelEarnings });
    }
  }
  
  return {
    balance: userData.affiliate_balance || 0,
    totalWithdrawn: userData.total_withdrawn || 0,
    referralCode: userData.referral_code || '',
    clicks: userData.affiliate_clicks || 0,
    joins: userData.affiliate_joins || 0,
    totalEarnings,
    levelBreakdown
  };
}
