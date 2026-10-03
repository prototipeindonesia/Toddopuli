/* ============================================================
   TODDOPULI v3.1 - Script Utama
   Bapperida Kota Palopo
   Firebase + Cloudinary + Chart + Excel + Realtime + Multi-Admin
============================================================ */

import {
  initializeApp, deleteApp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, getDoc, setDoc, serverTimestamp, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ============================================================
// KONFIGURASI
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyDd5aSNwQWtKNdyZvin7hOwlHHdBDyRQQg",
  authDomain: "toddopuli.firebaseapp.com",
  projectId: "toddopuli",
  storageBucket: "toddopuli.firebasestorage.app",
  messagingSenderId: "335127104149",
  appId: "1:335127104149:web:972c337e7f4db3b7e6e99c",
  measurementId: "G-840HNFYJ61"
};

const CLOUDINARY_CLOUD = "vsuyvv7v";
const CLOUDINARY_PRESET = "toddopuli_unsigned";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ============================================================
// KONFIG KATEGORI
// ============================================================
const KATEGORI = {
  inovasi: {
    nama: 'Inovasi', icon: 'fa-lightbulb',
    fields: [
      { key:'judul', label:'Judul Inovasi', type:'text', required:true },
      { key:'opd', label:'OPD Pengusul', type:'text', required:true },
      { key:'tahun', label:'Tahun', type:'text', required:true },
      { key:'status', label:'Status', type:'select', options:['Aktif','Pilot','Draft','Selesai'] },
      { key:'deskripsi', label:'Deskripsi', type:'textarea', required:true },
      { key:'gambar', label:'Gambar/Poster', type:'image' }
    ]
  },
  riset: {
    nama: 'Riset', icon: 'fa-flask',
    fields: [
      { key:'judul', label:'Judul Riset', type:'text', required:true },
      { key:'peneliti', label:'Peneliti', type:'text', required:true },
      { key:'tahun', label:'Tahun', type:'text', required:true },
      { key:'deskripsi', label:'Deskripsi', type:'textarea', required:true },
      { key:'dokumen', label:'File Dokumen (PDF)', type:'file' }
    ]
  },
  publikasi: {
    nama: 'Publikasi', icon: 'fa-book',
    fields: [
      { key:'judul', label:'Judul Publikasi', type:'text', required:true },
      { key:'jenis', label:'Jenis', type:'select', options:['Laporan','Jurnal','Profil','Buku','Artikel'] },
      { key:'tahun', label:'Tahun', type:'text', required:true },
      { key:'deskripsi', label:'Deskripsi', type:'textarea', required:true },
      { key:'dokumen', label:'File Publikasi (PDF)', type:'file' }
    ]
  },
  hki: {
    nama: 'HKI', icon: 'fa-certificate',
    fields: [
      { key:'judul', label:'Judul HKI', type:'text', required:true },
      { key:'pemilik', label:'Pemilik', type:'text', required:true },
      { key:'nomor', label:'Nomor Pendaftaran', type:'text', required:true },
      { key:'tahun', label:'Tahun', type:'text', required:true },
      { key:'jenis', label:'Jenis HKI', type:'select', options:['Hak Cipta','Merek','Paten','Desain Industri'] },
      { key:'deskripsi', label:'Deskripsi', type:'textarea' },
      { key:'sertifikat', label:'File Sertifikat (PDF)', type:'file' }
    ]
  },
  berita: {
    nama: 'Berita', icon: 'fa-newspaper',
    fields: [
      { key:'judul', label:'Judul Berita', type:'text', required:true },
      { key:'tanggal', label:'Tanggal', type:'date', required:true },
      { key:'deskripsi', label:'Isi Berita', type:'textarea', required:true },
      { key:'gambar', label:'Gambar Berita', type:'image' }
    ]
  },
  pelatihan: {
    nama: 'Pelatihan', icon: 'fa-chalkboard-teacher',
    fields: [
      { key:'judul', label:'Judul Pelatihan', type:'text', required:true },
      { key:'tanggal', label:'Tanggal Pelaksanaan', type:'date', required:true },
      { key:'kuota', label:'Kuota Peserta', type:'text' },
      { key:'deskripsi', label:'Deskripsi', type:'textarea', required:true },
      { key:'gambar', label:'Poster Pelatihan', type:'image' }
    ]
  },
  database: {
    nama: 'Database', icon: 'fa-database',
    fields: [
      { key:'judul', label:'Nama Dataset', type:'text', required:true },
      { key:'kategori', label:'Kategori', type:'text', required:true },
      { key:'deskripsi', label:'Deskripsi', type:'textarea', required:true },
      { key:'dokumen', label:'File Dataset', type:'file' }
    ]
  }
};

// ============================================================
// STATE GLOBAL
// ============================================================
let currentUser = null;
let currentProfile = null;
let currentAdminPage = 'dashboard';
let cachedData = {
  inovasi:[], riset:[], publikasi:[], hki:[],
  berita:[], pelatihan:[], database:[]
};
let cachedUsers = [];
let editingId = null;
let editingKategori = null;
let editingUserId = null;
let pendingUploadFile = null;
let unsubscribers = [];
let chartTahunInstance = null;
let chartOpdInstance = null;
let isFirstSnapshot = true;  // Untuk hindari toast "Data Baru" saat load pertama

// ============================================================
// UTIL
// ============================================================
const $ = (id) => document.getElementById(id);
const isAdminPage = () => !!$('adminApp');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[c]));

function formatTanggal(t) {
  if (!t) return '-';
  try {
    const d = new Date(t);
    return d.toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });
  } catch { return t; }
}

// ============================================================
// TOAST NOTIFICATION
// ============================================================
function toast(type, title, msg, duration = 4000) {
  const container = $('toastContainer');
  if (!container) return alert(`${title}\n${msg}`);
  const icons = {
    success:'fa-circle-check',
    error:'fa-circle-xmark',
    info:'fa-circle-info'
  };
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = `
    <i class="fas ${icons[type] || icons.info}"></i>
    <div class="toast-body">
      <div class="toast-title">${esc(title)}</div>
      <div class="toast-msg">${esc(msg)}</div>
    </div>
  `;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(120%)';
  }, duration);
  setTimeout(() => el.remove(), duration + 400);
}

