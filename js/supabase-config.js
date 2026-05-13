// ===== Supabase Config =====
const SUPABASE_URL = "https://qgdqhlptxdrxqsxixvlv.supabase.co";
const SUPABASE_ANON_KEY = "sb_secret_Y6bx31jNk1Na8MLFyKCq2Q_wKCv17Wy";

// Inisialisasi Supabase
let supabase = null;

// Cek apakah library Supabase sudah dimuat
if (window.supabaseJs) {
  supabase = window.supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.error('Supabase library not loaded');
}
