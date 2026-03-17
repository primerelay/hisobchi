export type MenuCategory = 'food' | 'drink' | 'service';

export interface MenuItem {
  _id: string;
  restaurantId: string;
  name: string;
  price: number;
  category: MenuCategory;
  image: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMenuItemInput {
  name: string;
  price: number;
  category: MenuCategory;
  image?: string;
}

export interface UpdateMenuItemInput {
  name?: string;
  price?: number;
  category?: MenuCategory;
  image?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ReorderMenuItemsInput {
  items: Array<{
    id: string;
    sortOrder: number;
  }>;
}
