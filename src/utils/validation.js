// Validation utility functions for form inputs

/**
 * Validates name fields (first name, last name)
 * @param {string} name - Name to validate
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateName = (name, fieldName = 'Name') => {
  if (!name || !name.trim()) {
    return {
      isValid: false,
      error: `${fieldName} is required`
    };
  }

  const trimmedName = name.trim();

  // Check minimum length
  if (trimmedName.length < 2) {
    return {
      isValid: false,
      error: `${fieldName} must be at least 2 characters`
    };
  }

  // Check maximum length
  if (trimmedName.length > 50) {
    return {
      isValid: false,
      error: `${fieldName} must not exceed 50 characters`
    };
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  // Supports Latin and Arabic characters
  const nameRegex = /^[\p{L}\s'-]+$/u;
  if (!nameRegex.test(trimmedName)) {
    return {
      isValid: false,
      error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates email address
 * @param {string} email - Email to validate
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return {
      isValid: false,
      error: 'Email is required'
    };
  }

  const trimmedEmail = email.trim();

  // RFC 5322 compliant email regex (simplified version)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }

  // Check for common invalid patterns
  if (trimmedEmail.includes('..') || trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
    return {
      isValid: false,
      error: 'Email format is invalid'
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates Algerian phone numbers
 * Accepts formats:
 * - 0555123456 (10 digits starting with 0)
 * - 0555 12 34 56 (with spaces)
 * - 0555-12-34-56 (with dashes)
 * - +213555123456 (international format)
 * - 00213555123456 (international format with 00)
 *
 * @param {string} phone - Phone number to validate
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateAlgerianPhone = (phone) => {
  if (!phone || !phone.trim()) {
    return {
      isValid: false,
      error: 'Phone number is required'
    };
  }

  const trimmedPhone = phone.trim();

  // Remove spaces, dashes, and parentheses
  const cleanPhone = trimmedPhone.replace(/[\s\-()]/g, '');

  // Check for valid Algerian phone number patterns
  const patterns = [
    /^0[5-7]\d{8}$/, // 0555123456 (10 digits, starts with 05, 06, or 07)
    /^\+2135\d{8}$/, // +213555123456 (international with +213)
    /^002135\d{8}$/, // 00213555123456 (international with 00213)
  ];

  const isValidFormat = patterns.some(pattern => pattern.test(cleanPhone));

  if (!isValidFormat) {
    return {
      isValid: false,
      error: 'Phone number must be a valid Algerian number (e.g., 0555 12 34 56)'
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates all profile fields
 * @param {Object} userData - User data object
 * @param {string} homeAddress - Home address (optional based on shipping preference)
 * @param {string} shippingPreference - Shipping preference ('home' or 'pickup')
 * @param {string} pickupProvider - Pickup provider (optional based on shipping preference)
 * @returns {Object} { isValid: boolean, errors: Object, firstErrorField: string }
 */
export const validateProfileData = (userData, homeAddress, shippingPreference, pickupProvider) => {
  const errors = {};
  let firstErrorField = null;

  // Validate first name (optional but if provided must be valid)
  if (userData.firstName && userData.firstName.trim()) {
    const firstNameValidation = validateName(userData.firstName, 'First name');
    if (!firstNameValidation.isValid) {
      errors.firstName = firstNameValidation.error;
      if (!firstErrorField) firstErrorField = 'firstName';
    }
  }

  // Validate last name (required)
  const lastNameValidation = validateName(userData.lastName, 'Last name');
  if (!lastNameValidation.isValid) {
    errors.lastName = lastNameValidation.error;
    if (!firstErrorField) firstErrorField = 'lastName';
  }

  // Validate email (required)
  const emailValidation = validateEmail(userData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
    if (!firstErrorField) firstErrorField = 'email';
  }

  // Validate phone (required)
  const phoneValidation = validateAlgerianPhone(userData.phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.error;
    if (!firstErrorField) firstErrorField = 'phone';
  }

  // Validate wilaya (optional but recommended)
  if (userData.wilaya && userData.wilaya.trim() && userData.wilaya.length > 100) {
    errors.wilaya = 'Wilaya name is too long';
    if (!firstErrorField) firstErrorField = 'wilaya';
  }

  // Validate city (optional but recommended)
  if (userData.city && userData.city.trim() && userData.city.length > 100) {
    errors.city = 'City name is too long';
    if (!firstErrorField) firstErrorField = 'city';
  }

  // Validate home address if home delivery is selected
  if (shippingPreference === 'home') {
    if (!homeAddress || !homeAddress.trim()) {
      errors.homeAddress = 'Home address is required for home delivery';
      if (!firstErrorField) firstErrorField = 'homeAddress';
    } else if (homeAddress.trim().length < 10) {
      errors.homeAddress = 'Please provide a more detailed address (minimum 10 characters)';
      if (!firstErrorField) firstErrorField = 'homeAddress';
    } else if (homeAddress.trim().length > 500) {
      errors.homeAddress = 'Address is too long (maximum 500 characters)';
      if (!firstErrorField) firstErrorField = 'homeAddress';
    }
  }

  // Validate pickup provider if pickup is selected
  if (shippingPreference === 'pickup') {
    if (!pickupProvider || !pickupProvider.trim()) {
      errors.pickupProvider = 'Please select a pickup provider';
      if (!firstErrorField) firstErrorField = 'pickupProvider';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstErrorField
  };
};

/**
 * Formats Algerian phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatAlgerianPhone = (phone) => {
  if (!phone) return '';

  const cleanPhone = phone.replace(/[\s\-()]/g, '');

  // Format as 0555 12 34 56
  if (cleanPhone.match(/^0[5-7]\d{8}$/)) {
    return cleanPhone.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
  }

  return phone;
};
