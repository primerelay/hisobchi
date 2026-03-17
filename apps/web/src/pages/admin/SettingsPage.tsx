import { useState, useEffect } from 'react';
import { restaurantApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';
import type { Restaurant } from '@repo/types';

export default function SettingsPage() {
  const { restaurant: authRestaurant, setAuth, user, token } = useAuthStore();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    commissionEnabled: false,
    defaultCommission: 10,
  });

  useEffect(() => {
    loadRestaurant();
  }, []);

  const loadRestaurant = async () => {
    try {
      const { data } = await restaurantApi.get();
      setRestaurant(data.restaurant);
      setFormData({
        name: data.restaurant.name,
        phone: data.restaurant.phone,
        address: data.restaurant.address || '',
        commissionEnabled: data.restaurant.settings.commissionEnabled,
        defaultCommission: data.restaurant.settings.defaultCommission,
      });
    } catch (error) {
      console.error('Error loading restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data } = await restaurantApi.update({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        settings: {
          commissionEnabled: formData.commissionEnabled,
          defaultCommission: formData.defaultCommission,
        },
      });

      setRestaurant(data.restaurant);

      // Update auth store
      if (token && user) {
        setAuth({
          token,
          user,
          restaurant: {
            _id: data.restaurant._id,
            name: data.restaurant.name,
            slug: data.restaurant.slug,
            settings: data.restaurant.settings,
          },
        });
      }

      toast.success('Sozlamalar saqlandi');
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sozlamalar</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Restoran ma'lumotlari</h2>

          <div>
            <label className="label">Restoran nomi</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Telefon raqam</label>
            <input
              type="tel"
              className="input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Manzil</label>
            <input
              type="text"
              className="input"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Komissiya sozlamalari</h2>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="commissionEnabled"
              checked={formData.commissionEnabled}
              onChange={(e) => setFormData({ ...formData, commissionEnabled: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="commissionEnabled" className="text-gray-700">
              Komissiya tizimini yoqish
            </label>
          </div>

          {formData.commissionEnabled && (
            <div>
              <label className="label">Standart komissiya foizi</label>
              <input
                type="number"
                className="input w-32"
                min="0"
                max="100"
                value={formData.defaultCommission}
                onChange={(e) => setFormData({ ...formData, defaultCommission: parseInt(e.target.value, 10) })}
              />
            </div>
          )}
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </form>
    </div>
  );
}
