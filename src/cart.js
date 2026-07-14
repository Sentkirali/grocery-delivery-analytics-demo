export let cart = [];

export function addToCart(product) {
  const existingCartItem = cart.find((item) => item.id === product.id);

  if (existingCartItem) {
    existingCartItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  return cart;
}

export function getCart() {
  return cart;
}

export function calculateSubtotal() {
  return cart.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
}

export function calculateDeliveryFee() {
  if (cart.length === 0) {
    return 0;
  }

  return 1490;
}

export function calculateTotal() {
  return calculateSubtotal() + calculateDeliveryFee();
}

export function getCartItemCount() {
  return cart.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
}