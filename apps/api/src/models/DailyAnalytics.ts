import mongoose, { Schema, Document, Types } from 'mongoose';
import type { DailyAnalytics as IDailyAnalytics } from '@repo/types';

export interface DailyAnalyticsDocument extends Omit<IDailyAnalytics, '_id' | 'restaurantId'>, Document {
  restaurantId: Types.ObjectId;
}

const dailyAnalyticsSchema = new Schema<DailyAnalyticsDocument>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    totals: {
      revenue: { type: Number, default: 0 },
      orderCount: { type: Number, default: 0 },
      avgOrderValue: { type: Number, default: 0 },
    },
    byCategory: {
      food: {
        revenue: { type: Number, default: 0 },
        quantity: { type: Number, default: 0 },
      },
      drink: {
        revenue: { type: Number, default: 0 },
        quantity: { type: Number, default: 0 },
      },
      service: {
        revenue: { type: Number, default: 0 },
        quantity: { type: Number, default: 0 },
      },
    },
    topItems: [
      {
        menuItemId: Schema.Types.ObjectId,
        name: String,
        quantity: Number,
        revenue: Number,
      },
    ],
    byWaiter: [
      {
        waiterId: Schema.Types.ObjectId,
        name: String,
        orderCount: Number,
        revenue: Number,
        commission: Number,
      },
    ],
    byHour: [
      {
        hour: Number,
        orderCount: Number,
        revenue: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
dailyAnalyticsSchema.index({ restaurantId: 1, date: -1 }, { unique: true });

export const DailyAnalytics = mongoose.model<DailyAnalyticsDocument>('DailyAnalytics', dailyAnalyticsSchema);
