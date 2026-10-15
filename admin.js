/* =========================================================
   WARKOP 14KZ — admin.js (hanya dimuat di admin.html)
   Login admin · kelola menu · catat pesanan · pengaturan
   ========================================================= */

// ⚠️ Kredensial demo (terlihat di kode). Untuk produksi:
// autentikasi harus di server (Firebase Auth dll), bukan di sini.
const ADMIN_AKUN = { email: "admin@14kz.id", pass: "admin14kz" };
const isAdmin = () => sessionStorage.getItem("kz_admin") === "1";
const $ = id => document.getElementById(id);

// ====== 0. LOGIN & TAMPILAN PANEL ======
function tampilPanel() {
  const masuk = isAdmin();
  $("adminLogin")?.classList.toggle("hidden", masuk);
  $("adminPanel")?.classList.toggle("hidden", !masuk);
  if (masuk) { renderDash(); renderMenuAdmin(); renderOrders(); renderSet(); }
}
 $("formAdmin")?.addEventListener("submit", e => {
  e.preventDefault();
  const em = $("aEmail").value.trim().toLowerCase();
  const pw = $("aPass").value;
  if (em === ADMIN_AKUN.email && pw === ADMIN_AKUN.pass) {
    sessionStorage.setItem("kz_admin", "1");   // sesi berakhir saat tab ditutup
    tampilPanel();
  } else alert("Email/password admin salah.\nDemo: admin@14kz.id / admin14kz");
});
 $("btnAdminKeluar")?.addEventListener("click", () => {
  sessionStorage.removeItem("kz_admin"); location.reload();
});

// tab: dashboard / menu / pesanan / pengaturan
document.querySelectorAll(".admin-tabs button").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll(".admin-tabs button").forEach(x => x.classList.toggle("active", x === b));
  document.querySelectorAll(".admin-view").forEach(v => v.classList.add("hidden"));
  $("view-" + b.dataset.view).classList.remove("hidden");
}));

// ====== 1. DASHBOARD ======
const getOrders  = () => JSON.parse(localStorage.getItem("kz_orders_admin") || "[]");
const saveOrders = o => localStorage.setItem("kz_orders_admin", JSON.stringify(o));

function renderDash() {
  if (!$("dashStats")) return;
  const orders = getOrders();
  const hariIni = new Date().toDateString();
  const today = orders.filter(o => new Date(o.tgl).toDateString() === hariIni);
  const omsetToday = today.reduce((s, o) => s + o.total, 0);
  const menu = getMenu();
  const aktif = menu.filter(i => !i.habis).length;

  $("dashStats").innerHTML = `
    <div class="stat-card"><b>${today.length}</b><span>Pesanan hari ini</span></div>
    <div class="stat-card"><b>${rp(omsetToday)}</b><span>Omset hari ini</span></div>
    <div class="stat-card"><b>${orders.length}</b><span>Total pesanan tercatat</span></div>
    <div class="stat-card"><b>${aktif}/${menu.length}</b><span>Item menu aktif</span></div>`;

  $("dashRecent").innerHTML = orders.slice(0, 5).map(o => `
    <div class="admin-row">
      <div class="ar-info">
        <b>${o.status === "baru" ? '<span class="badge-status">BARU</span> ' : ""}${esc(o.nama)}</b>
        <span>${new Date(o.tgl).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })} · ${esc(o.item.join(" · "))}</span>
      </div>
      <div class="ar-aksi"><em>${rp(o.total)}</em></div>
    </div>`).join("") || `<p class="kosong">Belum ada pesanan tercatat.</p>`;
}

// ====== 2. KELOLA MENU ======
let editId = null;

