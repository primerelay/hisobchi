/**
 * Generate URL-safe slug from string
 * @example generateSlug("Milliy Taomlar") => "milliy-taomlar"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace Uzbek characters
    .replace(/[оўғқҳ]/g, (char) => {
      const map: Record<string, string> = {
        'о': 'o',
        'ў': 'o',
        'ғ': 'g',
        'қ': 'q',
        'ҳ': 'h',
      };
      return map[char] || char;
    })
    // Replace spaces and special chars with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove non-alphanumeric except hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Check if slug is valid
 */
export function isValidSlug(slug: string): boolean {
  const regex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return regex.test(slug) && slug.length >= 2 && slug.length <= 50;
}

/**
 * Generate unique slug by appending number
 * @example makeUniqueSlug("test", ["test", "test-1"]) => "test-2"
 */
export function makeUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 1;
  let newSlug = `${baseSlug}-${counter}`;

  while (existingSlugs.includes(newSlug)) {
    counter++;
    newSlug = `${baseSlug}-${counter}`;
  }

  return newSlug;
}
