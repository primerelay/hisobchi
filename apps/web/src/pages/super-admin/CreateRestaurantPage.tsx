import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminApi } from '../../services/api';
import { generateSlug } from '@repo/utils';
import { PLAN_LABELS, SUBSCRIPTION_PLANS } from '@repo/constants';
import toast from 'react-hot-toast';

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
      const { data } = await superAdminApi.createRestaurant(formData);
      toast.success('Restoran yaratildi!');
      navigate('/super-admin/restaurants');
    } catch (error) {
      console.error('Error creating restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Yangi restoran qo'shish</h1>

      {/* Step 1: Restaurant Info */}
      {step === 1 && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 mb-4">1. Restoran ma'lumotlari</h2>

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

          <button onClick={() => setStep(2)} className="btn-primary w-full">
            Keyingi
          </button>
        </div>
      )}

      {/* Step 2: Admin Account */}
      {step === 2 && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 mb-4">2. Admin hisobi</h2>

          <div>
            <label className="label">Admin ismi</label>
            <input
              type="text"
              className="input"
              value={formData.adminName}
              onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Admin telefoni</label>
            <input
              type="tel"
              className="input"
              placeholder="+998901234567"
              value={formData.adminPhone}
              onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Parol</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="input flex-1"
                value={formData.adminPassword}
                onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
              />
              <button type="button" onClick={generatePassword} className="btn btn-secondary">
                Generatsiya
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 btn btn-secondary">
              Orqaga
            </button>
            <button onClick={() => setStep(3)} className="flex-1 btn-primary">
              Keyingi
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Subscription & Options */}
      {step === 3 && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 mb-4">3. Tarif va sozlamalar</h2>

          <div>
            <label className="label">Tarif rejasi</label>
            <div className="space-y-2">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <label key={plan} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="plan"
                    value={plan}
                    checked={formData.plan === plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value as any })}
                    className="w-4 h-4"
                  />
                  <span>{PLAN_LABELS[plan]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="createSampleData"
              checked={formData.createSampleData}
              onChange={(e) => setFormData({ ...formData, createSampleData: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="createSampleData">Namuna ma'lumotlar yaratish</label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="commissionEnabled"
              checked={formData.commissionEnabled}
              onChange={(e) => setFormData({ ...formData, commissionEnabled: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="commissionEnabled">Komissiya tizimini yoqish</label>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 btn btn-secondary">
              Orqaga
            </button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 btn-primary">
              {loading ? 'Yaratilmoqda...' : 'Yaratish'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
