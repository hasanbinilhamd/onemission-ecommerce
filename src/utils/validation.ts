export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

export function isPositiveNumber(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function isPhoneNumber(value: string): boolean {
  return /^\+?[\d\s\-()]{8,15}$/.test(value.trim());
}

export function minLength(value: string, min: number): boolean {
  return value.trim().length >= min;
}

export function maxLength(value: string, max: number): boolean {
  return value.trim().length <= max;
}
