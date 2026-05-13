-- ===== BAINVES - Supabase Database Setup =====
-- Jalankan SQL ini di Supabase SQL Editor (https://supabase.com/dashboard/project/_{YOUR_PROJECT}_/sql/new)

-- 1. TABEL USERS
CREATE TABLE IF NOT EXISTS public.users (
  id BIGSERIAL PRIMARY KEY,
  uid TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  phone TEXT,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  coins BIGINT DEFAULT 0,
  total_quiz_done BIGINT DEFAULT 0,
  total_correct BIGINT DEFAULT 0,
  paket TEXT DEFAULT 'none',
  paket_aktif BOOLEAN DEFAULT false,
  paket_aktif_until TIMESTAMPTZ,
  affiliate_balance BIGINT DEFAULT 0,
  total_withdrawn BIGINT DEFAULT 0,
  affiliate_clicks BIGINT DEFAULT 0,
  affiliate_joins BIGINT DEFAULT 0,
  affiliate_level_1 JSONB DEFAULT '[]'::jsonb,
  affiliate_level_2 JSONB DEFAULT '[]'::jsonb,
  affiliate_level_3 JSONB DEFAULT '[]'::jsonb,
  affiliate_level_4 JSONB DEFAULT '[]'::jsonb,
  affiliate_level_5 JSONB DEFAULT '[]'::jsonb,
  affiliate_level_6 JSONB DEFAULT '[]'::jsonb,
  affiliate_level_7 JSONB DEFAULT '[]'::jsonb,
  affiliate_level_8 JSONB DEFAULT '[]'::jsonb,
  affiliate_level_9 JSONB DEFAULT '[]'::jsonb,
  affiliate_level_10 JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL TRANSACTIONS (riwayat pembelian paket)
CREATE TABLE IF NOT EXISTS public.transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  type TEXT,
  paket_id TEXT,
  amount BIGINT,
  coin_bonus BIGINT,
  status TEXT DEFAULT 'success',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL REDEMPTIONS (penukaran hadiah)
CREATE TABLE IF NOT EXISTS public.redemptions (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  hadiah_id BIGINT,
  hadiah_name TEXT,
  hadiah_icon TEXT,
  coins_spent BIGINT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL AFFILIATE TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.affiliate_transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  referred_user_id TEXT,
  from_user_id TEXT,
  level BIGINT,
  amount BIGINT,
  status TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL WITHDRAWALS
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  amount BIGINT,
  method TEXT,
  phone TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL QUIZ HISTORY
CREATE TABLE IF NOT EXISTS public.quiz_history (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT,
  score BIGINT,
  total BIGINT,
  coins_earned BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABEL PRIZES (untuk admin panel nanti)
CREATE TABLE IF NOT EXISTS public.prizes (
  id BIGSERIAL PRIMARY KEY,
  name TEXT,
  icon TEXT,
  description TEXT,
  coins BIGINT,
  image TEXT,
  stock BIGINT DEFAULT 999,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_users_uid ON public.users(uid);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users(referral_code);
CREATE INDEX IF NOT EXISTS idx_redemptions_user_id ON public.redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_history_user_id ON public.quiz_history(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_transactions_user_id ON public.affiliate_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawals(user_id);

-- RLS: Izinkan akses publik baca/tulis (untuk development)
-- Untuk production, atur RLS lebih ketat
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;

-- Hapus policy jika sudah ada, lalu buat ulang
DROP POLICY IF EXISTS "Allow all" ON public.users;
DROP POLICY IF EXISTS "Allow all" ON public.transactions;
DROP POLICY IF EXISTS "Allow all" ON public.redemptions;
DROP POLICY IF EXISTS "Allow all" ON public.affiliate_transactions;
DROP POLICY IF EXISTS "Allow all" ON public.withdrawals;
DROP POLICY IF EXISTS "Allow all" ON public.quiz_history;
DROP POLICY IF EXISTS "Allow all" ON public.prizes;

CREATE POLICY "Allow all" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.redemptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.affiliate_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.withdrawals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.quiz_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.prizes FOR ALL USING (true) WITH CHECK (true);
