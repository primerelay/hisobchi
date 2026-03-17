import mongoose, { Schema, Document, Types } from 'mongoose';
import type { Room as IRoom } from '@repo/types';

export interface RoomDocument extends Omit<IRoom, '_id' | 'restaurantId' | 'currentOrderId'>, Document {
  restaurantId: Types.ObjectId;
  currentOrderId: Types.ObjectId | null;
}

const roomSchema = new Schema<RoomDocument>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    currentOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
roomSchema.index({ restaurantId: 1, isActive: 1, sortOrder: 1 });
roomSchema.index({ restaurantId: 1, name: 1 });

export const Room = mongoose.model<RoomDocument>('Room', roomSchema);
