export const CATEGORIES = ['food', 'drink', 'service'] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  food: 'Taomlar',
  drink: 'Ichimliklar',
  service: 'Xizmatlar',
};

export const CATEGORY_LABELS_EN: Record<Category, string> = {
  food: 'Food',
  drink: 'Drinks',
  service: 'Services',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  food: '🍽️',
  drink: '🥤',
  service: '🛎️',
};