// ============================================================
// ROLE / PERMISSION
// ============================================================
function role() { return currentProfile?.role || null; }
function isSuperAdmin() { return role() === 'super_admin'; }
function isAdminOrAbove() { return ['super_admin','admin'].includes(role()); }
function isEditorOrAbove() { return ['super_admin','admin','editor'].includes(role()); }

// ============================================================
// LOAD DATA
// ============================================================
async function loadAllData() {
  const keys = Object.keys(KATEGORI);
  await Promise.all(keys.map(async (k) => {
    try {
      const snap = await getDocs(collection(db, k));
      cachedData[k] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('Gagal memuat', k, e);
      cachedData[k] = [];
    }
  }));
}

// ============================================================
// REALTIME LISTENER
// ============================================================
function startRealtimeListeners() {
  // Hentikan listener lama
  unsubscribers.forEach(u => { try { u(); } catch {} });
  unsubscribers = [];
  isFirstSnapshot = true;

  Object.keys(KATEGORI).forEach(k => {
    const unsub = onSnapshot(
      collection(db, k),
      (snap) => {
        const prevLen = cachedData[k].length;
        cachedData[k] = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Toast hanya kalau memang ADA data baru (bukan load pertama)
        if (!isFirstSnapshot && prevLen > 0) {
          const added = snap.docChanges().filter(c => c.type === 'added');
          added.forEach(c => {
            const judul = c.doc.data().judul || '-';
            toast('info', '📢 Data Baru', `${KATEGORI[k].nama}: ${judul}`);
          });
        }

        // Refresh UI sesuai halaman aktif
        if (isAdminPage()) {
          if (currentAdminPage === k) renderCrud();
          else if (currentAdminPage === 'dashboard') {
            updateStats();
            renderDashboardCharts();
          } else if (currentAdminPage === 'galeri') {
            renderGaleri();
          }
        } else {
          // Halaman publik
          const renderFn = {
            inovasi: renderInovasi,
            riset: renderRiset,
            publikasi: renderPublikasi,
            hki: renderHki,
            berita: renderBerita,
            pelatihan: renderPelatihan,
            database: renderDatabase
          }[k];
          if (renderFn) renderFn();
          if (['inovasi','berita','pelatihan'].includes(k)) renderPubGaleri();
          updateStats();
        }
      },
      (err) => console.warn('Realtime err:', k, err)
    );
    unsubscribers.push(unsub);
  });

  // Users listener (khusus super admin)
  if (isAdminPage() && isSuperAdmin()) {
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        cachedUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (currentAdminPage === 'users') renderUsers();
      },
      (err) => console.warn('Users listener err:', err)
    );
    unsubscribers.push(unsub);
  }

  // Setelah 2 detik, snapshot sudah bukan "pertama" lagi
  setTimeout(() => { isFirstSnapshot = false; }, 2000);
}

// ============================================================
// RENDER STATISTIK
// ============================================================
function updateStats() {
  const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  set('statInovasi', cachedData.inovasi.length);
  set('statRiset', cachedData.riset.length);
  set('statHki', cachedData.hki.length);
  set('statBerita', cachedData.berita.length);
  set('dashInovasi', cachedData.inovasi.length);
  set('dashRiset', cachedData.riset.length);
  set('dashPub', cachedData.publikasi.length);
  set('dashHki', cachedData.hki.length);
  set('dashBerita', cachedData.berita.length);
  set('dashPelatihan', cachedData.pelatihan.length);
  set('dashDb', cachedData.database.length);
}

function emptyMsg(text = 'Belum ada data.') {
  return `<div class="loading"><i class="fas fa-inbox" style="font-size:36px;opacity:.4;display:block;margin-bottom:10px;"></i>${text}</div>`;
}

function buildCard(d, k, extraLabel = '') {
  const img = d.gambar
    ? `<img class="thumb" src="${esc(d.gambar)}" alt="${esc(d.judul)}" loading="lazy">`
    : '';
  const badge = extraLabel ? `<span class="badge">${esc(extraLabel)}</span>` : '';
  const desc = String(d.deskripsi || '');
  const descCut = desc.length > 120 ? desc.substring(0, 120) + '...' : desc;
  return `<div class="item" onclick="showDetail('${k}','${d.id}')">
    ${img}
    <h4>${esc(d.judul)}</h4>
    <p>${esc(descCut)}</p>
    ${badge}
  </div>`;
}

// ============================================================
// RENDER PUBLIK
// ============================================================
function renderInovasi() {
  if (!$('listInovasi')) return;
  const q = ($('searchInovasi')?.value || '').toLowerCase();
  const th = $('filterTahunInovasi')?.value || '';
  let d = cachedData.inovasi;
  if (q) d = d.filter(x =>
    (x.judul||'').toLowerCase().includes(q) ||
    (x.opd||'').toLowerCase().includes(q)
  );
  if (th) d = d.filter(x => x.tahun === th);
  $('listInovasi').innerHTML = d.length
    ? d.map(x => buildCard(x, 'inovasi', `${x.opd} • ${x.tahun}`)).join('')
    : emptyMsg('Belum ada data inovasi.');
}

function renderRiset() {
  if (!$('listRiset')) return;
  const q = ($('searchRiset')?.value || '').toLowerCase();
  let d = cachedData.riset;
  if (q) d = d.filter(x => (x.judul||'').toLowerCase().includes(q));
  $('listRiset').innerHTML = d.length
    ? d.map(x => buildCard(x, 'riset', `${x.peneliti} • ${x.tahun}`)).join('')
    : emptyMsg('Belum ada data riset.');
}

function renderPublikasi() {
  if (!$('listPublikasi')) return;
  const q = ($('searchPub')?.value || '').toLowerCase();
  let d = cachedData.publikasi;
  if (q) d = d.filter(x => (x.judul||'').toLowerCase().includes(q));
  $('listPublikasi').innerHTML = d.length
    ? d.map(x => buildCard(x, 'publikasi', `${x.jenis} • ${x.tahun}`)).join('')
    : emptyMsg('Belum ada publikasi.');
}

