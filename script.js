/* ============================================================
   TODDOPULI v3.5 - Script Utama
   Bapperida Kota Palopo
   Firebase + Cloudinary + Chart + Excel + Realtime + Multi-Admin
   + Google Drive Link + OPD Management + Inovasi Extended
   + Filter Jenis & Bentuk Inovasi + ROLE ADMIN OPD
   + Sinkron dengan admin.html v3.5
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
      { key:'nama_inovator', label:'Nama Inovator', type:'text', required:true },
      { key:'opd', label:'OPD Pengusul', type:'opd_select', required:true },
      { key:'jenis_inovasi', label:'Jenis Inovasi', type:'select',
        options:['Layanan Publik','Tata Pemerintahan','Lainnya'], required:true },
      { key:'bentuk_inovasi', label:'Bentuk Inovasi', type:'select',
        options:['Digital','Non Digital'], required:true },
      { key:'tahun', label:'Tahun', type:'text', required:true },
      { key:'status', label:'Status', type:'select',
        options:['Aktif','Pilot','Draft','Selesai'] },
      { key:'deskripsi', label:'Deskripsi', type:'textarea', required:true },
      { key:'manfaat', label:'Manfaat', type:'textarea', required:true },
      { key:'hasil', label:'Hasil', type:'textarea', required:true },
      { key:'laporan', label:'Link Laporan Inovasi (Google Drive, opsional)', type:'text' },
      { key:'gambar', label:'Link Gambar Inovasi (Google Drive — JPG/PNG/JPEG)', type:'text' }
    ]
  },
  riset: {
    nama: 'Riset', icon: 'fa-flask',
    fields: [
      { key:'judul', label:'Judul Riset', type:'text', required:true },
      { key:'peneliti', label:'Peneliti', type:'text', required:true },
      { key:'tahun', label:'Tahun', type:'text', required:true },
      { key:'deskripsi', label:'Deskripsi', type:'textarea', required:true },
      { key:'dokumen', label:'Link Dokumen (Google Drive)', type:'text' }
    ]
  },
  publikasi: {
    nama: 'Publikasi', icon: 'fa-book',
    fields: [
      { key:'judul', label:'Judul Publikasi', type:'text', required:true },
      { key:'jenis', label:'Jenis', type:'select',
        options:['Laporan','Jurnal','Profil','Buku','Artikel'] },
      { key:'tahun', label:'Tahun', type:'text', required:true },
      { key:'deskripsi', label:'Deskripsi', type:'textarea', required:true },
      { key:'dokumen', label:'Link Publikasi (Google Drive)', type:'text' }
    ]
  },
  hki: {
    nama: 'HKI', icon: 'fa-certificate',
    fields: [
      { key:'judul', label:'Judul HKI', type:'text', required:true },
      { key:'pemilik', label:'Pemilik', type:'text', required:true },
      { key:'nomor', label:'Nomor Pendaftaran', type:'text', required:true },
      { key:'tahun', label:'Tahun', type:'text', required:true },
      { key:'jenis', label:'Jenis HKI', type:'select',
        options:['Hak Cipta','Merek','Paten','Desain Industri'] },
      { key:'deskripsi', label:'Deskripsi', type:'textarea' },
      { key:'sertifikat', label:'Link Sertifikat (Google Drive)', type:'text' }
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
      { key:'dokumen', label:'Link Dataset (Google Drive)', type:'text' }
    ]
  },
  opd: {
    nama: 'OPD', icon: 'fa-building',
    fields: [
      { key:'judul', label:'Nama OPD', type:'text', required:true },
      { key:'singkatan', label:'Singkatan (opsional)', type:'text' },
      { key:'deskripsi', label:'Keterangan (opsional)', type:'textarea' }
    ]
  }
};

// ============================================================
// HELPER: URL FIELDS
// ============================================================
const URL_KEYS = ['gambar','dokumen','sertifikat','laporan'];
const isUrlField = (key) => URL_KEYS.includes(key);

// ============================================================
// HELPER: NORMALISASI URL GOOGLE DRIVE
// ============================================================
function extractDriveFileId(url) {
  if (!url) return null;
  const s = String(url).trim();
  if (!s) return null;
  const m1 = s.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) return m1[1];
  const m2 = s.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2) return m2[1];
  const m3 = s.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m3) return m3[1];
  return null;
}

function normalizeDriveUrl(url) {
  if (!url) return '';
  const s = String(url).trim();
  if (!s) return '';
  if (!s.includes('drive.google.com') && !s.includes('docs.google.com')) return s;
  const fileId = extractDriveFileId(s);
  if (!fileId) return s;
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

function normalizeDriveImageUrl(url) {
  if (!url) return '';
  const s = String(url).trim();
  if (!s) return '';
  if (!s.includes('drive.google.com') && !s.includes('docs.google.com')) return s;
  const fileId = extractDriveFileId(s);
  if (!fileId) return s;
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
}

function getImageUrl(url) {
  if (!url) return '';
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    return normalizeDriveImageUrl(url);
  }
  return url;
}

// ============================================================
// STATE GLOBAL
// ============================================================
let currentUser = null;
let currentProfile = null;
let currentAdminPage = 'dashboard';
let cachedData = {
  inovasi:[], riset:[], publikasi:[], hki:[],
  berita:[], pelatihan:[], database:[], opd:[]
};
let cachedUsers = [];
let editingId = null;
let editingKategori = null;
let editingUserId = null;
let pendingUploadFile = null;
let unsubscribers = [];
let chartTahunInstance = null;
let chartOpdInstance = null;
let chartJenisInstance = null;
let chartBentukInstance = null;
let isFirstSnapshot = true;

// ============================================================
// MENU YANG DIIZINKAN UNTUK ADMIN OPD
// ============================================================
const ADMIN_OPD_MENUS = ['dashboard', 'inovasi', 'riset', 'pelatihan', 'galeri'];
const ADMIN_OPD_STAT_CARDS = ['dashInovasi', 'dashRiset', 'dashPelatihan'];

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
// TOAST
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
// ROLE / PERMISSION HELPERS
// ============================================================
function role() { return currentProfile?.role || null; }
function isSuperAdmin() { return role() === 'super_admin'; }
function isAdmin() { return role() === 'admin'; }
function isAdminOpd() { return role() === 'admin_opd'; }
function isEditor() { return role() === 'editor'; }

function isAnyAdmin() {
  return ['super_admin', 'admin', 'admin_opd', 'editor'].includes(role());
}
function isAdminOrAbove() { return ['super_admin', 'admin'].includes(role()); }
function isEditorOrAbove() {
  return ['super_admin', 'admin', 'admin_opd', 'editor'].includes(role());
}

// ============================================================
// DATA FILTER UNTUK ADMIN OPD
// ============================================================
function filterDataForRole(kategori, list) {
  if (!isAdminOpd()) return list;
  if (kategori === 'inovasi') {
    return list.filter(d => d.opd === currentProfile?.opd);
  }
  if (kategori === 'riset' || kategori === 'pelatihan') {
    return list.filter(d => d.createdBy === currentUser?.email);
  }
  return [];
}

// ============================================================
// CEK IZIN EDIT / HAPUS PER ITEM
// ============================================================
function canEditItem(kategori, d) {
  if (isSuperAdmin() || isAdmin() || isEditor()) return true;
  if (isAdminOpd()) {
    if (kategori === 'inovasi') return d.opd === currentProfile?.opd;
    if (kategori === 'riset' || kategori === 'pelatihan') {
      return d.createdBy === currentUser?.email;
    }
    return false;
  }
  return false;
}

function canDeleteItem(kategori, d) {
  if (isSuperAdmin() || isAdmin()) return true;
  if (isAdminOpd()) {
    if (kategori === 'inovasi') return d.opd === currentProfile?.opd;
    if (kategori === 'riset' || kategori === 'pelatihan') {
      return d.createdBy === currentUser?.email;
    }
    return false;
  }
  return false;
}

// ============================================================
// TERAPKAN ROLE KE UI (SIDEBAR & STAT CARDS & SIDEBAR INFO)
// ============================================================
function applyRoleToUI() {
  // === 1. Update Sidebar User Info ===
  const sidebarInfo = $('sidebarUserInfo');
  if (sidebarInfo) {
    if (currentProfile?.nama || role()) {
      const roleLabel = (role() || 'viewer').replace('_', ' ');
      const opdLine = (isAdminOpd() && currentProfile?.opd)
        ? `<div style="margin-top:4px;color:#1E40AF;font-weight:600;">
             <i class="fas fa-building"></i> ${esc(currentProfile.opd)}
           </div>`
        : '';
      sidebarInfo.innerHTML = `
        <div style="font-weight:700;color:#1E3A8A;">
          <i class="fas fa-user-circle"></i> ${esc(currentProfile?.nama || currentUser?.email || '-')}
        </div>
        <div style="margin-top:2px;text-transform:capitalize;">
          <i class="fas fa-shield-halved"></i> ${esc(roleLabel)}
        </div>
        ${opdLine}
      `;
      sidebarInfo.style.display = 'block';
    } else {
      sidebarInfo.style.display = 'none';
    }
  }

  // === 2. Sembunyikan menu sidebar yang tidak diizinkan ===
  document.querySelectorAll('.side-btn').forEach(btn => {
    const onclickAttr = btn.getAttribute('onclick') || '';
    const match = onclickAttr.match(/showAdminPage\('([^']+)'/);
    const page = match ? match[1] : null;
    if (!page) return;

    let show = true;

    if (isAdminOpd()) {
      show = ADMIN_OPD_MENUS.includes(page);
    } else if (isEditor()) {
      if (page === 'users') show = false;
    } else if (isAdmin()) {
      if (page === 'users') show = false;
    }

    if (page === 'users' && !isSuperAdmin()) show = false;

    btn.style.display = show ? 'flex' : 'none';
  });

  // === 3. Sembunyikan stat card yang tidak diizinkan untuk admin_opd ===
  document.querySelectorAll('.stat-card').forEach(card => {
    const h3 = card.querySelector('h3');
    const id = h3?.id || '';
    if (isAdminOpd() && !ADMIN_OPD_STAT_CARDS.includes(id)) {
      card.style.display = 'none';
    } else {
      card.style.display = '';
    }
  });

  // === 4. Update subtitle dashboard & galeri untuk admin OPD ===
  const dashSub = $('dashboardSubtitle');
  if (dashSub) {
    if (isAdminOpd()) {
      dashSub.textContent = `Ringkasan data TODDOPULI — ${currentProfile?.opd || 'OPD Anda'}`;
    } else {
      dashSub.textContent = 'Ringkasan data TODDOPULI';
    }
  }

  const galeriSub = $('galeriSubtitle');
  if (galeriSub) {
    if (isAdminOpd()) {
      galeriSub.textContent = `Gambar dari data ${currentProfile?.opd || 'OPD Anda'}`;
    } else {
      galeriSub.textContent = 'Semua gambar dari Inovasi, Berita, dan Pelatihan';
    }
  }
}

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
  unsubscribers.forEach(u => { try { u(); } catch {} });
  unsubscribers = [];
  isFirstSnapshot = true;

  Object.keys(KATEGORI).forEach(k => {
    const unsub = onSnapshot(
      collection(db, k),
      (snap) => {
        const prevLen = cachedData[k].length;
        cachedData[k] = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        if (!isFirstSnapshot && prevLen > 0) {
          const added = snap.docChanges().filter(c => c.type === 'added');
          added.forEach(c => {
            const judul = c.doc.data().judul || '-';
            toast('info', '📢 Data Baru', `${KATEGORI[k].nama}: ${judul}`);
          });
        }

        if (isAdminPage()) {
          if (currentAdminPage === k) renderCrud();
          else if (currentAdminPage === 'dashboard') {
            updateStats();
            renderDashboardCharts();
          } else if (currentAdminPage === 'galeri') {
            renderGaleri();
          }
        } else {
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

  setTimeout(() => { isFirstSnapshot = false; }, 2000);
}

// ============================================================
// STATISTIK
// ============================================================
function updateStats() {
  const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };

  set('statInovasi', cachedData.inovasi.length);
  set('statRiset', cachedData.riset.length);
  set('statHki', cachedData.hki.length);
  set('statBerita', cachedData.berita.length);

  let inovasiCount = cachedData.inovasi.length;
  let risetCount = cachedData.riset.length;
  let pelatihanCount = cachedData.pelatihan.length;

  if (isAdminOpd()) {
    inovasiCount = filterDataForRole('inovasi', cachedData.inovasi).length;
    risetCount = filterDataForRole('riset', cachedData.riset).length;
    pelatihanCount = filterDataForRole('pelatihan', cachedData.pelatihan).length;
  }

  set('dashInovasi', inovasiCount);
  set('dashRiset', risetCount);
  set('dashPub', cachedData.publikasi.length);
  set('dashHki', cachedData.hki.length);
  set('dashBerita', cachedData.berita.length);
  set('dashPelatihan', pelatihanCount);
  set('dashDb', cachedData.database.length);
}

function emptyMsg(text = 'Belum ada data.') {
  return `<div class="loading"><i class="fas fa-inbox" style="font-size:36px;opacity:.4;display:block;margin-bottom:10px;"></i>${text}</div>`;
}

// ============================================================
// CARD BUILDER (UMUM)
// ============================================================
function buildCard(d, k, extraLabel = '') {
  const imgSrc = d.gambar ? getImageUrl(d.gambar) : '';
  const img = imgSrc ? `<img class="thumb" src="${esc(imgSrc)}" alt="${esc(d.judul)}" loading="lazy" onerror="this.style.display='none'">` : '';
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
// CARD BUILDER KHUSUS INOVASI
// ============================================================
function buildInovasiCard(d) {
  const imgSrc = d.gambar ? getImageUrl(d.gambar) : '';
  const img = imgSrc ? `<img class="thumb" src="${esc(imgSrc)}" alt="${esc(d.judul)}" loading="lazy" onerror="this.style.display='none'">` : '';
  const desc = String(d.deskripsi || '');
  const descCut = desc.length > 120 ? desc.substring(0, 120) + '...' : desc;
  const inovator = d.nama_inovator ? `<div class="meta"><i class="fas fa-user"></i> ${esc(d.nama_inovator)}</div>` : '';
  const jenis = d.jenis_inovasi ? `<span class="badge badge-jenis">${esc(d.jenis_inovasi)}</span>` : '';
  const bentuk = d.bentuk_inovasi ? `<span class="badge badge-bentuk">${esc(d.bentuk_inovasi)}</span>` : '';
  const opdTahun = (d.opd || d.tahun) ? `<span class="badge">${esc(d.opd || '')}${d.opd && d.tahun ? ' • ' : ''}${esc(d.tahun || '')}</span>` : '';
  return `<div class="item item-inovasi" onclick="showDetail('inovasi','${d.id}')">
    ${img}
    <h4>${esc(d.judul)}</h4>
    <p>${esc(descCut)}</p>
    <div class="badge-row">
      ${opdTahun}
      ${jenis}
      ${bentuk}
    </div>
    ${inovator}
  </div>`;
}

// ============================================================
// RENDER PUBLIK
// ============================================================
function renderInovasi() {
  if (!$('listInovasi')) return;
  const q = ($('searchInovasi')?.value || '').toLowerCase();
  const th = $('filterTahunInovasi')?.value || '';
  const jenis = $('filterJenisInovasi')?.value || '';
  const bentuk = $('filterBentukInovasi')?.value || '';

  let d = cachedData.inovasi;
  if (q) d = d.filter(x =>
    (x.judul||'').toLowerCase().includes(q) ||
    (x.opd||'').toLowerCase().includes(q) ||
    (x.nama_inovator||'').toLowerCase().includes(q) ||
    (x.deskripsi||'').toLowerCase().includes(q)
  );
  if (th) d = d.filter(x => String(x.tahun) === String(th));
  if (jenis) d = d.filter(x => x.jenis_inovasi === jenis);
  if (bentuk) d = d.filter(x => x.bentuk_inovasi === bentuk);

  $('listInovasi').innerHTML = d.length
    ? d.map(buildInovasiCard).join('')
    : emptyMsg('Belum ada data inovasi yang sesuai filter.');
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
// GALERI
// ============================================================
function getGaleriItems(filterKategori = '', query = '') {
  const items = [];
  ['inovasi','berita','pelatihan'].forEach(k => {
    if (filterKategori && filterKategori !== k) return;
    let list = cachedData[k];
    if (isAdminOpd()) {
      list = filterDataForRole(k, list);
    }
    list.forEach(d => {
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
  const meta = x.opd || x.peneliti || x.nama_inovator || formatTanggal(x.tanggal) || '-';
  const imgSrc = getImageUrl(x.gambar);
  return `<div class="galeri-item" onclick="showDetail('${x._kategori}','${x.id}')">
    <img src="${esc(imgSrc)}" alt="${esc(x.judul)}" loading="lazy" onerror="this.parentElement.style.opacity='0.3'">
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
// NAVIGASI
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
    const imgSrc = getImageUrl(d.gambar);
    html += `<img class="preview-img" src="${esc(imgSrc)}" alt="" onerror="this.style.display='none'">`;
  }

  if (k === 'inovasi') {
    let badges = '';
    if (d.opd) badges += `<span class="badge">${esc(d.opd)}</span> `;
    if (d.jenis_inovasi) badges += `<span class="badge badge-jenis">${esc(d.jenis_inovasi)}</span> `;
    if (d.bentuk_inovasi) badges += `<span class="badge badge-bentuk">${esc(d.bentuk_inovasi)}</span> `;
    if (d.status) badges += `<span class="badge">${esc(d.status)}</span>`;
    if (badges) html += `<div class="badge-row" style="margin-bottom:14px;">${badges}</div>`;
  }

  cfg.fields.forEach(f => {
    if (['judul','gambar','dokumen','sertifikat','laporan'].includes(f.key)) return;
    if (d[f.key] != null && d[f.key] !== '') {
      const val = f.type === 'date' ? formatTanggal(d[f.key]) : esc(d[f.key]);
      html += `<p style="margin-bottom:10px;"><b>${f.label}:</b><br>${val}</p>`;
    }
  });

  if (d.laporan) {
    html += `<a href="${esc(normalizeDriveUrl(d.laporan))}" target="_blank" rel="noopener" class="btn-primary" style="margin-top:12px;text-decoration:none;display:inline-block;"><i class="fas fa-file-lines"></i> Lihat Laporan Inovasi</a> `;
  }
  if (d.dokumen) {
    html += `<a href="${esc(normalizeDriveUrl(d.dokumen))}" target="_blank" rel="noopener" class="btn-primary" style="margin-top:12px;text-decoration:none;display:inline-block;"><i class="fas fa-file-pdf"></i> Lihat Dokumen</a> `;
  }
  if (d.sertifikat) {
    html += `<a href="${esc(normalizeDriveUrl(d.sertifikat))}" target="_blank" rel="noopener" class="btn-primary" style="margin-top:12px;text-decoration:none;display:inline-block;"><i class="fas fa-file-certificate"></i> Lihat Sertifikat</a>`;
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

  if (isAdminPage()) {
    if (user) {
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

      if (!isAnyAdmin()) {
        toast('error', 'Akses Terbatas', 'Anda tidak punya izin mengelola data.');
      }

      $('authScreen').style.display = 'none';
      $('adminApp').style.display = 'block';

      // Tampilkan nama + role + OPD di header
      let label = `${currentProfile.nama || user.email} (${role() || 'viewer'})`;
      if (isAdminOpd() && currentProfile.opd) {
        label = `${currentProfile.nama || user.email} (Admin OPD: ${currentProfile.opd})`;
      }
      $('userEmail').textContent = label;

      // Terapkan role ke UI
      applyRoleToUI();

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

  // Re-apply role setelah data OPD ke-load (biar dropdown OPD keisi)
  applyRoleToUI();

  let startPage = 'dashboard';
  if (isAdminOpd() && !ADMIN_OPD_MENUS.includes(startPage)) {
    startPage = ADMIN_OPD_MENUS[0];
  }
  showAdminPage(startPage);
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
  opd: ['OPD', 'Kelola daftar OPD (untuk dropdown Inovasi)'],
  galeri: ['Galeri Foto', 'Semua gambar dari berbagai kategori'],
  users: ['Kelola Admin', 'Atur siapa saja yang bisa mengelola TODDOPULI']
};

function showAdminPage(page, btn) {
  // Cek izin akses halaman
  if (isAdminOpd() && !ADMIN_OPD_MENUS.includes(page)) {
    toast('error', 'Akses Ditolak', 'Anda tidak punya akses ke menu ini.');
    return;
  }
  if (page === 'users' && !isSuperAdmin()) {
    toast('error', 'Akses Ditolak', 'Hanya Super Admin yang dapat mengelola admin.');
    return;
  }

  currentAdminPage = page;

  document.querySelectorAll('.adm-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.side-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  if (page === 'dashboard') {
    $('adm-dashboard').classList.add('active');
    updateStats();
    // Set subtitle dinamis
    const sub = $('dashboardSubtitle');
    if (sub) {
      sub.textContent = isAdminOpd()
        ? `Ringkasan data TODDOPULI — ${currentProfile?.opd || 'OPD Anda'}`
        : 'Ringkasan data TODDOPULI';
    }
    requestAnimationFrame(() => renderDashboardCharts());
  } else if (page === 'galeri') {
    $('adm-galeri').classList.add('active');
    // Set subtitle dinamis
    const sub = $('galeriSubtitle');
    if (sub) {
      sub.textContent = isAdminOpd()
        ? `Gambar dari data ${currentProfile?.opd || 'OPD Anda'}`
        : 'Semua gambar dari Inovasi, Berita, dan Pelatihan';
    }
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

  let inovasiData = cachedData.inovasi;
  if (isAdminOpd()) {
    inovasiData = filterDataForRole('inovasi', inovasiData);
  }

  // Chart 1: Inovasi per Tahun
  const tahunMap = {};
  inovasiData.forEach(x => {
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
  inovasiData.forEach(x => {
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
          legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 10 } }
        }
      }
    });
  }

  // Chart 3: Jenis Inovasi
  const jenisMap = {};
  inovasiData.forEach(x => {
    if (x.jenis_inovasi) jenisMap[x.jenis_inovasi] = (jenisMap[x.jenis_inovasi] || 0) + 1;
  });
  const jenisLabels = Object.keys(jenisMap);
  const jenisValues = jenisLabels.map(j => jenisMap[j]);
  const jenisColors = ['#F59E0B','#10B981','#6366F1','#EC4899','#8B5CF6'];

  const ctx3 = $('chartJenis');
  if (ctx3) {
    if (chartJenisInstance) chartJenisInstance.destroy();
    chartJenisInstance = new Chart(ctx3, {
      type: 'doughnut',
      data: {
        labels: jenisLabels.length ? jenisLabels : ['Belum ada data'],
        datasets: [{
          data: jenisValues.length ? jenisValues : [1],
          backgroundColor: jenisColors,
          borderWidth: 2, borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 10 } }
        }
      }
    });
  }

  // Chart 4: Bentuk Inovasi
  const bentukMap = {};
  inovasiData.forEach(x => {
    if (x.bentuk_inovasi) bentukMap[x.bentuk_inovasi] = (bentukMap[x.bentuk_inovasi] || 0) + 1;
  });
  const bentukLabels = Object.keys(bentukMap);
  const bentukValues = bentukLabels.map(b => bentukMap[b]);
  const bentukColors = ['#0EA5E9','#F97316','#84CC16'];

  const ctx4 = $('chartBentuk');
  if (ctx4) {
    if (chartBentukInstance) chartBentukInstance.destroy();
    chartBentukInstance = new Chart(ctx4, {
      type: 'pie',
      data: {
        labels: bentukLabels.length ? bentukLabels : ['Belum ada data'],
        datasets: [{
          data: bentukValues.length ? bentukValues : [1],
          backgroundColor: bentukColors,
          borderWidth: 2, borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 10 } }
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
  list = filterDataForRole(k, list);

  if (q) list = list.filter(x => (x.judul||'').toLowerCase().includes(q));

  container.innerHTML = list.length
    ? list.map(d => {
      const imgSrc = d.gambar ? getImageUrl(d.gambar) : '';
      const img = imgSrc ? `<img class="thumb" src="${esc(imgSrc)}" alt="" onerror="this.style.display='none'">` : '';
      const badge = d.opd || d.jenis || d.kategori || d.peneliti || d.pemilik;
      const date = d.tanggal ? formatTanggal(d.tanggal) : d.tahun;
      const desc = String(d.deskripsi || '');
      const descCut = desc.length > 100 ? desc.substring(0, 100) + '...' : desc;

      const editable = canEditItem(k, d);
      const deletable = canDeleteItem(k, d);

      const ownerInfo = (isAdminOpd() && d.createdBy)
        ? `<div class="meta" style="font-size:10px;color:#94A3B8;margin-top:4px;">
             <i class="fas fa-user"></i> ${esc(d.createdBy)}
           </div>`
        : '';

      return `<div class="crud-item">
        ${img}
        <h4>${esc(d.judul)}</h4>
        <p>${esc(descCut)}</p>
        ${badge ? `<span class="badge">${esc(badge)}</span>` : ''}
        ${date ? `<div class="meta" style="font-size:11px;color:#94A3B8;margin-top:6px;"><i class="fas fa-calendar"></i> ${esc(date)}</div>` : ''}
        ${ownerInfo}
        <div class="crud-actions">
          <button class="btn-edit" onclick="openForm('${d.id}')" ${editable ? '' : 'disabled title="Bukan data Anda"'}>
            <i class="fas fa-pen"></i> Edit
          </button>
          <button class="btn-del" onclick="hapusData('${d.id}')" ${deletable ? '' : 'disabled title="Bukan data Anda"'}>
            <i class="fas fa-trash"></i> Hapus
          </button>
        </div>
      </div>`;
    }).join('')
    : emptyMsg(
      isAdminOpd()
        ? `Belum ada data ${KATEGORI[k].nama} untuk ${currentProfile?.opd || 'OPD Anda'}.`
        : 'Belum ada data.'
    );
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

  if (id) {
    const existing = cachedData[k]?.find(x => x.id === id);
    if (!existing) return;
    if (!canEditItem(k, existing)) {
      toast('error', 'Akses Ditolak', 'Anda hanya dapat mengedit data milik OPD Anda.');
      return;
    }
  }

  editingKategori = k;
  editingId = id;
  pendingUploadFile = null;

  const cfg = KATEGORI[k];
  $('formTitle').innerHTML = `<i class="fas ${cfg.icon}"></i> ${id ? 'Edit' : 'Tambah'} ${cfg.nama}`;

  const d = id ? cachedData[k].find(x => x.id === id) : {};
  let html = '';

  cfg.fields.forEach(f => {
    let val = d?.[f.key] ?? '';
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

    } else if (f.type === 'opd_select') {
      // KHUSUS ADMIN OPD: OPD otomatis dari profil & terkunci
      if (isAdminOpd()) {
        val = currentProfile?.opd || '';
        html += `<input type="text" id="f_${f.key}" value="${esc(val)}" readonly class="opd-locked">`;
        html += `<small style="color:#1E40AF;font-size:11px;display:block;margin-top:-6px;margin-bottom:10px;">
          <i class="fas fa-lock"></i> OPD terkunci: <b>${esc(val || '-')}</b>
        </small>`;
      } else {
        const opdList = (cachedData.opd || [])
          .map(o => o.judul || o.nama)
          .filter(Boolean)
          .sort();
        if (opdList.length === 0) {
          html += `<input type="text" id="f_${f.key}" value="${esc(val)}" ${req} placeholder="Ketik nama OPD...">`;
          html += `<small style="color:#F59E0B;font-size:11px;display:block;margin-top:-6px;margin-bottom:10px;">
            <i class="fas fa-info-circle"></i> Belum ada daftar OPD. Tambahkan di menu <b>OPD</b> agar muncul sebagai dropdown.
          </small>`;
        } else {
          html += `<select id="f_${f.key}" ${req}>`;
          html += `<option value="">-- Pilih OPD --</option>`;
          opdList.forEach(o => {
            html += `<option value="${esc(o)}" ${val === o ? 'selected' : ''}>${esc(o)}</option>`;
          });
          if (val && !opdList.includes(val)) {
            html += `<option value="${esc(val)}" selected>${esc(val)} (lama)</option>`;
          }
          html += `</select>`;
        }
      }

    } else if (f.type === 'image') {
      html += `
        <div class="upload-box" onclick="document.getElementById('file_${f.key}').click()">
          <i class="fas fa-cloud-upload-alt"></i>
          <p>Tap untuk pilih gambar</p>
          <small>JPG/PNG • Maks 5MB</small>
        </div>
        <input type="file" id="file_${f.key}" accept="image/*" style="display:none" onchange="handleFilePick(this,'${f.key}','image')">
        <div id="prev_${f.key}">${val ? `<img class="preview-img" src="${esc(getImageUrl(val))}" alt="" onerror="this.style.display='none'">` : ''}</div>
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
            <a href="${esc(normalizeDriveUrl(val))}" target="_blank" rel="noopener" style="color:var(--primary);font-size:12px;font-weight:600;">Lihat</a>
          </div>` : ''}</div>
        <input type="hidden" id="f_${f.key}" value="${esc(val)}">
      `;

    } else if (isUrlField(f.key)) {
      const isImageField = f.key === 'gambar';
      const placeholder = isImageField
        ? 'https://drive.google.com/file/d/... (link gambar)'
        : 'https://drive.google.com/file/d/... (link dokumen)';
      html += `<input type="url" id="f_${f.key}" value="${esc(val)}" ${req}
        placeholder="${placeholder}"
        style="font-family:monospace;font-size:12px;">`;
      if (val) {
        const checkUrl = isImageField ? getImageUrl(val) : normalizeDriveUrl(val);
        html += `<small style="display:block;margin-top:-6px;margin-bottom:10px;">
          <a href="${esc(checkUrl)}" target="_blank" rel="noopener" style="color:var(--primary);font-size:11px;font-weight:600;">
            <i class="fas fa-external-link-alt"></i> Cek ${isImageField ? 'gambar' : 'link'}
          </a>
        </small>`;
      }

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
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
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

  for (const f of cfg.fields) {
    if (f.type !== 'image' && f.type !== 'file') continue;
    const hidden = $('f_' + f.key);
    if (hidden && hidden.value) data[f.key] = hidden.value;
  }

  // KHUSUS ADMIN OPD: paksa OPD mereka untuk inovasi
  if (isAdminOpd() && k === 'inovasi') {
    data.opd = currentProfile?.opd || data.opd;
  }

  if (isAdminOpd() && (k === 'riset' || k === 'pelatihan')) {
    if (!editingId) {
      data.createdBy = currentUser?.email;
    }
  }

  try {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

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

    if (editingId) {
      const existing = cachedData[k].find(x => x.id === editingId);
      if (!canEditItem(k, existing)) {
        throw new Error('Anda tidak dapat mengedit data ini.');
      }

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

  const item = cachedData[k]?.find(x => x.id === id);
  if (!item) return;

  if (!canDeleteItem(k, item)) {
    toast('error', 'Akses Ditolak', 'Anda hanya dapat menghapus data milik OPD Anda.');
    return;
  }

  if (!confirm('Yakin hapus data ini?')) return;
  try {
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
  let data = cachedData[k] || [];
  data = filterDataForRole(k, data);
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
  let data = cachedData[k] || [];
  data = filterDataForRole(k, data);
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
  doc.text(`Daftar ${cfg.nama}${isAdminOpd() ? ' - ' + currentProfile?.opd : ''}`, 14, 22);
  doc.setFontSize(9);
  doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 14, 28);

  const textFields = cfg.fields.filter(f =>
    f.type !== 'image' &&
    f.type !== 'file' &&
    !isUrlField(f.key)
  ).slice(0, 6);

  const headers = [textFields.map(f => f.label)];
  const rows = data.map(d =>
    textFields.map(f => String(d[f.key] ?? '').substring(0, 60))
  );

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

    const labelToKey = {};
    cfg.fields.forEach(f => {
      labelToKey[f.label.toLowerCase().trim()] = f.key;
      labelToKey[f.key.toLowerCase().trim()] = f.key;
    });

    const visibleList = filterDataForRole(k, cachedData[k] || []);
    const existingJudul = new Set(
      visibleList.map(x => String(x.judul || '').toLowerCase().trim())
    );

    let success = 0, skipped = 0, failed = 0;

    for (const row of rows) {
      const docData = {};
      Object.keys(row).forEach(col => {
        const key = labelToKey[col.toLowerCase().trim()];
        if (key && row[col] !== '') docData[key] = String(row[col]).trim();
      });

      if (!docData.judul) { failed++; continue; }

      const j = docData.judul.toLowerCase().trim();
      if (existingJudul.has(j)) { skipped++; continue; }

      if (isAdminOpd() && k === 'inovasi') {
        docData.opd = currentProfile?.opd || docData.opd;
      }

      try {
        await addDoc(collection(db, k), {
          ...docData,
          createdAt: serverTimestamp(),
          createdBy: currentUser?.email,
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
    ? cachedUsers.map(u => {
      const isMe = u.id === currentUser?.uid;
      const roleClass = `role-${u.role}`;
      const roleLabel = (u.role || '').replace('_',' ');
      const opdBadge = u.opd
        ? `<span class="badge" style="background:#DBEAFE;color:#1E40AF;margin-left:6px;">
             <i class="fas fa-building"></i> ${esc(u.opd)}
           </span>`
        : '';
      return `<div class="crud-item">
        <h4><i class="fas fa-user-shield"></i> ${esc(u.nama || u.email)} ${isMe ? ' <span style="color:#059669;font-size:11px;">(Anda)</span>' : ''}</h4>
        <p>${esc(u.email)}</p>
        <span class="role-badge ${roleClass}">${esc(roleLabel)}</span>
        ${opdBadge}
        <div class="crud-actions">
          <button class="btn-edit" onclick="editUser('${u.id}')"><i class="fas fa-pen"></i> Edit</button>
          <button class="btn-del" onclick="hapusUser('${u.id}')" ${isMe ? 'disabled' : ''}>
            <i class="fas fa-trash"></i> Hapus
          </button>
        </div>
      </div>`;
    }).join('')
    : emptyMsg('Belum ada admin terdaftar.');
}

// ============================================================
// USER FORM - OPD FIELD (sudah ada di HTML)
// ============================================================
function toggleUserOpdField() {
  const wrapper = $('u_opd_wrapper');
  if (!wrapper) return;
  const r = $('u_role')?.value;
  wrapper.style.display = r === 'admin_opd' ? 'block' : 'none';
}

/** Populate dropdown OPD dari cache */
function populateOpdDropdown(selectedValue = '') {
  const sel = $('u_opd');
  if (!sel) return;

  // Reset dulu (kecuali option pertama)
  sel.innerHTML = '<option value="">-- Pilih OPD --</option>';

  const opdOptions = (cachedData.opd || [])
    .map(o => o.judul || o.nama)
    .filter(Boolean)
    .sort();

  if (opdOptions.length === 0) {
    sel.innerHTML = '<option value="">-- Belum ada OPD. Tambahkan dulu di menu OPD --</option>';
    return;
  }

  opdOptions.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o;
    opt.textContent = o;
    if (o === selectedValue) opt.selected = true;
    sel.appendChild(opt);
  });
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

  // Populate dropdown OPD
  populateOpdDropdown();
  // Sembunyikan field OPD (karena default role = admin)
  toggleUserOpdField();

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

  // Populate dropdown OPD dengan nilai yang tersimpan
  populateOpdDropdown(u.opd || '');
  // Tampilkan field OPD jika role = admin_opd
  toggleUserOpdField();

  $('userModal').classList.add('show');
}

