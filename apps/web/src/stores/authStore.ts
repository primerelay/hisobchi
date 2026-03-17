import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserPublic, Restaurant } from '@repo/types';

interface AuthState {
  token: string | null;
  user: UserPublic | null;
  restaurant: Pick<Restaurant, '_id' | 'name' | 'slug' | 'settings'> | null;
  isAuthenticated: boolean;
  setAuth: (data: {
    token: string;
    user: UserPublic;
    restaurant?: Pick<Restaurant, '_id' | 'name' | 'slug' | 'settings'>;
  }) => void;
  setSuperAdminAuth: (data: {
    token: string;
    admin: { _id: string; email: string; name: string; permissions: string[] };
  }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      restaurant: null,
      isAuthenticated: false,

      setAuth: ({ token, user, restaurant }) => {
        set({
          token,
          user,
          restaurant: restaurant || null,
          isAuthenticated: true,
        });
      },

      setSuperAdminAuth: ({ token, admin }) => {
        set({
          token,
          user: {
            _id: admin._id,
            restaurantId: '',
            role: 'superAdmin',
            name: admin.name,
            phone: admin.email,
            commissionPercent: 0,
            isActive: true,
          },
          restaurant: null,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          token: null,
          user: null,
          restaurant: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
