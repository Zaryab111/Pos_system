/* POS App using localStorage only */

// ===== Utilities =====
const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUserEmail";

function lsGet(key, fallback) {
  const raw = localStorage.getItem(key);
  try { return raw ? JSON.parse(raw) : (fallback ?? null); }
  catch { return fallback ?? null; }
}
function lsSet(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

function getUsers() { return lsGet(USERS_KEY, []); }
function setUsers(users) { lsSet(USERS_KEY, users); }
function findUser(email) { return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase()); }

function setCurrentUser(email) { localStorage.setItem(CURRENT_USER_KEY, email); }
function getCurrentUserEmail() { return localStorage.getItem(CURRENT_USER_KEY); }
function getCurrentUser() { const email = getCurrentUserEmail(); return email ? findUser(email) : null; }

function cartKey(email) { return `cart_${email}`; }
function historyKey(email) { return `purchaseHistory_${email}`; }

function getCart(email) { return lsGet(cartKey(email), []); }
function setCart(email, cart) { lsSet(cartKey(email), cart); }
function clearCart(email) { localStorage.removeItem(cartKey(email)); }

function getHistory(email) { return lsGet(historyKey(email), []); }
function addHistory(email, order) {
  const h = getHistory(email);
  h.push(order);
  lsSet(historyKey(email), h);
}

// ===== Theme (Dark Mode) =====
function applySavedTheme() {
  const mode = localStorage.getItem("theme") || "light";
  if (mode === "dark") document.body.classList.add("dark-mode");
  updateThemeToggleUI();
}
function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  const mode = document.body.classList.contains("dark-mode") ? "dark" : "light";
  localStorage.setItem("theme", mode);
  updateThemeToggleUI();
}
function updateThemeToggleUI() {
  const t = document.getElementById("themeToggleLabel");
  if (t) t.textContent = document.body.classList.contains("dark-mode") ? "Dark" : "Light";
}

// ===== Auth Handlers =====
function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;

  const alert = document.getElementById("signupAlert");
  alert.classList.add("d-none");
  alert.textContent = "";

  if (!name || !email || !password) {
    alert.textContent = "All fields are required.";
    alert.classList.remove("d-none");
    return;
  }
  if (findUser(email)) {
    alert.textContent = "An account with this email already exists.";
    alert.classList.remove("d-none");
    return;
  }
  const users = getUsers();
  users.push({ name, email, password });
  setUsers(users);
  setCurrentUser(email);
  window.location.href = "dashboard.html";
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  const alert = document.getElementById("loginAlert");
  alert.classList.add("d-none");
  alert.textContent = "";

  const user = findUser(email);
  if (!user || user.password !== password) {
    alert.textContent = "Invalid email or password.";
    alert.classList.remove("d-none");
    return;
  }
  setCurrentUser(email);
  window.location.href = "dashboard.html";
}

function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
  window.location.href = "index.html";
}

// ===== Products =====
const DEFAULT_PRODUCTS = [
  { id: "p1", name: "Wireless Mouse", price: 2200 },
  { id: "p2", name: "Mechanical Keyboard", price: 9800 },
  { id: "p3", name: "USB-C Charger 45W", price: 3500 },
  { id: "p4", name: "Noise-Cancel Headphones", price: 14999 },
  { id: "p5", name: "1080p Webcam", price: 6500 },
  { id: "p6", name: "32GB Flash Drive", price: 1200 },
];

