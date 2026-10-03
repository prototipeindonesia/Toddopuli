/* ========================================
   TODDOPULI - Script Utama
   Bapperida Kota Palopo
======================================== */

// ===== DATA (LocalStorage-based) =====
const DB = {
  get: (key) => JSON.parse(localStorage.getItem('toddopuli_' + key) || 'null'),
  set: (key, val) => localStorage.setItem('toddopuli_' + key, JSON.stringify(val))
};

// Data seed awal
function seedData() {
  if (!DB.get('seeded')) {
    DB.set('inovasi', [
      {id:1, judul:'SiCantik - Sistem Cerdas Administrasi', opd:'Dinas Kominfo', tahun:'2024', deskripsi:'Inovasi digitalisasi pelayanan administrasi kependudukan.', status:'Aktif'},
      {id:2, judul:'Layanan Jemput Bola Pajak', opd:'Bapenda', tahun:'2023', deskripsi:'Inovasi pelayanan pajak langsung ke masyarakat.', status:'Aktif'},
      {id:3, judul:'Kampung Iklim Palopo', opd:'DLH', tahun:'2023', deskripsi:'Program kampung ramah lingkungan.', status:'Aktif'},
      {id:4, judul:'Pasar Digital Palopo', opd:'Disperindag', tahun:'2024', deskripsi:'Platform digital untuk UMKM Palopo.', status:'Pilot'}
    ]);
    DB.set('riset', [
      {id:1, judul:'Kajian Pengelolaan Sampah Kota Palopo', peneliti:'Tim BRIDA', tahun:'2024', deskripsi:'Riset strategis pengelolaan sampah berkelanjutan.'},
      {id:2, judul:'Pemetaan Potensi Ekonomi Kreatif', peneliti:'Dr. Ahmad', tahun:'2023', deskripsi:'Riset pemetaan ekonomi kreatif daerah.'},
      {id:3, judul:'Studi Transportasi Publik', peneliti:'Tim BRIDA', tahun:'2024', deskripsi:'Analisis kebutuhan transportasi publik Palopo.'}
    ]);
    DB.set('publikasi', [
      {id:1, judul:'Laporan Kinerja Bapperida 2024', jenis:'Laporan', tahun:'2024', deskripsi:'Laporan tahunan kinerja Bapperida Kota Palopo.'},
      {id:2, judul:'Jurnal Inovasi Daerah Vol. 1', jenis:'Jurnal', tahun:'2024', deskripsi:'Kumpulan artikel inovasi daerah.'},
      {id:3, judul:'Profil Riset & Inovasi Palopo', jenis:'Profil', tahun:'2023', deskripsi:'Profil lengkap riset dan inovasi daerah.'}
    ]);
    DB.set('hki', [
      {id:1, judul:'Aplikasi SiCantik', pemilik:'Dinas Kominfo', nomor:'EC002024001', tahun:'2024', jenis:'Hak Cipta'},
      {id:2, judul:'Merek TODDOPULI', pemilik:'Bapperida', nomor:'IDM000987654', tahun:'2024', jenis:'Merek'}
    ]);
    DB.set('berita', [
      {id:1, judul:'BRIDA Palopo Luncurkan TODDOPULI', tanggal:'2025-01-10', deskripsi:'Platform terintegrasi riset dan inovasi resmi diluncurkan.'},
      {id:2, judul:'Pelatihan Digitalisasi OPD Digelar', tanggal:'2025-01-05', deskripsi:'Bapperida menggelar pelatihan digitalisasi untuk seluruh OPD.'},
      {id:3, judul:'Kunjungan Kerja BRIDA Makassar', tanggal:'2024-12-20', deskripsi:'Studi tiru implementasi SIGAP BRIDA Makassar.'}
    ]);
    DB.set('pelatihan', [
      {id:1, judul:'Pelatihan Penulisan Proposal Riset', tanggal:'2025-02-15', kuota:'30 orang', deskripsi:'Pelatihan penulisan proposal riset bagi ASN.'},
      {id:2, judul:'Workshop Inovasi Pelayanan Publik', tanggal:'2025-03-10', kuota:'50 orang', deskripsi:'Workshop pengembangan inovasi pelayanan publik.'},
      {id:3, judul:'Bimtek Pengelolaan HKI', tanggal:'2025-04-05', kuota:'25 orang', deskripsi:'Bimbingan teknis pengelolaan HKI.'}
    ]);
    DB.set('database', [
      {id:1, judul:'Data OPD Kota Palopo', kategori:'Kelembagaan', deskripsi:'Daftar lengkap OPD Kota Palopo.'},
      {id:2, judul:'Dataset Inovasi Daerah', kategori:'Inovasi', deskripsi:'Dataset inovasi seluruh OPD.'},
      {id:3, judul:'Arsip Dokumen Riset', kategori:'Riset', deskripsi:'Arsip dokumen hasil riset.'},
      {id:4, judul:'Data Pegawai BRIDA', kategori:'SDM', deskripsi:'Data pegawai BRIDA (terbatas).'}
    ]);
    DB.set('seeded', true);
  }
}
seedData();

