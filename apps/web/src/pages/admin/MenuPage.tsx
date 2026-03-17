import { useState, useEffect } from 'react';
import { menuItemsApi } from '../../services/api';
import { formatCurrency } from '@repo/utils';
import { CATEGORY_LABELS, MENU_ITEM_IMAGES } from '@repo/constants';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import type { MenuItem } from '@repo/types';

type Category = 'food' | 'drink' | 'service';

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'food' as Category,
    image: '',
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const { data } = await menuItemsApi.getAll();
      setItems(data.items);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      price: parseInt(formData.price, 10),
      category: formData.category,
      image: formData.image || undefined,
    };

    try {
      if (editingItem) {
        await menuItemsApi.update(editingItem._id, payload);
        toast.success('Taom yangilandi');
      } else {
        await menuItemsApi.create(payload);
        toast.success('Taom qo\'shildi');
      }
      loadItems();
      resetForm();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      image: item.image || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`"${item.name}" ni o'chirmoqchimisiz?`)) return;

    try {
      await menuItemsApi.delete(item._id);
      toast.success('Taom o\'chirildi');
      loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({ name: '', price: '', category: 'food', image: '' });
  };

  const filteredItems = activeCategory === 'all'
    ? items
    : items.filter((item) => item.category === activeCategory);

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
        <h1 className="text-2xl font-bold text-gray-900">Menyu</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Yangi taom
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={clsx(
            'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap',
            activeCategory === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
          )}
        >
          Hammasi ({items.length})
        </button>
        {(['food', 'drink', 'service'] as Category[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap',
              activeCategory === cat ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
            )}
          >
            {CATEGORY_LABELS[cat]} ({items.filter((i) => i.category === cat).length})
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div key={item._id} className="card p-4 flex gap-4">
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 rounded-lg object-cover bg-gray-100"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
              <p className="text-sm text-gray-500">{CATEGORY_LABELS[item.category]}</p>
              <p className="font-semibold text-gray-900 mt-1">{formatCurrency(item.price)}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleEdit(item)}
                className="p-2 text-gray-400 hover:text-primary-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(item)}
                className="p-2 text-gray-400 hover:text-red-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingItem ? 'Taomni tahrirlash' : 'Yangi taom'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nomi</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Narxi (so'm)</label>
                <input
                  type="number"
                  className="input"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Kategoriya</label>
                <select
                  className="input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Category, image: '' })}
                >
                  <option value="food">Taomlar</option>
                  <option value="drink">Ichimliklar</option>
                  <option value="service">Xizmatlar</option>
                </select>
              </div>
              <div>
                <label className="label">Rasm tanlang</label>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                  {MENU_ITEM_IMAGES[formData.category].map((img) => (
                    <button
                      key={img.url}
                      type="button"
                      onClick={() => setFormData({ ...formData, image: img.url })}
                      className={clsx(
                        'relative rounded-lg overflow-hidden border-2 transition-all',
                        formData.image === img.url
                          ? 'border-primary-600 ring-2 ring-primary-200'
                          : 'border-transparent hover:border-gray-300'
                      )}
                      title={img.name}
                    >
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full aspect-square object-cover"
                      />
                      {formData.image === img.url && (
                        <div className="absolute inset-0 bg-primary-600/20 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
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
