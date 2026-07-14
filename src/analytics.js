export const dataLayer = [];

export function validateEventPayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== "object") {
    errors.push("Payload must be an object.");
  }

  if (!payload.eventName || typeof payload.eventName !== "string") {
    errors.push("eventName is required and must be a string.");
  }

  if (!payload.timestamp || typeof payload.timestamp !== "string") {
    errors.push("timestamp is required and must be a string.");
  }

  if (!payload.page || typeof payload.page !== "string") {
    errors.push("page is required and must be a string.");
  }

  if (typeof payload.consentGiven !== "boolean") {
    errors.push("consentGiven is required and must be a boolean.");
  }

  if (!payload.properties || typeof payload.properties !== "object") {
    errors.push("properties is required and must be an object.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function trackEvent(eventName, properties = {}, consentGranted = true) {
  const eventPayload = {
    eventName,
    timestamp: new Date().toISOString(),
    page: "grocery_delivery",
    consentGiven: consentGranted,
    properties
  };

  const validationResult = validateEventPayload(eventPayload);

  if (!validationResult.isValid) {
    return {
      status: "invalid",
      event: eventPayload,
      errors: validationResult.errors,
      dataLayer
    };
  }

  if (!consentGranted) {
    return {
      status: "blocked",
      event: eventPayload,
      errors: ["Consent not granted."],
      dataLayer
    };
  }

  dataLayer.push(eventPayload);

  return {
    status: "tracked",
    event: eventPayload,
    errors: [],
    dataLayer
  };
}

export function getDataLayer() {
  return dataLayer;
}

export function clearDataLayer() {
  dataLayer.length = 0;
  return dataLayer;
}

export function getEventCount() {
  return dataLayer.length;
}

export function getLastEvent() {
  if (dataLayer.length === 0) {
    return null;
  }

  return dataLayer[dataLayer.length - 1];
}