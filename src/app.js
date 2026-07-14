import { products } from "./products.js";
import {
  addToCart,
  getCart,
  calculateSubtotal,
  calculateDeliveryFee,
  calculateTotal,
  getCartItemCount,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart
} from "./cart.js";

const productGrid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#search-input");
const categoryFilter = document.querySelector("#category-filter");
const sortSelect = document.querySelector("#sort-select");
const stockOnlyCheckbox = document.querySelector("#stock-only");
const cartItemsContainer = document.querySelector("#cart-items");
const cartCount = document.querySelector("#cart-count");
const cartSubtotal = document.querySelector("#cart-subtotal");
const deliveryFee = document.querySelector("#delivery-fee");
const cartTotal = document.querySelector("#cart-total");

console.log("App loaded");
console.log("Products:", products);
console.log("Product grid:", productGrid);


function formatPrice(price) {
  return `${price.toLocaleString("hu-HU")} HUF`;
}

function renderProducts(productList) {
  productGrid.innerHTML = "";

  if (productList.length === 0) {
    productGrid.innerHTML = `
      <p class="empty-state">No products found.</p>
    `;
    return;
  }

  productList.forEach((product) => {
    const productCard = document.createElement("article");
    productCard.classList.add("product-card");

    productCard.innerHTML = `
      <div class="product-image">
        <span>${product.name.charAt(0)}</span>
      </div>

      <div class="product-content">
        <p class="product-category">${product.category}</p>
        <h3>${product.name}</h3>

        <p class="product-price">
          ${formatPrice(product.price)} / ${product.unit}
        </p>

        <p class="${product.inStock ? "stock in-stock" : "stock out-of-stock"}">
          ${product.inStock ? "In stock" : "Out of stock"}
        </p>

        <button 
          class="btn add-to-cart-btn" 
          data-product-id="${product.id}"
          ${product.inStock ? "" : "disabled"}
        >
          ${product.inStock ? "Add to cart" : "Unavailable"}
        </button>
      </div>
    `;

    productGrid.append(productCard);
  });
}

function renderCart() {
  const cart = getCart();

  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <p class="empty-state">Your cart is empty.</p>
    `;
  } else {
    cart.forEach((item) => {
      const cartItem = document.createElement("div");
      cartItem.classList.add("cart-item");

      cartItem.innerHTML = `
  <div>
    <h3>${item.name}</h3>
    <p>${formatPrice(item.price)} / ${item.unit}</p>

    <div class="quantity-controls">
      <button class="quantity-btn decrease-btn" data-product-id="${item.id}">-</button>
      <span>${item.quantity}</span>
      <button class="quantity-btn increase-btn" data-product-id="${item.id}">+</button>
    </div>
  </div>

  <div class="cart-item-actions">
    <strong>${formatPrice(item.price * item.quantity)}</strong>
    <button class="remove-btn" data-product-id="${item.id}">Remove</button>
  </div>
`;

      cartItemsContainer.append(cartItem);
    });
  }

  cartCount.textContent = `Cart: ${getCartItemCount()} items`;
  cartSubtotal.textContent = formatPrice(calculateSubtotal());
  deliveryFee.textContent = formatPrice(calculateDeliveryFee());
  cartTotal.textContent = formatPrice(calculateTotal());
}

function getFilteredProducts() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedCategory = categoryFilter.value;
  const selectedSort = sortSelect.value;
  const stockOnly = stockOnlyCheckbox.checked;

  let filteredProducts = [...products];

  if (searchTerm !== "") {
    filteredProducts = filteredProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm)
    );
  }

  if (selectedCategory !== "all") {
    filteredProducts = filteredProducts.filter(
      (product) => product.category === selectedCategory
    );
  }

  if (stockOnly) {
    filteredProducts = filteredProducts.filter((product) => product.inStock);
  }

  if (selectedSort === "price-asc") {
    filteredProducts.sort((a, b) => a.price - b.price);
  }

  if (selectedSort === "price-desc") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  return filteredProducts;
}

function updateProductList() {
  const filteredProducts = getFilteredProducts();
  renderProducts(filteredProducts);
}

searchInput.addEventListener("input", updateProductList);
categoryFilter.addEventListener("change", updateProductList);
sortSelect.addEventListener("change", updateProductList);
stockOnlyCheckbox.addEventListener("change", updateProductList);

productGrid.addEventListener("click", (event) => {
  const addToCartButton = event.target.closest(".add-to-cart-btn");

  if (!addToCartButton) {
    return;
  }

  const productId = Number(addToCartButton.dataset.productId);
  const selectedProduct = products.find((product) => product.id === productId);

  if (!selectedProduct) {
    return;
  }

  addToCart(selectedProduct);
  renderCart();
});

cartItemsContainer.addEventListener("click", (event) => {
  const increaseButton = event.target.closest(".increase-btn");
  const decreaseButton = event.target.closest(".decrease-btn");
  const removeButton = event.target.closest(".remove-btn");

  if (increaseButton) {
    const productId = Number(increaseButton.dataset.productId);
    increaseQuantity(productId);
    renderCart();
    return;
  }

  if (decreaseButton) {
    const productId = Number(decreaseButton.dataset.productId);
    decreaseQuantity(productId);
    renderCart();
    return;
  }

  if (removeButton) {
    const productId = Number(removeButton.dataset.productId);
    removeFromCart(productId);
    renderCart();
  }
});

renderProducts(products);
renderCart();