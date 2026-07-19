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
const productModal = document.querySelector("#product-modal");
const modalCloseButton = document.querySelector("#modal-close-btn");
const modalProductImage = document.querySelector("#modal-product-image");
const modalProductCategory = document.querySelector("#modal-product-category");
const modalProductName = document.querySelector("#modal-product-name");
const modalProductPrice = document.querySelector("#modal-product-price");
const modalProductStock = document.querySelector("#modal-product-stock");
const modalProductDescription = document.querySelector("#modal-product-description");
const modalAddToCartButton = document.querySelector("#modal-add-to-cart-btn");
const orderConfirmation = document.querySelector("#order-confirmation");
const couponCodeInput = document.querySelector("#coupon-code");
const applyCouponButton = document.querySelector("#apply-coupon-btn");
const couponMessage = document.querySelector("#coupon-message");
const discountAmount = document.querySelector("#discount-amount");
const minimumOrderStatus = document.querySelector("#minimum-order-status");

let activeModalProduct = null;
let selectedDeliverySlot = "";
let appliedCoupon = null;

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
           <img src="${product.image}" alt="${product.name}" />
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

        <div class="product-card-actions">
  <button 
    class="btn add-to-cart-btn" 
    data-product-id="${product.id}"
    ${product.inStock ? "" : "disabled"}
  >
    ${product.inStock ? "Add to cart" : "Unavailable"}
  </button>

  <button 
    class="btn details-btn view-details-btn" 
    data-product-id="${product.id}"
    type="button"
  >
    View details
  </button>
