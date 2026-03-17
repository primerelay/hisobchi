import mongoose, { Schema, Document, Types } from 'mongoose';
import type { MenuItem as IMenuItem, MenuCategory } from '@repo/types';
import { DEFAULT_IMAGES } from '@repo/constants';

export interface MenuItemDocument extends Omit<IMenuItem, '_id' | 'restaurantId'>, Document {
  restaurantId: Types.ObjectId;
}

const menuItemSchema = new Schema<MenuItemDocument>(
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
      maxlength: 100,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: ['food', 'drink', 'service'] as MenuCategory[],
      required: true,
    },
    image: {
      type: String,
      default: function (this: MenuItemDocument) {
        return DEFAULT_IMAGES[this.category] || DEFAULT_IMAGES.food;
      },
    },
    sortOrder: {
      type: Number,
      default: 0,
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

// Indexes
menuItemSchema.index({ restaurantId: 1, category: 1, isActive: 1 });
menuItemSchema.index({ restaurantId: 1, sortOrder: 1 });
menuItemSchema.index({ restaurantId: 1, isActive: 1 });

export const MenuItem = mongoose.model<MenuItemDocument>('MenuItem', menuItemSchema);