function renderHki() {
  if (!$('listHki')) return;
  const q = ($('searchHki')?.value || '').toLowerCase();
  let d = cachedData.hki;
  if (q) d = d.filter(x => (x.judul||'').toLowerCase().includes(q));
  $('listHki').innerHTML = d.length
    ? d.map(x => buildCard(x, 'hki', `${x.jenis} • ${x.tahun}`)).join('')
    : emptyMsg('Belum ada data HKI.');
}

function renderBerita() {
  if (!$('listBerita')) return;
  const d = cachedData.berita;
  $('listBerita').innerHTML = d.length
    ? d.map(x => buildCard(x, 'berita', formatTanggal(x.tanggal))).join('')
    : emptyMsg('Belum ada berita.');
}

function renderPelatihan() {
  if (!$('listPelatihan')) return;
  const q = ($('searchPelatihan')?.value || '').toLowerCase();
  let d = cachedData.pelatihan;
  if (q) d = d.filter(x => (x.judul||'').toLowerCase().includes(q));
  $('listPelatihan').innerHTML = d.length
    ? d.map(x => buildCard(x, 'pelatihan', formatTanggal(x.tanggal))).join('')
    : emptyMsg('Belum ada pelatihan.');
}

function renderDatabase() {
  if (!$('listDatabase')) return;
  const q = ($('searchDb')?.value || '').toLowerCase();
  let d = cachedData.database;
  if (q) d = d.filter(x => (x.judul||'').toLowerCase().includes(q));
  $('listDatabase').innerHTML = d.length
    ? d.map(x => buildCard(x, 'database', x.kategori)).join('')
    : emptyMsg('Belum ada data.');
}

// ============================================================
// GALERI (PUBLIK & ADMIN)
// ============================================================
function getGaleriItems(filterKategori = '', query = '') {
  const items = [];
  ['inovasi','berita','pelatihan'].forEach(k => {
    if (filterKategori && filterKategori !== k) return;
    cachedData[k].forEach(d => {
      if (d.gambar) items.push({ ...d, _kategori: k });
    });
  });
  if (query) {
    const q = query.toLowerCase();
    return items.filter(x => (x.judul||'').toLowerCase().includes(q));
  }
  return items;
}

function buildGaleriCard(x) {
  const meta = x.opd || x.peneliti || formatTanggal(x.tanggal) || '-';
  return `<div class="galeri-item" onclick="showDetail('${x._kategori}','${x.id}')">
    <img src="${esc(x.gambar)}" alt="${esc(x.judul)}" loading="lazy">
    <span class="galeri-tag">${KATEGORI[x._kategori].nama}</span>
    <div class="galeri-info">
      <b>${esc(x.judul)}</b>
      <small>${esc(meta)}</small>
    </div>
  </div>`;
}

function renderPubGaleri() {
  const container = $('pubGaleriList');
  if (!container) return;
  const q = $('pubGaleriSearch')?.value || '';
  const items = getGaleriItems('', q);
  container.innerHTML = items.length
    ? items.map(buildGaleriCard).join('')
    : emptyMsg('Belum ada foto di galeri.');
}

function renderGaleri() {
  const container = $('galeriList');
  if (!container) return;
  const q = $('galeriSearch')?.value || '';
  const f = $('galeriFilter')?.value || '';
  const items = getGaleriItems(f, q);
  container.innerHTML = items.length
    ? items.map(buildGaleriCard).join('')
    : emptyMsg('Belum ada gambar.');
}

// ============================================================
// NAVIGASI PUBLIK
// ============================================================
function showPage(page, e) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = $('page-' + page);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
  const el = e?.target || document.querySelector(`.nav-link[onclick*="'${page}'"]`);
  if (el) el.classList.add('active');

  const hero = $('heroSection');
  if (hero) hero.style.display = page === 'home' ? 'block' : 'none';

  $('navMenu')?.classList.remove('show');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const map = {
    inovasi: renderInovasi, riset: renderRiset, publikasi: renderPublikasi,
    hki: renderHki, berita: renderBerita, pelatihan: renderPelatihan,
    database: renderDatabase, galeri: renderPubGaleri
  };
  if (map[page]) map[page]();
  if (page === 'home') updateStats();
}

function toggleMenu() { $('navMenu')?.classList.toggle('show'); }

// ============================================================
// DETAIL MODAL
// ============================================================
function showDetail(k, id) {
  const d = cachedData[k]?.find(x => x.id === id);
  if (!d) return;
  const cfg = KATEGORI[k];
  let html = `<h2>${esc(d.judul)}</h2>`;
  if (d.gambar) {
    html += `<img class="preview-img" src="${esc(d.gambar)}" alt="">`;
  }
  cfg.fields.forEach(f => {
    if (['judul','gambar','dokumen','sertifikat'].includes(f.key)) return;
    if (d[f.key] != null && d[f.key] !== '') {
      const val = f.type === 'date' ? formatTanggal(d[f.key]) : esc(d[f.key]);
      html += `<p style="margin-bottom:10px;"><b>${f.label}:</b><br>${val}</p>`;
    }
  });
  if (d.dokumen) {
    html += `<a href="${esc(d.dokumen)}" target="_blank" rel="noopener" class="btn-primary" style="margin-top:12px;text-decoration:none;"><i class="fas fa-file-pdf"></i> Lihat Dokumen</a>`;
  }
  if (d.sertifikat) {
    html += `<a href="${esc(d.sertifikat)}" target="_blank" rel="noopener" class="btn-primary" style="margin-top:12px;text-decoration:none;"><i class="fas fa-file-certificate"></i> Lihat Sertifikat</a>`;
  }
  $('detailContent').innerHTML = html;
  $('detailModal').classList.add('show');
}
function closeDetail() { $('detailModal')?.classList.remove('show'); }

// ============================================================
// LOGIN PUBLIK
// ============================================================
function openLogin() {
  if (currentUser) {
    if (confirm('Logout dari TODDOPULI?')) authLogout();
    return;
  }
  $('loginModal').classList.add('show');
}
function closeLogin() { $('loginModal')?.classList.remove('show'); }

