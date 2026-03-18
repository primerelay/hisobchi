import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { superAdminApi } from '../../services/api';
import { formatCurrency, formatDateShort } from '@repo/utils';
import { PLAN_LABELS } from '@repo/constants';
import PasswordInput from '../../components/ui/PasswordInput';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface RestaurantDetail {
  _id: string;
  name: string;
  slug: string;
  phone: string;
  address?: string;
  isActive: boolean;
  subscription: {
    plan: 'trial' | 'basic' | 'premium';
    expiresAt: string;
  };
  settings: {
    commissionEnabled: boolean;
    defaultCommission: number;
  };
}

interface AdminDetail {
  _id: string;
  name: string;
  phone: string;
  isActive: boolean;
}

interface Stats {
  orderCount: number;
  totalRevenue: number;
}

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [admin, setAdmin] = useState<AdminDetail | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const [editingRestaurant, setEditingRestaurant] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    phone: '',
    address: '',
    isActive: true,
  });

  const [adminForm, setAdminForm] = useState({
    name: '',
    phone: '',
  });

  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const { data } = await superAdminApi.getRestaurant(id!);
      setRestaurant(data.restaurant);
      setAdmin(data.admin);
      setStats(data.stats);

      setRestaurantForm({
        name: data.restaurant.name,
        phone: data.restaurant.phone,
        address: data.restaurant.address || '',
        isActive: data.restaurant.isActive,
      });

      if (data.admin) {
        setAdminForm({
          name: data.admin.name,
          phone: data.admin.phone,
        });
      }
    } catch (error) {
      console.error('Error loading restaurant:', error);
      toast.error('Ma\'lumotlarni yuklashda xatolik');
      navigate('/super-admin/restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRestaurant = async () => {
    setSaving(true);
    try {
      await superAdminApi.updateRestaurant(id!, restaurantForm);
      toast.success('Restoran yangilandi');
      setEditingRestaurant(false);
      loadData();
    } catch (error) {
      console.error('Error updating restaurant:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAdmin = async () => {
    setSaving(true);
    try {
      await superAdminApi.updateAdmin(id!, adminForm);
      toast.success('Admin ma\'lumotlari yangilandi');
      setEditingAdmin(false);
      loadData();
    } catch (error) {
      console.error('Error updating admin:', error);
      toast.error('Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    setSaving(true);
    try {
      await superAdminApi.resetAdminPassword(id!, newPassword);
      toast.success('Parol o\'zgartirildi');
      setChangingPassword(false);
      setNewPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`"${restaurant?.name}" restoranini o'chirishni tasdiqlaysizmi?\n\nBu amalni ortga qaytarib bo'lmaydi!`)) {
      return;
    }

    try {
      await superAdminApi.deleteRestaurant(id!);
      toast.success('Restoran o\'chirildi');
      navigate('/super-admin/restaurants');
    } catch (error) {
      console.error('Error deleting restaurant:', error);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'premium':
        return 'bg-purple-100 text-purple-700';
      case 'basic':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!restaurant) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/super-admin/restaurants')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{restaurant.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={clsx(
                'px-2 py-0.5 text-xs rounded-full',
                restaurant.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              )}>
                {restaurant.isActive ? 'Faol' : 'Nofaol'}
              </span>
              <span className={clsx('px-2 py-0.5 text-xs rounded-full', getPlanColor(restaurant.subscription.plan))}>
                {PLAN_LABELS[restaurant.subscription.plan]}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="btn bg-red-600 text-white hover:bg-red-700 text-sm sm:text-base"
        >
          O'chirish
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="card p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500">Tarif</p>
          <p className="text-base sm:text-lg font-semibold">{PLAN_LABELS[restaurant.subscription.plan]}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatDateShort(restaurant.subscription.expiresAt)} gacha
          </p>
        </div>
        <div className="card p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500">Buyurtmalar</p>
          <p className="text-base sm:text-lg font-semibold">{stats?.orderCount || 0}</p>
        </div>
        <div className="card p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-500">Daromad</p>
          <p className="text-base sm:text-lg font-semibold truncate">{formatCurrency(stats?.totalRevenue || 0)}</p>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Restoran ma'lumotlari</h2>
          {!editingRestaurant && (
            <button
              onClick={() => setEditingRestaurant(true)}
              className="text-primary-600 hover:underline text-sm"
            >
              Tahrirlash
            </button>
          )}
        </div>

        {editingRestaurant ? (
          <div className="space-y-4">
            <div>
              <label className="label">Nomi</label>
              <input
                type="text"
                className="input"
                value={restaurantForm.name}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Telefon</label>
              <input
                type="tel"
                className="input"
                value={restaurantForm.phone}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Manzil</label>
              <input
                type="text"
                className="input"
                value={restaurantForm.address}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, address: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={restaurantForm.isActive}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isActive">Faol</label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setEditingRestaurant(false)}
                className="flex-1 btn btn-secondary"
                disabled={saving}
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSaveRestaurant}
                className="flex-1 btn-primary"
                disabled={saving}
              >
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b text-sm sm:text-base">
              <span className="text-gray-500">Slug</span>
              <span className="font-medium">{restaurant.slug}</span>
            </div>
            <div className="flex justify-between py-2 border-b text-sm sm:text-base">
              <span className="text-gray-500">Telefon</span>
              <span className="font-medium">{restaurant.phone}</span>
            </div>
            <div className="flex justify-between py-2 border-b text-sm sm:text-base">
              <span className="text-gray-500">Manzil</span>
              <span className="font-medium">{restaurant.address || '-'}</span>
            </div>
            <div className="flex justify-between py-2 text-sm sm:text-base">
              <span className="text-gray-500">Komissiya</span>
              <span className="font-medium">
                {restaurant.settings.commissionEnabled
                  ? `${restaurant.settings.defaultCommission}%`
                  : 'O\'chirilgan'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Admin Info */}
      {admin && (
        <div className="card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Admin hisobi</h2>
            <div className="flex gap-3">
              {!editingAdmin && !changingPassword && (
                <>
                  <button
                    onClick={() => setEditingAdmin(true)}
                    className="text-primary-600 hover:underline text-sm"
                  >
                    Tahrirlash
                  </button>
                  <button
                    onClick={() => setChangingPassword(true)}
                    className="text-orange-600 hover:underline text-sm"
                  >
                    Parolni o'zgartirish
                  </button>
                </>
              )}
            </div>
          </div>

          {changingPassword ? (
            <div className="space-y-4">
              <PasswordInput
                label="Yangi parol"
                placeholder="Kamida 6 ta belgi"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setChangingPassword(false);
                    setNewPassword('');
                  }}
                  className="flex-1 btn btn-secondary"
                  disabled={saving}
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleChangePassword}
                  className="flex-1 btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saqlanmoqda...' : 'O\'zgartirish'}
                </button>
              </div>
            </div>
          ) : editingAdmin ? (
            <div className="space-y-4">
              <div>
                <label className="label">Admin ismi</label>
                <input
                  type="text"
                  className="input"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Admin telefoni (login)</label>
                <input
                  type="tel"
                  className="input"
                  value={adminForm.phone}
                  onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingAdmin(false)}
                  className="flex-1 btn btn-secondary"
                  disabled={saving}
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleSaveAdmin}
                  className="flex-1 btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b text-sm sm:text-base">
                <span className="text-gray-500">Ismi</span>
                <span className="font-medium">{admin.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b text-sm sm:text-base">
                <span className="text-gray-500">Telefon (login)</span>
                <span className="font-medium font-mono">{admin.phone}</span>
              </div>
              <div className="flex justify-between py-2 text-sm sm:text-base">
                <span className="text-gray-500">Holat</span>
                <span className={clsx(
                  'px-2 py-1 text-xs rounded-full',
                  admin.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                )}>
                  {admin.isActive ? 'Faol' : 'Nofaol'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
