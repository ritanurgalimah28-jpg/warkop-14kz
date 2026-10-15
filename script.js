/* =========================================================
   WARKOP 14KZ — script.js (dimuat di SEMUA halaman)
   Nav · animasi · status buka · DATA MENU · akun member ·
   keranjang → WhatsApp
   ========================================================= */

// ====== KONFIG (✏️ ganti di sini kalau ada perubahan) ======
const KZ = {
  wa: "6281288517801",   // nomor WhatsApp admin (format 62xxx)
  jamBuka: 17,           // default — bisa diubah lewat panel admin
  jamTutup: 0,
};
const rp  = n => "Rp" + Number(n).toLocaleString("id-ID");
const rb  = n => (n / 1000).toLocaleString("id-ID");   // 12000 → "12"
const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// ====== DATA MENU (dikelola admin lewat admin.html) ======
const KATEGORI = {
  signature: { no: "01", label: "House Signature" },
  kopi:      { no: "02", label: "Clasik Coffee" },
  nonkopi:   { no: "03", label: "Daily Drink" },
  mie:       { no: "04", label: "Mie & Snack" },
};

const MENU_DEFAULT = [
  { id:"s1", kat:"signature", nama:"Kopi Susu 14KZ",   desc:"Espresso, susu, gula aren asli. Racikan jati diri kami.", panas:12000, dingin:16000, badge:"Best Seller", habis:false },
  { id:"s2", kat:"signature", nama:"Sea Salt Coffee",  desc:"Manis, asin, manis lagi. Sekali coba, sulit berhenti.",   panas:14000, dingin:18000, badge:null, habis:false },
  { id:"s3", kat:"signature", nama:"Kopi Pandan",      desc:"Wangi daun pandan, rasa nostalgia sore hari.",            panas:12000, dingin:16000, badge:null, habis:false },
  { id:"s4", kat:"signature", nama:"Butterscotch Latte",desc:"Manis karamel halus. Ramah buat pemula kopi.",            panas:15000, dingin:19000, badge:null, habis:false },
  { id:"s5", kat:"signature", nama:"Kopi Kelapa",      desc:"Espresso + air kelapa. Segar dan beda dari yang lain.",   panas:14000, dingin:18000, badge:null, habis:false },
  { id:"k1", kat:"kopi", nama:"Americano",    desc:"Espresso + air. Jujur, tegas, tanpa drama.",       panas:10000, dingin:15000, badge:null, habis:false },
  { id:"k2", kat:"kopi", nama:"Espresso",     desc:"Satu tegukan, langsung sadar.",                     panas:8000,  dingin:10000, badge:null, habis:false },
  { id:"k3", kat:"kopi", nama:"Cafe Latte",   desc:"Lembut dan sopan. Susu lebih banyak.",              panas:13000, dingin:18000, badge:null, habis:false },
  { id:"k4", kat:"kopi", nama:"Cappuccino",   desc:"Kopi, susu, dan buhui — seimbang semua.",           panas:13000, dingin:18000, badge:null, habis:false },
  { id:"k5", kat:"kopi", nama:"Kopi Tubruk",  desc:"Klasik warkop. Ampasnya aja wangi.",                 panas:6000,  dingin:8000,  badge:null, habis:false },
  { id:"k6", kat:"kopi", nama:"Kopi Susu",    desc:"Klasik yang nggak pernah salah.",                   panas:8000,  dingin:12000, badge:null, habis:false },
  { id:"n1", kat:"nonkopi", nama:"Es Teh Jumbo", desc:"Pilihan paling jujur sedunia.",                            panas:0,     dingin:5000,  badge:null, habis:false },
  { id:"n2", kat:"nonkopi", nama:"Thai Tea",     desc:"Manis khas, warnanya cantik.",                              panas:10000, dingin:14000, badge:null, habis:false },
  { id:"n3", kat:"nonkopi", nama:"Matcha Latte", desc:"Buat yang lagi mau hidup sehat (dengan manis-manis).",      panas:13000, dingin:17000, badge:null, habis:false },
  { id:"n4", kat:"nonkopi", nama:"Chocolate",    desc:"Anak kecil di dalam kita, tetap dilayani.",                  panas:12000, dingin:16000, badge:null, habis:false },
  { id:"n5", kat:"nonkopi", nama:"Red Velvet",   desc:"Manis, merah marun, favorit akhir pekan.",                   panas:12000, dingin:16000, badge:null, habis:false },
  { id:"n6", kat:"nonkopi", nama:"Lemon Tea",    desc:"Segar, penyeimbang semua kopi tadi.",                        panas:8000,  dingin:12000, badge:null, habis:false },
  { id:"m1", kat:"mie", nama:"Indomie Goreng / Rebus", desc:"Standar warkop, level dewa.",        panas:10000, dingin:0, badge:null, habis:false },
  { id:"m2", kat:"mie", nama:"Indomie Telur",         desc:"Nambah telur, nambah semangat.",     panas:13000, dingin:0, badge:null, habis:false },
  { id:"m3", kat:"mie", nama:"Indomie Double",        desc:"Buat yang bener-bener laper.",       panas:18000, dingin:0, badge:null, habis:false },
  { id:"m4", kat:"mie", nama:"Kentang Goreng",        desc:"Renyah, hangat, teman ngobrol.",     panas:10000, dingin:0, badge:null, habis:false },
  { id:"m5", kat:"mie", nama:"Roti Bakar Cokelat",    desc:"Manis hangat penutup senja.",        panas:10000, dingin:0, badge:null, habis:false },
  { id:"m6", kat:"mie", nama:"Pisang Goreng",         desc:"Camilan sore paling jujur.",         panas:8000,  dingin:0, badge:null, habis:false },
];

