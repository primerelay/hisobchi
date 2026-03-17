export interface Room {
  _id: string;
  restaurantId: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  currentOrderId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoomInput {
  name: string;
}

export interface UpdateRoomInput {
  name?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface RoomWithOrder extends Room {
  currentOrder?: {
    _id: string;
    totalPrice: number;
    waiterId: string;
    waiterName: string;
  } | null;
}