function closeUserForm() {
  $('userModal')?.classList.remove('show');
  editingUserId = null;
}

async function createUserSecondary(email, password) {
  const SECONDARY_NAME = 'toddopuli-secondary';
  let secondaryApp;
  try {
    secondaryApp = initializeApp(firebaseConfig, SECONDARY_NAME);
  } catch (e) {
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
  const opd = $('u_opd')?.value.trim() || '';

  if (!email) return toast('error', 'Gagal', 'Email wajib diisi.');

  if (r === 'admin_opd' && !opd) {
    return toast('error', 'Gagal', 'Pilih OPD untuk Admin OPD.');
  }

  const userData = { nama, role: r };
  if (r === 'admin_opd') userData.opd = opd;

  try {
    if (editingUserId) {
      await updateDoc(doc(db, 'users', editingUserId), {
        ...userData,
        updatedAt: serverTimestamp()
      });
      toast('success', 'Berhasil', 'Data admin diperbarui.');
    } else {
      if (!pass || pass.length < 6) {
        return toast('error', 'Gagal', 'Password minimal 6 karakter.');
      }
      const uid = await createUserSecondary(email, pass);
      await setDoc(doc(db, 'users', uid), {
        email,
        ...userData,
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
// ACTIVITY LOG
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
    if (k === 'opd') return;
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

  document.querySelectorAll('.modal').forEach(m => {
    m.addEventListener('click', e => {
      if (e.target === m) m.classList.remove('show');
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.show').forEach(m => m.classList.remove('show'));
    }
  });
});

// ============================================================
// EXPOSE KE WINDOW
// ============================================================
Object.assign(window, {
  showPage, toggleMenu, openLogin, closeLogin, doLogin, loginGuest,
  showDetail, closeDetail, globalSearch,
  authLogin, authLogout, showAdminPage, openForm, closeForm, saveForm,
  hapusData, handleFilePick, exportExcel, exportPDF, triggerImport, handleImport,
  renderGaleri, renderPubGaleri, openUserForm, editUser, closeUserForm, saveUser, hapusUser,
  renderInovasi, renderRiset, renderPublikasi, renderHki,
  renderBerita, renderPelatihan, renderDatabase, renderCrud,
  normalizeDriveUrl, normalizeDriveImageUrl,
  toggleUserOpdField  // ← ditambahkan karena dipanggil via onchange di HTML
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