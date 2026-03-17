import mongoose, { Schema, Document, Types } from 'mongoose';
import type { User as IUser, UserRole } from '@repo/types';

export interface UserDocument extends Omit<IUser, '_id' | 'restaurantId'>, Document {
  restaurantId: Types.ObjectId;
}

const userSchema = new Schema<UserDocument>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'waiter'] as UserRole[],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    commissionPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ restaurantId: 1, phone: 1 }, { unique: true });
userSchema.index({ restaurantId: 1, role: 1 });
userSchema.index({ restaurantId: 1, isActive: 1 });

export const User = mongoose.model<UserDocument>('User', userSchema);
