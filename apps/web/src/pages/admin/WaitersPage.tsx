import { useState, useEffect } from 'react';
import { waitersApi } from '../../services/api';
import { formatPhone } from '@repo/utils';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import type { UserPublic } from '@repo/types';

export default function WaitersPage() {
  const [waiters, setWaiters] = useState<UserPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWaiter, setEditingWaiter] = useState<UserPublic | null>(null);
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
      setWaiters(data.waiters);
    } catch (error) {
      console.error('Error loading waiters:', error);
    } finally {
      setLoading(false);
    }
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
        toast.success('Ofitsiant yangilandi');
      } else {
        if (!formData.password) {
          toast.error('Parol kiritilishi shart');
          return;
        }
        await waitersApi.create(payload);
        toast.success('Ofitsiant qo\'shildi');
      }
      loadWaiters();
      resetForm();
    } catch (error) {
      console.error('Error saving waiter:', error);
    }
  };

  const handleEdit = (waiter: UserPublic) => {
    setEditingWaiter(waiter);
    setFormData({
      name: waiter.name,
      phone: waiter.phone,
      password: '',
      commissionPercent: waiter.commissionPercent.toString(),
    });
    setShowForm(true);
  };

  const handleToggleActive = async (waiter: UserPublic) => {
    try {
      await waitersApi.update(waiter._id, { isActive: !waiter.isActive });
      toast.success(waiter.isActive ? 'Ofitsiant o\'chirildi' : 'Ofitsiant yoqildi');
      loadWaiters();
    } catch (error) {
      console.error('Error toggling waiter:', error);
    }
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
                <label className="label">Telefon</label>
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
                <label className="label">
                  Parol {editingWaiter && '(bo\'sh qoldiring o\'zgartirmaslik uchun)'}
                </label>
                <input
                  type="password"
                  className="input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