const getMenu  = () => { try { return JSON.parse(localStorage.getItem("kz_menu")) || MENU_DEFAULT.map(x => ({ ...x })); } catch { return MENU_DEFAULT.map(x => ({ ...x })); } };
const saveMenu = m => localStorage.setItem("kz_menu", JSON.stringify(m));
const getSet   = () => { try { return { buka: KZ.jamBuka, tutup: KZ.jamTutup, ...(JSON.parse(localStorage.getItem("kz_settings")) || {}) }; } catch { return { buka: KZ.jamBuka, tutup: KZ.jamTutup }; } };

// ====== 1. Menu mobile (hamburger) ======
const navToggle = document.getElementById("navToggle");
const navLinks  = document.getElementById("navLinks");
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => navLinks.classList.remove("open")));
}

// ====== 2. Animasi elemen muncul saat scroll ======
const pengamat = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("visible"); pengamat.unobserve(e.target); }
  });
}, { threshold: .12 });
document.querySelectorAll(".reveal").forEach(el => pengamat.observe(el));

// ====== 3. Tahun footer otomatis ======
document.querySelectorAll(".year").forEach(el => el.textContent = new Date().getFullYear());

// ====== 4. Status BUKA/TUTUP otomatis (mengikuti pengaturan admin) ======
function statusToko() {
  const s = getSet();
  const now = new Date();
  const jam = now.getHours() + now.getMinutes() / 60;

  //  jam tutup 0 artinya tutupnya LEWAT tengah malam → logika beda
  const lewatTengahMalam = s.tutup <= s.buka;
  const buka = lewatTengahMalam
    ? (jam >= s.buka || jam < s.tutup)   // 17.00 s.d. 23.59 = BUKA
    : (jam >= s.buka && jam < s.tutup);  // kasus biasa, cth: 10.00–20.00

  const dua = h => String(h).padStart(2, "0");   // 0 → "00"
  document.querySelectorAll("[data-status]").forEach(el => {
    el.classList.toggle("buka", buka);
    el.innerHTML = buka
      ? `<i></i> BUKA SEKARANG · sampai ${dua(s.tutup)}.00`
      : `<i></i> TUTUP · buka ${dua(s.buka)}.00`;
  });
}
statusToko();
setInterval(statusToko, 60000);

