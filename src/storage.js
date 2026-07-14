const CART_STORAGE_KEY = "freshcart_cart";

export function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

export function loadCart() {
  const savedCart = localStorage.getItem(CART_STORAGE_KEY);

  if (!savedCart) {
    return [];
  }

  try {
    return JSON.parse(savedCart);
  } catch (error) {
    console.error("Failed to parse cart from localStorage:", error);
    return [];
  }
}

export function clearSavedCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
}