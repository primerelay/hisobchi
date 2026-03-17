import { useState, useEffect } from 'react';
import { roomsApi } from '../../services/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import type { Room } from '@repo/types';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const { data } = await roomsApi.getAll();
      setRooms(data.rooms);
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingRoom) {
        await roomsApi.update(editingRoom._id, formData);
        toast.success('Xona yangilandi');
      } else {
        await roomsApi.create(formData);
        toast.success('Xona qo\'shildi');
      }
      loadRooms();
      resetForm();
    } catch (error) {
      console.error('Error saving room:', error);
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({ name: room.name });
    setShowForm(true);
  };

  const handleToggleActive = async (room: Room) => {
    try {
      await roomsApi.update(room._id, { isActive: !room.isActive });
      toast.success(room.isActive ? 'Xona o\'chirildi' : 'Xona yoqildi');
      loadRooms();
    } catch (error) {
      console.error('Error toggling room:', error);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingRoom(null);
    setFormData({ name: '' });
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
        <h1 className="text-2xl font-bold text-gray-900">Xonalar</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Yangi xona
        </button>
      </div>

      {/* Rooms grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {rooms.map((room) => (
          <div
            key={room._id}
            className={clsx(
              'card p-4 relative',
              !room.isActive && 'opacity-50'
            )}
          >
            <h3 className="font-medium text-gray-900 mb-2">{room.name}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(room)}
                className="text-sm text-primary-600 hover:underline"
              >
                Tahrirlash
              </button>
              <button
                onClick={() => handleToggleActive(room)}
                className={clsx(
                  'text-sm hover:underline',
                  room.isActive ? 'text-red-600' : 'text-green-600'
                )}
              >
                {room.isActive ? 'O\'chirish' : 'Yoqish'}
              </button>
            </div>
            {room.currentOrderId && (
              <span className="absolute top-2 right-2 w-3 h-3 bg-orange-500 rounded-full" />
            )}
          </div>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          Xonalar topilmadi. Yangi xona qo'shing.
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingRoom ? 'Xonani tahrirlash' : 'Yangi xona'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Xona nomi</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Xona 1"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  required
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
