export function validateCheckoutForm(formData) {
  const errors = [];

  if (formData.cart.length === 0) {
    errors.push("Your cart is empty.");
  }

  if (formData.cart.length > 0 && formData.subtotal < 5000) {
  errors.push("Minimum order value is 5 000 HUF.");
  } 

  if (formData.deliverySlot === "") {
    errors.push("Please select a delivery slot.");
  }

  if (formData.fullName.trim() === "") {
    errors.push("Full name is required.");
  }

  if (formData.email.trim() === "") {
    errors.push("Email is required.");
  }

  if (formData.email.trim() !== "" && !formData.email.includes("@")) {
    errors.push("Email must contain @.");
  }

  if (formData.phone.trim() === "") {
    errors.push("Phone number is required.");
  }

  if (formData.city.trim() === "") {
    errors.push("City is required.");
  }

  if (formData.zip.trim().length < 4) {
    errors.push("ZIP code must be at least 4 characters long.");
  }

  if (formData.address.trim().length < 5) {
    errors.push("Street address must be at least 5 characters long.");
  }

  if (!formData.termsAccepted) {
    errors.push("You must accept the delivery terms.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}