</div>
      </div>
    `;

    productGrid.append(productCard);
  });
}

const MINIMUM_ORDER_VALUE = 5000;

function getRemainingMinimumOrderAmount() {
  const subtotal = calculateSubtotal();

  if (subtotal >= MINIMUM_ORDER_VALUE) {
    return 0;
  }

  return MINIMUM_ORDER_VALUE - subtotal;
}

function isMinimumOrderReached() {
  return calculateSubtotal() >= MINIMUM_ORDER_VALUE;
}

function getDiscountAmount() {
  if (!appliedCoupon) {
    return 0;
  }

  const subtotal = calculateSubtotal();
  const delivery = calculateDeliveryFee();

  if (appliedCoupon.code === "FRESH10") {
    return Math.round(subtotal * 0.1);
  }

  if (appliedCoupon.code === "DELIVERY0") {
    return delivery;
  }

  return 0;
}

function getFinalTotal() {
  const totalBeforeDiscount = calculateSubtotal() + calculateDeliveryFee();
  const discount = getDiscountAmount();

  return Math.max(totalBeforeDiscount - discount, 0);
}

function applyCoupon(code) {
  const normalizedCode = code.trim().toUpperCase();

  if (getCart().length === 0) {
    appliedCoupon = null;

    couponMessage.textContent = "Add products to the cart before applying a coupon.";
    couponMessage.classList.remove("success");
    couponMessage.classList.add("error");

    runTracking("coupon_failed", {
      couponCode: normalizedCode || "empty",
      reason: "cart_empty"
    });

    renderCart();
    return;
  }

  if (normalizedCode === "FRESH10") {
    appliedCoupon = {
      code: "FRESH10",
      label: "10% discount"
    };

    couponMessage.textContent = "Coupon applied: 10% discount.";
    couponMessage.classList.remove("error");
    couponMessage.classList.add("success");

    runTracking("coupon_applied", {
      couponCode: "FRESH10",
      discountType: "percentage",
      discountValue: 10
    });

    renderCart();
    return;
  }

  if (normalizedCode === "DELIVERY0") {
    appliedCoupon = {
      code: "DELIVERY0",
      label: "Free delivery"
    };

    couponMessage.textContent = "Coupon applied: free delivery.";
    couponMessage.classList.remove("error");
    couponMessage.classList.add("success");

    runTracking("coupon_applied", {
      couponCode: "DELIVERY0",
      discountType: "free_delivery"
    });

    renderCart();
    return;
  }

  appliedCoupon = null;

  couponMessage.textContent = "Invalid coupon code.";
  couponMessage.classList.remove("success");
  couponMessage.classList.add("error");

  runTracking("coupon_failed", {
    couponCode: normalizedCode || "empty",
    reason: "invalid_code"
  });

  renderCart();
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

if (getCart().length === 0) {
  minimumOrderStatus.textContent = `${formatPrice(MINIMUM_ORDER_VALUE)} required`;
  minimumOrderStatus.classList.remove("success");
  minimumOrderStatus.classList.add("warning");
} else if (!isMinimumOrderReached()) {
  minimumOrderStatus.textContent = `${formatPrice(getRemainingMinimumOrderAmount())} more needed`;
  minimumOrderStatus.classList.remove("success");
  minimumOrderStatus.classList.add("warning");
} else {
  minimumOrderStatus.textContent = "Minimum reached";
  minimumOrderStatus.classList.remove("warning");
  minimumOrderStatus.classList.add("success");
}

deliveryFee.textContent = formatPrice(calculateDeliveryFee());
discountAmount.textContent = `- ${formatPrice(getDiscountAmount())}`;
cartTotal.textContent = formatPrice(getFinalTotal());
}

function getOrderItemCount(items) {
  return items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
}

function renderOrderConfirmation(order) {
  orderConfirmation.classList.remove("hidden");

  orderConfirmation.innerHTML = `
    <h3>Order confirmed</h3>
    <p>Your grocery delivery order has been submitted successfully.</p>

    <div class="order-confirmation-grid">
      <div class="order-confirmation-item">
        <span>Order ID</span>
        <strong>${order.id}</strong>
      </div>

      <div class="order-confirmation-item">
        <span>Customer</span>
        <strong>${order.customerName}</strong>
      </div>

      <div class="order-confirmation-item">
        <span>Delivery slot</span>
        <strong>${order.deliverySlot}</strong>
      </div>

      <div class="order-confirmation-item">
        <span>Items</span>
        <strong>${getOrderItemCount(order.items)}</strong>
      </div>

      <div class="order-confirmation-item">
        <span>Payment method</span>
        <strong>${order.paymentMethod.replaceAll("_", " ")}</strong>
      </div>

      <div class="order-confirmation-item">
        <span>Total</span>
        <strong>${formatPrice(order.total)}</strong>
      </div>
    </div>
  `;
}

function openProductModal(product) {
  activeModalProduct = product;

  modalProductImage.src = product.image;
  modalProductImage.alt = product.name;
  modalProductCategory.textContent = product.category;
  modalProductName.textContent = product.name;
  modalProductPrice.textContent = `${formatPrice(product.price)} / ${product.unit}`;

  modalProductStock.textContent = product.inStock ? "In stock" : "Out of stock";
  modalProductStock.className = product.inStock
    ? "stock in-stock"
    : "stock out-of-stock";

  modalProductDescription.textContent = `${product.name} is available for home delivery from FreshCart Delivery. Add it to your basket and choose a delivery slot at checkout.`;

  modalAddToCartButton.disabled = !product.inStock;
  modalAddToCartButton.textContent = product.inStock ? "Add to cart" : "Unavailable";

  productModal.classList.remove("hidden");

  runTracking("product_detail_viewed", {
    productId: product.id,
    productName: product.name,
    category: product.category,
    price: product.price
  });
}

function closeProductModal() {
  productModal.classList.add("hidden");
  activeModalProduct = null;
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
  const viewDetailsButton = event.target.closest(".view-details-btn");

  console.log("Product grid clicked");
  console.log("Add button:", addToCartButton);
  console.log("Details button:", viewDetailsButton);

  if (viewDetailsButton) {
    const productId = Number(viewDetailsButton.dataset.productId);
    const selectedProduct = products.find((product) => product.id === productId);

    console.log("Selected product for modal:", selectedProduct);

    if (!selectedProduct) {
      return;
    }

    openProductModal(selectedProduct);
    return;
  }

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
    cart: getCart(),
    subtotal: calculateSubtotal(),
  };

  const validationResult = validateCheckoutForm(formData);

  if (!validationResult.isValid) {
  checkoutMessage.textContent = validationResult.errors.join(" ");
  checkoutMessage.classList.remove("success");
  checkoutMessage.classList.add("error");

  orderConfirmation.classList.add("hidden");
  orderConfirmation.innerHTML = "";

  console.log("Checkout validation failed:", validationResult.errors);
  runTracking("checkout_validation_failed", {
  errors: validationResult.errors,
  subtotal: calculateSubtotal(),
  minimumOrderValue: MINIMUM_ORDER_VALUE
});

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
    discountCode: appliedCoupon ? appliedCoupon.code : null,
    discountAmount: getDiscountAmount(),
    total: getFinalTotal(),
    createdAt: new Date().toISOString()
};

checkoutMessage.textContent = `Order submitted successfully. Order total: ${formatPrice(order.total)}.`;
checkoutMessage.classList.remove("error");
checkoutMessage.classList.add("success");

console.log("Order submitted:", order);

renderOrderConfirmation(order);

runTracking("order_submitted", {
  orderId: order.id,
  orderTotal: order.total,
  itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
  deliverySlot: order.deliverySlot,
  paymentMethod: order.paymentMethod,
  discountCode: order.discountCode,
  discountAmount: order.discountAmount
});

clearCart();

appliedCoupon = null;
couponCodeInput.value = "";
couponMessage.textContent = "";

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
  productCount: products.length
});

modalCloseButton.addEventListener("click", closeProductModal);

productModal.addEventListener("click", (event) => {
  const shouldCloseModal = event.target.hasAttribute("data-close-modal");

  if (shouldCloseModal) {
    closeProductModal();
  }
});

modalAddToCartButton.addEventListener("click", () => {
  if (!activeModalProduct || !activeModalProduct.inStock) {
    return;
  }

  addToCart(activeModalProduct);
  renderCart();

  runTracking("add_to_cart", {
    productId: activeModalProduct.id,
    productName: activeModalProduct.name,
    category: activeModalProduct.category,
    price: activeModalProduct.price,
    unit: activeModalProduct.unit,
    quantity: 1,
    source: "product_modal"
  });

  closeProductModal();
});

applyCouponButton.addEventListener("click", () => {
  applyCoupon(couponCodeInput.value);
});