// ===== SESSION =====
let currentUser = DB.get('session') || null;
const ADMIN = { username: 'admin', password: 'admin123', role: 'admin' };
const GUEST = { username: 'tamu', password: 'tamu', role: 'guest' };

// ===== NAVIGATION =====
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
  event && event.target && event.target.classList && event.target.classList.add('active');

  // Hero hanya di beranda
  document.getElementById('heroSection').style.display = page === 'home' ? 'block' : 'none';

  document.getElementById('navMenu').classList.remove('show');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Render sesuai halaman
  if (page === 'inovasi') renderInovasi();
  if (page === 'riset') renderRiset();
  if (page === 'publikasi') renderPublikasi();
  if (page === 'hki') renderHki();
  if (page === 'berita') renderBerita();
  if (page === 'pelatihan') renderPelatihan();
  if (page === 'database') renderDatabase();
  if (page === 'home') updateStats();
}

function toggleMenu() {
  document.getElementById('navMenu').classList.toggle('show');
}

// ===== STATS =====
function updateStats() {
  document.getElementById('statInovasi').textContent = (DB.get('inovasi') || []).length;
  document.getElementById('statRiset').textContent = (DB.get('riset') || []).length;
  document.getElementById('statHki').textContent = (DB.get('hki') || []).length;
  document.getElementById('statBerita').textContent = (DB.get('berita') || []).length;
}
updateStats();

// ===== RENDER FUNCTIONS =====
function renderInovasi() {
  const q = (document.getElementById('searchInovasi')?.value || '').toLowerCase();
  const th = document.getElementById('filterTahunInovasi')?.value || '';
  let data = DB.get('inovasi') || [];
  if (q) data = data.filter(d => d.judul.toLowerCase().includes(q) || d.opd.toLowerCase().includes(q));
  if (th) data = data.filter(d => d.tahun === th);
  document.getElementById('listInovasi').innerHTML = data.length ? data.map(d => `
    <div class="item" onclick="showDetail('Inovasi', ${d.id}, 'inovasi')">
      <h4>${d.judul}</h4>
      <p>${d.deskripsi}</p>
      <span class="badge">${d.opd} • ${d.tahun}</span>
      <div class="meta">Status: ${d.status}</div>
    </div>
  `).join('') : '<p>Belum ada data inovasi.</p>';
}

function renderRiset() {
  const q = (document.getElementById('searchRiset')?.value || '').toLowerCase();
  let data = DB.get('riset') || [];
  if (q) data = data.filter(d => d.judul.toLowerCase().includes(q));
  document.getElementById('listRiset').innerHTML = data.length ? data.map(d => `
    <div class="item" onclick="showDetail('Riset', ${d.id}, 'riset')">
      <h4>${d.judul}</h4>
      <p>${d.deskripsi}</p>
      <span class="badge">${d.peneliti} • ${d.tahun}</span>
    </div>
  `).join('') : '<p>Belum ada data riset.</p>';
}

function renderPublikasi() {
  const q = (document.getElementById('searchPub')?.value || '').toLowerCase();
  let data = DB.get('publikasi') || [];
  if (q) data = data.filter(d => d.judul.toLowerCase().includes(q));
  document.getElementById('listPublikasi').innerHTML = data.length ? data.map(d => `
    <div class="item" onclick="showDetail('Publikasi', ${d.id}, 'publikasi')">
      <h4>${d.judul}</h4>
      <p>${d.deskripsi}</p>
      <span class="badge">${d.jenis} • ${d.tahun}</span>
    </div>
  `).join('') : '<p>Belum ada publikasi.</p>';
}