const PRODUCTS_KEY = "products";
function getProducts() {
  return lsGet(PRODUCTS_KEY, DEFAULT_PRODUCTS);
}
function setProducts(products) {
  lsSet(PRODUCTS_KEY, products);
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;
  const q = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const filtered = getProducts().filter(p => p.name.toLowerCase().includes(q));

  grid.innerHTML = "";
  filtered.forEach(p => {
    const col = document.createElement("div");
    col.className = "col-sm-6 col-lg-4";
    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <div class="card-body d-flex flex-column">
          <div class="product-thumb mb-3">${p.name.split(" ")[0]}</div>
          <h6 class="card-title mb-1">${p.name}</h6>
          <div class="text-muted mb-3">PKR ${p.price.toLocaleString()}</div>
          <button class="btn btn-olive mt-auto" data-id="${p.id}">Add to Cart</button>
        </div>
      </div>`;
    grid.appendChild(col);
  });

  grid.querySelectorAll("button[data-id]").forEach(btn => {
    btn.addEventListener("click", () => addToCart(btn.getAttribute("data-id")));
  });
}

// ===== Cart =====
function addToCart(productId) {
  const email = getCurrentUserEmail();
  if (!email) { window.location.href = "index.html"; return; }
  const cart = getCart(email);
  const item = cart.find(i => i.productId === productId);
  if (item) item.qty += 1;
  else cart.push({ productId, qty: 1 });
  setCart(email, cart);
  renderCart();
}

function renderCart() {
  const email = getCurrentUserEmail();
  if (!email) return;
  const tbody = document.getElementById("cartBody");
  const subtotalEl = document.getElementById("subtotal");
  const taxEl = document.getElementById("tax");
  const grandEl = document.getElementById("grandTotal");

  if (!tbody) return;

  const cart = getCart(email);
  tbody.innerHTML = "";

  let subtotal = 0;
  cart.forEach((ci, idx) => {
    const p = PRODUCTS.find(pp => pp.id === ci.productId);
    const line = p.price * ci.qty;
    subtotal += line;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.name}</td>
      <td style="max-width:120px">
        <input type="number" min="1" value="${ci.qty}" class="form-control form-control-sm qty-input" data-idx="${idx}">
      </td>
      <td>PKR ${p.price.toLocaleString()}</td>
      <td>PKR ${line.toLocaleString()}</td>
      <td><button class="btn btn-sm btn-outline-danger" data-remove="${idx}">Remove</button></td>
    `;
    tbody.appendChild(tr);
  });

  const tax = Math.round(subtotal * 0.10);
  const grand = subtotal + tax;

  if (subtotalEl) subtotalEl.textContent = `PKR ${subtotal.toLocaleString()}`;
  if (taxEl) taxEl.textContent = `PKR ${tax.toLocaleString()}`;
  if (grandEl) grandEl.textContent = `PKR ${grand.toLocaleString()}`;

  // Bind qty changes & removes
  tbody.querySelectorAll(".qty-input").forEach(inp => {
    inp.addEventListener("change", (e) => {
      const idx = parseInt(e.target.getAttribute("data-idx"));
      let val = parseInt(e.target.value || "1");
      if (isNaN(val) || val < 1) val = 1;
      const cart = getCart(email);
      cart[idx].qty = val;
      setCart(email, cart);
      renderCart();
    });
  });
  tbody.querySelectorAll("button[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-remove"));
      const cart = getCart(email);
      cart.splice(idx, 1);
      setCart(email, cart);
      renderCart();
    });
  });

  // Disable checkout if cart empty
  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;
}

