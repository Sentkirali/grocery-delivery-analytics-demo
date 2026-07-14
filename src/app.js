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
  removeFromCart,
  clearCart
} from "./cart.js";
import { validateCheckoutForm } from "./checkoutValidation.js";
import {
  trackEvent,
  getDataLayer,
  clearDataLayer,
  getEventCount,
  getLastEvent
} from "./analytics.js";

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
const deliverySlotSelect = document.querySelector("#delivery-slot");
const deliveryMessage = document.querySelector("#delivery-message");
const checkoutForm = document.querySelector("#checkout-form");
const fullNameInput = document.querySelector("#full-name");
const emailInput = document.querySelector("#email");
const phoneInput = document.querySelector("#phone");
const cityInput = document.querySelector("#city");
const zipInput = document.querySelector("#zip");
const addressInput = document.querySelector("#address");
const deliveryInstructionsInput = document.querySelector("#delivery-instructions");
const paymentMethodSelect = document.querySelector("#payment-method");
const termsCheckbox = document.querySelector("#terms");
const checkoutMessage = document.querySelector("#checkout-message");
const analyticsConsentCheckbox = document.querySelector("#analytics-consent");
const consentStatus = document.querySelector("#consent-status");
const eventCount = document.querySelector("#event-count");
const lastEvent = document.querySelector("#last-event");
const clearDataLayerButton = document.querySelector("#clear-datalayer-btn");
const dataLayerOutput = document.querySelector("#datalayer-output");

let selectedDeliverySlot = "";
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

function renderAnalyticsPanel(lastTrackingResult = null) {
  consentStatus.textContent = analyticsConsentCheckbox.checked ? "granted" : "denied";
  eventCount.textContent = getEventCount();

  const latestEvent = getLastEvent();

  if (lastTrackingResult?.status === "blocked") {
    lastEvent.textContent = `blocked: ${lastTrackingResult.event.eventName}`;
  } else {
    lastEvent.textContent = latestEvent ? latestEvent.eventName : "none";
  }

  dataLayerOutput.textContent = JSON.stringify(getDataLayer(), null, 2);
}

function runTracking(eventName, properties = {}) {
  const result = trackEvent(
    eventName,
    properties,
    analyticsConsentCheckbox.checked
  );

  if (result.status === "blocked") {
    console.warn(`Tracking blocked: ${eventName}`);
  }

  if (result.status === "invalid") {
    console.error("Invalid tracking payload:", result.errors);
  }

  renderAnalyticsPanel(result);

  return result;
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

searchInput.addEventListener("input", () => {
  updateProductList();

  runTracking("product_searched", {
    searchTerm: searchInput.value.trim()
  });
});

categoryFilter.addEventListener("change", () => {
  updateProductList();

  runTracking("category_filtered", {
    category: categoryFilter.value
  });
});

sortSelect.addEventListener("change", () => {
  updateProductList();

  runTracking("sort_changed", {
    sortValue: sortSelect.value
  });
});

stockOnlyCheckbox.addEventListener("change", () => {
  updateProductList();

  runTracking("stock_filter_changed", {
    inStockOnly: stockOnlyCheckbox.checked
  });
});

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

runTracking("add_to_cart", {
  productId: selectedProduct.id,
  productName: selectedProduct.name,
  category: selectedProduct.category,
  price: selectedProduct.price,
  unit: selectedProduct.unit,
  quantity: 1
});
});

cartItemsContainer.addEventListener("click", (event) => {
  const increaseButton = event.target.closest(".increase-btn");
  const decreaseButton = event.target.closest(".decrease-btn");
  const removeButton = event.target.closest(".remove-btn");

  if (increaseButton) {
    const productId = Number(increaseButton.dataset.productId);
   increaseQuantity(productId);
renderCart();

runTracking("cart_quantity_changed", {
  productId,
  action: "increase"
});

return;
  }

  if (decreaseButton) {
    const productId = Number(decreaseButton.dataset.productId);
    decreaseQuantity(productId);
renderCart();

runTracking("cart_quantity_changed", {
  productId,
  action: "decrease"
});

return;
  }

  if (removeButton) {
    const productId = Number(removeButton.dataset.productId);
    removeFromCart(productId);
renderCart();

runTracking("remove_from_cart", {
  productId
});
  }
});

deliverySlotSelect.addEventListener("change", () => {
  selectedDeliverySlot = deliverySlotSelect.value;

  if (selectedDeliverySlot === "") {
    deliveryMessage.textContent = "Please select a delivery slot.";
    deliveryMessage.classList.remove("success");
    deliveryMessage.classList.add("warning");

    console.log("No delivery slot selected.");
    return;
  }

  deliveryMessage.textContent = `Selected delivery slot: ${selectedDeliverySlot}`;
  deliveryMessage.classList.remove("warning");
  deliveryMessage.classList.add("success");

  console.log("Selected delivery slot:", selectedDeliverySlot);
  runTracking("delivery_slot_selected", {
  deliverySlot: selectedDeliverySlot
  });
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = {
    fullName: fullNameInput.value,
    email: emailInput.value,
    phone: phoneInput.value,
    city: cityInput.value,
    zip: zipInput.value,
    address: addressInput.value,
    deliveryInstructions: deliveryInstructionsInput.value,
    paymentMethod: paymentMethodSelect.value,
    termsAccepted: termsCheckbox.checked,
    deliverySlot: selectedDeliverySlot,
    cart: getCart()
  };

  const validationResult = validateCheckoutForm(formData);

  if (!validationResult.isValid) {
    checkoutMessage.textContent = validationResult.errors.join(" ");
    checkoutMessage.classList.remove("success");
    checkoutMessage.classList.add("error");

    console.log("Checkout validation failed:", validationResult.errors);

    return;
  }

  const order = {
  id: `ORDER-${Date.now()}`,
  customerName: formData.fullName,
  email: formData.email,
  phone: formData.phone,
  address: formData.address,
  city: formData.city,
  zip: formData.zip,
  deliverySlot: formData.deliverySlot,
  paymentMethod: formData.paymentMethod,
  items: getCart(),
  subtotal: calculateSubtotal(),
  deliveryFee: calculateDeliveryFee(),
  total: calculateTotal(),
  createdAt: new Date().toISOString()
};

checkoutMessage.textContent = `Order submitted successfully. Order total: ${formatPrice(order.total)}.`;
checkoutMessage.classList.remove("error");
checkoutMessage.classList.add("success");

console.log("Order submitted:", order);
runTracking("order_submitted", {
  orderId: order.id,
  orderTotal: order.total,
  itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
  deliverySlot: order.deliverySlot,
  paymentMethod: order.paymentMethod
});

clearCart();
renderCart();

checkoutForm.reset();
deliverySlotSelect.value = "";
selectedDeliverySlot = "";

deliveryMessage.textContent = "";
});

analyticsConsentCheckbox.addEventListener("change", () => {
  renderAnalyticsPanel();
});

clearDataLayerButton.addEventListener("click", () => {
  clearDataLayer();
  renderAnalyticsPanel();
});

renderProducts(products);
renderCart();
renderAnalyticsPanel();

runTracking("product_list_viewed", {
  productCount: productData.length
});