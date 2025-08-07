export interface ValidationError {
  field: string;
  message: string;
};

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
};

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!email || email.trim() === "") {
    errors.push({ field: "email", message: "Email is required." });
    return { isValid: false, errors };
  };

  // RFC 5322 compliant email regex (simplified but robust)
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(email.trim())) {
    errors.push({
      field: "email",
      message: "Please provide a valid email address.",
    });
  };

  if (email.length > 254) {
    errors.push({ field: "email", message: "Email address is too long." });
  };

  return { isValid: errors.length === 0, errors };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!password) {
    errors.push({ field: "password", message: "Password is required." });
    return { isValid: false, errors };
  }

  // Minimum length
  if (password.length < 8) {
    errors.push({
      field: "password",
      message: "Password must be at least 8 characters long.",
    });
  }

  // Maximum length (prevent DoS)
  if (password.length > 128) {
    errors.push({
      field: "password",
      message: "Password must not exceed 128 characters.",
    });
  }

  // At least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push({
      field: "password",
      message: "Password must contain at least one lowercase letter.",
    });
  }

  // At least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push({
      field: "password",
      message: "Password must contain at least one uppercase letter.",
    });
  }

  // At least one number
  if (!/\d/.test(password)) {
    errors.push({
      field: "password",
      message: "Password must contain at least one number.",
    });
  }

  // At least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push({
      field: "password",
      message:
        'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>).',
    });
  }

  // No common patterns
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /admin/i,
  ];

  if (commonPatterns.some((pattern) => pattern.test(password))) {
    errors.push({
      field: "password",
      message: "Password contains common patterns and is not secure.",
    });
  }

  return { isValid: errors.length === 0, errors };
};

// Name validation
export const validateName = (name: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!name || name.trim() === "") {
    errors.push({ field: "name", message: "Name is required." });
    return { isValid: false, errors };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    errors.push({
      field: "name",
      message: "Name must be at least 2 characters long.",
    });
  }

  if (trimmedName.length > 50) {
    errors.push({
      field: "name",
      message: "Name must not exceed 50 characters.",
    });
  }

  // Only letters, spaces, hyphens, and apostrophes
  if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) {
    errors.push({
      field: "name",
      message:
        "Name can only contain letters, spaces, hyphens, and apostrophes.",
    });
  }

  return { isValid: errors.length === 0, errors };
};

// Username validation
export const validateUsername = (username: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!username || username.trim() === "") {
    errors.push({ field: "username", message: "Username is required." });
    return { isValid: false, errors };
  }

  const trimmedUsername = username.trim();

  if (trimmedUsername.length < 3) {
    errors.push({
      field: "username",
      message: "Username must be at least 3 characters long.",
    });
  }

  if (trimmedUsername.length > 30) {
    errors.push({
      field: "username",
      message: "Username must not exceed 30 characters.",
    });
  }

  // Alphanumeric, underscores, and hyphens only
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
    errors.push({
      field: "username",
      message:
        "Username can only contain letters, numbers, underscores, and hyphens.",
    });
  }

  // Must start with a letter or number
  if (!/^[a-zA-Z0-9]/.test(trimmedUsername)) {
    errors.push({
      field: "username",
      message: "Username must start with a letter or number.",
    });
  }

  // Reserved usernames
  const reservedUsernames = [
    "admin",
    "root",
    "user",
    "test",
    "guest",
    "api",
    "www",
    "mail",
    "email",
    "support",
    "help",
    "info",
    "contact",
    "service",
    "system",
    "null",
    "undefined",
  ];

  if (reservedUsernames.includes(trimmedUsername.toLowerCase())) {
    errors.push({
      field: "username",
      message: "This username is reserved and cannot be used.",
    });
  }

  return { isValid: errors.length === 0, errors };
};

// Comprehensive validation for all fields
export const validateSignUpInput = (input: {
  name: string;
  username: string;
  email: string;
  password: string;
}): ValidationResult => {
  const allErrors: ValidationError[] = [];

  const nameResult = validateName(input.name);
  const usernameResult = validateUsername(input.username);
  const emailResult = validateEmail(input.email);
  const passwordResult = validatePassword(input.password);

  allErrors.push(
    ...nameResult.errors,
    ...usernameResult.errors,
    ...emailResult.errors,
    ...passwordResult.errors
  );

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};

export const validateSignInInput = (input: {
  email: string;
  password: string;
}): ValidationResult => {
  const allErrors: ValidationError[] = [];

  // For sign-in, we do basic validation (not strength checking)
  if (!input.email || input.email.trim() === "") {
    allErrors.push({ field: "email", message: "Email is required." });
  } else {
    const emailResult = validateEmail(input.email);
    allErrors.push(...emailResult.errors);
  }

  if (!input.password || input.password.trim() === "") {
    allErrors.push({ field: "password", message: "Password is required." });
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};
