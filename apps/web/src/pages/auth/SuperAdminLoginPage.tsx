import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { authApi } from '../../services/api';
import PasswordInput from '../../components/ui/PasswordInput';
import Logo from '../../components/ui/Logo';
import toast from 'react-hot-toast';

export default function SuperAdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setSuperAdminAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Email va parolni kiriting');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.superAdminLogin(email, password);
      setSuperAdminAuth({
        token: data.token,
        admin: data.admin,
      });

      toast.success('Xush kelibsiz!');
      navigate('/super-admin/dashboard');
    } catch {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Logo size="xl" variant="light" />
          <p className="text-gray-400 mt-3 text-sm">Super Admin Panel</p>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Kirish</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                className="w-full rounded-lg border border-gray-600 bg-gray-700 text-white px-4 py-2 focus:border-primary-500 focus:outline-none"
                placeholder="admin@hisobchi.uz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <PasswordInput
              label="Parol"
              variant="dark"
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
        </div>
      </div>
    </div>
  );
}