// ====== 5. MERENDER MENU DI menu.html (dari data — bisa diedit admin) ======
function renderMenu() {
  const root = document.getElementById("menuRoot");
  if (!root) return;
  const menu = getMenu();
  let html = "";
  Object.entries(KATEGORI).forEach(([kat, meta]) => {
    const items = menu.filter(i => i.kat === kat);
    if (!items.length) return;
    html += `<section class="menu-section" data-kat="${kat}" id="${kat}">
      <div class="menu-title"><span class="no">${meta.no}</span><h2>${meta.label}</h2><span class="rule"></span></div>
      <ul class="menu-list">`;
    items.forEach(i => {
      const harga = (i.panas && i.dingin) ? `${rb(i.panas)} <em>/</em> ${rb(i.dingin)}` : rb(i.panas || i.dingin);
      let aksi;
      if (i.habis) {
        aksi = `<span class="habis-tag">HABIS</span>`;
      } else if (i.panas && i.dingin) {
        aksi = `<span class="row-aksi">
          <button class="add" data-nama="${esc(i.nama)}" data-varian="Panas" data-harga="${i.panas}">+ Panas</button>
          <button class="add" data-nama="${esc(i.nama)}" data-varian="Dingin" data-harga="${i.dingin}">+ Dingin</button></span>`;
      } else {
        aksi = `<span class="row-aksi"><button class="add" data-nama="${esc(i.nama)}" data-harga="${i.panas || i.dingin}">+ Tambah</button></span>`;
      }
      const label = i.badge ? `<span class="badge-menu">${esc(i.badge)}</span>` : "";
      html += `<li class="menu-row">
        <div class="row-info"><b class="${kat === "signature" ? "sig" : ""}">${esc(i.nama)} ${label}</b><span>${esc(i.desc || "")}</span></div>
        <i class="dots"></i><span class="row-harga">${harga}</span>${aksi}</li>`;
    });
    html += `</ul></section>`;
  });
  root.innerHTML = html || `<p class="kosong">Menu sedang disiapkan 🙏</p>`;
}
renderMenu();

// efek "live": kalau admin mengubah menu di tab lain, halaman ini ikut berubah
window.addEventListener("storage", e => {
  if (e.key === "kz_menu") renderMenu();
  if (e.key === "kz_settings") statusToko();
});

// ====== 6. SISTEM AKUN MEMBER (customer) ======
const getUsers  = () => JSON.parse(localStorage.getItem("kz_users") || "[]");
const saveUsers = u => localStorage.setItem("kz_users", JSON.stringify(u));
const getSession = () => localStorage.getItem("kz_session");
const setSession = e => e ? localStorage.setItem("kz_session", e) : localStorage.removeItem("kz_session");
const userSekarang = () => {
  const email = getSession();
  return email ? (getUsers().find(u => u.email === email) || null) : null;
};

if (!localStorage.getItem("kz_seed")) {
  const u = getUsers();
  if (!u.some(x => x.email === "demo@14kz.id")) {
    u.push({ nama: "Pelanggan Demo", email: "demo@14kz.id", pass: "1234", poin: 12, sejak: new Date().toISOString() });
    saveUsers(u);
  }
  localStorage.setItem("kz_seed", "1");
}

function updateNavAuth() {
  const el = document.getElementById("navAuth");
  if (!el) return;
  const u = userSekarang();
  el.innerHTML = u
    ? `<a class="user-chip" href="akun.html" title="Akun member saya">
         <span class="chip-ava">${(u.nama[0] || "K").toUpperCase()}</span>
         ${u.nama.split(" ")[0]} <b>· ${u.poin || 0} poin</b>
       </a>`
    : `<a class="btn btn-ghost btn-small" href="akun.html">Masuk</a>`;
}
updateNavAuth();

// ====== 7. KERANJANG PESANAN ======
let cart = JSON.parse(localStorage.getItem("kz_cart") || "[]");
const simpanCart = () => localStorage.setItem("kz_cart", JSON.stringify(cart));

function toast(msg) {
  let t = document.getElementById("kzToast");
  if (!t) { t = document.createElement("div"); t.id = "kzToast"; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2200);
}

function tambahCart(nama, varian, harga) {
  const key = nama + (varian ? ` (${varian})` : "");
  const ada = cart.find(i => i.key === key);
  if (ada) ada.qty++;
  else cart.push({ key, nama, varian: varian || "", harga, qty: 1 });
  simpanCart(); renderCart();
  toast("✓ " + key + " masuk keranjang");
}

