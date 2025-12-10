const WA_NUMBER = "6281387263351";
const cart = {};
let toastTimeoutId = null;

function formatRupiah(num) {
  return (
    "Rp " +
    num
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  );
}

function renderCart() {
  const tbody = document.getElementById("cart-items");
  const empty = document.getElementById("cart-empty");
  const totalEl = document.getElementById("cart-total");
  const orderBtn = document.getElementById("cart-order-btn");
  const table = document.getElementById("cart-table");

  tbody.innerHTML = "";
  let total = 0;
  let hasItems = false;

  Object.entries(cart).forEach(([name, item]) => {
    if (item.qty <= 0) return;

    hasItems = true;
    const lineTotal = item.qty * item.price;
    total += lineTotal;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${name}</td>
      <td class="cart-center">
        <button class="cart-qty-btn" data-name="${name}" data-delta="-1">-</button>
        <span>${item.qty}</span>
        <button class="cart-qty-btn" data-name="${name}" data-delta="1">+</button>
      </td>
      <td>${formatRupiah(lineTotal)}</td>
    `;
    tbody.appendChild(tr);
  });

  if (!hasItems) {
    empty.style.display = "block";
    table.style.display = "none";
    orderBtn.disabled = true;
    totalEl.textContent = "Rp 0";
  } else {
    empty.style.display = "none";
    table.style.display = "table";
    orderBtn.disabled = false;
    totalEl.textContent = formatRupiah(total);
  }

  // event untuk tombol + / -
  document.querySelectorAll(".cart-qty-btn").forEach((btn) => {
    btn.onclick = () => {
      const name = btn.dataset.name;
      const delta = Number(btn.dataset.delta);

      if (!cart[name]) return;

      cart[name].qty += delta;
      if (cart[name].qty <= 0) {
        delete cart[name];
      }
      renderCart();
    };
  });
}

function showCartToast(message = "Menu berhasil ditambahkan ke keranjang") {
  const toast = document.getElementById("cart-toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("toast--visible");

  // reset timer supaya tidak saling tumpuk
  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
  }

  toastTimeoutId = setTimeout(() => {
    toast.classList.remove("toast--visible");
  }, 1800);
}

function addToCart(name, price) {
  if (!cart[name]) {
    cart[name] = { qty: 0, price };
  }
  cart[name].qty += 1;
  renderCart();
  showCartToast();
}

function sendWhatsAppOrder() {
  const lines = [];
  lines.push("Halo YINN, aku mau pesan:");

  Object.entries(cart).forEach(([name, item]) => {
    if (item.qty <= 0) return;

    const subtotal = item.qty * item.price;
    lines.push(
      `- ${item.qty}x ${name} (${formatRupiah(
        item.price
      )}) = ${formatRupiah(subtotal)}`
    );
  });

  lines.push("");
  lines.push(document.getElementById("cart-total").textContent);
  lines.push("");
  lines.push("Nama:");
  lines.push("Metode ambil (ambil sendiri / diantar):");
  lines.push("Alamat / titik temu:");

  const msg = encodeURIComponent(lines.join("\n"));
  const url = `https://wa.me/${WA_NUMBER}?text=${msg}`;
  window.open(url, "_blank");
}

document.addEventListener("DOMContentLoaded", () => {
  // tombol tambah ke keranjang
  document.querySelectorAll(".btn-add").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.name;
      const price = Number(btn.dataset.price || "0");
      addToCart(name, price);
    });
  });

  // tombol kirim WA
  document
    .getElementById("cart-order-btn")
    .addEventListener("click", sendWhatsAppOrder);

  // tahun di footer
  document.getElementById("year").textContent = new Date().getFullYear();
});
