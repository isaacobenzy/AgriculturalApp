export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim().length === 0) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateNumber = (value: string, fieldName: string, min?: number, max?: number): string | null => {
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }
  
  if (min !== undefined && num < min) {
    return `${fieldName} must be at least ${min}`;
  }
  
  if (max !== undefined && num > max) {
    return `${fieldName} must be at most ${max}`;
  }
  
  return null;
};

export const validateDate = (date: string, fieldName: string): string | null => {
  if (!date) {
    return `${fieldName} is required`;
  }
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return `${fieldName} must be a valid date`;
  }
  
  return null;
};

export const validateFutureDate = (date: string, fieldName: string): string | null => {
  const dateValidation = validateDate(date, fieldName);
  if (dateValidation) return dateValidation;
  
  const dateObj = new Date(date);
  const now = new Date();
  
  if (dateObj <= now) {
    return `${fieldName} must be in the future`;
  }
  
  return null;
};

export const validatePastDate = (date: string, fieldName: string): string | null => {
  const dateValidation = validateDate(date, fieldName);
  if (dateValidation) return dateValidation;
  
  const dateObj = new Date(date);
  const now = new Date();
  
  if (dateObj > now) {
    return `${fieldName} cannot be in the future`;
  }
  
  return null;
};