// tombol "+" item menu — delegation, jadi tombol hasil render admin ikut berfungsi
document.addEventListener("click", e => {
  const b = e.target.closest("button.add");
  if (b) tambahCart(b.dataset.nama, b.dataset.varian, +b.dataset.harga);
});

function renderCart() {
  const bar = document.getElementById("cartBar");
  const list = document.getElementById("cartList");
  if (!bar && !list) return;
  const total = cart.reduce((s, i) => s + i.harga * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  if (bar) {
    bar.classList.toggle("show", count > 0);
    const c = document.getElementById("cartCount"), t = document.getElementById("cartTotal");
    if (c) c.textContent = count + " item";
    if (t) t.textContent = rp(total);
  }
  if (list) {
    list.innerHTML = cart.length ? cart.map(i => `
      <div class="cart-item">
        <div class="ci-info"><b>${i.key}</b><span>${rp(i.harga)} /pc</span></div>
        <div class="ci-qty">
          <button data-act="minus" data-key="${i.key}" aria-label="Kurangi">−</button>
          <b>${i.qty}</b>
          <button data-act="plus" data-key="${i.key}" aria-label="Tambah">+</button>
        </div>
        <em>${rp(i.harga * i.qty)}</em>
        <button class="ci-hapus" data-act="hapus" data-key="${i.key}" aria-label="Hapus">✕</button>
      </div>`).join("")
      : `<p class="kosong">Keranjang masih kosong.<br>Cek menu dulu ☕</p>`;
  }
  const big = document.getElementById("cartTotalBig");
  if (big) big.textContent = rp(total);
}
renderCart();

const drawer = document.getElementById("drawer"), dback = document.getElementById("drawerBack");
function bukaDrawer(v) {
  drawer?.classList.toggle("open", v);
  dback?.classList.toggle("show", v);
}
document.getElementById("cartOpen")?.addEventListener("click", () => bukaDrawer(true));
document.getElementById("cartClose")?.addEventListener("click", () => bukaDrawer(false));
dback?.addEventListener("click", () => bukaDrawer(false));

const cartList = document.getElementById("cartList");
if (cartList) cartList.addEventListener("click", e => {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  const item = cart.find(i => i.key === btn.dataset.key);
  if (!item) return;
  if (btn.dataset.act === "plus") item.qty++;
  if (btn.dataset.act === "minus") { item.qty--; if (item.qty < 1) cart = cart.filter(i => i.key !== btn.dataset.key); }
  if (btn.dataset.act === "hapus") cart = cart.filter(i => i.key !== btn.dataset.key);
  simpanCart(); renderCart();
});

const cartNama = document.getElementById("cartNama");
if (cartNama) { const u = userSekarang(); if (u) cartNama.value = u.nama; }

// ====== 8. CHECKOUT → WhatsApp (+ riwayat & poin member) ======
function pesanWA() {
  if (!cart.length) return toast("Keranjang masih kosong 😅");
  const nm = (cartNama ? cartNama.value.trim() : "") || (userSekarang()?.nama || "");
  let teks = "Halo Warkop 14KZ! 👋\nSaya mau pesan (ambil sendiri):\n\n";
  let total = 0;
  cart.forEach(i => { teks += `${i.qty}x ${i.key} — ${rp(i.harga * i.qty)}\n`; total += i.harga * i.qty; });
  teks += `\nTotal: ${rp(total)}`;
  if (nm) teks += `\nAtas nama: ${nm}`;
  teks += "\n\n(dikirim dari website Warkop 14KZ)";
  window.open(`https://wa.me/${KZ.wa}?text=${encodeURIComponent(teks)}`, "_blank");

  const u = userSekarang();
  if (u) {
    const key = "kz_orders_" + u.email;
    const orders = JSON.parse(localStorage.getItem(key) || "[]");
    orders.unshift({
      tgl: new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }),
      total, item: cart.map(i => `${i.qty}x ${i.key}`)
    });
    localStorage.setItem(key, JSON.stringify(orders));
    const users = getUsers(), me = users.find(x => x.email === u.email);
    me.poin = (me.poin || 0) + Math.floor(total / 10000);
    saveUsers(users);
    updateNavAuth();
  }
  cart = []; simpanCart(); renderCart();
  toast("Pesanan dikirim ke admin 14KZ ✓");
}
document.getElementById("btnCheckout")?.addEventListener("click", pesanWA);

