import mongoose, { Schema, Document } from 'mongoose';
import type { Restaurant as IRestaurant, SubscriptionPlan } from '@repo/types';

export interface RestaurantDocument extends Omit<IRestaurant, '_id'>, Document {}

const restaurantSchema = new Schema<RestaurantDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 50,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    logo: {
      type: String,
      default: 'https://res.cloudinary.com/oshxona/image/upload/v1/defaults/restaurant.png',
    },
    settings: {
      currency: {
        type: String,
        default: 'UZS',
      },
      commissionEnabled: {
        type: Boolean,
        default: false,
      },
      defaultCommission: {
        type: Number,
        default: 10,
        min: 0,
        max: 100,
      },
      timezone: {
        type: String,
        default: 'Asia/Tashkent',
      },
    },
    subscription: {
      plan: {
        type: String,
        enum: ['trial', 'basic', 'premium'] as SubscriptionPlan[],
        default: 'trial',
      },
      expiresAt: {
        type: Date,
        required: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes (slug already has unique:true in schema)
restaurantSchema.index({ isActive: 1 });
restaurantSchema.index({ 'subscription.expiresAt': 1 });

export const Restaurant = mongoose.model<RestaurantDocument>('Restaurant', restaurantSchema);
