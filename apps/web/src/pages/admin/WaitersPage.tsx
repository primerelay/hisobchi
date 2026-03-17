import { useState, useEffect } from 'react';
import { waitersApi } from '../../services/api';
import { formatPhone } from '@repo/utils';
import PasswordInput from '../../components/ui/PasswordInput';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import type { UserPublic } from '@repo/types';

// Extend UserPublic to include password for display
interface WaiterWithPassword extends UserPublic {
  plainPassword?: string;
}

export default function WaitersPage() {
  const [waiters, setWaiters] = useState<WaiterWithPassword[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWaiter, setEditingWaiter] = useState<WaiterWithPassword | null>(null);
  const [showPasswordFor, setShowPasswordFor] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    commissionPercent: '0',
  });

  useEffect(() => {
    loadWaiters();
  }, []);

  const loadWaiters = async () => {
    try {
      const { data } = await waitersApi.getAll();
      // Load saved passwords from localStorage
      const savedPasswords = JSON.parse(localStorage.getItem('waiter-passwords') || '{}');
      const waitersWithPasswords = data.waiters.map((w: UserPublic) => ({
        ...w,
        plainPassword: savedPasswords[w._id] || undefined,
      }));
      setWaiters(waitersWithPasswords);
    } catch (error) {
      console.error('Error loading waiters:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePassword = (waiterId: string, password: string) => {
    const savedPasswords = JSON.parse(localStorage.getItem('waiter-passwords') || '{}');
    savedPasswords[waiterId] = password;
    localStorage.setItem('waiter-passwords', JSON.stringify(savedPasswords));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      name: formData.name,
      phone: formData.phone,
      commissionPercent: parseInt(formData.commissionPercent, 10),
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      if (editingWaiter) {
        await waitersApi.update(editingWaiter._id, payload);
        // Save new password if changed
        if (formData.password) {
          savePassword(editingWaiter._id, formData.password);
        }
        toast.success('Ofitsiant yangilandi');
      } else {
        if (!formData.password) {
          toast.error('Parol kiritilishi shart');
          return;
        }
        const { data } = await waitersApi.create(payload);
        // Save password for new waiter
        savePassword(data.waiter._id, formData.password);
        toast.success('Ofitsiant qo\'shildi');
      }
      loadWaiters();
      resetForm();
    } catch (error) {
      console.error('Error saving waiter:', error);
    }
  };

  const handleEdit = (waiter: WaiterWithPassword) => {
    setEditingWaiter(waiter);
    setFormData({
      name: waiter.name,
      phone: waiter.phone,
      password: '',
      commissionPercent: waiter.commissionPercent.toString(),
    });
    setShowForm(true);
  };

  const handleToggleActive = async (waiter: WaiterWithPassword) => {
    try {
      await waitersApi.update(waiter._id, { isActive: !waiter.isActive });
      toast.success(waiter.isActive ? 'Ofitsiant o\'chirildi' : 'Ofitsiant yoqildi');
      loadWaiters();
    } catch (error) {
      console.error('Error toggling waiter:', error);
    }
  };

  const handleCopyCredentials = (waiter: WaiterWithPassword) => {
    const text = `Telefon: ${waiter.phone}\nParol: ${waiter.plainPassword || 'Noma\'lum'}`;
    navigator.clipboard.writeText(text);
    toast.success('Login ma\'lumotlari nusxalandi');
  };

  const generatePassword = () => {
    const chars = '0123456789';
    let password = '';
    for (let i = 0; i < 6; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingWaiter(null);
    setFormData({ name: '', phone: '', password: '', commissionPercent: '0' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ofitsiantlar</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Yangi ofitsiant
        </button>
      </div>

      {/* Waiters list */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Ism</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Telefon</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Parol</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Komissiya</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Holat</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {waiters.map((waiter) => (
              <tr key={waiter._id} className={clsx(!waiter.isActive && 'opacity-50')}>
                <td className="px-4 py-3 font-medium text-gray-900">{waiter.name}</td>
                <td className="px-4 py-3 text-gray-600">{formatPhone(waiter.phone)}</td>
                <td className="px-4 py-3">
                  {waiter.plainPassword ? (
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">
                        {showPasswordFor === waiter._id ? waiter.plainPassword : '••••••'}
                      </code>
                      <button
                        onClick={() => setShowPasswordFor(showPasswordFor === waiter._id ? null : waiter._id)}
                        className="text-gray-500 hover:text-gray-700"
                        title={showPasswordFor === waiter._id ? 'Yashirish' : 'Ko\'rsatish'}
                      >
                        {showPasswordFor === waiter._id ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleCopyCredentials(waiter)}
                        className="text-gray-500 hover:text-gray-700"
                        title="Nusxalash"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Saqlanmagan</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{waiter.commissionPercent}%</td>
                <td className="px-4 py-3">
                  <span className={clsx(
                    'px-2 py-1 text-xs rounded-full',
                    waiter.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  )}>
                    {waiter.isActive ? 'Faol' : 'Nofaol'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => handleEdit(waiter)}
                    className="text-primary-600 hover:underline text-sm"
                  >
                    Tahrirlash
                  </button>
                  <button
                    onClick={() => handleToggleActive(waiter)}
                    className={clsx(
                      'text-sm hover:underline',
                      waiter.isActive ? 'text-red-600' : 'text-green-600'
                    )}
                  >
                    {waiter.isActive ? 'O\'chirish' : 'Yoqish'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {waiters.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          Ofitsiantlar topilmadi. Yangi ofitsiant qo'shing.
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingWaiter ? 'Ofitsiantni tahrirlash' : 'Yangi ofitsiant'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Ism</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Telefon (login)</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="+998901234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="label mb-0">
                    Parol {editingWaiter && '(bo\'sh = o\'zgartirmaslik)'}
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-xs text-primary-600 hover:underline"
                  >
                    Avtomatik yaratish
                  </button>
                </div>
                <PasswordInput
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Parol"
                  required={!editingWaiter}
                />
              </div>
              <div>
                <label className="label">Komissiya (%)</label>
                <input
                  type="number"
                  className="input"
                  min="0"
                  max="100"
                  value={formData.commissionPercent}
                  onChange={(e) => setFormData({ ...formData, commissionPercent: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={resetForm} className="flex-1 btn btn-secondary">
                  Bekor qilish
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
