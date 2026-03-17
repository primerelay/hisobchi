import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { authApi, roomsApi, menuItemsApi } from '../../services/api';
import { cacheService } from '../../services/cacheService';
import PasswordInput from '../../components/ui/PasswordInput';
import Logo from '../../components/ui/Logo';
import toast from 'react-hot-toast';

export default function WaiterLoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || !password) {
      toast.error('Telefon va parolni kiriting');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.login(phone, password);

      if (data.user.role !== 'waiter') {
        toast.error('Bu sahifa faqat ofitsiantlar uchun');
        return;
      }

      setAuth({
        token: data.token,
        user: data.user,
        restaurant: data.restaurant,
      });

      // Pre-cache rooms and menu items for offline use
      try {
        const [roomsRes, menuRes] = await Promise.all([
          roomsApi.getAll({ isActive: true }),
          menuItemsApi.getAll({ isActive: true }),
        ]);
        await cacheService.cacheRooms(roomsRes.data.rooms);
        await cacheService.cacheMenuItems(menuRes.data.items);
        console.log('Initial cache completed');
      } catch (cacheError) {
        console.warn('Failed to pre-cache data:', cacheError);
      }

      toast.success('Xush kelibsiz!');
      navigate('/waiter/rooms');
    } catch {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Logo size="xl" variant="light" />
          <p className="text-green-100 mt-3 text-sm">Ofitsiant kirishi</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Kirish</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Telefon raqam</label>
              <input
                type="tel"
                className="input text-lg py-3"
                placeholder="+998901234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <PasswordInput
              label="Parol"
              placeholder="Parolni kiriting"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-lg py-3"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full btn bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 btn-lg"
            >
              {loading ? 'Kirish...' : 'Kirish'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <Link to="/login" className="text-green-600 hover:underline">
              Admin sifatida kirish
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