function checkout() {
  const email = getCurrentUserEmail();
  const cart = getCart(email);
  if (!cart.length) return;

  const lines = cart.map(ci => {
    const p = PRODUCTS.find(pp => pp.id === ci.productId);
    return { name: p.name, qty: ci.qty, price: p.price, subtotal: p.price * ci.qty };
  });
  const subtotal = lines.reduce((s, l) => s + l.subtotal, 0);
  const tax = Math.round(subtotal * 0.10);
  const grand = subtotal + tax;

  // Save purchase history
  addHistory(email, {
    at: new Date().toISOString(),
    items: lines,
    subtotal, tax, grand,
  });

  // Build confirmation content
  const list = lines.map(l => `• ${l.name} × ${l.qty} = PKR ${l.subtotal.toLocaleString()}`).join("\n");
  const msg = `Purchase successful!\n\nItems:\n${list}\n\nSubtotal: PKR ${subtotal.toLocaleString()}\nTax (10%): PKR ${tax.toLocaleString()}\nGrand Total: PKR ${grand.toLocaleString()}`;

  // Clear cart and re-render
  clearCart(email);
  renderCart();
  renderHistory();

  // Show alert via Bootstrap modal if present, else native alert
  const modalBody = document.getElementById("confirmBody");
  if (modalBody) {
    modalBody.textContent = msg;
    const modal = new bootstrap.Modal(document.getElementById("confirmModal"));
    modal.show();
    // Add download handler
    const downloadBtn = document.getElementById("downloadReceiptBtn");
    if (downloadBtn) {
      downloadBtn.onclick = function() {
        // Build beautiful HTML receipt
        const receiptHtml = `<!DOCTYPE html>
<html lang='en'>
<head>
  <meta charset='UTF-8'>
  <title>Receipt</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8f8f8; margin: 0; padding: 40px; }
    .receipt { max-width: 400px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); padding: 24px; }
    .store { font-size: 1.4em; font-weight: bold; text-align: center; margin-bottom: 8px; }
    .date { text-align: center; color: #888; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th, td { padding: 6px 0; text-align: left; }
    th { border-bottom: 1px solid #eee; font-weight: 600; }
    td.qty, th.qty { text-align: center; }
    td.price, th.price, td.subtotal, th.subtotal { text-align: right; }
    .totals { margin-top: 12px; }
    .totals td { font-weight: 600; }
    .thankyou { text-align: center; margin-top: 18px; font-size: 1.1em; color: #4caf50; }
  </style>
</head>
<body>
  <div class='receipt'>
    <div class='store'>Mini POS Store</div>
    <div class='date'>${new Date().toLocaleString()}</div>
    <table>
      <tr><th>Item</th><th class='qty'>Qty</th><th class='price'>Price</th><th class='subtotal'>Subtotal</th></tr>
      ${lines.map(l => `<tr><td>${l.name}</td><td class='qty'>${l.qty}</td><td class='price'>PKR ${l.price.toLocaleString()}</td><td class='subtotal'>PKR ${l.subtotal.toLocaleString()}</td></tr>`).join('')}
    </table>
    <table class='totals'>
      <tr><td>Subtotal</td><td style='text-align:right;'>PKR ${subtotal.toLocaleString()}</td></tr>
      <tr><td>Tax (10%)</td><td style='text-align:right;'>PKR ${tax.toLocaleString()}</td></tr>
      <tr><td>Grand Total</td><td style='text-align:right;'>PKR ${grand.toLocaleString()}</td></tr>
    </table>
    <div class='thankyou'>Thank you for your purchase!</div>
  </div>
</body>
</html>`;
        const blob = new Blob([receiptHtml], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `receipt_${new Date().toISOString().replace(/[:.]/g, "-")}.html`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      };
    }
  } else {
    alert(msg);
  }
}

// ===== History (optional feature) =====
function renderHistory() {
  const wrap = document.getElementById("historyWrap");
  if (!wrap) return;
  const email = getCurrentUserEmail();
  const hist = getHistory(email).slice().reverse();
  wrap.innerHTML = "";

  if (!hist.length) {
    wrap.innerHTML = '<div class="text-muted">No purchases yet.</div>';
    return;
  }
  hist.forEach((order, i) => {
    const date = new Date(order.at);
    const id = `h${i}`;
    const items = order.items.map(it => `<li class="list-group-item d-flex justify-content-between align-items-center">
        <span>${it.name} <span class="text-muted">× ${it.qty}</span></span>
        <span>PKR ${it.subtotal.toLocaleString()}</span>
      </li>`).join("");

    const card = document.createElement("div");
    card.className = "card mb-2";
    card.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <strong>Order</strong> • ${date.toLocaleString()}
          </div>
          <div class="text-end">
            <div class="fw-semibold">Grand: PKR ${order.grand.toLocaleString()}</div>
            <div class="text-muted small">Subtotal: PKR ${order.subtotal.toLocaleString()} • Tax: PKR ${order.tax.toLocaleString()}</div>
          </div>
        </div>
        <ul class="list-group list-group-flush mt-3">${items}</ul>
      </div>`;
    wrap.appendChild(card);
  });
}

// ===== Page Bootstraps =====
document.addEventListener("DOMContentLoaded", () => {
  // Product page
  const onProduct = document.body.dataset.page === "product";
  if (onProduct) {
    applySavedTheme();
    document.querySelectorAll("[data-action='toggle-theme']").forEach(b => b.addEventListener("click", toggleTheme));
    document.getElementById("logoutBtn")?.addEventListener("click", logout);
    const form = document.getElementById("addProductForm");
    const alert = document.getElementById("productAlert");
    if (form) {
      form.addEventListener("submit", function(e) {
        e.preventDefault();
        const name = document.getElementById("productName").value.trim();
        const price = parseInt(document.getElementById("productPrice").value);
        if (!name || isNaN(price) || price < 1) {
          alert.textContent = "Please enter a valid product name and price.";
          alert.classList.remove("d-none", "alert-success");
          alert.classList.add("alert-danger");
          return;
        }
        // Generate unique id
        const products = getProducts();
        const id = "p" + (Date.now() + Math.floor(Math.random() * 1000));
        products.push({ id, name, price });
        setProducts(products);
        alert.textContent = "Product added successfully!";
        alert.classList.remove("d-none", "alert-danger");
        alert.classList.add("alert-success");
        form.reset();
      });
    }
  }
  applySavedTheme();

  // Wire theme toggle if present
  document.querySelectorAll("[data-action='toggle-theme']").forEach(b => b.addEventListener("click", toggleTheme));

  // Signup
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup);
  }

  // Login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  // Dashboard
  const onDash = document.body.dataset.page === "dashboard";
  if (onDash) {
    const email = getCurrentUserEmail();
    if (!email) { window.location.href = "index.html"; return; }

    // greet user
    const user = getCurrentUser();
    const hello = document.getElementById("helloUser");
    if (hello && user) hello.textContent = user.name.split(" ")[0];

    // actions
    document.getElementById("logoutBtn")?.addEventListener("click", logout);
    document.getElementById("checkoutBtn")?.addEventListener("click", checkout);
    document.getElementById("searchInput")?.addEventListener("input", renderProducts);

    renderProducts();
    renderCart();
    // History is now only shown on history.html
  }

  // History page
  const onHistory = document.body.dataset.page === "history";
  if (onHistory) {
    const email = getCurrentUserEmail();
    if (!email) { window.location.href = "index.html"; return; }
    document.getElementById("logoutBtn")?.addEventListener("click", logout);
    document.querySelectorAll("[data-action='toggle-theme']").forEach(b => b.addEventListener("click", toggleTheme));
    renderHistory();
  }
});
