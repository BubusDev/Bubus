const MIN_PASSWORD_LENGTH = 8;

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string) {
  return password.length >= MIN_PASSWORD_LENGTH;
}

export function getPasswordMinLength() {
  return MIN_PASSWORD_LENGTH;
}
