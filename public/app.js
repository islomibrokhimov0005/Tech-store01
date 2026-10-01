let products = [];
let selectedCategory = "All";
let cart = [];

async function loadCategories() {
  const response = await fetch("/api/categories");
  const categories = await response.json();
  document.getElementById("categories").innerHTML =
    ["All", ...categories].map(c =>
      `<button class="category ${c === selectedCategory ? "active" : ""}" onclick="selectCategory('${c}')">${c}</button>`
    ).join("");
}

async function loadProducts() {
  const search = document.getElementById("search").value;
  const params = new URLSearchParams();
  if (selectedCategory !== "All") params.set("category", selectedCategory);
  if (search) params.set("search", search);

  const response = await fetch("/api/products?" + params.toString());
  products = await response.json();

  document.getElementById("productsGrid").innerHTML = products.length
    ? products.map(product => `
      <article class="product">
        <div class="product-image">${product.emoji}</div>
        <h3>${escapeHtml(product.name)}</h3>
        <p>${escapeHtml(product.description)}</p>
        <div class="product-bottom">
          <span class="price">$${product.price.toFixed(2)}</span>
          <button class="add-btn" onclick="addToCart(${product.id})">Add to cart</button>
        </div>
      </article>`).join("")
    : "<p>No products found.</p>";
}

function selectCategory(category) {
  selectedCategory = category;
  loadCategories();
  loadProducts();
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity++;
  else cart.push({...product, quantity: 1});
  updateCartCount();
}

function updateCartCount() {
  document.getElementById("cartCount").textContent =
    cart.reduce((sum, item) => sum + item.quantity, 0);
}

function openCart() {
  renderCart();
  document.getElementById("cartModal").classList.remove("hidden");
}

function closeCart() {
  document.getElementById("cartModal").classList.add("hidden");
}

function renderCart() {
  const container = document.getElementById("cartItems");
  if (!cart.length) {
    container.innerHTML = "<p>Your cart is empty.</p>";
  } else {
    container.innerHTML = cart.map(item => `
      <div class="cart-row">
        <span>${escapeHtml(item.name)} × ${item.quantity}</span>
        <span>$${(item.price * item.quantity).toFixed(2)}
          <button class="remove" onclick="removeFromCart(${item.id})">Remove</button>
        </span>
      </div>`).join("");
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.getElementById("cartTotal").textContent = total.toFixed(2);
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartCount();
  renderCart();
}

function checkout() {
  if (!cart.length) {
    alert("Your cart is empty.");
    return;
  }
  closeCart();
  document.getElementById("checkoutModal").classList.remove("hidden");
}

function closeCheckout() {
  document.getElementById("checkoutModal").classList.add("hidden");
}

document.getElementById("checkoutForm").addEventListener("submit", async event => {
  event.preventDefault();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const response = await fetch("/api/orders", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      customerName: document.getElementById("customerName").value,
      customerEmail: document.getElementById("customerEmail").value,
      total
    })
  });

  const data = await response.json();
  if (response.ok) {
    document.getElementById("orderMessage").textContent =
      `Order #${data.orderId} created successfully!`;
    cart = [];
    updateCartCount();
  } else {
    document.getElementById("orderMessage").textContent = data.error || "Something went wrong.";
  }
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

loadCategories();
loadProducts();