async function doLogin() {
  const email = $('loginEmail').value.trim();
  const pass = $('loginPass').value.trim();
  const err = $('loginError');
  if (!email || !pass) { err.textContent = 'Email dan password wajib diisi!'; return; }
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    closeLogin();
    toast('success', 'Login Berhasil', 'Mengalihkan ke panel admin...');
    setTimeout(() => window.location.href = 'admin.html', 800);
  } catch (e) {
    err.textContent = 'Login gagal: ' + (
      e.code === 'auth/invalid-credential'
        ? 'Email atau password salah.'
        : e.message
    );
  }
}

function loginGuest() {
  closeLogin();
  toast('info', 'Mode Pengunjung', 'Semua fitur publik dapat diakses.');
}

// ============================================================
// AUTH STATE
// ============================================================
onAuthStateChanged(auth, async (user) => {
  currentUser = user;

  // Update tombol login di publik
  const btn = $('loginBtn');
  if (btn) {
    if (user) {
      btn.innerHTML = `<i class="fas fa-user-shield"></i> <span>${esc(user.email.split('@')[0])}</span>`;
      btn.onclick = () => {
        if (confirm('Buka Panel Admin?')) location.href = 'admin.html';
      };
    } else {
      btn.innerHTML = `<i class="fas fa-user"></i> <span>Login</span>`;
      btn.onclick = openLogin;
    }
  }

  // Handle halaman admin
  if (isAdminPage()) {
    if (user) {
      // Ambil profil user
      try {
        const profileSnap = await getDoc(doc(db, 'users', user.uid));
        if (profileSnap.exists()) {
          currentProfile = profileSnap.data();
        } else {
          currentProfile = { role: 'viewer', email: user.email, nama: user.email };
          toast('error', 'Akses Ditolak', 'Akun Anda belum terdaftar sebagai admin.');
        }
      } catch (e) {
        console.error(e);
        currentProfile = { role: 'viewer', email: user.email };
      }

      if (!isEditorOrAbove()) {
        toast('error', 'Akses Terbatas', 'Anda tidak punya izin mengelola data.');
      }

      $('authScreen').style.display = 'none';
      $('adminApp').style.display = 'block';
      $('userEmail').textContent = `${currentProfile.nama || user.email} (${role() || 'viewer'})`;
      initAdmin();
    } else {
      $('authScreen').style.display = 'flex';
      $('adminApp').style.display = 'none';
    }
  }
});

// ============================================================
// HALAMAN ADMIN
// ============================================================
async function authLogin() {
  const email = $('authEmail').value.trim();
  const pass = $('authPass').value.trim();
  const err = $('authError');
  if (!email || !pass) { err.textContent = 'Email & password wajib diisi!'; return; }
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (e) {
    err.textContent = 'Login gagal: ' + (
      e.code === 'auth/invalid-credential'
        ? 'Email atau password salah.'
        : e.message
    );
  }
}

async function authLogout() {
  if (!confirm('Yakin logout?')) return;
  unsubscribers.forEach(u => { try { u(); } catch {} });
  unsubscribers = [];
  await signOut(auth);
  location.href = 'index.html';
}

async function initAdmin() {
  await loadAllData();
  updateStats();
  renderActivity();
  startRealtimeListeners();
  showAdminPage('dashboard');
}

const PAGE_TITLES = {
  dashboard: ['Dashboard', 'Ringkasan data TODDOPULI'],
  inovasi: ['Inovasi', 'Kelola data inovasi daerah'],
  riset: ['Riset', 'Kelola hasil riset & kajian'],
  publikasi: ['Publikasi', 'Kelola dokumen publikasi'],
  hki: ['HKI', 'Kelola Hak Kekayaan Intelektual'],
  berita: ['Berita', 'Kelola berita & informasi'],
  pelatihan: ['Pelatihan', 'Kelola program pelatihan'],
  database: ['Database', 'Kelola dataset & dokumen'],
  galeri: ['Galeri Foto', 'Semua gambar dari berbagai kategori'],
  users: ['Kelola Admin', 'Atur siapa saja yang bisa mengelola TODDOPULI']
};

function showAdminPage(page, btn) {
  currentAdminPage = page;

  // Pindah halaman
  document.querySelectorAll('.adm-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.side-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  if (page === 'dashboard') {
    $('adm-dashboard').classList.add('active');
    updateStats();
    // Panggil setelah DOM render
    requestAnimationFrame(() => renderDashboardCharts());
  } else if (page === 'galeri') {
    $('adm-galeri').classList.add('active');
    renderGaleri();
  } else if (page === 'users') {
    $('adm-users').classList.add('active');
    if (!isSuperAdmin()) {
      $('usersList').innerHTML = '<div class="info-box"><i class="fas fa-lock"></i><p>Hanya Super Admin yang dapat mengelola admin.</p></div>';
    } else {
      renderUsers();
    }
  } else {
    $('adm-crud').classList.add('active');
    const [t, s] = PAGE_TITLES[page] || ['Kelola Data',''];
    $('crudTitle').innerHTML = `<i class="fas ${KATEGORI[page].icon}"></i> ${t}`;
    $('crudSubtitle').textContent = s;
    $('crudSearch').value = '';
    renderCrud();
  }
}

// ============================================================
// DASHBOARD CHARTS
// ============================================================
function renderDashboardCharts() {
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js belum siap');
    return;
  }

  // Chart 1: Inovasi per Tahun
  const tahunMap = {};
  cachedData.inovasi.forEach(x => {
    if (x.tahun) tahunMap[x.tahun] = (tahunMap[x.tahun] || 0) + 1;
  });
  const tahunLabels = Object.keys(tahunMap).sort();
  const tahunValues = tahunLabels.map(t => tahunMap[t]);

  const ctx1 = $('chartTahun');
  if (ctx1) {
    if (chartTahunInstance) chartTahunInstance.destroy();
    chartTahunInstance = new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: tahunLabels.length ? tahunLabels : ['Belum ada data'],
        datasets: [{
          label: 'Jumlah Inovasi',
          data: tahunValues.length ? tahunValues : [0],
          backgroundColor: '#1E3A8A',
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });
  }

  // Chart 2: Inovasi per OPD
  const opdMap = {};
  cachedData.inovasi.forEach(x => {
    if (x.opd) opdMap[x.opd] = (opdMap[x.opd] || 0) + 1;
  });
  const opdLabels = Object.keys(opdMap).slice(0, 8);
  const opdValues = opdLabels.map(o => opdMap[o]);
  const colors = ['#1E3A8A','#1D4ED8','#2563EB','#3B82F6','#60A5FA','#93C5FD','#BFDBFE','#DBEAFE'];

  const ctx2 = $('chartOpd');
  if (ctx2) {
    if (chartOpdInstance) chartOpdInstance.destroy();
    chartOpdInstance = new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: opdLabels.length ? opdLabels : ['Belum ada data'],
        datasets: [{
          data: opdValues.length ? opdValues : [1],
          backgroundColor: colors,
          borderWidth: 2, borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 11 }, padding: 10 }
          }
        }
      }
    });
  }
}

