export type OrderStatus = 'open' | 'closed' | 'cancelled';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface WaiterCommission {
  percent: number;
  amount: number;
}

export interface Order {
  _id: string;
  restaurantId: string;
  roomId: string;
  waiterId: string;
  items: OrderItem[];
  totalPrice: number;
  waiterCommission: WaiterCommission;
  status: OrderStatus;
  clientId?: string;
  syncedAt?: Date;
  openedAt: Date;
  closedAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderInput {
  roomId: string;
  items?: Array<{
    menuItemId: string;
    quantity: number;
  }>;
  clientId?: string;
}

export interface UpdateOrderInput {
  items: Array<{
    menuItemId: string;
    quantity: number;
  }>;
}

export interface CancelOrderInput {
  reason: string;
}

export interface OrderWithDetails extends Order {
  room?: {
    _id: string;
    name: string;
  };
  waiter?: {
    _id: string;
    name: string;
  };
}
