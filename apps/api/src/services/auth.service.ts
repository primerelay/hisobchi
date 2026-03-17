import bcrypt from 'bcryptjs';
import { User, SuperAdmin, Restaurant } from '../models';
import { generateToken, ApiError } from '../middleware';
import type { LoginResponse, SuperAdminLoginResponse } from '@repo/types';

export async function loginUser(phone: string, password: string): Promise<LoginResponse> {
  const user = await User.findOne({ phone }).select('+passwordHash');

  if (!user) {
    throw new ApiError('Telefon yoki parol noto\'g\'ri', 401);
  }

  if (!user.isActive) {
    throw new ApiError('Akkaunt faol emas', 403);
  }

  if (!user.passwordHash) {
    throw new ApiError('Telefon yoki parol noto\'g\'ri', 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    throw new ApiError('Telefon yoki parol noto\'g\'ri', 401);
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  // Get restaurant info
  const restaurant = await Restaurant.findById(user.restaurantId);

  if (!restaurant || !restaurant.isActive) {
    throw new ApiError('Restaurant faol emas', 403);
  }

  const token = generateToken({
    id: user._id.toString(),
    restaurantId: user.restaurantId.toString(),
    role: user.role,
  });

  return {
    token,
    user: {
      _id: user._id.toString(),
      restaurantId: user.restaurantId.toString(),
      role: user.role,
      name: user.name,
      phone: user.phone,
      commissionPercent: user.commissionPercent,
      isActive: user.isActive,
    },
    restaurant: {
      _id: restaurant._id.toString(),
      name: restaurant.name,
      slug: restaurant.slug,
      settings: restaurant.settings,
    },
  };
}

export async function loginSuperAdmin(email: string, password: string): Promise<SuperAdminLoginResponse> {
  const admin = await SuperAdmin.findOne({ email }).select('+passwordHash');

  if (!admin) {
    throw new ApiError('Email yoki parol noto\'g\'ri', 401);
  }

  if (!admin.isActive) {
    throw new ApiError('Akkaunt faol emas', 403);
  }

  if (!admin.passwordHash) {
    throw new ApiError('Email yoki parol noto\'g\'ri', 401);
  }

  const isMatch = await bcrypt.compare(password, admin.passwordHash);

  if (!isMatch) {
    throw new ApiError('Email yoki parol noto\'g\'ri', 401);
  }

  const token = generateToken({
    id: admin._id.toString(),
    role: 'superAdmin',
  });

  return {
    token,
    admin: {
      _id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      permissions: admin.permissions,
    },
  };
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await User.findById(userId).select('+passwordHash');

  if (!user) {
    throw new ApiError('Foydalanuvchi topilmadi', 404);
  }

  if (!user.passwordHash) {
    throw new ApiError('Joriy parol noto\'g\'ri', 400);
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!isMatch) {
    throw new ApiError('Joriy parol noto\'g\'ri', 400);
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
