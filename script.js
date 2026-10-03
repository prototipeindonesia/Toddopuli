/* ============================================================
   TODDOPULI - Script Utama
   Bapperida Kota Palopo
   Firebase Firestore + Auth + Cloudinary Upload
============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ============================================================
// KONFIGURASI FIREBASE
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

// ============================================================
// ⚠️ KONFIGURASI CLOUDINARY — GANTI DENGAN MILIK ANDA
// ============================================================
const CLOUDINARY_CLOUD = "vsuyvv7v";              // ← Cloud name Anda
const CLOUDINARY_PRESET = "toddopuli_unsigned";    // ← Nama upload preset Anda
const CLOUDINARY_FOLDER = "toddopuli";             // Folder di Cloudinary (opsional)

// ============================================================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ============================================================
// KONFIG KATEGORI & FIELD
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
let currentAdminPage = 'dashboard';
let cachedData = {
  inovasi:[], riset:[], publikasi:[], hki:[],
  berita:[], pelatihan:[], database:[]
};
let editingId = null;
let editingKategori = null;
let pendingUploadFile = null;

// ============================================================
// UTIL
// ============================================================
const $ = (id) => document.getElementById(id);
const isAdminPage = () => !!$('adminApp');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function formatTanggal(t) {
  if (!t) return '-';
  try {
    const d = new Date(t);
    return d.toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });
  } catch { return t; }
}

// ============================================================
// AMBIL SEMUA DATA DARI FIRESTORE
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
// RENDER PUBLIK
// ============================================================
function updateStats() {
  const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  set('statInovasi', cachedData.inovasi.length);
  set('statRiset', cachedData.riset.length);
  set('statHki', cachedData.hki.length);
  set('statBerita', cachedData.berita.length);
  // Admin dashboard
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
  const img = d.gambar ? `<img class="thumb" src="${esc(d.gambar)}" alt="${esc(d.judul)}" loading="lazy">` : '';
  const badge = extraLabel ? `<span class="badge">${esc(extraLabel)}</span>` : '';
  return `<div class="item" onclick="showDetail('${k}','${d.id}')">
    ${img}
    <h4>${esc(d.judul)}</h4>
    <p>${esc(d.deskripsi).substring(0,120)}${d.deskripsi?.length>120?'...':''}</p>
    ${badge}
  </div>`;
}

function renderInovasi() {
  const q = ($('searchInovasi')?.value || '').toLowerCase();
  const th = $('filterTahunInovasi')?.value || '';
  let d = cachedData.inovasi;
  if (q) d = d.filter(x => (x.judul||'').toLowerCase().includes(q) || (x.opd||'').toLowerCase().includes(q));
  if (th) d = d.filter(x => x.tahun === th);
  $('listInovasi').innerHTML = d.length
    ? d.map(x => buildCard(x, 'inovasi', `${x.opd} • ${x.tahun}`)).join('')
    : emptyMsg('Belum ada data inovasi.');
}

function renderRiset() {
  const q = ($('searchRiset')?.value || '').toLowerCase();
  let d = cachedData.riset;
  if (q) d = d.filter(x => (x.judul||'').toLowerCase().includes(q));
  $('listRiset').innerHTML = d.length
    ? d.map(x => buildCard(x, 'riset', `${x.peneliti} • ${x.tahun}`)).join('')
    : emptyMsg('Belum ada data riset.');
}

function renderPublikasi() {
  const q = ($('searchPub')?.value || '').toLowerCase();
  let d = cachedData.publikasi;
  if (q) d = d.filter(x => (x.judul||'').toLowerCase().includes(q));
  $('listPublikasi').innerHTML = d.length
    ? d.map(x => buildCard(x, 'publikasi', `${x.jenis} • ${x.tahun}`)).join('')
    : emptyMsg('Belum ada publikasi.');
}

function renderHki() {
  const q = ($('searchHki')?.value || '').toLowerCase();
  let d = cachedData.hki;
  if (q) d = d.filter(x => (x.judul||'').toLowerCase().includes(q));
  $('listHki').innerHTML = d.length
    ? d.map(x => buildCard(x, 'hki', `${x.jenis} • ${x.tahun}`)).join('')
    : emptyMsg('Belum ada data HKI.');
}

function renderBerita() {
  const d = cachedData.berita;
  $('listBerita').innerHTML = d.length
    ? d.map(x => buildCard(x, 'berita', formatTanggal(x.tanggal))).join('')
    : emptyMsg('Belum ada berita.');
}

function renderPelatihan() {
  const q = ($('searchPelatihan')?.value || '').toLowerCase();
  let d = cachedData.pelatihan;
  if (q) d = d.filter(x => (x.judul||'').toLowerCase().includes(q));
  $('listPelatihan').innerHTML = d.length
    ? d.map(x => buildCard(x, 'pelatihan', formatTanggal(x.tanggal))).join('')
    : emptyMsg('Belum ada pelatihan.');
}

function renderDatabase() {
  const q = ($('searchDb')?.value || '').toLowerCase();
  let d = cachedData.database;
  if (q) d = d.filter(x => (x.judul||'').toLowerCase().includes(q));
  $('listDatabase').innerHTML = d.length
    ? d.map(x => buildCard(x, 'database', x.kategori)).join('')
    : emptyMsg('Belum ada data.');
}

// ============================================================
// NAVIGASI HALAMAN PUBLIK
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
    database: renderDatabase
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
    html += `<a href="${esc(d.dokumen)}" target="_blank" class="btn-primary" style="margin-top:12px;text-decoration:none;"><i class="fas fa-file-pdf"></i> Lihat Dokumen</a>`;
  }
  if (d.sertifikat) {
    html += `<a href="${esc(d.sertifikat)}" target="_blank" class="btn-primary" style="margin-top:12px;text-decoration:none;"><i class="fas fa-file-certificate"></i> Lihat Sertifikat</a>`;
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
    alert('Login berhasil! Anda dapat mengakses Panel Admin.');
    window.location.href = 'admin.html';
  } catch (e) {
    err.textContent = 'Login gagal: ' + (e.code === 'auth/invalid-credential' ? 'Email atau password salah.' : e.message);
  }
}

function loginGuest() {
  closeLogin();
  alert('Anda masuk sebagai Pengunjung. Semua fitur publik dapat diakses.');
}

// ============================================================
// AUTH STATE
// ============================================================
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  const btn = $('loginBtn');
  if (btn) {
    if (user) {
      btn.innerHTML = `<i class="fas fa-user-shield"></i> <span>${esc(user.email.split('@')[0])}</span>`;
      btn.onclick = () => { if (confirm('Buka Panel Admin?')) location.href='admin.html'; };
    } else {
      btn.innerHTML = `<i class="fas fa-user"></i> <span>Login</span>`;
      btn.onclick = openLogin;
    }
  }
  if (isAdminPage()) {
    if (user) {
      $('authScreen').style.display = 'none';
      $('adminApp').style.display = 'block';
      $('userEmail').textContent = user.email;
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
    err.textContent = 'Login gagal: ' + (e.code === 'auth/invalid-credential' ? 'Email atau password salah.' : e.message);
  }
}

async function authLogout() {
  if (!confirm('Yakin logout?')) return;
  await signOut(auth);
  location.href = 'index.html';
}

async function initAdmin() {
  await loadAllData();
  updateStats();
  renderActivity();
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
  database: ['Database', 'Kelola dataset & dokumen']
};

function showAdminPage(page, btn) {
  currentAdminPage = page;
  document.querySelectorAll('.adm-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.side-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  if (page === 'dashboard') {
    $('adm-dashboard').classList.add('active');
    updateStats();
  } else {
    $('adm-crud').classList.add('active');
    const [t, s] = PAGE_TITLES[page] || ['Kelola Data',''];
    $('crudTitle').innerHTML = `<i class="fas ${KATEGORI[page].icon}"></i> ${t}`;
    $('crudSubtitle').textContent = s;
    $('crudSearch').value = '';
    renderCrud();
  }
}

function renderCrud() {
  const k = currentAdminPage;
  if (k === 'dashboard') return;
  const q = ($('crudSearch')?.value || '').toLowerCase();
  let list = cachedData[k] || [];
  if (q) list = list.filter(x => (x.judul||'').toLowerCase().includes(q));

  $('crudList').innerHTML = list.length
    ? list.map(d => {
      const img = d.gambar ? `<img class="thumb" src="${esc(d.gambar)}" alt="">` : '';
      const badge = d.opd || d.jenis || d.kategori || d.peneliti || d.pemilik;
      const date = d.tanggal ? formatTanggal(d.tanggal) : d.tahun;
      return `<div class="crud-item">
        ${img}
        <h4>${esc(d.judul)}</h4>
        <p>${esc(d.deskripsi||'').substring(0,100)}${d.deskripsi?.length>100?'...':''}</p>
        ${badge ? `<span class="badge">${esc(badge)}</span>` : ''}
        ${date ? `<div class="meta" style="font-size:11px;color:#94A3B8;margin-top:6px;"><i class="fas fa-calendar"></i> ${esc(date)}</div>` : ''}
        <div class="crud-actions">
          <button class="btn-edit" onclick="openForm('${d.id}')"><i class="fas fa-pen"></i> Edit</button>
          <button class="btn-del" onclick="hapusData('${d.id}')"><i class="fas fa-trash"></i> Hapus</button>
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
  if (k === 'dashboard') return;
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
    html += `<label>${f.label}${f.required?' <span style="color:#DC2626">*</span>':''}</label>`;

    if (f.type === 'textarea') {
      html += `<textarea id="f_${f.key}" ${req} placeholder="${f.label}...">${esc(val)}</textarea>`;
    } else if (f.type === 'select') {
      html += `<select id="f_${f.key}" ${req}>`;
      f.options.forEach(o => {
        html += `<option value="${esc(o)}" ${val===o?'selected':''}>${esc(o)}</option>`;
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
            <a href="${esc(val)}" target="_blank" style="color:var(--primary);font-size:12px;font-weight:600;">Lihat</a>
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

function closeForm() { $('formModal')?.classList.remove('show'); editingId = null; }

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
    const url = URL.createObjectURL(file);
    prev.innerHTML = `<img class="preview-img" src="${url}" alt="">`;
  } else {
    prev.innerHTML = `<div class="preview-file"><i class="fas fa-file"></i><span>${esc(file.name)}</span></div>`;
  }
}

// ============================================================
// UPLOAD KE CLOUDINARY
// ============================================================
async function uploadFile(file, path, onProgress) {
  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/auto/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_PRESET);
    if (CLOUDINARY_FOLDER) formData.append('folder', CLOUDINARY_FOLDER);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress?.(pct);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const res = JSON.parse(xhr.responseText);
          // Kembalikan URL aman (secure_url)
          resolve(res.secure_url || res.url);
        } catch (err) {
          reject(new Error('Respons Cloudinary tidak valid'));
        }
      } else {
        let msg = 'Upload gagal (' + xhr.status + ')';
        try {
          const errRes = JSON.parse(xhr.responseText);
          if (errRes.error?.message) msg += ': ' + errRes.error.message;
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
  const cfg = KATEGORI[k];
  const btn = $('saveBtn');

  // Kumpulkan data teks
  const data = {};
  for (const f of cfg.fields) {
    if (f.type === 'image' || f.type === 'file') continue;
    const el = $('f_' + f.key);
    const v = el ? el.value.trim() : '';
    if (f.required && !v) { alert(`Field "${f.label}" wajib diisi!`); return; }
    if (v !== '') data[f.key] = v;
  }

  // Ambil URL file lama (kalau edit & tidak upload baru)
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
      const ext = file.name.split('.').pop();
      const path = `${k}/${Date.now()}_${key}.${ext}`;
      $('uploadProgress').style.display = 'block';
      $('uploadFill').style.width = '0%';
      const url = await uploadFile(file, path, (p) => {
        $('uploadFill').style.width = p + '%';
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Upload ${p}%`;
      });
      data[key] = url;
    }

    // Simpan ke Firestore
    if (editingId) {
      await updateDoc(doc(db, k, editingId), { ...data, updatedAt: serverTimestamp() });
    } else {
      await addDoc(collection(db, k), { ...data, createdAt: serverTimestamp() });
    }

    // Reload data dari Firestore
    const snap = await getDocs(collection(db, k));
    cachedData[k] = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    saveActivity(editingId ? 'edit' : 'tambah', k, data.judul);

    closeForm();
    renderCrud();
    updateStats();
    alert('Data berhasil disimpan!');
  } catch (e) {
    console.error(e);
    alert('Gagal menyimpan: ' + e.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Simpan Data';
    $('uploadProgress').style.display = 'none';
    $('uploadFill').style.width = '0%';
  }
}

async function hapusData(id) {
  const k = currentAdminPage;
  if (!confirm('Yakin hapus data ini?')) return;
  try {
    const item = cachedData[k].find(x => x.id === id);
    await deleteDoc(doc(db, k, id));
    cachedData[k] = cachedData[k].filter(x => x.id !== id);
    saveActivity('hapus', k, item?.judul || '');
    renderCrud();
    updateStats();
    alert('Data dihapus.');
  } catch (e) {
    alert('Gagal hapus: ' + e.message);
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
    const iconMap = { tambah:'fa-plus', edit:'fa-pen', hapus:'fa-trash' };
    const colorMap = { tambah:'#059669', edit:'#F59E0B', hapus:'#DC2626' };
    const t = new Date(a.time).toLocaleString('id-ID', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
    return `<div class="activity-item">
      <i class="fas ${iconMap[a.action]||'fa-circle'}" style="background:${(colorMap[a.action]||'#64748B')}20;color:${colorMap[a.action]||'#64748B'};"></i>
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
  if (!q) return alert('Masukkan kata kunci pencarian.');
  const res = [];
  Object.entries(cachedData).forEach(([k, list]) => {
    list.forEach(d => {
      if ((d.judul||'').toLowerCase().includes(q.toLowerCase())) {
        res.push(`• [${KATEGORI[k].nama}] ${d.judul}`);
      }
    });
  });
  alert(res.length ? `Ditemukan ${res.length} hasil:\n\n${res.slice(0,10).join('\n')}${res.length>10?'\n...':''}` : 'Tidak ditemukan hasil untuk: ' + q);
}

// ============================================================
// EVENT LISTENERS
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  $('globalSearch')?.addEventListener('keypress', e => { if (e.key === 'Enter') globalSearch(); });
  $('loginPass')?.addEventListener('keypress', e => { if (e.key === 'Enter') doLogin(); });
  $('authPass')?.addEventListener('keypress', e => { if (e.key === 'Enter') authLogin(); });
  document.querySelectorAll('.modal').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('show'); });
  });
});

// ============================================================
// EXPOSE KE GLOBAL
// ============================================================
Object.assign(window, {
  showPage, toggleMenu, openLogin, closeLogin, doLogin, loginGuest,
  showDetail, closeDetail, globalSearch,
  authLogin, authLogout, showAdminPage, openForm, closeForm, saveForm,
  hapusData, handleFilePick,
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
      renderInovasi(); renderRiset(); renderPublikasi();
      renderHki(); renderBerita(); renderPelatihan(); renderDatabase();
    } catch (e) {
      console.error('Init error:', e);
      alert('Gagal memuat data. Periksa koneksi & konfigurasi Firebase.');
    }
  })();
}
