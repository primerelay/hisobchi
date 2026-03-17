/**
 * Format phone number for display
 * @example formatPhone("+998901234567") => "+998 90 123 45 67"
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 12 && cleaned.startsWith('998')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10, 12)}`;
  }

  return phone;
}

/**
 * Parse phone to standard format
 * @example parsePhone("90 123 45 67") => "+998901234567"
 */
export function parsePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  // If starts with 998, add +
  if (cleaned.startsWith('998') && cleaned.length === 12) {
    return `+${cleaned}`;
  }

  // If 9 digits starting with 9, add +998
  if (cleaned.length === 9 && cleaned.startsWith('9')) {
    return `+998${cleaned}`;
  }

  return phone;
}

/**
 * Validate Uzbek phone number
 * @example isValidUzbekPhone("+998901234567") => true
 */
export function isValidUzbekPhone(phone: string): boolean {
  const regex = /^\+998[0-9]{9}$/;
  return regex.test(phone);
}

/**
 * Mask phone number for privacy
 * @example maskPhone("+998901234567") => "+998 90 *** ** 67"
 */
export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 12 && cleaned.startsWith('998')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} *** ** ${cleaned.slice(10, 12)}`;
  }

  return phone.slice(0, 4) + '****' + phone.slice(-2);
}
