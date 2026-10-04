/* ============================================================
   TODDOPULI v4.4 - Script Utama
   Firebase + Cloudinary + Chart + Excel + Realtime + Multi-Admin
   + Google Drive Link + OPD Management + Inovasi Extended
   + Filter + ROLE ADMIN OPD + APPROVAL + WIDGET + HKI EXTENDED
   + PELATIHAN NEW + MASYARAKAT UMUM + PENDAFTARAN + REQUEST AKSES HKI
   + HKI Card Polished + Error Handling Improved
   + PELATIHAN VIEWER untuk Admin OPD & Masyarakat
   + FIX EDIT ADMIN BUG
   + REQUEST AKSES DATA (Inovasi, Riset, Publikasi, Database)
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

// ⚠️ GANTI dengan nomor WA admin TODDOPULI Anda
const ADMIN_WA = "6285696409288";

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
      { key:'akses_file', label:'Akses File Laporan', type:'select',
        options:['Publik','Terbatas'], required:true },
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
      { key:'akses_file', label:'Akses File Dokumen', type:'select',
        options:['Publik','Terbatas'], required:true },
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
      { key:'akses_file', label:'Akses File Publikasi', type:'select',
        options:['Publik','Terbatas'], required:true },
      { key:'dokumen', label:'Link Publikasi (Google Drive)', type:'text' }
    ]
  },
  hki: {
    nama: 'HKI', icon: 'fa-certificate',
    fields: [
      { key:'judul', label:'Judul Karya / Ciptaan', type:'text', required:true },
      { key:'pemilik', label:'Nama Pemilik / Pemohon', type:'text', required:true },
      { key:'email_pemilik', label:'Email Pemilik (untuk akses download)', type:'text', required:true },
      { key:'no_wa_pemohon', label:'Nomor WhatsApp Pemohon', type:'text', required:true },
      { key:'alamat_pemohon', label:'Alamat Pemohon', type:'text' },
      { key:'jenis', label:'Jenis HKI', type:'select',
        options:['Hak Cipta','Merek','Paten','Desain Industri'], required:true },
      { key:'nomor', label:'Nomor Pendaftaran (isi jika sudah resmi)', type:'text' },
      { key:'tahun', label:'Tahun', type:'text' },
      { key:'status_proses', label:'Status Proses', type:'select',
        options:['Diajukan','Verifikasi','Proses','Terdaftar','Ditolak'] },
      { key:'deskripsi', label:'Deskripsi Karya', type:'textarea', required:true },
      { key:'sertifikat', label:'Link Sertifikat (Google Drive)', type:'text' },
      { key:'link_file', label:'Link File Karya (Google Drive, untuk download)', type:'text' }
    ]
  },
  hki_edukasi: {
    nama: 'Edukasi HKI', icon: 'fa-graduation-cap',
    fields: [
      { key:'judul', label:'Judul Edukasi', type:'text', required:true },
      { key:'tipe', label:'Tipe Konten', type:'select',
        options:['Artikel','Video'], required:true },
      { key:'penulis', label:'Penulis / Narasumber', type:'text' },
      { key:'konten', label:'Isi Artikel (untuk tipe Artikel)', type:'textarea' },
      { key:'link_video', label:'Link Video YouTube (untuk tipe Video)', type:'text' },
      { key:'gambar', label:'Link Thumbnail (Google Drive, opsional)', type:'text' }
    ]
  },
  pelatihan: {
    nama: 'Pelatihan', icon: 'fa-chalkboard-teacher',
    fields: [
      { key:'judul', label:'Nama Pelatihan', type:'text', required:true },
      { key:'pemilik', label:'Pemilik Pelatihan', type:'text', required:true },
      { key:'jenis', label:'Jenis Pelatihan', type:'select',
        options:['Teknis','Manajerial','Fungsional','Sosial Budaya','Lainnya'], required:true },
      { key:'deskripsi', label:'Deskripsi Pelatihan', type:'textarea', required:true },
      { key:'link_pelatihan', label:'Link Pelatihan (URL daftar/ikuti)', type:'text', required:true },
      { key:'gambar', label:'Link Gambar/Poster (Google Drive)', type:'text' }
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
  database: {
    nama: 'Database', icon: 'fa-database',
    fields: [
      { key:'judul', label:'Nama Dataset', type:'text', required:true },
      { key:'kategori', label:'Kategori', type:'text', required:true },
      { key:'deskripsi', label:'Deskripsi', type:'textarea', required:true },
      { key:'akses_file', label:'Akses File Dataset', type:'select',
        options:['Publik','Terbatas'], required:true },
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
// KONFIG KHUSUS
// ============================================================
const APPROVAL_KATEGORI = ['inovasi', 'riset', 'hki'];
const CREATOR_ONLY_CREATE = ['pelatihan'];

function needsApproval(k) { return APPROVAL_KATEGORI.includes(k); }
function creatorOnly(k) { return CREATOR_ONLY_CREATE.includes(k); }
function getApprovalStatus(d) { return d?.approval_status || 'approved'; }
function isUrlField(key) { return ['gambar','dokumen','sertifikat','laporan','link_file'].includes(key); }

// ============================================================
// STATE GLOBAL
// ============================================================
let currentUser = null;
let currentProfile = null;
let currentAdminPage = 'dashboard';
let cachedData = {
  inovasi:[], riset:[], publikasi:[], hki:[],
  berita:[], pelatihan:[], database:[], opd:[],
  hki_edukasi:[], hki_requests:[], registrations:[],
  access_requests: []
};
let cachedUsers = [];
let editingId = null;
let editingKategori = null;
let editingUserId = null;
let editingEdukasiId = null;
let pendingUploadFile = null;
let unsubscribers = [];
let chartTahunInstance = null;
let chartOpdInstance = null;
let chartJenisInstance = null;
let chartBentukInstance = null;
let isFirstSnapshot = true;

// ============================================================
// MENU PER ROLE
// ============================================================
const ADMIN_OPD_MENUS = ['dashboard', 'inovasi', 'riset', 'hki', 'pelatihan', 'galeri'];
const MASYARAKAT_MENUS = ['dashboard', 'inovasi', 'riset', 'hki', 'pelatihan'];
const ADMIN_OPD_STAT_CARDS = ['dashInovasi', 'dashRiset', 'dashHki', 'dashPelatihan'];

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
  try { return new Date(t).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }); }
  catch { return t; }
}
function formatTanggalSingkat(t) {
  if (!t) return '';
  try { return new Date(t).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }); }
  catch { return t; }
}
function formatDateTime(t) {
  if (!t) return '-';
  try {
    const d = t.toDate ? t.toDate() : new Date(t);
    return d.toLocaleString('id-ID', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
  } catch { return '-'; }
}

// ============================================================
// TOAST
// ============================================================
function toast(type, title, msg, duration = 4000) {
  const container = $('toastContainer');
  if (!container) return alert(`${title}\n${msg}`);
  const icons = { success:'fa-circle-check', error:'fa-circle-xmark', info:'fa-circle-info' };
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i>
    <div class="toast-body">
      <div class="toast-title">${esc(title)}</div>
      <div class="toast-msg">${esc(msg)}</div>
    </div>`;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity='0'; el.style.transform='translateX(120%)'; }, duration);
  setTimeout(() => el.remove(), duration + 400);
}

// ============================================================
// ROLE HELPERS
// ============================================================
function role() { return currentProfile?.role || null; }
function isSuperAdmin() { return role() === 'super_admin'; }
function isAdmin() { return role() === 'admin'; }
function isAdminOpd() { return role() === 'admin_opd'; }
function isEditor() { return role() === 'editor'; }
function isMasyarakat() { return role() === 'masyarakat'; }

function isAnyAdmin() {
  return ['super_admin', 'admin', 'admin_opd', 'editor', 'masyarakat'].includes(role());
}
function isAdminOrAbove() { return ['super_admin', 'admin'].includes(role()); }
function isEditorOrAbove() {
  return ['super_admin', 'admin', 'admin_opd', 'editor', 'masyarakat'].includes(role());
}
function canApprove() { return isSuperAdmin() || isAdmin(); }

// ============================================================
// FILTER DATA PER ROLE
// ============================================================
function filterDataForRole(kategori, list) {
  if (kategori === 'pelatihan') return list;

  if (isAdminOpd()) {
    if (kategori === 'inovasi') return list.filter(d => d.opd === currentProfile?.opd);
    if (['riset', 'hki'].includes(kategori)) return list.filter(d => d.createdBy === currentUser?.email);
    if (kategori === 'hki_edukasi') return list;
    return [];
  }
  if (isMasyarakat()) {
    if (['inovasi', 'riset', 'hki'].includes(kategori)) return list.filter(d => d.createdBy === currentUser?.email);
    if (kategori === 'hki_edukasi') return list;
    return [];
  }
  return list;
}

function filterForPublic(kategori, list) {
  if (!needsApproval(kategori)) return list;
  return list.filter(d => getApprovalStatus(d) === 'approved');
}

// ============================================================
// PERMISSION PER ITEM
// ============================================================
function canEditItem(kategori, d) {
  if (kategori === 'pelatihan') return isSuperAdmin() || isAdmin();
  if (isSuperAdmin() || isAdmin() || isEditor()) return true;
  if (isAdminOpd() || isMasyarakat()) {
    if (kategori === 'inovasi') return d.opd === currentProfile?.opd || d.createdBy === currentUser?.email;
    if (['riset', 'hki'].includes(kategori)) return d.createdBy === currentUser?.email;
    return false;
  }
  return false;
}

function canDeleteItem(kategori, d) {
  if (kategori === 'pelatihan') return isSuperAdmin() || isAdmin();
  if (isSuperAdmin() || isAdmin()) return true;
  if (isAdminOpd() || isMasyarakat()) {
    if (kategori === 'inovasi') return d.opd === currentProfile?.opd || d.createdBy === currentUser?.email;
    if (['riset', 'hki'].includes(kategori)) return d.createdBy === currentUser?.email;
    return false;
  }
  return false;
}

// ============================================================
// URL HELPERS
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
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) return normalizeDriveImageUrl(url);
  return url;
}
function waLink(phone, text) {
  const p = String(phone || '').replace(/\D/g, '').replace(/^0/, '62');
  return `https://wa.me/${p}?text=${encodeURIComponent(text)}`;
}

// ============================================================
// LOAD DATA
// ============================================================
async function loadAllData() {
  const keys = Object.keys(KATEGORI).concat(['hki_edukasi', 'hki_requests', 'registrations', 'access_requests']);
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
// REALTIME LISTENERS
// ============================================================
function startRealtimeListeners() {
  unsubscribers.forEach(u => { try { u(); } catch {} });
  unsubscribers = [];
  isFirstSnapshot = true;

  Object.keys(KATEGORI).forEach(k => {
    const unsub = onSnapshot(collection(db, k), (snap) => {
      const prevLen = cachedData[k].length;
      cachedData[k] = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      if (!isFirstSnapshot && prevLen > 0) {
        snap.docChanges().filter(c => c.type === 'added').forEach(c => {
          toast('info', '📢 Data Baru', `${KATEGORI[k].nama}: ${c.doc.data().judul || '-'}`);
        });
      }

      if (isAdminPage()) {
        if (currentAdminPage === k) renderCrud();
        else if (currentAdminPage === 'dashboard') { updateStats(); renderDashboardCharts(); }
        else if (currentAdminPage === 'galeri') renderGaleri();
      } else {
        const fn = {
          inovasi: renderInovasi, riset: renderRiset, publikasi: renderPublikasi,
          hki: () => { renderHki(); renderHkiWidget(); },
          berita: renderBerita, pelatihan: () => { renderPelatihan(); renderWidgetPelatihan(); },
          database: renderDatabase
        }[k];
        if (fn) fn();
        if (['inovasi','berita','pelatihan'].includes(k)) renderPubGaleri();
        if (k === 'berita') renderWidgetBerita();
        updateStats();
      }
    }, (err) => console.warn('Realtime err:', k, err));
    unsubscribers.push(unsub);
  });

  ['hki_edukasi', 'hki_requests', 'registrations', 'access_requests'].forEach(k => {
    const unsub = onSnapshot(collection(db, k), (snap) => {
      cachedData[k] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (!isAdminPage()) {
        if (k === 'hki_edukasi') renderHkiEdukasi();
      } else {
        if (k === 'hki_edukasi' && currentAdminPage === 'hki_edukasi') renderHkiEdukasiAdmin();
        if (k === 'hki_requests' && currentAdminPage === 'hki_requests') renderHkiRequests();
        if (k === 'access_requests' && currentAdminPage === 'access_requests') renderAccessRequests();
        if (k === 'registrations' && currentAdminPage === 'registrations') renderRegistrations();
      }
    }, err => console.warn('Listener err:', k, err));
    unsubscribers.push(unsub);
  });

  if (isAdminPage() && isSuperAdmin()) {
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      cachedUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (currentAdminPage === 'users') renderUsers();
    }, err => console.warn('Users listener err:', err));
    unsubscribers.push(unsub);
  }

  setTimeout(() => { isFirstSnapshot = false; }, 2000);
}

// ============================================================
// STATS
// ============================================================
function updateStats() {
  const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };

  set('statInovasi', filterForPublic('inovasi', cachedData.inovasi).length);
  set('statRiset', filterForPublic('riset', cachedData.riset).length);
  set('statHki', filterForPublic('hki', cachedData.hki).length);
  set('statBerita', cachedData.berita.length);

  let inovasiCount = cachedData.inovasi.length;
  let risetCount = cachedData.riset.length;
  let hkiCount = cachedData.hki.length;
  let pelatihanCount = cachedData.pelatihan.length;

  if (isAdminOpd() || isMasyarakat()) {
    inovasiCount = filterDataForRole('inovasi', cachedData.inovasi).length;
    risetCount = filterDataForRole('riset', cachedData.riset).length;
    hkiCount = filterDataForRole('hki', cachedData.hki).length;
    pelatihanCount = filterDataForRole('pelatihan', cachedData.pelatihan).length;
  }

  set('dashInovasi', inovasiCount);
  set('dashRiset', risetCount);
  set('dashPub', cachedData.publikasi.length);
  set('dashHki', hkiCount);
  set('dashBerita', cachedData.berita.length);
  set('dashPelatihan', pelatihanCount);
  set('dashDb', cachedData.database.length);
}

function emptyMsg(text = 'Belum ada data.') {
  return `<div class="loading"><i class="fas fa-inbox" style="font-size:36px;opacity:.4;display:block;margin-bottom:10px;"></i>${text}</div>`;
}

// ============================================================
// BADGES
// ============================================================
function approvalBadge(d) {
  const s = getApprovalStatus(d);
  if (s === 'pending') return `<span class="approval-badge approval-pending"><i class="fas fa-clock"></i> Menunggu ACC</span>`;
  if (s === 'rejected') return `<span class="approval-badge approval-rejected"><i class="fas fa-circle-xmark"></i> Ditolak</span>`;
  return `<span class="approval-badge approval-approved"><i class="fas fa-circle-check"></i> Disetujui</span>`;
}

function hkiStatusBadge(d) {
  const s = d?.status_proses || 'Diajukan';
  const map = {
    'Diajukan': 'approval-pending',
    'Verifikasi': 'approval-pending',
    'Proses': 'approval-pending',
    'Terdaftar': 'approval-approved',
    'Ditolak': 'approval-rejected'
  };
  return `<span class="approval-badge ${map[s] || 'approval-approved'}"><i class="fas fa-info-circle"></i> ${esc(s)}</span>`;
}

// ============================================================
// CARD BUILDERS
// ============================================================
function buildCard(d, k, extraLabel = '') {
  const imgSrc = d.gambar ? getImageUrl(d.gambar) : '';
  const img = imgSrc ? `<img class="thumb" src="${esc(imgSrc)}" alt="" loading="lazy" onerror="this.style.display='none'">` : '';
  const badge = extraLabel ? `<span class="badge">${esc(extraLabel)}</span>` : '';
  const desc = String(d.deskripsi || '');
  const descCut = desc.length > 120 ? desc.substring(0, 120) + '...' : desc;
  return `<div class="item" onclick="showDetail('${k}','${d.id}')">
    ${img}<h4>${esc(d.judul)}</h4><p>${esc(descCut)}</p>${badge}
  </div>`;
}

function buildInovasiCard(d) {
  const imgSrc = d.gambar ? getImageUrl(d.gambar) : '';
  const img = imgSrc ? `<img class="thumb" src="${esc(imgSrc)}" alt="" loading="lazy" onerror="this.style.display='none'">` : '';
  const desc = String(d.deskripsi || '');
  const descCut = desc.length > 120 ? desc.substring(0, 120) + '...' : desc;
  const inovator = d.nama_inovator ? `<div class="meta"><i class="fas fa-user"></i> ${esc(d.nama_inovator)}</div>` : '';
  const jenis = d.jenis_inovasi ? `<span class="badge badge-jenis">${esc(d.jenis_inovasi)}</span>` : '';
  const bentuk = d.bentuk_inovasi ? `<span class="badge badge-bentuk">${esc(d.bentuk_inovasi)}</span>` : '';
  const opdTahun = (d.opd || d.tahun) ? `<span class="badge">${esc(d.opd || '')}${d.opd && d.tahun ? ' • ' : ''}${esc(d.tahun || '')}</span>` : '';
  return `<div class="item item-inovasi" onclick="showDetail('inovasi','${d.id}')">
    ${img}<h4>${esc(d.judul)}</h4><p>${esc(descCut)}</p>
    <div class="badge-row">${opdTahun}${jenis}${bentuk}</div>${inovator}
  </div>`;
}

function buildPelatihanCard(d) {
  const imgSrc = d.gambar ? getImageUrl(d.gambar) : '';
  const img = imgSrc ? `<img class="thumb" src="${esc(imgSrc)}" alt="" loading="lazy" onerror="this.style.display='none'">` : '';
  const desc = String(d.deskripsi || '');
  const descCut = desc.length > 120 ? desc.substring(0, 120) + '...' : desc;
  const jenis = d.jenis ? `<span class="badge badge-jenis">${esc(d.jenis)}</span>` : '';
  const pemilik = d.pemilik ? `<span class="badge">${esc(d.pemilik)}</span>` : '';
  const btnIkuti = d.link_pelatihan
    ? `<a href="${esc(d.link_pelatihan)}" target="_blank" rel="noopener" class="btn-ikuti" onclick="event.stopPropagation();">
         <i class="fas fa-external-link-alt"></i> Ikuti Pelatihan
       </a>`
    : '';
  return `<div class="item item-pelatihan" onclick="showDetail('pelatihan','${d.id}')">
    ${img}<h4>${esc(d.judul)}</h4><p>${esc(descCut)}</p>
    <div class="badge-row">${pemilik}${jenis}</div>
    ${btnIkuti}
  </div>`;
}

function buildPelatihanAdminCard(d) {
  const imgSrc = d.gambar ? getImageUrl(d.gambar) : '';
  const img = imgSrc ? `<img class="thumb" src="${esc(imgSrc)}" alt="" onerror="this.style.display='none'">` : '';
  const desc = String(d.deskripsi || '');
  const descCut = desc.length > 150 ? desc.substring(0, 150) + '...' : desc;
  const jenis = d.jenis ? `<span class="badge badge-jenis">${esc(d.jenis)}</span>` : '';
  const pemilik = d.pemilik ? `<span class="badge">${esc(d.pemilik)}</span>` : '';
  const btnIkuti = d.link_pelatihan
    ? `<a href="${esc(d.link_pelatihan)}" target="_blank" rel="noopener" class="btn-ikuti" onclick="event.stopPropagation();" style="margin-top:12px;">
         <i class="fas fa-external-link-alt"></i> Ikuti Pelatihan
       </a>`
    : '';
  return `<div class="crud-item crud-item-pelatihan">
    ${img}
    <h4>${esc(d.judul)}</h4>
    <p>${esc(descCut)}</p>
    <div class="badge-row" style="margin-top:6px;">
      ${pemilik}
      ${jenis}
    </div>
    ${btnIkuti}
    <div style="margin-top:10px;padding-top:10px;border-top:1px dashed #E2E8F0;font-size:11px;color:#64748B;display:flex;align-items:center;gap:6px;">
      <i class="fas fa-info-circle" style="color:#3B82F6;"></i>
      <span>Diselenggarakan oleh ${esc(d.pemilik || 'Admin TODDOPULI')}</span>
    </div>
  </div>`;
}

function buildHkiCard(d) {
  const imgSrc = d.gambar ? getImageUrl(d.gambar) : '';
  const img = imgSrc ? `<img class="thumb" src="${esc(imgSrc)}" alt="" loading="lazy" onerror="this.style.display='none'">` : '';
  const desc = String(d.deskripsi || '');
  const descCut = desc.length > 120 ? desc.substring(0, 120) + '...' : desc;
  const pemilik = d.pemilik ? `<div class="meta"><i class="fas fa-user"></i> ${esc(d.pemilik)}</div>` : '';
  const jenis = d.jenis ? `<span class="badge badge-jenis">${esc(d.jenis)}</span>` : '';
  const nomor = d.nomor ? `<span class="badge">No. ${esc(d.nomor)}</span>` : '';
  const statusBadge = `<div style="margin-top:8px;">${hkiStatusBadge(d)}</div>`;
  return `<div class="item item-hki" onclick="showDetail('hki','${d.id}')">
    ${img}<h4>${esc(d.judul)}</h4><p>${esc(descCut)}</p>
    <div class="badge-row">${nomor}${jenis}</div>
    ${pemilik}
    ${statusBadge}
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

  let d = filterForPublic('inovasi', cachedData.inovasi);
  if (q) d = d.filter(x =>
    (x.judul||'').toLowerCase().includes(q) ||
    (x.opd||'').toLowerCase().includes(q) ||
    (x.nama_inovator||'').toLowerCase().includes(q) ||
    (x.deskripsi||'').toLowerCase().includes(q));
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
  let d = filterForPublic('riset', cachedData.riset);
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
  let d = filterForPublic('hki', cachedData.hki);
  d = d.filter(x => (x.status_proses || 'Diajukan') !== 'Ditolak');
  d = [...d].sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
  if (q) d = d.filter(x =>
    (x.judul||'').toLowerCase().includes(q) ||
    (x.pemilik||'').toLowerCase().includes(q) ||
    (x.nomor||'').toLowerCase().includes(q));
  $('listHki').innerHTML = d.length
    ? d.map(buildHkiCard).join('')
    : emptyMsg('Belum ada data HKI terdaftar.');
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
    ? d.map(buildPelatihanCard).join('')
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
// HKI EDUKASI
// ============================================================
function renderHkiEdukasi() {
  const container = $('hkiEdukasiList');
  if (!container) return;
  const d = cachedData.hki_edukasi || [];
  if (!d.length) {
    container.innerHTML = `<div class="widget-empty"><i class="fas fa-graduation-cap"></i>Belum ada konten edukasi HKI.</div>`;
    return;
  }
  container.innerHTML = d.map(x => {
    const imgSrc = x.gambar ? getImageUrl(x.gambar) : '';
    const imgHtml = imgSrc
      ? `<div class="widget-item-img"><img src="${esc(imgSrc)}" alt="" onerror="this.parentElement.innerHTML='<i class=&quot;fas fa-graduation-cap&quot;></i>';this.parentElement.classList.add('placeholder');"></div>`
      : `<div class="widget-item-img placeholder"><i class="fas fa-${x.tipe === 'Video' ? 'video' : 'newspaper'}"></i></div>`;
    return `<div class="widget-item" onclick="showEdukasiDetail('${x.id}')">
      ${imgHtml}
      <div class="widget-item-body">
        <h4>${esc(x.judul)}</h4>
        <p>${esc(x.penulis || x.tipe || '')}</p>
        <span class="widget-item-date"><i class="fas fa-${x.tipe === 'Video' ? 'video' : 'newspaper'}"></i> ${esc(x.tipe)}</span>
      </div>
    </div>`;
  }).join('');
}

function showEdukasiDetail(id) {
  const d = cachedData.hki_edukasi?.find(x => x.id === id);
  if (!d) return;
  let html = `<h2>${esc(d.judul)}</h2>`;
  if (d.tipe) html += `<div style="margin-bottom:12px;"><span class="badge">${esc(d.tipe)}</span></div>`;
  if (d.penulis) html += `<p style="margin-bottom:10px;"><b>Penulis:</b> ${esc(d.penulis)}</p>`;
  if (d.tipe === 'Video' && d.link_video) {
    let embedUrl = d.link_video;
    const ytMatch = d.link_video.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    html += `<div class="video-wrap"><iframe src="${esc(embedUrl)}" frameborder="0" allowfullscreen></iframe></div>`;
    html += `<p style="margin-top:10px;"><a href="${esc(d.link_video)}" target="_blank" rel="noopener" class="btn-primary" style="text-decoration:none;display:inline-block;"><i class="fas fa-external-link-alt"></i> Buka di YouTube</a></p>`;
  } else if (d.konten) {
    html += `<div class="edu-content">${esc(d.konten).replace(/\n/g, '<br>')}</div>`;
  }
  $('detailContent').innerHTML = html;
  $('detailModal').classList.add('show');
}

// ============================================================
// HKI WIDGET
// ============================================================
function renderHkiWidget() {
  const container = $('hkiWidgetList');
  if (!container) return;
  let list = filterForPublic('hki', cachedData.hki)
    .filter(x => (x.status_proses || 'Diajukan') !== 'Ditolak');
  list = [...list].sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
  const items = list.slice(0, 4);
  if (!items.length) {
    container.innerHTML = `<div class="widget-empty"><i class="fas fa-certificate"></i>Belum ada HKI terdaftar.</div>`;
    return;
  }
  container.innerHTML = items.map(d => {
    const imgSrc = d.gambar ? getImageUrl(d.gambar) : '';
    const imgHtml = imgSrc
      ? `<div class="widget-item-img"><img src="${esc(imgSrc)}" alt="" onerror="this.parentElement.innerHTML='<i class=&quot;fas fa-certificate&quot;></i>';this.parentElement.classList.add('placeholder');"></div>`
      : `<div class="widget-item-img placeholder"><i class="fas fa-certificate"></i></div>`;
    return `<div class="widget-item" onclick="showDetail('hki','${d.id}')">
      ${imgHtml}
      <div class="widget-item-body">
        <h4>${esc(d.judul)}</h4>
        <p>${esc(d.pemilik || '-')} • ${esc(d.jenis || 'HKI')}</p>
        <span class="widget-item-date"><i class="fas fa-hashtag"></i> ${esc(d.nomor || 'Belum ada nomor')}</span>
      </div>
    </div>`;
  }).join('');
}

// ============================================================
// NAV
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
    hki: () => { renderHki(); renderHkiWidget(); renderHkiEdukasi(); },
    berita: renderBerita, pelatihan: renderPelatihan,
    database: renderDatabase, galeri: renderPubGaleri
  };
  if (map[page]) map[page]();
  if (page === 'home') { updateStats(); renderHomeWidgets(); }
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
  if (needsApproval(k) && isAnyAdmin()) html += `<div style="margin-bottom:14px;">${approvalBadge(d)}</div>`;
  if (k === 'hki') html += `<div style="margin-bottom:14px;">${hkiStatusBadge(d)}</div>`;
  if (k === 'inovasi') {
    let badges = '';
    if (d.opd) badges += `<span class="badge">${esc(d.opd)}</span> `;
    if (d.jenis_inovasi) badges += `<span class="badge badge-jenis">${esc(d.jenis_inovasi)}</span> `;
    if (d.bentuk_inovasi) badges += `<span class="badge badge-bentuk">${esc(d.bentuk_inovasi)}</span> `;
    if (d.status) badges += `<span class="badge">${esc(d.status)}</span>`;
    if (badges) html += `<div class="badge-row" style="margin-bottom:14px;">${badges}</div>`;
  }
  cfg.fields.forEach(f => {
    if (['judul','gambar','dokumen','sertifikat','laporan','link_file','email_pemilik','akses_file'].includes(f.key)) return;
    if (d[f.key] != null && d[f.key] !== '') {
      const val = f.type === 'date' ? formatTanggal(d[f.key]) : esc(d[f.key]);
      html += `<p style="margin-bottom:10px;"><b>${f.label}:</b><br>${val}</p>`;
    }
  });

  // File buttons — handle akses Publik vs Terbatas
  const fileFields = ['laporan','dokumen'];
  fileFields.forEach(key => {
    if (!d[key]) return;
    const fieldLabel = key === 'laporan' ? 'Laporan' : 'Dokumen';
    const aksesTerbatas = (d.akses_file || 'Publik') === 'Terbatas';
    const canDirectAccess = !aksesTerbatas || isAdminOrAbove();

    if (canDirectAccess) {
      const btnColor = aksesTerbatas ? 'background:#059669;' : '';
      html += `<a href="${esc(normalizeDriveUrl(d[key]))}" target="_blank" rel="noopener" class="btn-primary" style="margin-top:12px;text-decoration:none;display:inline-block;${btnColor}"><i class="fas fa-${aksesTerbatas ? 'download' : 'file-pdf'}"></i> ${aksesTerbatas ? 'Download' : 'Lihat'} ${fieldLabel}</a> `;
    } else {
      html += `<button class="btn-primary" style="margin-top:12px;background:#F59E0B;color:#fff;" onclick="event.stopPropagation();openAccessRequest('${k}','${d.id}','${key}')"><i class="fas fa-lock"></i> Minta Akses ${fieldLabel}</button> `;
    }
  });

  if (d.sertifikat) html += `<a href="${esc(normalizeDriveUrl(d.sertifikat))}" target="_blank" rel="noopener" class="btn-primary" style="margin-top:12px;text-decoration:none;display:inline-block;"><i class="fas fa-file-certificate"></i> Lihat Sertifikat</a> `;

  if (k === 'pelatihan' && d.link_pelatihan) {
    html += `<a href="${esc(d.link_pelatihan)}" target="_blank" rel="noopener" class="btn-ikuti" style="margin-top:12px;display:inline-block;text-decoration:none;"><i class="fas fa-external-link-alt"></i> Ikuti Pelatihan</a>`;
  }

  if (k === 'hki' && d.link_file) {
    const isOwner = d.email_pemilik && currentUser?.email === d.email_pemilik;
    if (isOwner || isAdminOrAbove()) {
      html += `<a href="${esc(normalizeDriveUrl(d.link_file))}" target="_blank" rel="noopener" class="btn-primary" style="margin-top:12px;text-decoration:none;display:inline-block;background:#059669;"><i class="fas fa-download"></i> Download Karya</a>`;
    } else {
      html += `<button class="btn-primary" style="margin-top:12px;background:#F59E0B;color:#fff;" onclick="event.stopPropagation();openHkiRequest('${d.id}')"><i class="fas fa-lock"></i> Minta Akses Download</button>`;
    }
  }

  $('detailContent').innerHTML = html;
  $('detailModal').classList.add('show');
}
function closeDetail() { $('detailModal')?.classList.remove('show'); }

// ============================================================
// REQUEST AKSES HKI
// ============================================================
function openHkiRequest(hkiId) {
  const d = cachedData.hki?.find(x => x.id === hkiId);
  if (!d) return;
  const html = `
    <h2><i class="fas fa-lock"></i> Minta Akses Download</h2>
    <p style="font-size:13px;color:#64748B;margin-bottom:14px;">
      Isi data di bawah ini. Admin akan mengirimkan akses melalui WhatsApp Anda setelah diverifikasi.
    </p>
    <p style="margin-bottom:10px;padding:10px;background:#DBEAFE;border-radius:8px;font-size:12px;">
      <b>HKI:</b> ${esc(d.judul)}
    </p>
    <label>Nama Lengkap <span style="color:#DC2626">*</span></label>
    <input type="text" id="req_nama" placeholder="Nama lengkap">
    <label>Nomor WhatsApp <span style="color:#DC2626">*</span></label>
    <input type="tel" id="req_wa" placeholder="08xx xxxx xxxx">
    <label>Tujuan Penggunaan <span style="color:#DC2626">*</span></label>
    <textarea id="req_tujuan" placeholder="Contoh: referensi penelitian, dll..."></textarea>
    <button class="btn-primary full" onclick="submitHkiRequest('${hkiId}')"><i class="fas fa-paper-plane"></i> Kirim Permintaan</button>
  `;
  $('detailContent').innerHTML = html;
  $('detailModal').classList.add('show');
}

async function submitHkiRequest(hkiId) {
  const d = cachedData.hki?.find(x => x.id === hkiId);
  const nama = $('req_nama')?.value.trim();
  const wa = $('req_wa')?.value.trim();
  const tujuan = $('req_tujuan')?.value.trim();
  if (!nama || !wa || !tujuan) { alert('Semua field wajib diisi!'); return; }
  try {
    await addDoc(collection(db, 'hki_requests'), {
      hki_id: hkiId,
      hki_judul: d?.judul || '',
      hki_pemilik: d?.pemilik || '',
      nama_pemohon: nama,
      no_wa: wa,
      tujuan,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    closeDetail();
    toast('success', 'Permintaan Terkirim', 'Admin akan menghubungi Anda via WhatsApp.');
    setTimeout(() => {
      const text = `Halo Admin TODDOPULI,\n\nSaya ${nama} ingin meminta akses download HKI:\n\n• HKI: ${d?.judul}\n• Tujuan: ${tujuan}\n• No. WA saya: ${wa}\n\nTerima kasih.`;
      window.open(waLink(ADMIN_WA, text), '_blank');
    }, 800);
  } catch (e) {
    console.error(e);
    toast('error', 'Gagal', e.message);
  }
}

// ============================================================
// REQUEST AKSES DATA (Inovasi, Riset, Publikasi, Database)
// ============================================================
function openAccessRequest(kategori, docId, fileKey) {
  const d = cachedData[kategori]?.find(x => x.id === docId);
  if (!d) return;
  const fieldLabel = fileKey === 'laporan' ? 'Laporan' : 'Dokumen';
  const katLabel = KATEGORI[kategori].nama;

  const html = `
    <h2><i class="fas fa-lock"></i> Minta Akses ${fieldLabel}</h2>
    <p style="font-size:13px;color:#64748B;margin-bottom:14px;">
      Isi data di bawah ini. Admin akan mengirimkan akses melalui WhatsApp Anda setelah diverifikasi.
    </p>
    <p style="margin-bottom:10px;padding:10px;background:#DBEAFE;border-radius:8px;font-size:12px;">
      <b>${esc(katLabel)}:</b> ${esc(d.judul)}
    </p>
    <label>Nama Lengkap <span style="color:#DC2626">*</span></label>
    <input type="text" id="acc_nama" placeholder="Nama lengkap">
    <label>Nomor WhatsApp <span style="color:#DC2626">*</span></label>
    <input type="tel" id="acc_wa" placeholder="08xx xxxx xxxx">
    <label>Instansi / Institusi</label>
    <input type="text" id="acc_instansi" placeholder="Contoh: Universitas Andi Djemma">
    <label>Tujuan Penggunaan <span style="color:#DC2626">*</span></label>
    <textarea id="acc_tujuan" placeholder="Contoh: referensi penelitian, dll..."></textarea>
    <button class="btn-primary full" onclick="submitAccessRequest('${kategori}','${docId}','${fileKey}')"><i class="fas fa-paper-plane"></i> Kirim Permintaan</button>
  `;
  $('detailContent').innerHTML = html;
  $('detailModal').classList.add('show');
}

async function submitAccessRequest(kategori, docId, fileKey) {
  const d = cachedData[kategori]?.find(x => x.id === docId);
  const nama = $('acc_nama')?.value.trim();
  const wa = $('acc_wa')?.value.trim();
  const instansi = $('acc_instansi')?.value.trim() || '';
  const tujuan = $('acc_tujuan')?.value.trim();

  if (!nama || !wa || !tujuan) { alert('Semua field bertanda * wajib diisi!'); return; }
  if (!/^0\d{8,13}$/.test(wa.replace(/[\s-]/g,''))) { alert('Format nomor WA tidak valid (contoh: 08123456789)'); return; }

  try {
    await addDoc(collection(db, 'access_requests'), {
      kategori,
      file_key: fileKey,
      doc_id: docId,
      doc_judul: d?.judul || '',
      doc_pemilik: d?.opd || d?.peneliti || d?.pemilik || '-',
      nama_pemohon: nama,
      no_wa: wa,
      instansi,
      tujuan,
      status: 'pending',
      createdAt: serverTimestamp()
    });

    closeDetail();
    toast('success', 'Permintaan Terkirim', 'Admin akan menghubungi Anda via WhatsApp.');

    setTimeout(() => {
      const katLabel = KATEGORI[kategori].nama;
      const text = `Halo Admin TODDOPULI,\n\nSaya ${nama} (${instansi || 'Umum'}) ingin meminta akses file:\n\n• Kategori: ${katLabel}\n• Judul: ${d?.judul}\n• Tujuan: ${tujuan}\n• No. WA saya: ${wa}\n\nMohon dibantu verifikasi. Terima kasih.`;
      window.open(waLink(ADMIN_WA, text), '_blank');
    }, 800);

  } catch (e) {
    console.error(e);
    toast('error', 'Gagal', e.message);
  }
}

// ============================================================
// GALERI
// ============================================================
function getGaleriItems(filterKategori = '', query = '') {
  const items = [];
  ['inovasi','berita','pelatihan'].forEach(k => {
    if (filterKategori && filterKategori !== k) return;
    let list = cachedData[k];
    if (isAdminOpd() || isMasyarakat()) list = filterDataForRole(k, list);
    else if (!isAdminPage()) list = filterForPublic(k, list);
    list.forEach(d => { if (d.gambar) items.push({ ...d, _kategori: k }); });
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
    <img src="${esc(imgSrc)}" alt="" loading="lazy" onerror="this.parentElement.style.opacity='0.3'">
    <span class="galeri-tag">${KATEGORI[x._kategori].nama}</span>
    <div class="galeri-info"><b>${esc(x.judul)}</b><small>${esc(meta)}</small></div>
  </div>`;
}

function renderPubGaleri() {
  const c = $('pubGaleriList'); if (!c) return;
  const q = $('pubGaleriSearch')?.value || '';
  const items = getGaleriItems('', q);
  c.innerHTML = items.length ? items.map(buildGaleriCard).join('') : emptyMsg('Belum ada foto.');
}

function renderGaleri() {
  const c = $('galeriList'); if (!c) return;
  const q = $('galeriSearch')?.value || '';
  const f = $('galeriFilter')?.value || '';
  const items = getGaleriItems(f, q);
  c.innerHTML = items.length ? items.map(buildGaleriCard).join('') : emptyMsg('Belum ada gambar.');
}

// ============================================================
// WIDGET HOMEPAGE
// ============================================================
function renderWidgetBerita() {
  const container = $('widgetBerita'); if (!container) return;
  let list = [...(cachedData.berita||[])].sort((a,b) => (new Date(b.tanggal||0)) - (new Date(a.tanggal||0)));
  const items = list.slice(0, 3);
  if (!items.length) { container.innerHTML = `<div class="widget-empty"><i class="fas fa-newspaper"></i>Belum ada berita terbaru.</div>`; return; }
  container.innerHTML = items.map(d => {
    const imgSrc = d.gambar ? getImageUrl(d.gambar) : '';
    const imgHtml = imgSrc
      ? `<div class="widget-item-img"><img src="${esc(imgSrc)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<i class=&quot;fas fa-newspaper&quot;></i>';this.parentElement.classList.add('placeholder');"></div>`
      : `<div class="widget-item-img placeholder"><i class="fas fa-newspaper"></i></div>`;
    return `<div class="widget-item" onclick="showDetail('berita','${d.id}')">
      ${imgHtml}<div class="widget-item-body">
        <h4>${esc(d.judul)}</h4>
        <p>${esc(String(d.deskripsi||'').substring(0,100))}</p>
        ${d.tanggal ? `<span class="widget-item-date"><i class="fas fa-calendar"></i> ${esc(formatTanggalSingkat(d.tanggal))}</span>` : ''}
      </div></div>`;
  }).join('');
}

function renderWidgetPelatihan() {
  const container = $('widgetPelatihan'); if (!container) return;
  let list = cachedData.pelatihan || [];
  const items = list.slice(0, 3);
  if (!items.length) {
    container.innerHTML = `<div class="widget-empty"><i class="fas fa-chalkboard-teacher"></i>Belum ada pelatihan terbaru.</div>`;
    return;
  }
  container.innerHTML = items.map(d => {
    const imgSrc = d.gambar ? getImageUrl(d.gambar) : '';
    const imgHtml = imgSrc
      ? `<div class="widget-item-img"><img src="${esc(imgSrc)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<i class=&quot;fas fa-chalkboard-teacher&quot;></i>';this.parentElement.classList.add('placeholder');"></div>`
      : `<div class="widget-item-img placeholder"><i class="fas fa-chalkboard-teacher"></i></div>`;
    const btnIkuti = d.link_pelatihan
      ? `<a href="${esc(d.link_pelatihan)}" target="_blank" rel="noopener" class="widget-item-btn" onclick="event.stopPropagation();">
           <i class="fas fa-external-link-alt"></i> Ikuti
         </a>`
      : '';
    return `<div class="widget-item" onclick="showDetail('pelatihan','${d.id}')">
      ${imgHtml}
      <div class="widget-item-body">
        <h4>${esc(d.judul)}</h4>
        <p>${esc(String(d.deskripsi||'').substring(0,80))}</p>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:4px;">
          <span class="widget-item-date"><i class="fas fa-user"></i> ${esc(d.pemilik || '-')}</span>
          ${btnIkuti}
        </div>
      </div>
    </div>`;
  }).join('');
}

function renderHomeWidgets() { renderWidgetBerita(); renderWidgetPelatihan(); }

// ============================================================
// LOGIN & REGISTRASI
// ============================================================
function openLogin() {
  if (currentUser) { if (confirm('Logout dari TODDOPULI?')) authLogout(); return; }
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
    toast('success', 'Login Berhasil', 'Mengalihkan ke panel...');
    setTimeout(() => window.location.href = 'admin.html', 800);
  } catch (e) {
    err.textContent = 'Login gagal: ' + (e.code === 'auth/invalid-credential' ? 'Email atau password salah.' : e.message);
  }
}

function loginGuest() { closeLogin(); toast('info', 'Mode Pengunjung', 'Semua fitur publik dapat diakses.'); }

function openRegister() {
  closeLogin();
  $('registerModal').classList.add('show');
}
function closeRegister() { $('registerModal')?.classList.remove('show'); }

async function submitRegister() {
  const nama = $('reg_nama').value.trim();
  const email = $('reg_email').value.trim();
  const wa = $('reg_wa').value.trim();
  const kategori = $('reg_kategori').value;
  const institusi = $('reg_institusi').value.trim();
  const alasan = $('reg_alasan').value.trim();
  const err = $('regError');

  if (!nama || !email || !wa || !kategori) { err.textContent = 'Field bertanda * wajib diisi!'; return; }
  if (!/^0\d{8,13}$/.test(wa.replace(/[\s-]/g,''))) { err.textContent = 'Format nomor WA tidak valid (contoh: 08123456789)'; return; }

  try {
    const dup = cachedData.registrations?.find(r => r.email === email);
    if (dup) {
      err.textContent = 'Email sudah pernah didaftarkan. Tunggu konfirmasi admin.';
      return;
    }
    await addDoc(collection(db, 'registrations'), {
      nama, email, no_wa: wa, kategori, institusi, alasan,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    closeRegister();
    toast('success', 'Pendaftaran Terkirim', 'Admin akan menghubungi Anda via WhatsApp.');
    setTimeout(() => {
      const text = `Halo Admin TODDOPULI,\n\nSaya baru mendaftar akun TODDOPULI:\n\n• Nama: ${nama}\n• Email: ${email}\n• Kategori: ${kategori}\n• Institusi: ${institusi || '-'}\n• No. WA: ${wa}\n\nMohon dibuatkan akun. Terima kasih.`;
      window.open(waLink(ADMIN_WA, text), '_blank');
    }, 800);
  } catch (e) {
    console.error(e);
    err.textContent = 'Gagal: ' + e.message;
  }
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
      btn.onclick = () => { if (confirm('Buka Panel?')) location.href = 'admin.html'; };
    } else {
      btn.innerHTML = `<i class="fas fa-user"></i> <span>Login</span>`;
      btn.onclick = openLogin;
    }
  }
  if (isAdminPage()) {
    if (user) {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        currentProfile = snap.exists() ? snap.data() : { role: 'viewer', email: user.email, nama: user.email };
        if (!snap.exists()) toast('error', 'Akses Ditolak', 'Akun belum terdaftar sebagai admin.');
      } catch (e) { currentProfile = { role: 'viewer', email: user.email }; }
      if (!isAnyAdmin()) toast('error', 'Akses Terbatas', 'Anda tidak punya izin.');
      $('authScreen').style.display = 'none';
      $('adminApp').style.display = 'block';
      let label = `${currentProfile.nama || user.email} (${role() || 'viewer'})`;
      if (isAdminOpd() && currentProfile.opd) label = `${currentProfile.nama || user.email} (Admin OPD: ${currentProfile.opd})`;
      if (isMasyarakat()) label = `${currentProfile.nama || user.email} (Masyarakat)`;
      $('userEmail').textContent = label;
      applyRoleToUI();
      initAdmin();
    } else {
      $('authScreen').style.display = 'flex';
      $('adminApp').style.display = 'none';
    }
  }
});

async function authLogin() {
  const email = $('authEmail').value.trim();
  const pass = $('authPass').value.trim();
  const err = $('authError');
  if (!email || !pass) { err.textContent = 'Email & password wajib diisi!'; return; }
  try { await signInWithEmailAndPassword(auth, email, pass); }
  catch (e) { err.textContent = 'Login gagal: ' + (e.code === 'auth/invalid-credential' ? 'Email atau password salah.' : e.message); }
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
  applyRoleToUI();
  injectStatusFilterToToolbar();
  let startPage = 'dashboard';
  if (isAdminOpd() && !ADMIN_OPD_MENUS.includes(startPage)) startPage = ADMIN_OPD_MENUS[0];
  if (isMasyarakat() && !MASYARAKAT_MENUS.includes(startPage)) startPage = MASYARAKAT_MENUS[0];
  showAdminPage(startPage);
}

// ============================================================
// APPLY ROLE
// ============================================================
function applyRoleToUI() {
  const info = $('sidebarUserInfo');
  if (info) {
    if (currentProfile?.nama || role()) {
      const roleLabel = (role() || 'viewer').replace('_', ' ');
      const opdLine = (isAdminOpd() && currentProfile?.opd)
        ? `<div style="margin-top:4px;color:#1E40AF;font-weight:600;"><i class="fas fa-building"></i> ${esc(currentProfile.opd)}</div>` : '';
      info.innerHTML = `<div style="font-weight:700;color:#1E3A8A;"><i class="fas fa-user-circle"></i> ${esc(currentProfile?.nama || currentUser?.email || '-')}</div>
        <div style="margin-top:2px;text-transform:capitalize;"><i class="fas fa-shield-halved"></i> ${esc(roleLabel)}</div>${opdLine}`;
      info.style.display = 'block';
    } else info.style.display = 'none';
  }

  document.querySelectorAll('.side-btn').forEach(btn => {
    const onclick = btn.getAttribute('onclick') || '';
    const match = onclick.match(/showAdminPage\('([^']+)'/);
    const page = match ? match[1] : null;
    if (!page) return;
    let show = true;
    if (isAdminOpd()) show = ADMIN_OPD_MENUS.includes(page);
    else if (isMasyarakat()) show = MASYARAKAT_MENUS.includes(page);
    else if (isEditor() || isAdmin()) { if (page === 'users') show = false; }
    if (page === 'users' && !isSuperAdmin()) show = false;
    btn.style.display = show ? 'flex' : 'none';
  });

  document.querySelectorAll('.stat-card').forEach(card => {
    const h3 = card.querySelector('h3');
    const id = h3?.id || '';
    if ((isAdminOpd() || isMasyarakat()) && !ADMIN_OPD_STAT_CARDS.includes(id)) card.style.display = 'none';
    else card.style.display = '';
  });

  const dashSub = $('dashboardSubtitle');
  if (dashSub) {
    if (isAdminOpd()) dashSub.textContent = `Ringkasan data TODDOPULI — ${currentProfile?.opd || 'OPD Anda'}`;
    else if (isMasyarakat()) dashSub.textContent = `Ringkasan data Anda — ${currentProfile?.nama || ''}`;
    else dashSub.textContent = 'Ringkasan data TODDOPULI';
  }
  const galeriSub = $('galeriSubtitle');
  if (galeriSub) galeriSub.textContent = (isAdminOpd() || isMasyarakat())
    ? `Gambar dari data Anda` : 'Semua gambar dari Inovasi, Berita, dan Pelatihan';

  updateStatusFilterVisibility();
  updatePelatihanInfoVisibility();
  updateCrudToolbarVisibility();
}

function updateStatusFilterVisibility() {
  const filterWrap = $('crudStatusFilterWrap');
  const approvalInfo = $('crudApprovalInfo');
  const approvalLegend = $('crudApprovalLegend');
  const k = currentAdminPage;
  const butuhApproval = needsApproval(k);
  if (filterWrap) filterWrap.style.display = (butuhApproval && isAnyAdmin()) ? 'block' : 'none';
  if (approvalInfo) approvalInfo.style.display = (butuhApproval && (isAdminOpd() || isMasyarakat())) ? 'flex' : 'none';
  if (approvalLegend) approvalLegend.style.display = (butuhApproval && canApprove()) ? 'flex' : 'none';
}

function updatePelatihanInfoVisibility() {
  const k = currentAdminPage;
  const infoPelatihan = $('crudPelatihanInfo');
  if (!infoPelatihan) return;
  const show = k === 'pelatihan' && (isAdminOpd() || isMasyarakat());
  infoPelatihan.style.display = show ? 'flex' : 'none';
}

function updateCrudToolbarVisibility() {
  const k = currentAdminPage;

  const toolbarActions = document.querySelector('#adm-crud .toolbar-actions');
  const addBtn = document.querySelector('#adm-crud .crud-head .btn-primary');

  const hideForPelatihanViewer = k === 'pelatihan' && (isAdminOpd() || isMasyarakat());
  const hideForCreatorOnly = creatorOnly(k) && !isAdminOrAbove();

  if (toolbarActions) toolbarActions.style.display = hideForPelatihanViewer ? 'none' : 'flex';
  if (addBtn) {
    if (hideForPelatihanViewer || hideForCreatorOnly) {
      addBtn.style.display = 'none';
    } else {
      addBtn.style.display = 'inline-flex';
    }
  }
}

// ============================================================
// ADMIN PAGES
// ============================================================
const PAGE_TITLES = {
  dashboard: ['Dashboard', 'Ringkasan data TODDOPULI'],
  inovasi: ['Inovasi', 'Kelola data inovasi daerah'],
  riset: ['Riset', 'Kelola hasil riset & kajian'],
  publikasi: ['Publikasi', 'Kelola dokumen publikasi'],
  hki: ['HKI', 'Kelola Hak Kekayaan Intelektual'],
  hki_edukasi: ['Edukasi HKI', 'Kelola artikel & video edukasi HKI'],
  hki_requests: ['Permintaan Akses HKI', 'Permintaan download dari pengunjung'],
  access_requests: ['Permintaan Akses Data', 'Permintaan download Inovasi/Riset/Publikasi/Database'],
  registrations: ['Pendaftaran Masyarakat', 'Pendaftaran akun baru dari masyarakat umum'],
  berita: ['Berita', 'Kelola berita & informasi'],
  pelatihan: ['Pelatihan', 'Kelola program pelatihan'],
  database: ['Database', 'Kelola dataset & dokumen'],
  opd: ['OPD', 'Kelola daftar OPD'],
  galeri: ['Galeri Foto', 'Semua gambar dari berbagai kategori'],
  users: ['Kelola Admin', 'Atur siapa saja yang bisa mengelola TODDOPULI']
};

function showAdminPage(page, btn) {
  if (isAdminOpd() && !ADMIN_OPD_MENUS.includes(page)) { toast('error', 'Akses Ditolak', 'Anda tidak punya akses.'); return; }
  if (isMasyarakat() && !MASYARAKAT_MENUS.includes(page)) { toast('error', 'Akses Ditolak', 'Anda tidak punya akses.'); return; }
  if (page === 'users' && !isSuperAdmin()) { toast('error', 'Akses Ditolak', 'Hanya Super Admin.'); return; }

  currentAdminPage = page;
  document.querySelectorAll('.adm-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.side-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  if (page === 'dashboard') {
    $('adm-dashboard').classList.add('active');
    updateStats();
    requestAnimationFrame(() => renderDashboardCharts());
  } else if (page === 'galeri') {
    $('adm-galeri').classList.add('active');
    renderGaleri();
  } else if (page === 'users') {
    $('adm-users').classList.add('active');
    if (!isSuperAdmin()) $('usersList').innerHTML = '<div class="info-box"><i class="fas fa-lock"></i><p>Hanya Super Admin.</p></div>';
    else renderUsers();
  } else if (page === 'hki_edukasi') {
    const el = $('adm-hki-edukasi'); if (el) el.classList.add('active');
    renderHkiEdukasiAdmin();
  } else if (page === 'hki_requests') {
    const el = $('adm-hki-requests'); if (el) el.classList.add('active');
    renderHkiRequests();
  } else if (page === 'access_requests') {
    const el = $('adm-access-requests'); if (el) el.classList.add('active');
    renderAccessRequests();
  } else if (page === 'registrations') {
    const el = $('adm-registrations'); if (el) el.classList.add('active');
    renderRegistrations();
  } else {
    $('adm-crud').classList.add('active');
    const [t, s] = PAGE_TITLES[page] || ['Kelola Data',''];
    $('crudTitle').innerHTML = `<i class="fas ${KATEGORI[page].icon}"></i> ${t}`;
    $('crudSubtitle').textContent = s;
    $('crudSearch').value = '';
    const sf = $('crudStatusFilter'); if (sf) sf.value = '';
    updateStatusFilterVisibility();
    updatePelatihanInfoVisibility();
    updateCrudToolbarVisibility();
    renderCrud();
  }
}

// ============================================================
// CHARTS
// ============================================================
function renderDashboardCharts() {
  if (typeof Chart === 'undefined') return;
  let inovasiData = cachedData.inovasi;
  if (isAdminOpd() || isMasyarakat()) inovasiData = filterDataForRole('inovasi', inovasiData);

  const tahunMap = {}; inovasiData.forEach(x => { if (x.tahun) tahunMap[x.tahun] = (tahunMap[x.tahun]||0)+1; });
  const tahunLabels = Object.keys(tahunMap).sort();
  const tahunValues = tahunLabels.map(t => tahunMap[t]);

  const ctx1 = $('chartTahun');
  if (ctx1) {
    if (chartTahunInstance) chartTahunInstance.destroy();
    chartTahunInstance = new Chart(ctx1, {
      type: 'bar',
      data: { labels: tahunLabels.length ? tahunLabels : ['-'], datasets: [{ label:'Jumlah Inovasi', data: tahunValues.length ? tahunValues : [0], backgroundColor:'#1E3A8A', borderRadius:8 }] },
      options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true, ticks:{stepSize:1}}} }
    });
  }

  const opdMap = {}; inovasiData.forEach(x => { if (x.opd) opdMap[x.opd] = (opdMap[x.opd]||0)+1; });
  const opdLabels = Object.keys(opdMap).slice(0, 8);
  const opdValues = opdLabels.map(o => opdMap[o]);
  const colors = ['#1E3A8A','#1D4ED8','#2563EB','#3B82F6','#60A5FA','#93C5FD','#BFDBFE','#DBEAFE'];

  const ctx2 = $('chartOpd');
  if (ctx2) {
    if (chartOpdInstance) chartOpdInstance.destroy();
    chartOpdInstance = new Chart(ctx2, {
      type: 'doughnut',
      data: { labels: opdLabels.length ? opdLabels : ['-'], datasets: [{ data: opdValues.length ? opdValues : [1], backgroundColor: colors, borderWidth:2, borderColor:'#fff' }] },
      options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom', labels:{font:{size:11}, padding:10}}} }
    });
  }

  const jenisMap = {}; inovasiData.forEach(x => { if (x.jenis_inovasi) jenisMap[x.jenis_inovasi] = (jenisMap[x.jenis_inovasi]||0)+1; });
  const jenisLabels = Object.keys(jenisMap);
  const jenisValues = jenisLabels.map(j => jenisMap[j]);
  const jenisColors = ['#F59E0B','#10B981','#6366F1','#EC4899','#8B5CF6'];

  const ctx3 = $('chartJenis');
  if (ctx3) {
    if (chartJenisInstance) chartJenisInstance.destroy();
    chartJenisInstance = new Chart(ctx3, {
      type: 'doughnut',
      data: { labels: jenisLabels.length ? jenisLabels : ['-'], datasets: [{ data: jenisValues.length ? jenisValues : [1], backgroundColor: jenisColors, borderWidth:2, borderColor:'#fff' }] },
      options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom', labels:{font:{size:11}, padding:10}}} }
    });
  }

  const bentukMap = {}; inovasiData.forEach(x => { if (x.bentuk_inovasi) bentukMap[x.bentuk_inovasi] = (bentukMap[x.bentuk_inovasi]||0)+1; });
  const bentukLabels = Object.keys(bentukMap);
  const bentukValues = bentukLabels.map(b => bentukMap[b]);
  const bentukColors = ['#0EA5E9','#F97316','#84CC16'];

  const ctx4 = $('chartBentuk');
  if (ctx4) {
    if (chartBentukInstance) chartBentukInstance.destroy();
    chartBentukInstance = new Chart(ctx4, {
      type: 'pie',
      data: { labels: bentukLabels.length ? bentukLabels : ['-'], datasets: [{ data: bentukValues.length ? bentukValues : [1], backgroundColor: bentukColors, borderWidth:2, borderColor:'#fff' }] },
      options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom', labels:{font:{size:11}, padding:10}}} }
    });
  }
}

// ============================================================
// CRUD
// ============================================================
function renderCrud() {
  const k = currentAdminPage;
  if (['dashboard','galeri','users','hki_edukasi','hki_requests','registrations','access_requests'].includes(k)) return;
  const container = $('crudList'); if (!container) return;
  const q = ($('crudSearch')?.value || '').toLowerCase();
  const statusFilter = $('crudStatusFilter')?.value || '';

  let list = cachedData[k] || [];
  list = filterDataForRole(k, list);
  if (needsApproval(k) && statusFilter) list = list.filter(d => getApprovalStatus(d) === statusFilter);
  if (q) list = list.filter(x => (x.judul||'').toLowerCase().includes(q));
  if (canApprove() && needsApproval(k)) {
    list.sort((a,b) => { const o = {pending:0,rejected:1,approved:2}; return (o[getApprovalStatus(a)]??3)-(o[getApprovalStatus(b)]??3); });
  }

  if (k === 'pelatihan' && (isAdminOpd() || isMasyarakat())) {
    if (!list.length) {
      container.innerHTML = emptyMsg('Belum ada pelatihan dari Admin. Silakan cek kembali nanti.');
      return;
    }
    container.innerHTML = list.map(buildPelatihanAdminCard).join('');
    return;
  }

  if (!list.length) {
    container.innerHTML = emptyMsg((isAdminOpd()||isMasyarakat()) ? `Belum ada data ${KATEGORI[k].nama} untuk Anda.` : 'Belum ada data.');
    return;
  }

  container.innerHTML = list.map(d => {
    const imgSrc = d.gambar ? getImageUrl(d.gambar) : '';
    const img = imgSrc ? `<img class="thumb" src="${esc(imgSrc)}" alt="" onerror="this.style.display='none'">` : '';
    const badge = d.opd || d.jenis || d.kategori || d.peneliti || d.pemilik;
    const date = d.tanggal ? formatTanggal(d.tanggal) : d.tahun;
    const desc = String(d.deskripsi || '');
    const descCut = desc.length > 100 ? desc.substring(0,100)+'...' : desc;
    const editable = canEditItem(k, d);
    const deletable = canDeleteItem(k, d);
    const approvalStatus = getApprovalStatus(d);
    const showApproval = needsApproval(k) && isAnyAdmin();
    const showApprovalButtons = canApprove() && needsApproval(k) && approvalStatus === 'pending';
    const ownerInfo = ((isAdminOpd()||isMasyarakat()) && d.createdBy)
      ? `<div class="meta" style="font-size:10px;color:#94A3B8;margin-top:4px;"><i class="fas fa-user"></i> ${esc(d.createdBy)}</div>` : '';
    const rejectInfo = (approvalStatus === 'rejected' && d.rejectReason)
      ? `<div class="meta" style="font-size:10px;color:#DC2626;margin-top:4px;"><i class="fas fa-circle-exclamation"></i> ${esc(d.rejectReason)}</div>` : '';
    const approvalRow = showApproval ? `<div style="margin-top:8px;">${approvalBadge(d)}</div>` : '';
    const approvalBtns = showApprovalButtons ? `<div style="display:flex;gap:6px;margin-top:10px;">
      <button onclick="event.stopPropagation();approveItem('${d.id}')" class="btn-approve"><i class="fas fa-check"></i> Setujui</button>
      <button onclick="event.stopPropagation();rejectItem('${d.id}')" class="btn-reject"><i class="fas fa-times"></i> Tolak</button>
    </div>` : '';
    return `<div class="crud-item">
      ${img}<h4>${esc(d.judul)}</h4><p>${esc(descCut)}</p>
      ${badge ? `<span class="badge">${esc(badge)}</span>` : ''}
      ${date ? `<div class="meta" style="font-size:11px;color:#94A3B8;margin-top:6px;"><i class="fas fa-calendar"></i> ${esc(date)}</div>` : ''}
      ${ownerInfo}${rejectInfo}${approvalRow}${approvalBtns}
      <div class="crud-actions">
        <button class="btn-edit" onclick="openForm('${d.id}')" ${editable?'':'disabled'}><i class="fas fa-pen"></i> Edit</button>
        <button class="btn-del" onclick="hapusData('${d.id}')" ${deletable?'':'disabled'}><i class="fas fa-trash"></i> Hapus</button>
      </div>
    </div>`;
  }).join('');
}

// ============================================================
// APPROVE / REJECT
// ============================================================
async function approveItem(id) {
  const k = currentAdminPage;
  if (!canApprove() || !needsApproval(k)) return toast('error', 'Akses Ditolak', 'Hanya Admin/Super Admin.');
  const item = cachedData[k]?.find(x => x.id === id); if (!item) return;
  if (!confirm(`Setujui "${item.judul}"?`)) return;
  try {
    await updateDoc(doc(db, k, id), {
      approval_status: 'approved',
      approvedBy: currentUser?.email,
      approvedAt: serverTimestamp(),
      rejectedBy: null, rejectedAt: null, rejectReason: null,
      updatedAt: serverTimestamp()
    });
    saveActivity('approve', k, item.judul);
    toast('success', 'Disetujui', `"${item.judul}" tampil di halaman utama.`);
  } catch (e) { toast('error', 'Gagal', e.message); }
}

async function rejectItem(id) {
  const k = currentAdminPage;
  if (!canApprove() || !needsApproval(k)) return toast('error', 'Akses Ditolak', 'Hanya Admin/Super Admin.');
  const item = cachedData[k]?.find(x => x.id === id); if (!item) return;
  const reason = prompt(`Tolak "${item.judul}"?\n\nAlasan (opsional):`, '');
  if (reason === null) return;
  try {
    await updateDoc(doc(db, k, id), {
      approval_status: 'rejected',
      rejectedBy: currentUser?.email,
      rejectedAt: serverTimestamp(),
      rejectReason: reason || 'Tidak disebutkan',
      approvedBy: null, approvedAt: null,
      updatedAt: serverTimestamp()
    });
    saveActivity('reject', k, item.judul);
    toast('info', 'Ditolak', `"${item.judul}" ditolak.`);
  } catch (e) { toast('error', 'Gagal', e.message); }
}

// ============================================================
// FORM MODAL
// ============================================================
function openForm(id = null) {
  const k = currentAdminPage;
  if (['dashboard','galeri','users'].includes(k)) return;
  if (!isEditorOrAbove()) return toast('error', 'Akses Ditolak', 'Anda tidak punya izin.');
  if (creatorOnly(k) && !isAdminOrAbove()) return toast('error', 'Akses Ditolak', `Hanya Admin/Super Admin yang bisa membuat ${KATEGORI[k].nama}.`);

  if (id) {
    const ex = cachedData[k]?.find(x => x.id === id); if (!ex) return;
    if (!canEditItem(k, ex)) return toast('error', 'Akses Ditolak', 'Hanya data milik Anda.');
  }

  editingKategori = k; editingId = id; pendingUploadFile = null;
  const cfg = KATEGORI[k];
  $('formTitle').innerHTML = `<i class="fas ${cfg.icon}"></i> ${id ? 'Edit' : 'Tambah'} ${cfg.nama}`;

  const d = id ? cachedData[k].find(x => x.id === id) : {};
  let html = '';

  if ((isAdminOpd() || isMasyarakat()) && needsApproval(k) && !id) {
    html += `<div class="info-box warning" style="margin-bottom:14px;"><i class="fas fa-clock"></i>
      <p>Data yang Anda input akan berstatus <b>"Menunggu ACC"</b>. Admin/Super Admin akan menyetujui sebelum tampil di halaman utama.</p></div>`;
  }

  cfg.fields.forEach(f => {
    let val = d?.[f.key] ?? '';
    const req = f.required ? 'required' : '';
    html += `<label>${f.label}${f.required ? ' <span style="color:#DC2626">*</span>' : ''}</label>`;

    if (f.type === 'textarea') {
      html += `<textarea id="f_${f.key}" ${req} placeholder="${f.label}...">${esc(val)}</textarea>`;
    } else if (f.type === 'select') {
      html += `<select id="f_${f.key}" ${req}>`;
      f.options.forEach(o => { html += `<option value="${esc(o)}" ${val === o ? 'selected' : ''}>${esc(o)}</option>`; });
      html += `</select>`;
    } else if (f.type === 'opd_select') {
      if (isAdminOpd()) {
        val = currentProfile?.opd || '';
        html += `<input type="text" id="f_${f.key}" value="${esc(val)}" readonly class="opd-locked">`;
        html += `<small style="color:#1E40AF;font-size:11px;display:block;margin-top:-6px;margin-bottom:10px;"><i class="fas fa-lock"></i> Terkunci: <b>${esc(val || '-')}</b></small>`;
      } else if (isMasyarakat()) {
        const opdList = (cachedData.opd || []).map(o => o.judul || o.nama).filter(Boolean).sort();
        html += `<select id="f_${f.key}" ${req}>`;
        html += `<option value="">-- Pilih OPD Mitra --</option>`;
        opdList.forEach(o => { html += `<option value="${esc(o)}" ${val === o ? 'selected' : ''}>${esc(o)}</option>`; });
        if (val && !opdList.includes(val)) html += `<option value="${esc(val)}" selected>${esc(val)}</option>`;
        html += `</select>`;
        html += `<small style="color:#F59E0B;font-size:11px;display:block;margin-top:-6px;margin-bottom:10px;"><i class="fas fa-info-circle"></i> Pilih OPD mitra kolaborasi.</small>`;
      } else {
        const opdList = (cachedData.opd || []).map(o => o.judul || o.nama).filter(Boolean).sort();
        if (!opdList.length) {
          html += `<input type="text" id="f_${f.key}" value="${esc(val)}" ${req} placeholder="Ketik nama OPD...">`;
          html += `<small style="color:#F59E0B;font-size:11px;display:block;margin-top:-6px;margin-bottom:10px;"><i class="fas fa-info-circle"></i> Belum ada OPD. Tambahkan di menu OPD.</small>`;
        } else {
          html += `<select id="f_${f.key}" ${req}><option value="">-- Pilih OPD --</option>`;
          opdList.forEach(o => { html += `<option value="${esc(o)}" ${val === o ? 'selected' : ''}>${esc(o)}</option>`; });
          if (val && !opdList.includes(val)) html += `<option value="${esc(val)}" selected>${esc(val)} (lama)</option>`;
          html += `</select>`;
        }
      }
    } else if (f.type === 'image') {
      html += `
        <div class="upload-box" onclick="document.getElementById('file_${f.key}').click()">
          <i class="fas fa-cloud-upload-alt"></i><p>Tap untuk pilih gambar</p><small>JPG/PNG • Maks 5MB</small>
        </div>
        <input type="file" id="file_${f.key}" accept="image/*" style="display:none" onchange="handleFilePick(this,'${f.key}','image')">
        <div id="prev_${f.key}">${val ? `<img class="preview-img" src="${esc(getImageUrl(val))}" onerror="this.style.display='none'">` : ''}</div>
        <input type="hidden" id="f_${f.key}" value="${esc(val)}">`;
    } else if (isUrlField(f.key)) {
      const isImg = f.key === 'gambar';
      const ph = isImg ? 'https://drive.google.com/file/d/... (gambar)' : 'https://drive.google.com/file/d/... (dokumen)';
      html += `<input type="url" id="f_${f.key}" value="${esc(val)}" ${req} placeholder="${ph}" style="font-family:monospace;font-size:12px;">`;
      if (val) {
        const ck = isImg ? getImageUrl(val) : normalizeDriveUrl(val);
        html += `<small style="display:block;margin-top:-6px;margin-bottom:10px;"><a href="${esc(ck)}" target="_blank" style="color:var(--primary);font-size:11px;font-weight:600;"><i class="fas fa-external-link-alt"></i> Cek</a></small>`;
      }
    } else {
      html += `<input type="${f.type}" id="f_${f.key}" value="${esc(val)}" ${req} placeholder="${f.label}...">`;
    }
  });

  $('formFields').innerHTML = html;
  $('formModal').classList.add('show');
}

function closeForm() { $('formModal')?.classList.remove('show'); editingId=null; pendingUploadFile=null; }

function handleFilePick(input, key, kind) {
  const file = input.files?.[0]; if (!file) return;
  const max = kind === 'image' ? 5 : 10;
  if (file.size > max*1024*1024) { alert(`Maks ${max}MB`); input.value=''; return; }
  pendingUploadFile = { file, key, kind };
  const prev = $('prev_' + key);
  if (kind === 'image') prev.innerHTML = `<img class="preview-img" src="${URL.createObjectURL(file)}" alt="">`;
  else prev.innerHTML = `<div class="preview-file"><i class="fas fa-file"></i><span>${esc(file.name)}</span></div>`;
}

// ============================================================
// UPLOAD CLOUDINARY
// ============================================================
async function uploadFile(file, path, onProgress) {
  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/auto/upload`;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', CLOUDINARY_PRESET);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress?.(Math.round((e.loaded/e.total)*100)); };
    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        try { const r = JSON.parse(xhr.responseText); resolve(r.secure_url || r.url); }
        catch { reject(new Error('Respons tidak valid')); }
      } else {
        let msg = 'Upload gagal ('+xhr.status+')';
        try { const r = JSON.parse(xhr.responseText); if (r.error?.message) msg = r.error.message; } catch {}
        reject(new Error(msg));
      }
    };
    xhr.onerror = () => reject(new Error('Koneksi gagal'));
    xhr.send(fd);
  });
}

// ============================================================
// SAVE FORM
// ============================================================
async function saveForm() {
  const k = editingKategori; if (!k) return;
  if (!isEditorOrAbove()) return toast('error', 'Akses Ditolak', 'Anda tidak punya izin.');
  if (creatorOnly(k) && !isAdminOrAbove()) return toast('error', 'Akses Ditolak', 'Hanya Admin/Super Admin.');

  const cfg = KATEGORI[k];
  const btn = $('saveBtn');
  const data = {};

  for (const f of cfg.fields) {
    if (f.type === 'image' || f.type === 'file') continue;
    const el = $('f_' + f.key);
    const v = el ? el.value.trim() : '';
    if (f.required && !v) { alert(`Field "${f.label}" wajib diisi!`); return; }
    if (v !== '') data[f.key] = v;
  }
  for (const f of cfg.fields) {
    if (f.type !== 'image' && f.type !== 'file') continue;
    const hidden = $('f_' + f.key);
    if (hidden && hidden.value) data[f.key] = hidden.value;
  }

  if (isAdminOpd() && k === 'inovasi') data.opd = currentProfile?.opd || data.opd;

  if (needsApproval(k)) {
    if (isAdminOpd() || isMasyarakat()) {
      data.approval_status = 'pending';
      data.approvedBy = null; data.approvedAt = null;
      data.rejectedBy = null; data.rejectedAt = null; data.rejectReason = null;
    } else if (canApprove() && !editingId) {
      data.approval_status = 'approved';
      data.approvedBy = currentUser?.email;
      data.approvedAt = serverTimestamp();
    }
  }

  if (k === 'hki' && !data.status_proses) data.status_proses = 'Diajukan';

  if ((isAdminOpd() || isMasyarakat()) && !editingId) data.createdBy = currentUser?.email;

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
      const ex = cachedData[k].find(x => x.id === editingId);
      if (!canEditItem(k, ex)) throw new Error('Anda tidak dapat mengedit data ini.');
      await updateDoc(doc(db, k, editingId), { ...data, updatedAt: serverTimestamp(), updatedBy: currentUser?.email });
    } else {
      await addDoc(collection(db, k), { ...data, createdAt: serverTimestamp(), createdBy: currentUser?.email });
    }

    saveActivity(editingId ? 'edit' : 'tambah', k, data.judul);
    let msg = 'Data berhasil disimpan.';
    if ((isAdminOpd() || isMasyarakat()) && needsApproval(k)) msg = 'Data diajukan! Menunggu persetujuan Admin.';
    closeForm();
    toast('success', 'Berhasil!', msg);
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
  const item = cachedData[k]?.find(x => x.id === id); if (!item) return;
  if (!canDeleteItem(k, item)) return toast('error', 'Akses Ditolak', 'Hanya data milik Anda.');
  if (!confirm('Yakin hapus?')) return;
  try {
    await deleteDoc(doc(db, k, id));
    saveActivity('hapus', k, item?.judul || '');
    toast('success', 'Terhapus', 'Data berhasil dihapus.');
  } catch (e) { toast('error', 'Gagal Hapus', e.message); }
}

// ============================================================
// EXPORT / IMPORT
// ============================================================
function exportExcel() {
  const k = currentAdminPage;
  if (!KATEGORI[k]) return;
  let data = cachedData[k] || [];
  data = filterDataForRole(k, data);
  if (!data.length) return toast('error', 'Tidak Ada Data', 'Belum ada data untuk diexport.');

  const cfg = KATEGORI[k];
  const rows = data.map(d => {
    const row = {};
    cfg.fields.forEach(f => { row[f.label] = d[f.key] ?? ''; });
    if (needsApproval(k)) {
      const status = getApprovalStatus(d);
      row['Status Approval'] = status === 'approved' ? 'Disetujui'
        : status === 'pending' ? 'Menunggu' : 'Ditolak';
    }
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, cfg.nama);
  XLSX.writeFile(wb, `TODDOPULI_${cfg.nama}_${new Date().toISOString().slice(0,10)}.xlsx`);
  toast('success', 'Export Berhasil', `Data ${cfg.nama} telah diunduh.`);
}

function exportPDF() {
  const k = currentAdminPage;
  if (!KATEGORI[k]) return;
  let data = cachedData[k] || [];
  data = filterDataForRole(k, data);
  if (!data.length) return toast('error', 'Tidak Ada Data', 'Belum ada data untuk diexport.');

  const cfg = KATEGORI[k];
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  doc.setFontSize(16); doc.setFont(undefined, 'bold');
  doc.text('TODDOPULI - Bapperida Kota Palopo', 14, 15);
  doc.setFontSize(11); doc.setFont(undefined, 'normal');
  doc.text(`Daftar ${cfg.nama}${isAdminOpd() ? ' - ' + currentProfile?.opd : ''}`, 14, 22);
  doc.setFontSize(9); doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 14, 28);

  const textFields = cfg.fields.filter(f => f.type !== 'image' && f.type !== 'file' && !isUrlField(f.key)).slice(0, 6);
  const headers = [textFields.map(f => f.label)];
  const rows = data.map(d => textFields.map(f => String(d[f.key] ?? '').substring(0, 60)));

  doc.autoTable({
    head: headers, body: rows, startY: 33,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 248, 255] }
  });

  doc.save(`TODDOPULI_${cfg.nama}_${new Date().toISOString().slice(0,10)}.pdf`);
  toast('success', 'Export Berhasil', `Data ${cfg.nama} telah diunduh.`);
}

function triggerImport() {
  const k = currentAdminPage;
  if (!KATEGORI[k]) return;
  if (!isEditorOrAbove()) return toast('error', 'Akses Ditolak', 'Anda tidak punya izin.');
  $('importFile').click();
}

async function handleImport(input) {
  const file = input.files?.[0]; if (!file) return;
  const k = currentAdminPage;
  const cfg = KATEGORI[k];

  try {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
    if (!rows.length) return toast('error', 'File Kosong', 'Tidak ada data di file Excel.');
    if (!confirm(`Akan mengimpor ${rows.length} baris ke kategori ${cfg.nama}. Lanjutkan?`)) return;

    const labelToKey = {};
    cfg.fields.forEach(f => { labelToKey[f.label.toLowerCase().trim()] = f.key; labelToKey[f.key.toLowerCase().trim()] = f.key; });

    const visibleList = filterDataForRole(k, cachedData[k] || []);
    const existingJudul = new Set(visibleList.map(x => String(x.judul || '').toLowerCase().trim()));

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
      if (isAdminOpd() && k === 'inovasi') docData.opd = currentProfile?.opd || docData.opd;
      if (needsApproval(k)) {
        if (isAdminOpd() || isMasyarakat()) docData.approval_status = 'pending';
        else if (canApprove()) {
          docData.approval_status = 'approved';
          docData.approvedBy = currentUser?.email;
          docData.approvedAt = serverTimestamp();
        }
      }
      try {
        await addDoc(collection(db, k), {
          ...docData, createdAt: serverTimestamp(),
          createdBy: currentUser?.email, importedBy: currentUser?.email
        });
        existingJudul.add(j); success++;
      } catch (err) { console.error(err); failed++; }
    }
    const msg = `${success} berhasil, ${skipped} dilewati (duplikat), ${failed} gagal.`;
    toast('success', 'Import Selesai', msg);
    saveActivity('import', k, msg);
  } catch (e) { console.error(e); toast('error', 'Import Gagal', e.message); }
  finally { input.value = ''; }
}

// ============================================================
// HKI EDUKASI (ADMIN)
// ============================================================
function renderHkiEdukasiAdmin() {
  const c = $('hkiEdukasiAdminList'); if (!c) return;
  const d = cachedData.hki_edukasi || [];
  c.innerHTML = d.length ? d.map(x => {
    const tipe = `<span class="badge ${x.tipe === 'Video' ? 'badge-jenis' : 'badge-bentuk'}">${esc(x.tipe)}</span>`;
    const canEdit = isSuperAdmin() || isAdmin() || x.createdBy === currentUser?.email;
    return `<div class="crud-item">
      <h4>${esc(x.judul)}</h4>
      ${tipe}
      <p style="font-size:12px;color:#64748B;margin-top:6px;">${esc(x.penulis || '-')}</p>
      <div class="crud-actions">
        <button class="btn-edit" onclick="openEdukasiForm('${x.id}')" ${canEdit?'':'disabled'}><i class="fas fa-pen"></i> Edit</button>
        <button class="btn-del" onclick="hapusEdukasi('${x.id}')" ${canEdit?'':'disabled'}><i class="fas fa-trash"></i> Hapus</button>
      </div>
    </div>`;
  }).join('') : emptyMsg('Belum ada konten edukasi.');
}

function openEdukasiForm(id = null) {
  if (!isAdminOrAbove()) return toast('error', 'Akses Ditolak', 'Hanya Admin/Super Admin.');
  editingEdukasiId = id;
  const d = id ? cachedData.hki_edukasi.find(x => x.id === id) : {};
  $('edukasiFormTitle').innerHTML = `<i class="fas fa-graduation-cap"></i> ${id?'Edit':'Tambah'} Edukasi HKI`;
  $('edukasiFields').innerHTML = `
    <label>Judul <span style="color:#DC2626">*</span></label>
    <input type="text" id="edu_judul" value="${esc(d?.judul||'')}">
    <label>Tipe Konten <span style="color:#DC2626">*</span></label>
    <select id="edu_tipe" onchange="toggleEdukasiFields()">
      <option value="Artikel" ${d?.tipe==='Artikel'?'selected':''}>Artikel</option>
      <option value="Video" ${d?.tipe==='Video'?'selected':''}>Video</option>
    </select>
    <label>Penulis / Narasumber</label>
    <input type="text" id="edu_penulis" value="${esc(d?.penulis||'')}">
    <div id="edu_artikel_wrap" style="display:${(!d?.tipe||d?.tipe==='Artikel')?'block':'none'};">
      <label>Isi Artikel</label>
      <textarea id="edu_konten" style="min-height:180px;">${esc(d?.konten||'')}</textarea>
    </div>
    <div id="edu_video_wrap" style="display:${d?.tipe==='Video'?'block':'none'};">
      <label>Link Video YouTube</label>
      <input type="url" id="edu_link_video" value="${esc(d?.link_video||'')}" placeholder="https://youtube.com/watch?v=...">
    </div>
    <label>Link Thumbnail (Google Drive, opsional)</label>
    <input type="url" id="edu_gambar" value="${esc(d?.gambar||'')}">
  `;
  $('edukasiModal').classList.add('show');
}

function toggleEdukasiFields() {
  const t = $('edu_tipe')?.value;
  if ($('edu_artikel_wrap')) $('edu_artikel_wrap').style.display = t === 'Artikel' ? 'block' : 'none';
  if ($('edu_video_wrap')) $('edu_video_wrap').style.display = t === 'Video' ? 'block' : 'none';
}

async function saveEdukasi() {
  if (!isAdminOrAbove()) return toast('error', 'Akses Ditolak');
  const judul = $('edu_judul').value.trim();
  const tipe = $('edu_tipe').value;
  const penulis = $('edu_penulis').value.trim();
  const konten = $('edu_konten')?.value.trim() || '';
  const link_video = $('edu_link_video')?.value.trim() || '';
  const gambar = $('edu_gambar').value.trim();
  if (!judul) return toast('error', 'Gagal', 'Judul wajib diisi.');
  if (tipe === 'Video' && !link_video) return toast('error', 'Gagal', 'Link video wajib diisi.');

  const data = { judul, tipe, penulis, konten: tipe==='Artikel'?konten:'', link_video: tipe==='Video'?link_video:'', gambar };
  try {
    if (editingEdukasiId) {
      await updateDoc(doc(db, 'hki_edukasi', editingEdukasiId), { ...data, updatedAt: serverTimestamp() });
    } else {
      await addDoc(collection(db, 'hki_edukasi'), { ...data, createdAt: serverTimestamp(), createdBy: currentUser?.email });
    }
    closeEdukasiForm();
    toast('success', 'Berhasil!', 'Edukasi HKI tersimpan.');
  } catch (e) { toast('error', 'Gagal', e.message); }
}

async function hapusEdukasi(id) {
  if (!isAdminOrAbove()) return;
  if (!confirm('Hapus konten edukasi ini?')) return;
  try { await deleteDoc(doc(db, 'hki_edukasi', id)); toast('success', 'Terhapus', ''); }
  catch (e) { toast('error', 'Gagal', e.message); }
}

function closeEdukasiForm() { $('edukasiModal')?.classList.remove('show'); editingEdukasiId = null; }

// ============================================================
// HKI REQUESTS (ADMIN)
// ============================================================
function renderHkiRequests() {
  const c = $('hkiRequestsList'); if (!c) return;
  const d = (cachedData.hki_requests || []).sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
  c.innerHTML = d.length ? d.map(x => {
    const statusBadge = x.status === 'pending' ? '<span class="approval-badge approval-pending">Menunggu</span>'
      : x.status === 'approved' ? '<span class="approval-badge approval-approved">Disetujui</span>'
      : '<span class="approval-badge approval-rejected">Ditolak</span>';
    const canAct = isAdminOrAbove();
    return `<div class="crud-item">
      <h4><i class="fas fa-certificate"></i> ${esc(x.hki_judul)}</h4>
      <p><b>Pemohon:</b> ${esc(x.nama_pemohon)}<br>
      <b>WA:</b> ${esc(x.no_wa)}<br>
      <b>Tujuan:</b> ${esc(x.tujuan)}</p>
      <div style="margin-top:6px;">${statusBadge}</div>
      <div class="crud-actions">
        <button class="btn-tool" onclick="waRequest('${x.id}')"><i class="fab fa-whatsapp"></i> Chat WA</button>
        ${x.status === 'pending' && canAct ? `
          <button class="btn-approve" onclick="approveHkiRequest('${x.id}')"><i class="fas fa-check"></i> ACC</button>
          <button class="btn-reject" onclick="rejectHkiRequest('${x.id}')"><i class="fas fa-times"></i> Tolak</button>
        ` : ''}
      </div>
    </div>`;
  }).join('') : emptyMsg('Belum ada permintaan akses.');
}

function waRequest(id) {
  const r = cachedData.hki_requests.find(x => x.id === id); if (!r) return;
  const text = `Halo ${r.nama_pemohon},\n\nPermintaan akses download HKI "${r.hki_judul}" Anda telah kami terima.`;
  window.open(waLink(r.no_wa, text), '_blank');
}

async function approveHkiRequest(id) {
  if (!isAdminOrAbove()) return;
  try {
    await updateDoc(doc(db, 'hki_requests', id), { status: 'approved', processedAt: serverTimestamp(), processedBy: currentUser?.email });
    toast('success', 'Disetujui', 'Status diperbarui. Kirim link via WA.');
  } catch (e) { toast('error', 'Gagal', e.message); }
}

async function rejectHkiRequest(id) {
  if (!isAdminOrAbove()) return;
  if (!confirm('Tolak permintaan ini?')) return;
  try {
    await updateDoc(doc(db, 'hki_requests', id), { status: 'rejected', processedAt: serverTimestamp(), processedBy: currentUser?.email });
    toast('info', 'Ditolak', '');
  } catch (e) { toast('error', 'Gagal', e.message); }
}

// ============================================================
// ACCESS REQUESTS (Inovasi, Riset, Publikasi, Database)
// ============================================================
function renderAccessRequests() {
  const c = $('accessRequestsList'); if (!c) return;
  const d = (cachedData.access_requests || []).sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));

  if (!d.length) {
    c.innerHTML = emptyMsg('Belum ada permintaan akses data.');
    return;
  }

  c.innerHTML = d.map(x => {
    const statusBadge = x.status === 'pending' ? '<span class="approval-badge approval-pending">Menunggu</span>'
      : x.status === 'approved' ? '<span class="approval-badge approval-approved">Disetujui</span>'
      : '<span class="approval-badge approval-rejected">Ditolak</span>';
    const katLabel = KATEGORI[x.kategori]?.nama || x.kategori;
    const fieldLabel = x.file_key === 'laporan' ? 'Laporan' : 'Dokumen';
    const canAct = isAdminOrAbove();
    return `<div class="crud-item">
      <h4><i class="fas ${KATEGORI[x.kategori]?.icon || 'fa-file'}"></i> ${esc(x.doc_judul)}</h4>
      <p style="margin-top:6px;">
        <b>Kategori:</b> ${esc(katLabel)} (${esc(fieldLabel)})<br>
        <b>Pemohon:</b> ${esc(x.nama_pemohon)}<br>
        <b>Instansi:</b> ${esc(x.instansi || '-')}<br>
        <b>WA:</b> ${esc(x.no_wa)}<br>
        <b>Tujuan:</b> ${esc(x.tujuan)}
      </p>
      <div style="margin-top:6px;">${statusBadge}</div>
      <div class="crud-actions">
        <button class="btn-tool" onclick="waAccessRequest('${x.id}')"><i class="fab fa-whatsapp"></i> Chat WA</button>
        ${x.status === 'pending' && canAct ? `
          <button class="btn-approve" onclick="approveAccessRequest('${x.id}')"><i class="fas fa-check"></i> ACC</button>
          <button class="btn-reject" onclick="rejectAccessRequest('${x.id}')"><i class="fas fa-times"></i> Tolak</button>
        ` : ''}
      </div>
    </div>`;
  }).join('');
}

function waAccessRequest(id) {
  const r = cachedData.access_requests.find(x => x.id === id); if (!r) return;
  const text = `Halo ${r.nama_pemohon},\n\nPermintaan akses file "${r.doc_judul}" (${KATEGORI[r.kategori]?.nama}) Anda telah kami terima.`;
  window.open(waLink(r.no_wa, text), '_blank');
}

async function approveAccessRequest(id) {
  if (!isAdminOrAbove()) return;
  try {
    await updateDoc(doc(db, 'access_requests', id), {
      status: 'approved',
      processedAt: serverTimestamp(),
      processedBy: currentUser?.email
    });
    toast('success', 'Disetujui', 'Status diperbarui. Kirim link via WA.');
  } catch (e) { toast('error', 'Gagal', e.message); }
}

async function rejectAccessRequest(id) {
  if (!isAdminOrAbove()) return;
  if (!confirm('Tolak permintaan akses ini?')) return;
  try {
    await updateDoc(doc(db, 'access_requests', id), {
      status: 'rejected',
      processedAt: serverTimestamp(),
      processedBy: currentUser?.email
    });
    toast('info', 'Ditolak', '');
  } catch (e) { toast('error', 'Gagal', e.message); }
}

// ============================================================
// REGISTRATIONS (ADMIN)
// ============================================================
function renderRegistrations() {
  const c = $('registrationsList'); if (!c) return;
  const d = (cachedData.registrations || []).sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
  c.innerHTML = d.length ? d.map(x => {
    const statusBadge = x.status === 'pending' ? '<span class="approval-badge approval-pending">Menunggu</span>'
      : x.status === 'approved' ? '<span class="approval-badge approval-approved">Disetujui</span>'
      : '<span class="approval-badge approval-rejected">Ditolak</span>';
    return `<div class="crud-item">
      <h4><i class="fas fa-user-plus"></i> ${esc(x.nama)}</h4>
      <p><b>Email:</b> ${esc(x.email)}<br>
      <b>WA:</b> ${esc(x.no_wa)}<br>
      <b>Kategori:</b> ${esc(x.kategori)}<br>
      <b>Institusi:</b> ${esc(x.institusi || '-')}</p>
      <div style="margin-top:6px;">${statusBadge}</div>
      <div class="crud-actions">
        <button class="btn-tool" onclick="waRegistration('${x.id}')"><i class="fab fa-whatsapp"></i> Chat WA</button>
        ${x.status === 'pending' && isSuperAdmin() ? `
          <button class="btn-approve" onclick="approveRegistration('${x.id}')"><i class="fas fa-check"></i> Buat Akun</button>
          <button class="btn-reject" onclick="rejectRegistration('${x.id}')"><i class="fas fa-times"></i> Tolak</button>
        ` : ''}
      </div>
    </div>`;
  }).join('') : emptyMsg('Belum ada pendaftaran.');
}

function waRegistration(id) {
  const r = cachedData.registrations.find(x => x.id === id); if (!r) return;
  const text = `Halo ${r.nama}, pendaftaran akun TODDOPULI Anda sedang diproses.`;
  window.open(waLink(r.no_wa, text), '_blank');
}

async function approveRegistration(id) {
  if (!isSuperAdmin()) return;
  const r = cachedData.registrations.find(x => x.id === id); if (!r) return;
  const password = prompt(`Buat password untuk ${r.email} (min. 6 karakter):`, '');
  if (!password || password.length < 6) { if (password !== null) alert('Password minimal 6 karakter!'); return; }

  try {
    const uid = await createUserSecondary(r.email, password);
    await setDoc(doc(db, 'users', uid), {
      email: r.email, nama: r.nama, role: 'masyarakat',
      no_wa: r.no_wa, kategori: r.kategori, institusi: r.institusi || '',
      createdAt: serverTimestamp(), createdBy: currentUser?.email
    });
    await updateDoc(doc(db, 'registrations', id), {
      status: 'approved', approvedAt: serverTimestamp(), approvedBy: currentUser?.email, uid
    });
    const text = `Halo ${r.nama},\n\nAkun TODDOPULI Anda telah dibuat:\n\n• Email: ${r.email}\n• Password: ${password}\n\nSilakan login di: ${location.origin}${location.pathname.replace('admin.html','index.html')}\n\nTerima kasih.`;
    window.open(waLink(r.no_wa, text), '_blank');
    toast('success', 'Berhasil', 'Akun dibuat. Kirim kredensial via WA.');
  } catch (e) {
    console.error(e);
    toast('error', 'Gagal', e.message);
  }
}

async function rejectRegistration(id) {
  if (!isSuperAdmin()) return;
  if (!confirm('Tolak pendaftaran ini?')) return;
  try {
    await updateDoc(doc(db, 'registrations', id), { status: 'rejected', rejectedAt: serverTimestamp(), rejectedBy: currentUser?.email });
    toast('info', 'Ditolak', '');
  } catch (e) { toast('error', 'Gagal', e.message); }
}

// ============================================================
// USERS
// ============================================================
function renderUsers() {
  if (!isSuperAdmin()) return;
  const c = $('usersList'); if (!c) return;
  c.innerHTML = cachedUsers.length ? cachedUsers.map(u => {
    const isMe = u.id === currentUser?.uid;
    const roleClass = `role-${u.role}`;
    const roleLabel = (u.role||'').replace('_',' ');
    const opdBadge = u.opd ? `<span class="badge" style="background:#DBEAFE;color:#1E40AF;margin-left:6px;"><i class="fas fa-building"></i> ${esc(u.opd)}</span>` : '';
    return `<div class="crud-item">
      <h4><i class="fas fa-user-shield"></i> ${esc(u.nama || u.email)} ${isMe?'<span style="color:#059669;font-size:11px;">(Anda)</span>':''}</h4>
      <p>${esc(u.email)}</p>
      <span class="role-badge ${roleClass}">${esc(roleLabel)}</span>${opdBadge}
      <div class="crud-actions">
        <button class="btn-edit" onclick="editUser('${u.id}')"><i class="fas fa-pen"></i> Edit</button>
        <button class="btn-del" onclick="hapusUser('${u.id}')" ${isMe?'disabled':''}><i class="fas fa-trash"></i> Hapus</button>
      </div>
    </div>`;
  }).join('') : emptyMsg('Belum ada admin terdaftar.');
}

function toggleUserOpdField() {
  const w = $('u_opd_wrapper'); if (!w) return;
  const r = $('u_role')?.value;
  w.style.display = r === 'admin_opd' ? 'block' : 'none';
}

function populateOpdDropdown(selected = '') {
  const sel = $('u_opd'); if (!sel) return;
  sel.innerHTML = '<option value="">-- Pilih OPD --</option>';
  const opts = (cachedData.opd || []).map(o => o.judul || o.nama).filter(Boolean).sort();
  if (!opts.length) { sel.innerHTML = '<option value="">-- Belum ada OPD --</option>'; return; }
  opts.forEach(o => { const opt = document.createElement('option'); opt.value = o; opt.textContent = o; if (o === selected) opt.selected = true; sel.appendChild(opt); });
}

function openUserForm() {
  editingUserId = null;
  $('userFormTitle').innerHTML = '<i class="fas fa-user-plus"></i> Tambah Admin';
  ['u_email','u_nama','u_pass'].forEach(id => { const el = $(id); if (el) el.value = ''; });
  $('u_role').value = 'admin';
  $('u_email').disabled = false;
  const passWrap = $('u_pass_wrapper');
  if (passWrap) passWrap.style.display = 'block';
  populateOpdDropdown();
  toggleUserOpdField();
  $('userModal').classList.add('show');
}

function editUser(id) {
  const u = cachedUsers.find(x => x.id === id); if (!u) return;
  editingUserId = id;
  $('userFormTitle').innerHTML = '<i class="fas fa-user-pen"></i> Edit Admin';
  $('u_email').value = u.email || '';
  $('u_nama').value = u.nama || '';
  $('u_role').value = u.role || 'admin';
  $('u_email').disabled = true;
  const passWrap = $('u_pass_wrapper');
  if (passWrap) passWrap.style.display = 'none';
  populateOpdDropdown(u.opd || '');
  toggleUserOpdField();
  $('userModal').classList.add('show');
}

function closeUserForm() { $('userModal')?.classList.remove('show'); editingUserId = null; }

async function createUserSecondary(email, password) {
  const NAME = 'toddopuli-secondary';
  let sApp;
  try { sApp = initializeApp(firebaseConfig, NAME); } catch { console.warn('Sudah ada'); }
  const sAuth = getAuth(sApp);
  try {
    const cred = await createUserWithEmailAndPassword(sAuth, email, password);
    const uid = cred.user.uid;
    await signOut(sAuth);
    await deleteApp(sApp);
    return uid;
  } catch (e) { try { await deleteApp(sApp); } catch {} throw e; }
}

async function saveUser() {
  if (!isSuperAdmin()) return toast('error', 'Akses Ditolak', 'Hanya Super Admin.');
  const email = $('u_email').value.trim();
  const nama = $('u_nama').value.trim();
  const r = $('u_role').value;
  const pass = $('u_pass').value.trim();
  const opd = $('u_opd')?.value.trim() || '';
  if (!email) return toast('error', 'Gagal', 'Email wajib diisi.');
  if (r === 'admin_opd' && !opd) return toast('error', 'Gagal', 'Pilih OPD.');

  const userData = { nama, role: r };
  if (r === 'admin_opd') userData.opd = opd;

  try {
    if (editingUserId) {
      await updateDoc(doc(db, 'users', editingUserId), { ...userData, updatedAt: serverTimestamp() });
      toast('success', 'Berhasil', 'Diperbarui.');
    } else {
      if (!pass || pass.length < 6) return toast('error', 'Gagal', 'Password minimal 6 karakter.');
      const uid = await createUserSecondary(email, pass);
      await setDoc(doc(db, 'users', uid), { email, ...userData, createdAt: serverTimestamp(), createdBy: currentUser?.email });
      toast('success', 'Berhasil', 'Admin baru ditambahkan.');
    }
    closeUserForm();
  } catch (e) {
    let msg = e.message;
    if (e.code === 'auth/email-already-in-use') msg = 'Email sudah terdaftar.';
    else if (e.code === 'auth/invalid-email') msg = 'Format email tidak valid.';
    else if (e.code === 'auth/weak-password') msg = 'Password terlalu lemah.';
    toast('error', 'Gagal', msg);
  }
}

async function hapusUser(id) {
  if (!isSuperAdmin()) return;
  if (id === currentUser?.uid) return toast('error', 'Tidak Bisa', 'Tidak bisa hapus diri sendiri.');
  if (!confirm('Hapus admin dari daftar?')) return;
  try { await deleteDoc(doc(db, 'users', id)); toast('success', 'Berhasil', 'Dihapus.'); }
  catch (e) { toast('error', 'Gagal', e.message); }
}

// ============================================================
// ACTIVITY LOG
// ============================================================
function saveActivity(action, kategori, judul) {
  const log = JSON.parse(localStorage.getItem('toddopuli_log') || '[]');
  log.unshift({ action, kategori, judul, time: new Date().toISOString(), user: currentUser?.email || 'unknown' });
  localStorage.setItem('toddopuli_log', JSON.stringify(log.slice(0, 20)));
}

function renderActivity() {
  const el = $('activityLog'); if (!el) return;
  const log = JSON.parse(localStorage.getItem('toddopuli_log') || '[]');
  if (!log.length) { el.innerHTML = '<p class="empty">Belum ada aktivitas.</p>'; return; }
  el.innerHTML = log.map(a => {
    const iconMap = { tambah:'fa-plus', edit:'fa-pen', hapus:'fa-trash', import:'fa-file-import', approve:'fa-circle-check', reject:'fa-circle-xmark' };
    const colorMap = { tambah:'#059669', edit:'#F59E0B', hapus:'#DC2626', import:'#2563EB', approve:'#059669', reject:'#DC2626' };
    const t = new Date(a.time).toLocaleString('id-ID', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
    return `<div class="activity-item">
      <i class="fas ${iconMap[a.action]||'fa-circle'}" style="background:${(colorMap[a.action]||'#64748B')}20;color:${colorMap[a.action]||'#64748B'};"></i>
      <div><b>${esc(a.action.toUpperCase())}</b> ${esc(a.kategori)} — ${esc(a.judul)}<div class="time">${t}</div></div>
    </div>`;
  }).join('');
}

// ============================================================
// GLOBAL SEARCH
// ============================================================
function globalSearch() {
  const q = $('globalSearch')?.value.trim();
  if (!q) return toast('error', 'Kosong', 'Isi kata kunci.');
  const ql = q.toLowerCase(); const results = [];
  ['inovasi','riset','publikasi','hki','berita','pelatihan','database'].forEach(k => {
    let items = isAdminPage() ? (cachedData[k]||[]) : filterForPublic(k, cachedData[k]||[]);
    items.forEach(d => {
      if ((d.judul||'').toLowerCase().includes(ql) || (d.deskripsi||'').toLowerCase().includes(ql))
        results.push({ k, id: d.id, judul: d.judul, kategori: KATEGORI[k].nama });
    });
  });
  if (!results.length) return toast('info', 'Tidak Ditemukan', `Tidak ada hasil "${q}"`);
  let html = `<h2><i class="fas fa-search"></i> Hasil "${esc(q)}"</h2>`;
  html += `<p style="margin-bottom:14px;color:var(--gray);font-size:13px;">Ditemukan ${results.length} hasil</p>`;
  html += results.slice(0, 20).map(r => `<div class="item" style="margin-bottom:8px;" onclick="closeDetail();showDetail('${r.k}','${r.id}');">
    <span class="badge" style="margin-bottom:6px;display:inline-block;">${esc(r.kategori)}</span>
    <h4 style="margin-top:6px;">${esc(r.judul)}</h4>
  </div>`).join('');
  $('detailContent').innerHTML = html;
  $('detailModal').classList.add('show');
}

// ============================================================
// INJECT STATUS FILTER
// ============================================================
function injectStatusFilterToToolbar() {
  if ($('crudStatusFilterWrap')) return;
  const ta = document.querySelector('#adm-crud .toolbar-actions'); if (!ta) return;
  const w = document.createElement('div');
  w.id = 'crudStatusFilterWrap';
  w.style.cssText = 'display:none;margin-left:auto;';
  w.innerHTML = `<select id="crudStatusFilter" onchange="renderCrud()" style="padding:11px 14px;border:1px solid var(--border);border-radius:10px;font-size:13px;background:var(--light);outline:none;font-family:inherit;">
    <option value="">Semua Status</option>
    <option value="pending">⏳ Menunggu ACC</option>
    <option value="approved">✓ Disetujui</option>
    <option value="rejected">✗ Ditolak</option>
  </select>`;
  ta.parentNode.insertBefore(w, ta);
}

// ============================================================
// EVENT LISTENERS
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  $('globalSearch')?.addEventListener('keypress', e => { if (e.key === 'Enter') globalSearch(); });
  $('loginPass')?.addEventListener('keypress', e => { if (e.key === 'Enter') doLogin(); });
  $('authPass')?.addEventListener('keypress', e => { if (e.key === 'Enter') authLogin(); });
  $('pubGaleriSearch')?.addEventListener('input', renderPubGaleri);
  document.querySelectorAll('.modal').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('show'); });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.querySelectorAll('.modal.show').forEach(m => m.classList.remove('show'));
  });
});

// ============================================================
// EXPOSE
// ============================================================
Object.assign(window, {
  showPage, toggleMenu, openLogin, closeLogin, doLogin, loginGuest,
  openRegister, closeRegister, submitRegister,
  showDetail, closeDetail, globalSearch,
  authLogin, authLogout, showAdminPage, openForm, closeForm, saveForm,
  hapusData, handleFilePick, exportExcel, exportPDF, triggerImport, handleImport,
  renderGaleri, renderPubGaleri, openUserForm, editUser, closeUserForm, saveUser, hapusUser,
  renderInovasi, renderRiset, renderPublikasi, renderHki, renderBerita,
  renderPelatihan, renderDatabase, renderCrud, renderHkiEdukasi, renderHkiWidget,
  normalizeDriveUrl, normalizeDriveImageUrl, toggleUserOpdField,
  approveItem, rejectItem, openHkiRequest, submitHkiRequest, showEdukasiDetail,
  openEdukasiForm, closeEdukasiForm, saveEdukasi, hapusEdukasi, toggleEdukasiFields,
  renderHkiEdukasiAdmin, renderHkiRequests, renderRegistrations,
  waRequest, approveHkiRequest, rejectHkiRequest, waRegistration, approveRegistration, rejectRegistration,
  renderWidgetBerita, renderWidgetPelatihan, renderHomeWidgets,
  updatePelatihanInfoVisibility, updateCrudToolbarVisibility,
  openAccessRequest, submitAccessRequest, renderAccessRequests,
  waAccessRequest, approveAccessRequest, rejectAccessRequest
});

// ============================================================
// BOOTSTRAP
// ============================================================
if (!isAdminPage()) {
  (async () => {
    try {
      await loadAllData();
      updateStats();
      renderInovasi(); renderRiset(); renderPublikasi();
      renderHki(); renderHkiWidget(); renderHkiEdukasi();
      renderBerita(); renderPelatihan(); renderDatabase();
      renderPubGaleri(); renderHomeWidgets();
      startRealtimeListeners();
    } catch (e) { console.error('Init error:', e); toast('error', 'Gagal Memuat', 'Periksa koneksi.'); }
  })();
}