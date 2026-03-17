import mongoose, { Schema, Document } from 'mongoose';
import type { SuperAdmin as ISuperAdmin } from '@repo/types';

export interface SuperAdminDocument extends Omit<ISuperAdmin, '_id'>, Document {}

const superAdminSchema = new Schema<SuperAdminDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    permissions: {
      type: [String],
      default: ['*'],
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

// email already has unique:true in schema definition

export const SuperAdmin = mongoose.model<SuperAdminDocument>('SuperAdmin', superAdminSchema);