// ============================================================
// CRUD LIST
// ============================================================
function renderCrud() {
  const k = currentAdminPage;
  if (k === 'dashboard' || k === 'galeri' || k === 'users') return;

  const container = $('crudList');
  if (!container) return;

  const q = ($('crudSearch')?.value || '').toLowerCase();
  let list = cachedData[k] || [];
  if (q) list = list.filter(x => (x.judul||'').toLowerCase().includes(q));

  const canDelete = isAdminOrAbove();
  const canEdit = isEditorOrAbove();

  container.innerHTML = list.length
    ? list.map(d => {
      const img = d.gambar ? `<img class="thumb" src="${esc(d.gambar)}" alt="">` : '';
      const badge = d.opd || d.jenis || d.kategori || d.peneliti || d.pemilik;
      const date = d.tanggal ? formatTanggal(d.tanggal) : d.tahun;
      const desc = String(d.deskripsi || '');
      const descCut = desc.length > 100 ? desc.substring(0, 100) + '...' : desc;
      return `<div class="crud-item">
        ${img}
        <h4>${esc(d.judul)}</h4>
        <p>${esc(descCut)}</p>
        ${badge ? `<span class="badge">${esc(badge)}</span>` : ''}
        ${date ? `<div class="meta" style="font-size:11px;color:#94A3B8;margin-top:6px;"><i class="fas fa-calendar"></i> ${esc(date)}</div>` : ''}
        <div class="crud-actions">
          <button class="btn-edit" onclick="openForm('${d.id}')" ${canEdit ? '' : 'disabled'}>
            <i class="fas fa-pen"></i> Edit
          </button>
          <button class="btn-del" onclick="hapusData('${d.id}')" ${canDelete ? '' : 'disabled'}>
            <i class="fas fa-trash"></i> Hapus
          </button>
        </div>
      </div>`;
    }).join('')
    : emptyMsg('Belum ada data.');
}

// ============================================================
// FORM MODAL
// ============================================================
function openForm(id = null) {
  const k = currentAdminPage;
  if (k === 'dashboard' || k === 'galeri' || k === 'users') return;
  if (!isEditorOrAbove()) {
    toast('error', 'Akses Ditolak', 'Anda tidak punya izin.');
    return;
  }

  editingKategori = k;
  editingId = id;
  pendingUploadFile = null;

  const cfg = KATEGORI[k];
  $('formTitle').innerHTML = `<i class="fas ${cfg.icon}"></i> ${id ? 'Edit' : 'Tambah'} ${cfg.nama}`;

  const d = id ? cachedData[k].find(x => x.id === id) : {};
  let html = '';
  cfg.fields.forEach(f => {
    const val = d?.[f.key] ?? '';
    const req = f.required ? 'required' : '';
    html += `<label>${f.label}${f.required ? ' <span style="color:#DC2626">*</span>' : ''}</label>`;

    if (f.type === 'textarea') {
      html += `<textarea id="f_${f.key}" ${req} placeholder="${f.label}...">${esc(val)}</textarea>`;
    } else if (f.type === 'select') {
      html += `<select id="f_${f.key}" ${req}>`;
      f.options.forEach(o => {
        html += `<option value="${esc(o)}" ${val === o ? 'selected' : ''}>${esc(o)}</option>`;
      });
      html += `</select>`;
    } else if (f.type === 'image') {
      html += `
        <div class="upload-box" onclick="document.getElementById('file_${f.key}').click()">
          <i class="fas fa-cloud-upload-alt"></i>
          <p>Tap untuk pilih gambar</p>
          <small>JPG/PNG • Maks 5MB</small>
        </div>
        <input type="file" id="file_${f.key}" accept="image/*" style="display:none" onchange="handleFilePick(this,'${f.key}','image')">
        <div id="prev_${f.key}">${val ? `<img class="preview-img" src="${esc(val)}" alt="">` : ''}</div>
        <input type="hidden" id="f_${f.key}" value="${esc(val)}">
      `;
    } else if (f.type === 'file') {
      html += `
        <div class="upload-box" onclick="document.getElementById('file_${f.key}').click()">
          <i class="fas fa-file-upload"></i>
          <p>Tap untuk pilih file</p>
          <small>PDF/DOC/XLS • Maks 10MB</small>
        </div>
        <input type="file" id="file_${f.key}" accept=".pdf,.doc,.docx,.xls,.xlsx" style="display:none" onchange="handleFilePick(this,'${f.key}','file')">
        <div id="prev_${f.key}">${val ? `
          <div class="preview-file">
            <i class="fas fa-file-pdf"></i>
            <span>File sudah tersimpan</span>
            <a href="${esc(val)}" target="_blank" rel="noopener" style="color:var(--primary);font-size:12px;font-weight:600;">Lihat</a>
          </div>` : ''}</div>
        <input type="hidden" id="f_${f.key}" value="${esc(val)}">
      `;
    } else {
      html += `<input type="${f.type}" id="f_${f.key}" value="${esc(val)}" ${req} placeholder="${f.label}...">`;
    }
  });
  $('formFields').innerHTML = html;
  $('formModal').classList.add('show');
}

function closeForm() {
  $('formModal')?.classList.remove('show');
  editingId = null;
  pendingUploadFile = null;
}

function handleFilePick(input, key, kind) {
  const file = input.files?.[0];
  if (!file) return;
  const max = kind === 'image' ? 5 : 10;
  if (file.size > max * 1024 * 1024) {
    alert(`Ukuran file maksimal ${max}MB`);
    input.value = '';
    return;
  }
  pendingUploadFile = { file, key, kind };
  const prev = $('prev_' + key);
  if (kind === 'image') {
    prev.innerHTML = `<img class="preview-img" src="${URL.createObjectURL(file)}" alt="">`;
  } else {
    prev.innerHTML = `<div class="preview-file"><i class="fas fa-file"></i><span>${esc(file.name)}</span></div>`;
  }
}

