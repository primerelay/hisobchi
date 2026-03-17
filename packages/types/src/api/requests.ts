// Auth
export interface LoginRequest {
  phone: string;
  password: string;
}

export interface SuperAdminLoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Orders
export interface OrdersQueryParams extends PaginationParams {
  status?: 'open' | 'closed' | 'cancelled';
  roomId?: string;
  waiterId?: string;
  from?: string;
  to?: string;
}

// Analytics
export interface AnalyticsQueryParams {
  from: string;
  to: string;
  groupBy?: 'day' | 'week' | 'month';
}

// Sync
export interface SyncOperation {
  type: 'CREATE_ORDER' | 'UPDATE_ORDER' | 'CLOSE_ORDER';
  payload: object;
  clientId: string;
  timestamp: number;
}

export interface SyncPushRequest {
  operations: SyncOperation[];
}

export interface SyncPullParams {
  lastSyncAt?: number;
}
