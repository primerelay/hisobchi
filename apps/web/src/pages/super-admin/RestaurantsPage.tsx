import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { superAdminApi } from '../../services/api';
import { formatDateShort } from '@repo/utils';
import { PLAN_LABELS } from '@repo/constants';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import type { Restaurant } from '@repo/types';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadRestaurants();
  }, [search]);

  const loadRestaurants = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;

      const { data } = await superAdminApi.getRestaurants(params);
      setRestaurants(data.restaurants);
    } catch (error) {
      console.error('Error loading restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (restaurant: Restaurant) => {
    if (!confirm(`"${restaurant.name}" restoranini o'chirishni tasdiqlaysizmi?\n\nBu amalni ortga qaytarib bo'lmaydi! Barcha ma'lumotlar (menyu, xonalar, ofitsiantlar, buyurtmalar) o'chiriladi.`)) {
      return;
    }

    setDeleting(restaurant._id);
    try {
      await superAdminApi.deleteRestaurant(restaurant._id);
      toast.success('Restoran o\'chirildi');
      setRestaurants(restaurants.filter(r => r._id !== restaurant._id));
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast.error('Xatolik yuz berdi');
    } finally {
      setDeleting(null);
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Restoranlar</h1>
        <Link to="/super-admin/restaurants/new" className="btn-primary text-sm sm:text-base">
          <span className="hidden sm:inline">+ Yangi restoran</span>
          <span className="sm:hidden">+ Yangi</span>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="input pl-10 w-full sm:max-w-md"
            placeholder="Qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <>
          {/* Mobile: Card view */}
          <div className="lg:hidden space-y-3">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant._id}
                className={clsx(
                  'card p-4',
                  !restaurant.isActive && 'opacity-60'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                    <p className="text-sm text-gray-500">{restaurant.slug}</p>
                  </div>
                  <span className={clsx(
                    'px-2 py-1 text-xs rounded-full font-medium',
                    restaurant.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  )}>
                    {restaurant.isActive ? 'Faol' : 'Nofaol'}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className={clsx('px-2 py-0.5 text-xs rounded-full', getPlanColor(restaurant.subscription.plan))}>
                    {PLAN_LABELS[restaurant.subscription.plan]}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDateShort(restaurant.subscription.expiresAt)} gacha
                  </span>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <Link
                    to={`/super-admin/restaurants/${restaurant._id}`}
                    className="flex-1 btn btn-secondary text-sm py-2 text-center"
                  >
                    Ko'rish
                  </Link>
                  <button
                    onClick={() => handleDelete(restaurant)}
                    disabled={deleting === restaurant._id}
                    className={clsx(
                      'flex-1 text-sm py-2 rounded-lg font-medium',
                      'bg-red-50 text-red-600 hover:bg-red-100',
                      deleting === restaurant._id && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {deleting === restaurant._id ? 'O\'chirilmoqda...' : 'O\'chirish'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table view */}
          <div className="hidden lg:block card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nomi</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Slug</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tarif</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Muddat</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Holat</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {restaurants.map((restaurant) => (
                  <tr key={restaurant._id} className={clsx('hover:bg-gray-50 transition-colors', !restaurant.isActive && 'opacity-50')}>
                    <td className="px-4 py-3 font-medium text-gray-900">{restaurant.name}</td>
                    <td className="px-4 py-3 text-gray-600">{restaurant.slug}</td>
                    <td className="px-4 py-3">
                      <span className={clsx('px-2 py-1 text-xs rounded-full', getPlanColor(restaurant.subscription.plan))}>
                        {PLAN_LABELS[restaurant.subscription.plan]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDateShort(restaurant.subscription.expiresAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'px-2 py-1 text-xs rounded-full',
                        restaurant.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      )}>
                        {restaurant.isActive ? 'Faol' : 'Nofaol'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      <Link
                        to={`/super-admin/restaurants/${restaurant._id}`}
                        className="text-sm text-primary-600 hover:text-primary-800 hover:underline"
                      >
                        Ko'rish
                      </Link>
                      <button
                        onClick={() => handleDelete(restaurant)}
                        disabled={deleting === restaurant._id}
                        className={clsx(
                          'text-sm text-red-600 hover:text-red-800 hover:underline',
                          deleting === restaurant._id && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        {deleting === restaurant._id ? 'O\'chirilmoqda...' : 'O\'chirish'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {restaurants.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-12">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="font-medium">Restoranlar topilmadi</p>
          <Link to="/super-admin/restaurants/new" className="text-primary-600 hover:underline text-sm mt-2 inline-block">
            Yangi restoran qo'shing
          </Link>
        </div>
      )}
    </div>
  );
}