function renderHki() {
  const q = (document.getElementById('searchHki')?.value || '').toLowerCase();
  let data = DB.get('hki') || [];
  if (q) data = data.filter(d => d.judul.toLowerCase().includes(q));
  document.getElementById('listHki').innerHTML = data.length ? data.map(d => `
    <div class="item">
      <h4>${d.judul}</h4>
      <p>Pemilik: ${d.pemilik}<br>No: ${d.nomor}</p>
      <span class="badge">${d.jenis} • ${d.tahun}</span>
      ${currentUser?.role === 'admin' ? `
      <div class="actions">
        <button onclick="event.stopPropagation();editItem('hki',${d.id})">Edit</button>
        <button class="danger" onclick="event.stopPropagation();delItem('hki',${d.id})">Hapus</button>
      </div>` : ''}
    </div>
  `).join('') : '<p>Belum ada data HKI.</p>';
}

function renderBerita() {
  const data = DB.get('berita') || [];
  document.getElementById('listBerita').innerHTML = data.length ? data.map(d => `
    <div class="item" onclick="showDetail('Berita', ${d.id}, 'berita')">
      <h4>${d.judul}</h4>
      <p>${d.deskripsi}</p>
      <div class="meta"><i class="fas fa-calendar"></i> ${d.tanggal}</div>
    </div>
  `).join('') : '<p>Belum ada berita.</p>';
}

function renderPelatihan() {
  const q = (document.getElementById('searchPelatihan')?.value || '').toLowerCase();
  let data = DB.get('pelatihan') || [];
  if (q) data = data.filter(d => d.judul.toLowerCase().includes(q));
  document.getElementById('listPelatihan').innerHTML = data.length ? data.map(d => `
    <div class="item" onclick="showDetail('Pelatihan', ${d.id}, 'pelatihan')">
      <h4>${d.judul}</h4>
      <p>${d.deskripsi}</p>
      <span class="badge">${d.tanggal}</span>
      <div class="meta">Kuota: ${d.kuota}</div>
    </div>
  `).join('') : '<p>Belum ada pelatihan.</p>';
}

function renderDatabase() {
  const q = (document.getElementById('searchDb')?.value || '').toLowerCase();
  let data = DB.get('database') || [];
  if (q) data = data.filter(d => d.judul.toLowerCase().includes(q));
  document.getElementById('listDatabase').innerHTML = data.length ? data.map(d => `
    <div class="item">
      <h4>${d.judul}</h4>
      <p>${d.deskripsi}</p>
      <span class="badge">${d.kategori}</span>
    </div>
  `).join('') : '<p>Belum ada data.</p>';
}

// ===== DETAIL =====
function showDetail(label, id, key) {
  const data = (DB.get(key) || []).find(d => d.id === id);
  if (!data) return;
  let html = `<h2>${data.judul}</h2>`;
  for (const k in data) {
    if (k === 'id' || k === 'judul') continue;
    html += `<p><b>${k.charAt(0).toUpperCase() + k.slice(1)}:</b> ${data[k]}</p>`;
  }
  document.getElementById('detailContent').innerHTML = html;
  document.getElementById('detailModal').classList.add('show');
}
function closeDetail() { document.getElementById('detailModal').classList.remove('show'); }

// ===== LOGIN =====
function openLogin() {
  if (currentUser) {
    if (confirm('Logout dari TODDOPULI?')) {
      currentUser = null;
      DB.set('session', null);
      updateLoginButton();
      alert('Berhasil logout.');
    }
    return;
  }
  document.getElementById('loginModal').classList.add('show');
}
function closeLogin() { document.getElementById('loginModal').classList.remove('show'); }

function doLogin() {
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value.trim();
  const err = document.getElementById('loginError');

  if (u === ADMIN.username && p === ADMIN.password) {
    currentUser = ADMIN;
    DB.set('session', currentUser);
    err.textContent = '';
    closeLogin();
    updateLoginButton();
    alert('Login sebagai ADMIN berhasil!');
    showPage('home');
  } else if (u === GUEST.username && p === GUEST.password) {
    currentUser = GUEST;
    DB.set('session', currentUser);
    err.textContent = '';
    closeLogin();
    updateLoginButton();
    alert('Login sebagai Pengunjung berhasil!');
  } else {
    err.textContent = 'Username atau password salah!';
  }
}

function loginGuest() {
  currentUser = GUEST;
  DB.set('session', currentUser);
  closeLogin();
  updateLoginButton();
  alert('Masuk sebagai Pengunjung.');
}

function updateLoginButton() {
  const btn = document.getElementById('loginBtn');
  if (currentUser) {
    btn.innerHTML = `<i class="fas fa-user-check"></i> ${currentUser.username} (${currentUser.role})`;
  } else {
    btn.innerHTML = `<i class="fas fa-user"></i> Login`;
  }
}
updateLoginButton();