function isiKatSelect() {
  const s = $("mKat");
  if (s) s.innerHTML = Object.entries(KATEGORI).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join("");
}
function hargaTeks(i) {
  const p = i.panas ? rb(i.panas) : null, d = i.dingin ? rb(i.dingin) : null;
  return (p && d) ? `${p} / ${d}` : (p || d || "—");
}
function renderMenuAdmin() {
  const wrap = $("adminMenuList"); if (!wrap) return;
  const menu = getMenu();
  wrap.innerHTML = menu.map(i => `
    <div class="admin-row">
      <div class="ar-info">
        <b>${esc(i.nama)} ${i.habis ? '<span class="habis-tag">HABIS</span>' : ""}${i.badge ? ` <span class="badge-menu">${esc(i.badge)}</span>` : ""}</b>
        <span>${KATEGORI[i.kat]?.label || i.kat} · ${hargaTeks(i)} (rb)</span>
      </div>
      <div class="ar-aksi">
        <button class="mini" data-act="habis" data-id="${i.id}">${i.habis ? "Tersedia lagi" : "Tandai habis"}</button>
        <button class="mini" data-act="edit" data-id="${i.id}">Edit</button>
        <button class="mini merah" data-act="hapus" data-id="${i.id}">Hapus</button>
      </div>
    </div>`).join("") || `<p class="kosong">Menu kosong — tambahkan item di form atas.</p>`;
}

 $("formMenu")?.addEventListener("submit", e => {
  e.preventDefault();
  const nama = $("mNama").value.trim();
  const kat = $("mKat").value;
  const desc = $("mDesc").value.trim();
  const panas = +$("mPanas").value || 0;
  const dingin = +$("mDingin").value || 0;
  const badge = $("mBadge").value;
  if (!nama || (!panas && !dingin)) return alert("Isi nama dan minimal satu harga.");

  let menu = getMenu();
  if (editId) {
    const it = menu.find(x => x.id === editId);
    Object.assign(it, { nama, kat, desc, panas, dingin, badge: badge || null });
    editId = null;
    $("btnMenuForm").textContent = "＋ Tambah Item";
    $("btnBatalEdit").classList.add("hidden");
    toast("Perubahan item tersimpan ✓");
  } else {
    menu.push({ id: "i" + Date.now(), nama, kat, desc, panas, dingin, badge: badge || null, habis: false });
    toast("Item baru masuk menu ✓");
  }
  saveMenu(menu);
  $("formMenu").reset(); isiKatSelect();
  renderMenuAdmin(); renderMenu(); renderDash(); isiItemSelect();
});

 $("btnBatalEdit")?.addEventListener("click", () => {
  editId = null; $("formMenu")?.reset();
  $("btnMenuForm").textContent = "＋ Tambah Item";
  $("btnBatalEdit").classList.add("hidden");
});

 $("adminMenuList")?.addEventListener("click", e => {
  const b = e.target.closest("button[data-act]"); if (!b) return;
  let menu = getMenu();
  const it = menu.find(x => x.id === b.dataset.id); if (!it) return;

  if (b.dataset.act === "habis") {
    it.habis = !it.habis; saveMenu(menu);
    renderMenuAdmin(); renderMenu(); renderDash(); isiItemSelect();
    toast(it.habis ? "Ditandai HABIS — tombol pesan disembunyikan" : "Item tersedia kembali ✓");
  }
  if (b.dataset.act === "edit") {
    editId = it.id;
    $("mNama").value = it.nama; $("mKat").value = it.kat;
    $("mDesc").value = it.desc || "";
    $("mPanas").value = it.panas || ""; $("mDingin").value = it.dingin || "";
    $("mBadge").value = it.badge || "";
    $("btnMenuForm").textContent = "💾 Simpan Perubahan";
    $("btnBatalEdit").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  if (b.dataset.act === "hapus" && confirm(`Hapus "${it.nama}" dari menu?`)) {
    menu = menu.filter(x => x.id !== it.id);
    saveMenu(menu);
    renderMenuAdmin(); renderMenu(); renderDash(); isiItemSelect();
    toast("Item dihapus");
  }
});

// ====== 3. PESANAN (buku kas digital) ======
let lines = [];

function isiItemSelect() {
  const sel = $("oItem"); if (!sel) return;
  const menu = getMenu().filter(i => !i.habis);
  sel.innerHTML = menu.flatMap(i => {
    const o = [];
    if (i.panas)  o.push(`<option data-nama="${esc(i.nama)}" data-varian="Panas" data-harga="${i.panas}">${esc(i.nama)} · Panas — ${rp(i.panas)}</option>`);
    if (i.dingin) o.push(`<option data-nama="${esc(i.nama)}" data-varian="Dingin" data-harga="${i.dingin}">${esc(i.nama)} · Dingin — ${rp(i.dingin)}</option>`);
    return o;
  }).join("") || `<option value="">— menu kosong —</option>`;
}

 $("btnTambahBaris")?.addEventListener("click", () => {
  const opt = $("oItem").selectedOptions[0];
  if (!opt || !opt.dataset.harga) return alert("Menu masih kosong / item tidak valid.");
  lines.push({ nama: opt.dataset.nama, varian: opt.dataset.varian, harga: +opt.dataset.harga, qty: Math.max(1, +$("oQty").value || 1) });
  renderLines();
});

function renderLines() {
  const el = $("orderLines"); if (!el) return;
  el.innerHTML = lines.map((l, idx) => `
    <div class="line-row">
      <span>${l.qty}× ${esc(l.nama)}${l.varian ? ` (${l.varian})` : ""}</span>
      <em>${rp(l.harga * l.qty)}</em>
      <button type="button" class="ci-hapus" data-i="${idx}" aria-label="Hapus baris">✕</button>
    </div>`).join("") || `<p class="kosong">Belum ada item ditambahkan.</p>`;
  $("orderTotalKecil").textContent = rp(lines.reduce((s, l) => s + l.harga * l.qty, 0));
}
 $("orderLines")?.addEventListener("click", e => {
  const b = e.target.closest("button[data-i]");
  if (b) { lines.splice(+b.dataset.i, 1); renderLines(); }
});

 $("formOrder")?.addEventListener("submit", e => {
  e.preventDefault();
  if (!lines.length) return alert("Tambahkan minimal 1 item dulu.");
  const nama = $("oNama").value.trim() || "Walk-in";
  const total = lines.reduce((s, l) => s + l.harga * l.qty, 0);
  const orders = getOrders();
  orders.unshift({
    id: "o" + Date.now(), tgl: new Date().toISOString(), nama, total, status: "baru",
    item: lines.map(l => `${l.qty}× ${l.nama}${l.varian ? ` (${l.varian})` : ""}`)
  });
  saveOrders(orders);
  lines = []; renderLines(); $("formOrder").reset();
  renderOrders(); renderDash();
  toast("Pesanan tercatat ✓");
});

function renderOrders() {
  const el = $("adminOrderList"); if (!el) return;
  const orders = getOrders();
  el.innerHTML = orders.map(o => `
    <div class="admin-row">
      <div class="ar-info">
        <b>${o.status === "baru" ? '<span class="badge-status">BARU</span> ' : ""}${esc(o.nama)}</b>
        <span>${new Date(o.tgl).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</span>
        <span class="ar-items">${esc(o.item.join(" · "))}</span>
      </div>
      <div class="ar-aksi">
        <em>${rp(o.total)}</em>
        ${o.status === "baru"
          ? `<button class="mini" data-oid="${o.id}" data-oact="selesai">✓ Selesai</button>`
          : `<span class="badge-status done">SELESAI</span>`}
        <button class="mini merah" data-oid="${o.id}" data-oact="hapus">Hapus</button>
      </div>
    </div>`).join("") || `<p class="kosong">Belum ada pesanan tercatat.</p>`;
}
 $("adminOrderList")?.addEventListener("click", e => {
  const b = e.target.closest("button[data-oact]"); if (!b) return;
  let orders = getOrders();
  const o = orders.find(x => x.id === b.dataset.oid); if (!o) return;
  if (b.dataset.oact === "selesai") o.status = "selesai";
  if (b.dataset.oact === "hapus") {
    if (!confirm("Hapus catatan pesanan ini?")) return;
    orders = orders.filter(x => x.id !== b.dataset.oid);
  }
  saveOrders(orders); renderOrders(); renderDash();
});

// ====== 4. PENGATURAN ======
function renderSet() {
  const s = getSet();
  if ($("jBuka")) { $("jBuka").value = s.buka; $("jTutup").value = s.tutup; }
}
  $("formSet")?.addEventListener("submit", e => {
  e.preventDefault();
  const buka = +$("jBuka").value, tutup = +$("jTutup").value;
  if (!(buka >= 0 && buka <= 23 && tutup >= 0 && tutup <= 23 && buka !== tutup))
    return alert("Jam tidak valid (0–23, jam buka ≠ jam tutup).\n💡 Isi 0 di jam tutup = pukul 00.00 (tengah malam).");
  localStorage.setItem("kz_settings", JSON.stringify({ buka, tutup }));
  statusToko(); renderSet();
  toast("Jam operasional tersimpan ✓");
});
 $("btnResetMenu")?.addEventListener("click", () => {
  if (!confirm("Kembalikan menu ke daftar default? Semua perubahan akan hilang.")) return;
  localStorage.removeItem("kz_menu");
  renderMenuAdmin(); renderMenu(); renderDash(); isiItemSelect();
  toast("Menu dikembalikan ke default");
});

// ====== INIT ======
tampilPanel(); isiKatSelect(); isiItemSelect(); renderLines();