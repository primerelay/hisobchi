/**
 * Format number as Uzbek currency (so'm)
 * @example formatCurrency(45000) => "45 000 so'm"
 */
export function formatCurrency(amount: number, showSymbol = true): string {
  const formatted = new Intl.NumberFormat('uz-UZ').format(amount);
  return showSymbol ? `${formatted} so'm` : formatted;
}

/**
 * Format number with spaces as thousand separators
 * @example formatNumber(1234567) => "1 234 567"
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('uz-UZ').format(num);
}

/**
 * Parse currency string to number
 * @example parseCurrency("45 000 so'm") => 45000
 */
export function parseCurrency(str: string): number {
  const cleaned = str.replace(/[^\d]/g, '');
  return parseInt(cleaned, 10) || 0;
}

/**
 * Calculate percentage
 * @example calculatePercent(10000, 10) => 1000
 */
export function calculatePercent(amount: number, percent: number): number {
  return Math.floor(amount * (percent / 100));
}

/**
 * Format percentage
 * @example formatPercent(10.5) => "10.5%"
 */
export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}