// ====== 9. Filter kategori menu ======
const chips = document.querySelectorAll(".chip");
if (chips.length) chips.forEach(c => c.addEventListener("click", () => {
  document.querySelector(".chip.active")?.classList.remove("active");
  c.classList.add("active");
  const k = c.dataset.filter;
  document.querySelectorAll(".menu-section").forEach(s =>
    s.style.display = (k === "all" || s.dataset.kat === k) ? "" : "none");
}));

// ====== 10. Halaman akun member (customer) ======
const formLogin  = document.getElementById("formLogin");
const formDaftar = document.getElementById("formDaftar");

if (formDaftar) {
  document.querySelectorAll("[data-tab]").forEach(b => b.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach(x => x.classList.toggle("active", x === b));
    document.querySelectorAll(".auth-form").forEach(f => f.classList.add("hidden"));
    document.getElementById(b.dataset.tab).classList.remove("hidden");
  }));
}
if (formLogin) formLogin.addEventListener("submit", e => {
  e.preventDefault();
  const u = getUsers().find(x =>
    x.email === formLogin.email.value.trim().toLowerCase() && x.pass === formLogin.pass.value);
  if (!u) return alert("Email atau password salah.\nCoba akun demo: demo@14kz.id / 1234");
  setSession(u.email);
  location.href = "akun.html";
});
if (formDaftar) formDaftar.addEventListener("submit", e => {
  e.preventDefault();
  const email = formDaftar.email.value.trim().toLowerCase();
  if (getUsers().some(x => x.email === email)) return alert("Email sudah terdaftar — silakan masuk.");
  const users = getUsers();
  users.push({ nama: formDaftar.nama.value.trim(), email, pass: formDaftar.pass.value, poin: 0, sejak: new Date().toISOString() });
  saveUsers(users); setSession(email);
  alert("Selamat datang di keluarga 14KZ! 🎉");
  location.href = "akun.html";
});

const authView = document.getElementById("authView");
const profilView = document.getElementById("profilView");
if (authView && profilView) {
  const u = userSekarang();
  if (u) {
    authView.classList.add("hidden");
    profilView.classList.remove("hidden");
    document.getElementById("mcNama").textContent = u.nama;
    document.getElementById("mcPoin").textContent = (u.poin || 0) + " POIN";
    document.getElementById("mcSejak").textContent = "Member sejak " +
      new Date(u.sejak || Date.now()).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    document.getElementById("poinBar").style.width = Math.min(100, ((u.poin || 0) / 25) * 100) + "%";
    document.getElementById("poinTeks").textContent = `${Math.max(0, 25 - (u.poin || 0))} poin lagi menuju 1 kopi gratis`;
    const orders = JSON.parse(localStorage.getItem("kz_orders_" + u.email) || "[]");
    document.getElementById("riwayat").innerHTML = orders.length
      ? orders.map(o => `<div class="order-item"><b>${o.tgl}</b><span>${o.item.join("<br>")}</span><em>${rp(o.total)}</em></div>`).join("")
      : `<p class="kosong">Belum ada pesanan.<br><a href="menu.html" style="color:var(--gold)">Pesan sekarang →</a></p>`;
  }
}
document.getElementById("btnKeluar")?.addEventListener("click", () => { setSession(null); location.href = "index.html"; });

// ====== 11. Form kontak → WhatsApp ======
const formKontak = document.getElementById("formKontak");
if (formKontak) formKontak.addEventListener("submit", e => {
  e.preventDefault();
  const teks = encodeURIComponent(
    `Halo Warkop 14KZ! 👋\nSaya ${formKontak.nama.value.trim()}.\n${formKontak.pesan.value.trim()}`);
  window.open(`https://wa.me/${KZ.wa}?text=${teks}`, "_blank");
});