// ============================================================
// UPLOAD CLOUDINARY
// ============================================================
async function uploadFile(file, path, onProgress) {
  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/auto/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress?.(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve(res.secure_url || res.url);
        } catch {
          reject(new Error('Respons Cloudinary tidak valid'));
        }
      } else {
        let msg = 'Upload gagal (' + xhr.status + ')';
        try {
          const errRes = JSON.parse(xhr.responseText);
          if (errRes.error?.message) msg = errRes.error.message;
        } catch {}
        reject(new Error(msg));
      }
    };
    xhr.onerror = () => reject(new Error('Koneksi ke Cloudinary gagal'));
    xhr.send(formData);
  });
}

// ============================================================
// SIMPAN FORM
// ============================================================
async function saveForm() {
  const k = editingKategori;
  if (!k) return;
  if (!isEditorOrAbove()) {
    toast('error', 'Akses Ditolak', 'Anda tidak punya izin.');
    return;
  }

  const cfg = KATEGORI[k];
  const btn = $('saveBtn');
  const data = {};

  // Kumpulkan data teks
  for (const f of cfg.fields) {
    if (f.type === 'image' || f.type === 'file') continue;
    const el = $('f_' + f.key);
    const v = el ? el.value.trim() : '';
    if (f.required && !v) {
      alert(`Field "${f.label}" wajib diisi!`);
      return;
    }
    if (v !== '') data[f.key] = v;
  }

  // Ambil URL file lama (untuk edit tanpa ganti file)
  for (const f of cfg.fields) {
    if (f.type !== 'image' && f.type !== 'file') continue;
    const hidden = $('f_' + f.key);
    if (hidden && hidden.value) data[f.key] = hidden.value;
  }

  try {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

    // Upload file baru jika ada
    if (pendingUploadFile) {
      const { file, key } = pendingUploadFile;
      $('uploadProgress').style.display = 'block';
      $('uploadFill').style.width = '0%';
      const url = await uploadFile(file, null, (p) => {
        $('uploadFill').style.width = p + '%';
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Upload ${p}%`;
      });
      data[key] = url;
    }

    // Simpan ke Firestore
    if (editingId) {
      await updateDoc(doc(db, k, editingId), {
        ...data,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser?.email
      });
    } else {
      await addDoc(collection(db, k), {
        ...data,
        createdAt: serverTimestamp(),
        createdBy: currentUser?.email
      });
    }

    saveActivity(editingId ? 'edit' : 'tambah', k, data.judul);
    closeForm();
    toast('success', 'Berhasil!', 'Data berhasil disimpan.');
  } catch (e) {
    console.error(e);
    toast('error', 'Gagal Menyimpan', e.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Simpan Data';
    $('uploadProgress').style.display = 'none';
    $('uploadFill').style.width = '0%';
  }
}

async function hapusData(id) {
  const k = currentAdminPage;
  if (!isAdminOrAbove()) {
    toast('error', 'Akses Ditolak', 'Hanya Admin yang bisa menghapus.');
    return;
  }
  if (!confirm('Yakin hapus data ini?')) return;
  try {
    const item = cachedData[k].find(x => x.id === id);
    await deleteDoc(doc(db, k, id));
    saveActivity('hapus', k, item?.judul || '');
    toast('success', 'Terhapus', 'Data berhasil dihapus.');
  } catch (e) {
    toast('error', 'Gagal Hapus', e.message);
  }
}

// ============================================================
// EXPORT EXCEL
// ============================================================
function exportExcel() {
  const k = currentAdminPage;
  if (!KATEGORI[k]) return;
  const data = cachedData[k] || [];
  if (!data.length) {
    return toast('error', 'Tidak Ada Data', 'Belum ada data untuk diexport.');
  }

  const cfg = KATEGORI[k];
  const rows = data.map(d => {
    const row = {};
    cfg.fields.forEach(f => {
      row[f.label] = d[f.key] ?? '';
    });
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, cfg.nama);
  XLSX.writeFile(wb, `TODDOPULI_${cfg.nama}_${new Date().toISOString().slice(0,10)}.xlsx`);
  toast('success', 'Export Berhasil', `Data ${cfg.nama} telah diunduh.`);
}

// ============================================================
// EXPORT PDF
// ============================================================
function exportPDF() {
  const k = currentAdminPage;
  if (!KATEGORI[k]) return;
  const data = cachedData[k] || [];
  if (!data.length) {
    return toast('error', 'Tidak Ada Data', 'Belum ada data untuk diexport.');
  }

  const cfg = KATEGORI[k];
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('TODDOPULI - Bapperida Kota Palopo', 14, 15);
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text(`Daftar ${cfg.nama}`, 14, 22);
  doc.setFontSize(9);
  doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 14, 28);

  const fields = cfg.fields.filter(f => !['image','file'].includes(f.type)).slice(0, 6);
  const headers = [fields.map(f => f.label)];
  const rows = data.map(d => fields.map(f => String(d[f.key] ?? '').substring(0, 60)));

  doc.autoTable({
    head: headers,
    body: rows,
    startY: 33,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 248, 255] }
  });

  doc.save(`TODDOPULI_${cfg.nama}_${new Date().toISOString().slice(0,10)}.pdf`);
  toast('success', 'Export Berhasil', `Data ${cfg.nama} telah diunduh.`);
}

// ============================================================
// IMPORT EXCEL
// ============================================================
function triggerImport() {
  const k = currentAdminPage;
  if (!KATEGORI[k]) return;
  if (!isEditorOrAbove()) {
    toast('error', 'Akses Ditolak', 'Anda tidak punya izin.');
    return;
  }
  $('importFile').click();
}

async function handleImport(input) {
  const file = input.files?.[0];
  if (!file) return;
  const k = currentAdminPage;
  const cfg = KATEGORI[k];

  try {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

    if (!rows.length) {
      toast('error', 'File Kosong', 'Tidak ada data di file Excel.');
      return;
    }

    if (!confirm(`Akan mengimpor ${rows.length} baris ke kategori ${cfg.nama}. Lanjutkan?`)) return;

    // Mapping kolom: label ATAU key (case-insensitive)
    const labelToKey = {};
    cfg.fields.forEach(f => {
      labelToKey[f.label.toLowerCase().trim()] = f.key;
      labelToKey[f.key.toLowerCase().trim()] = f.key;
    });

    // Set judul existing (untuk cek duplikat)
    const existingJudul = new Set(
      (cachedData[k] || []).map(x => String(x.judul || '').toLowerCase().trim())
    );

    let success = 0, skipped = 0, failed = 0;

    for (const row of rows) {
      const docData = {};
      Object.keys(row).forEach(col => {
        const key = labelToKey[col.toLowerCase().trim()];
        if (key && row[col] !== '') docData[key] = String(row[col]).trim();
      });

      if (!docData.judul) { failed++; continue; }

      // Cek duplikat
      const j = docData.judul.toLowerCase().trim();
      if (existingJudul.has(j)) { skipped++; continue; }

      try {
        await addDoc(collection(db, k), {
          ...docData,
          createdAt: serverTimestamp(),
          importedBy: currentUser?.email
        });
        existingJudul.add(j);
        success++;
      } catch (err) {
        console.error(err);
        failed++;
      }
    }

    const msg = `${success} berhasil, ${skipped} dilewati (duplikat), ${failed} gagal.`;
    toast('success', 'Import Selesai', msg);
    saveActivity('import', k, msg);
  } catch (e) {
    console.error(e);
    toast('error', 'Import Gagal', e.message);
  } finally {
    input.value = '';
  }
}

// ============================================================
// USERS MANAGEMENT
// ============================================================
function renderUsers() {
  if (!isSuperAdmin()) return;
  const container = $('usersList');
  if (!container) return;

  container.innerHTML = cachedUsers.length
    ? cachedUsers.map(u => `
      <div class="crud-item">
        <h4><i class="fas fa-user-shield"></i> ${esc(u.nama || u.email)}</h4>
        <p>${esc(u.email)}</p>
        <span class="role-badge role-${esc(u.role)}">${esc((u.role || '').replace('_',' '))}</span>
        <div class="crud-actions">
          <button class="btn-edit" onclick="editUser('${u.id}')"><i class="fas fa-pen"></i> Edit</button>
          <button class="btn-del" onclick="hapusUser('${u.id}')" ${u.id === currentUser?.uid ? 'disabled' : ''}>
            <i class="fas fa-trash"></i> Hapus
          </button>
        </div>
      </div>
    `).join('')
    : emptyMsg('Belum ada admin terdaftar.');
}

function openUserForm() {
  editingUserId = null;
  $('userFormTitle').innerHTML = '<i class="fas fa-user-plus"></i> Tambah Admin';
  $('u_email').value = '';
  $('u_nama').value = '';
  $('u_role').value = 'admin';
  $('u_pass').value = '';
  $('u_email').disabled = false;
  $('u_pass').parentElement.style.display = 'block';
  $('userModal').classList.add('show');
}

function editUser(id) {
  const u = cachedUsers.find(x => x.id === id);
  if (!u) return;
  editingUserId = id;
  $('userFormTitle').innerHTML = '<i class="fas fa-user-pen"></i> Edit Admin';
  $('u_email').value = u.email || '';
  $('u_nama').value = u.nama || '';
  $('u_role').value = u.role || 'admin';
  $('u_email').disabled = true;
  $('u_pass').parentElement.style.display = 'none';
  $('userModal').classList.add('show');
}

function closeUserForm() {
  $('userModal')?.classList.remove('show');
  editingUserId = null;
}

/**
 * 🔥 Buat user baru TANPA mengganggu session login utama
 * Menggunakan secondary Firebase App instance
 */
async function createUserSecondary(email, password) {
  const SECONDARY_NAME = 'toddopuli-secondary';
  let secondaryApp;
  try {
    secondaryApp = initializeApp(firebaseConfig, SECONDARY_NAME);
  } catch (e) {
    // Kalau sudah ada, itu ok
    console.warn('Secondary app sudah ada, lanjut...');
  }
  const secondaryAuth = getAuth(secondaryApp);
  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = cred.user.uid;
    await signOut(secondaryAuth);
    await deleteApp(secondaryApp);
    return uid;
  } catch (e) {
    try { await deleteApp(secondaryApp); } catch {}
    throw e;
  }
}

async function saveUser() {
  if (!isSuperAdmin()) {
    return toast('error', 'Akses Ditolak', 'Hanya Super Admin.');
  }

  const email = $('u_email').value.trim();
  const nama = $('u_nama').value.trim();
  const r = $('u_role').value;
  const pass = $('u_pass').value.trim();

  if (!email) return toast('error', 'Gagal', 'Email wajib diisi.');

  try {
    if (editingUserId) {
      // Update role & nama saja
      await updateDoc(doc(db, 'users', editingUserId), {
        nama, role: r,
        updatedAt: serverTimestamp()
      });
      toast('success', 'Berhasil', 'Data admin diperbarui.');
    } else {
      // Buat user baru via secondary app (TIDAK sign-out dari akun saat ini!)
      if (!pass || pass.length < 6) {
        return toast('error', 'Gagal', 'Password minimal 6 karakter.');
      }
      const uid = await createUserSecondary(email, pass);
      await setDoc(doc(db, 'users', uid), {
        email,
        nama: nama || email,
        role: r,
        createdAt: serverTimestamp(),
        createdBy: currentUser?.email
      });
      toast('success', 'Berhasil', 'Admin baru ditambahkan.');
    }
    closeUserForm();
  } catch (e) {
    console.error(e);
    let msg = e.message;
    if (e.code === 'auth/email-already-in-use') {
      msg = 'Email sudah terdaftar di Firebase Authentication.';
    } else if (e.code === 'auth/invalid-email') {
      msg = 'Format email tidak valid.';
    } else if (e.code === 'auth/weak-password') {
      msg = 'Password terlalu lemah (minimal 6 karakter).';
    }
    toast('error', 'Gagal', msg);
  }
}

async function hapusUser(id) {
  if (!isSuperAdmin()) return;
  if (id === currentUser?.uid) {
    return toast('error', 'Tidak Bisa', 'Tidak bisa hapus akun sendiri.');
  }
  if (!confirm('Yakin hapus admin ini dari daftar?\n\nCatatan: Akun Firebase Authentication harus dihapus manual dari Console Firebase.')) return;
  try {
    await deleteDoc(doc(db, 'users', id));
    toast('success', 'Berhasil', 'Admin dihapus dari daftar.');
  } catch (e) {
    toast('error', 'Gagal', e.message);
  }
}

// ============================================================
// ACTIVITY LOG (localStorage — per device)
// ============================================================
function saveActivity(action, kategori, judul) {
  const log = JSON.parse(localStorage.getItem('toddopuli_log') || '[]');
  log.unshift({
    action, kategori, judul,
    time: new Date().toISOString(),
    user: currentUser?.email || 'unknown'
  });
  localStorage.setItem('toddopuli_log', JSON.stringify(log.slice(0, 20)));
}

function renderActivity() {
  const el = $('activityLog');
  if (!el) return;
  const log = JSON.parse(localStorage.getItem('toddopuli_log') || '[]');
  if (!log.length) {
    el.innerHTML = '<p class="empty"><i class="fas fa-clock" style="font-size:24px;opacity:.4;display:block;margin-bottom:8px;"></i>Belum ada aktivitas.</p>';
    return;
  }
  el.innerHTML = log.map(a => {
    const iconMap = { tambah:'fa-plus', edit:'fa-pen', hapus:'fa-trash', import:'fa-file-import' };
    const colorMap = { tambah:'#059669', edit:'#F59E0B', hapus:'#DC2626', import:'#2563EB' };
    const t = new Date(a.time).toLocaleString('id-ID', {
      day:'2-digit', month:'short',
      hour:'2-digit', minute:'2-digit'
    });
    return `<div class="activity-item">
      <i class="fas ${iconMap[a.action] || 'fa-circle'}" style="background:${(colorMap[a.action] || '#64748B')}20;color:${colorMap[a.action] || '#64748B'};"></i>
      <div>
        <b>${esc(a.action.toUpperCase())}</b> ${esc(a.kategori)} — ${esc(a.judul)}
        <div class="time">${t}</div>
      </div>
    </div>`;
  }).join('');
}

// ============================================================
// GLOBAL SEARCH
// ============================================================
function globalSearch() {
  const q = $('globalSearch')?.value.trim();
  if (!q) {
    toast('error', 'Kata Kunci Kosong', 'Silakan isi kata kunci pencarian.');
    return;
  }
  const qLower = q.toLowerCase();
  const results = [];
  Object.entries(cachedData).forEach(([k, list]) => {
    list.forEach(d => {
      if ((d.judul || '').toLowerCase().includes(qLower) ||
          (d.deskripsi || '').toLowerCase().includes(qLower)) {
        results.push({ k, id: d.id, judul: d.judul, kategori: KATEGORI[k].nama });
      }
    });
  });

  if (!results.length) {
    toast('info', 'Tidak Ditemukan', `Tidak ada hasil untuk "${q}"`);
    return;
  }

  // Tampilkan hasil di modal detail (lebih baik dari alert)
  let html = `<h2><i class="fas fa-search"></i> Hasil Pencarian "${esc(q)}"</h2>`;
  html += `<p style="margin-bottom:14px;color:var(--gray);font-size:13px;">Ditemukan ${results.length} hasil</p>`;
  html += results.slice(0, 20).map(r => `
    <div class="item" style="margin-bottom:8px;" onclick="closeDetail();showDetail('${r.k}','${r.id}');">
      <span class="badge" style="margin-bottom:6px;display:inline-block;">${esc(r.kategori)}</span>
      <h4 style="margin-top:6px;">${esc(r.judul)}</h4>
    </div>
  `).join('');
  if (results.length > 20) {
    html += `<p style="text-align:center;color:var(--gray);font-size:12px;margin-top:10px;">Menampilkan 20 dari ${results.length} hasil</p>`;
  }

  $('detailContent').innerHTML = html;
  $('detailModal').classList.add('show');
}

// ============================================================
// EVENT LISTENERS
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  $('globalSearch')?.addEventListener('keypress', e => {
    if (e.key === 'Enter') globalSearch();
  });
  $('loginPass')?.addEventListener('keypress', e => {
    if (e.key === 'Enter') doLogin();
  });
  $('authPass')?.addEventListener('keypress', e => {
    if (e.key === 'Enter') authLogin();
  });
  $('pubGaleriSearch')?.addEventListener('input', renderPubGaleri);

  // Klik luar modal untuk close
  document.querySelectorAll('.modal').forEach(m => {
    m.addEventListener('click', e => {
      if (e.target === m) m.classList.remove('show');
    });
  });

  // ESC untuk close modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.show').forEach(m => m.classList.remove('show'));
    }
  });
});

// ============================================================
// EXPOSE KE WINDOW (untuk onclick di HTML)
// ============================================================
Object.assign(window, {
  showPage, toggleMenu, openLogin, closeLogin, doLogin, loginGuest,
  showDetail, closeDetail, globalSearch,
  authLogin, authLogout, showAdminPage, openForm, closeForm, saveForm,
  hapusData, handleFilePick, exportExcel, exportPDF, triggerImport, handleImport,
  renderGaleri, renderPubGaleri, openUserForm, editUser, closeUserForm, saveUser, hapusUser,
  renderInovasi, renderRiset, renderPublikasi, renderHki,
  renderBerita, renderPelatihan, renderDatabase, renderCrud
});

// ============================================================
// BOOTSTRAP PUBLIK
// ============================================================
if (!isAdminPage()) {
  (async () => {
    try {
      await loadAllData();
      updateStats();
      renderInovasi();
      renderRiset();
      renderPublikasi();
      renderHki();
      renderBerita();
      renderPelatihan();
      renderDatabase();
      renderPubGaleri();
      startRealtimeListeners();
    } catch (e) {
      console.error('Init error:', e);
      toast('error', 'Gagal Memuat', 'Periksa koneksi internet Anda.');
    }
  })();
}
