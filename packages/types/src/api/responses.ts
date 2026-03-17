import type { UserPublic, Restaurant, MenuItem, Room, Order, DashboardStats, TopItem, WaiterStats } from '../models';

// Generic
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth
export interface LoginResponse {
  token: string;
  user: UserPublic;
  restaurant?: {
    _id: string;
    name: string;
    slug: string;
    settings: Restaurant['settings'];
  };
}

export interface SuperAdminLoginResponse {
  token: string;
  admin: {
    _id: string;
    email: string;
    name: string;
    permissions: string[];
  };
}

// Restaurant
export interface RestaurantResponse {
  restaurant: Restaurant;
}

// Menu Items
export interface MenuItemsResponse {
  items: MenuItem[];
}

export interface MenuItemResponse {
  item: MenuItem;
}

// Rooms
export interface RoomsResponse {
  rooms: Room[];
}

export interface RoomResponse {
  room: Room;
}

// Waiters
export interface WaitersResponse {
  waiters: UserPublic[];
}

export interface WaiterResponse {
  waiter: UserPublic;
}

// Orders
export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OrderResponse {
  order: Order;
}

// Analytics
export interface DashboardResponse {
  stats: DashboardStats;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface RevenueResponse {
  data: RevenueDataPoint[];
}

export interface TopItemsResponse {
  items: TopItem[];
}

export interface WaitersAnalyticsResponse {
  waiters: WaiterStats[];
}

// Sync
export interface SyncResult {
  clientId: string;
  serverId?: string;
  status: 'success' | 'conflict' | 'error';
  error?: string;
}

export interface SyncPushResponse {
  results: SyncResult[];
}

export interface SyncPullResponse {
  menuItems: MenuItem[];
  rooms: Room[];
  orders: Order[];
  timestamp: number;
}

// Health
export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: number;
}
