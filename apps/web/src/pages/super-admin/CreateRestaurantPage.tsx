import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminApi } from '../../services/api';
import { generateSlug } from '@repo/utils';
import { PLAN_LABELS, SUBSCRIPTION_PLANS } from '@repo/constants';
import PasswordInput from '../../components/ui/PasswordInput';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function CreateRestaurantPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    phone: '',
    address: '',
    adminName: '',
    adminPhone: '',
    adminPassword: '',
    plan: 'trial' as 'trial' | 'basic' | 'premium',
    commissionEnabled: false,
    defaultCommission: 10,
    createSampleData: true,
  });

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, adminPassword: password });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await superAdminApi.createRestaurant(formData);
      toast.success('Restoran yaratildi!');
      navigate('/super-admin/restaurants');
    } catch (error) {
      console.error('Error creating restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'premium':
        return 'border-purple-200 bg-purple-50';
      case 'basic':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/super-admin/restaurants')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Yangi restoran qo'shish</h1>
      </div>

      {/* Progress steps */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={clsx(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                step >= s
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-400'
              )}
            >
              {s}
            </div>
            {s < 3 && (
              <div className={clsx(
                'w-8 sm:w-12 h-1 mx-1',
                step > s ? 'bg-primary-600' : 'bg-gray-200'
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Restaurant Info */}
      {step === 1 && (
        <div className="card p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="font-semibold text-gray-900">Restoran ma'lumotlari</h2>
          </div>

          <div>
            <label className="label">Restoran nomi</label>
            <input
              type="text"
              className="input"
              placeholder="Milliy Taomlar"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>

          <div>
            <label className="label">URL slug</label>
            <input
              type="text"
              className="input"
              placeholder="milliy-taomlar"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">Avtomatik yaratiladi</p>
          </div>

          <div>
            <label className="label">Telefon</label>
            <input
              type="tel"
              className="input"
              placeholder="+998901234567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Manzil</label>
            <input
              type="text"
              className="input"
              placeholder="Toshkent, Chilonzor"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <button onClick={() => setStep(2)} className="btn-primary w-full py-3">
            Keyingi
          </button>
        </div>
      )}

      {/* Step 2: Admin Account */}
      {step === 2 && (
        <div className="card p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="font-semibold text-gray-900">Admin hisobi</h2>
          </div>

          <div>
            <label className="label">Admin ismi</label>
            <input
              type="text"
              className="input"
              placeholder="Admin nomi"
              value={formData.adminName}
              onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Admin telefoni (login)</label>
            <input
              type="tel"
              className="input"
              placeholder="+998901234567"
              value={formData.adminPhone}
              onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label mb-0">Parol</label>
              <button type="button" onClick={generatePassword} className="text-xs text-primary-600 hover:underline">
                Avtomatik yaratish
              </button>
            </div>
            <PasswordInput
              value={formData.adminPassword}
              onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
              placeholder="Parol kiriting"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(1)} className="flex-1 btn btn-secondary py-3">
              Orqaga
            </button>
            <button onClick={() => setStep(3)} className="flex-1 btn-primary py-3">
              Keyingi
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Subscription & Options */}
      {step === 3 && (
        <div className="card p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="font-semibold text-gray-900">Tarif va sozlamalar</h2>
          </div>

          <div>
            <label className="label">Tarif rejasi</label>
            <div className="space-y-2">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <label
                  key={plan}
                  className={clsx(
                    'flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all',
                    formData.plan === plan
                      ? getPlanColor(plan) + ' border-2'
                      : 'hover:bg-gray-50'
                  )}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={plan}
                    checked={formData.plan === plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value as any })}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="font-medium">{PLAN_LABELS[plan]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={formData.createSampleData}
                onChange={(e) => setFormData({ ...formData, createSampleData: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <div>
                <span className="font-medium text-gray-900">Namuna ma'lumotlar yaratish</span>
                <p className="text-xs text-gray-500">Menu, xonalar avtomatik qo'shiladi</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={formData.commissionEnabled}
                onChange={(e) => setFormData({ ...formData, commissionEnabled: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <div>
                <span className="font-medium text-gray-900">Komissiya tizimini yoqish</span>
                <p className="text-xs text-gray-500">Ofitsiantlar uchun komissiya</p>
              </div>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(2)} className="flex-1 btn btn-secondary py-3">
              Orqaga
            </button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 btn-primary py-3">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Yaratilmoqda...
                </span>
              ) : 'Yaratish'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
