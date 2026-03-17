import mongoose, { Schema, Document, Types } from 'mongoose';
import type { Order as IOrder, OrderStatus, OrderItem } from '@repo/types';

export interface OrderDocument extends Omit<IOrder, '_id' | 'restaurantId' | 'roomId' | 'waiterId'>, Document {
  restaurantId: Types.ObjectId;
  roomId: Types.ObjectId;
  waiterId: Types.ObjectId;
}

const orderItemSchema = new Schema<OrderItem>(
  {
    menuItemId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const orderSchema = new Schema<OrderDocument>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    waiterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    waiterCommission: {
      percent: {
        type: Number,
        default: 0,
      },
      amount: {
        type: Number,
        default: 0,
      },
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'cancelled'] as OrderStatus[],
      default: 'open',
    },
    clientId: {
      type: String,
      sparse: true,
    },
    syncedAt: {
      type: Date,
    },
    openedAt: {
      type: Date,
      default: Date.now,
    },
    closedAt: {
      type: Date,
    },
    cancelReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
orderSchema.index({ restaurantId: 1, status: 1, openedAt: -1 });
orderSchema.index({ restaurantId: 1, waiterId: 1, closedAt: -1 });
orderSchema.index({ restaurantId: 1, clientId: 1 }, { sparse: true });
orderSchema.index({ roomId: 1, status: 1 });
orderSchema.index({ restaurantId: 1, closedAt: -1 });

export const Order = mongoose.model<OrderDocument>('Order', orderSchema);
