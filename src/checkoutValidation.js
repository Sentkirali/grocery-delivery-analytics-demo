export function validateCheckoutForm(formData) {
  const errors = [];
  const fieldErrors = {};

  function addError(field, message) {
    errors.push(message);

    if (!fieldErrors[field]) {
      fieldErrors[field] = message;
    }
  }

  if (formData.cart.length === 0) {
    addError("cart", "Your cart is empty.");
  }

  if (formData.cart.length > 0 && formData.subtotal < 5000) {
    addError("cart", "Minimum order value is 5 000 HUF.");
  }

  if (formData.deliverySlot === "") {
    addError("deliverySlot", "Please select a delivery slot.");
  }

  if (formData.fullName.trim() === "") {
    addError("fullName", "Full name is required.");
  }

  if (formData.email.trim() === "") {
    addError("email", "Email is required.");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
    addError("email", "Please enter a valid email address.");
  }

  if (formData.phone.trim() === "") {
    addError("phone", "Phone number is required.");
  } else if (formData.phone.trim().length < 7) {
    addError("phone", "Phone number is too short.");
  }

  if (formData.city.trim() === "") {
    addError("city", "City is required.");
  }

  if (formData.zip.trim().length < 4) {
    addError("zip", "ZIP code must be at least 4 characters long.");
  }

  if (formData.address.trim().length < 5) {
    addError("address", "Street address must be at least 5 characters long.");
  }

  if (!formData.termsAccepted) {
    addError("terms", "You must accept the delivery terms.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors
  };
}