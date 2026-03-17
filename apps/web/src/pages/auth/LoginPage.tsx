import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { authApi } from '../../services/api';
import PasswordInput from '../../components/ui/PasswordInput';
import toast from 'react-hot-toast';

export default function LoginPage() {
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
      setAuth({
        token: data.token,
        user: data.user,
        restaurant: data.restaurant,
      });

      toast.success('Xush kelibsiz!');

      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/waiter/rooms');
      }
    } catch {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">OshxonaPOS</h1>
          <p className="text-primary-100 mt-2">Restoran boshqaruv tizimi</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Kirish</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Telefon raqam</label>
              <input
                type="tel"
                className="input"
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
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary btn-lg"
            >
              {loading ? 'Kirish...' : 'Kirish'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <Link to="/waiter/login" className="text-primary-600 hover:underline">
              Ofitsiant sifatida kirish
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