// ===== ADMIN FORM =====
let adminFormCtx = { key: null, editId: null };

function openAdminForm(key) {
  if (currentUser?.role !== 'admin') {
    alert('Fitur ini hanya untuk Admin!');
    return;
  }
  adminFormCtx = { key, editId: null };
  document.getElementById('adminFormTitle').textContent = 'Tambah Data ' + key.toUpperCase();
  let fields = '';
  const templates = {
    inovasi: ['judul','opd','tahun','deskripsi','status'],
    riset: ['judul','peneliti','tahun','deskripsi'],
    publikasi: ['judul','jenis','tahun','deskripsi'],
    hki: ['judul','pemilik','nomor','tahun','jenis'],
    berita: ['judul','tanggal','deskripsi'],
    pelatihan: ['judul','tanggal','kuota','deskripsi'],
    database: ['judul','kategori','deskripsi']
  };
  (templates[key] || []).forEach(f => {
    if (f === 'deskripsi') {
      fields += `<textarea id="f_${f}" placeholder="${f}"></textarea>`;
    } else {
      fields += `<input id="f_${f}" placeholder="${f}">`;
    }
  });
  document.getElementById('adminFormFields').innerHTML = fields;
  document.getElementById('adminModal').classList.add('show');
}

function closeAdminForm() { document.getElementById('adminModal').classList.remove('show'); }

function saveAdminForm() {
  const { key, editId } = adminFormCtx;
  const data = DB.get(key) || [];
  const obj = { id: editId || Date.now() };
  document.querySelectorAll('#adminFormFields [id^="f_"]').forEach(el => {
    obj[el.id.slice(2)] = el.value;
  });
  if (editId) {
    const idx = data.findIndex(d => d.id === editId);
    data[idx] = obj;
  } else {
    data.push(obj);
  }
  DB.set(key, data);
  closeAdminForm();
  alert('Data tersimpan!');
  // Refresh tampilan
  if (key === 'inovasi') renderInovasi();
  if (key === 'riset') renderRiset();
  if (key === 'publikasi') renderPublikasi();
  if (key === 'hki') renderHki();
  if (key === 'berita') renderBerita();
  if (key === 'pelatihan') renderPelatihan();
  if (key === 'database') renderDatabase();
  updateStats();
}

function editItem(key, id) {
  if (currentUser?.role !== 'admin') return alert('Hanya Admin!');
  const item = (DB.get(key) || []).find(d => d.id === id);
  if (!item) return;
  adminFormCtx = { key, editId: id };
  document.getElementById('adminFormTitle').textContent = 'Edit ' + key.toUpperCase();
  let fields = '';
  Object.keys(item).forEach(f => {
    if (f === 'id') return;
    if (f === 'deskripsi') {
      fields += `<textarea id="f_${f}" placeholder="${f}">${item[f]}</textarea>`;
    } else {
      fields += `<input id="f_${f}" placeholder="${f}" value="${item[f]}">`;
    }
  });
  document.getElementById('adminFormFields').innerHTML = fields;
  document.getElementById('adminModal').classList.add('show');
}

function delItem(key, id) {
  if (currentUser?.role !== 'admin') return alert('Hanya Admin!');
  if (!confirm('Hapus data ini?')) return;
  const data = (DB.get(key) || []).filter(d => d.id !== id);
  DB.set(key, data);
  if (key === 'hki') renderHki();
  updateStats();
  alert('Data dihapus.');
}

// ===== GLOBAL SEARCH =====
function globalSearch() {
  const q = document.getElementById('globalSearch').value.trim();
  if (!q) return alert('Masukkan kata kunci.');
  // Cari di semua kategori
  const results = [];
  ['inovasi','riset','publikasi','hki','berita','pelatihan','database'].forEach(k => {
    (DB.get(k) || []).forEach(d => {
      if (d.judul.toLowerCase().includes(q.toLowerCase())) results.push({k, d});
    });
  });
  if (!results.length) return alert('Tidak ditemukan hasil untuk: ' + q);
  alert('Ditemukan ' + results.length + ' hasil:\n\n' + results.map(r => '• [' + r.k.toUpperCase() + '] ' + r.d.judul).join('\n'));
}

// Enter untuk search
document.getElementById('globalSearch').addEventListener('keypress', e => {
  if (e.key === 'Enter') globalSearch();
});

// Close modal saat klik luar
document.querySelectorAll('.modal').forEach(m => {
  m.addEventListener('click', e => {
    if (e.target === m) m.classList.remove('show');
  });
});

// Init halaman
showPage('home');
