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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Xonalar</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary text-sm sm:text-base">
          <span className="hidden sm:inline">+ Yangi xona</span>
          <span className="sm:hidden">+ Yangi</span>
        </button>
      </div>

      {/* Rooms grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {rooms.map((room) => (
          <div
            key={room._id}
            className={clsx(
              'card p-4 relative group transition-all hover:shadow-md',
              !room.isActive && 'opacity-50'
            )}
          >
            {/* Status indicator */}
            {room.currentOrderId && (
              <span className="absolute top-3 right-3 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
              </span>
            )}

            {/* Room icon */}
            <div className={clsx(
              'w-12 h-12 rounded-xl flex items-center justify-center mb-3',
              room.currentOrderId
                ? 'bg-orange-100 text-orange-600'
                : room.isActive
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-gray-100 text-gray-400'
            )}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>

            <h3 className="font-semibold text-gray-900 mb-1">{room.name}</h3>

            <div className="flex items-center gap-2 mb-3">
              <span className={clsx(
                'text-xs px-2 py-0.5 rounded-full',
                room.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              )}>
                {room.isActive ? 'Faol' : 'Nofaol'}
              </span>
              {room.currentOrderId && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                  Band
                </span>
              )}
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => handleEdit(room)}
                className="flex-1 text-sm text-primary-600 hover:text-primary-700 font-medium py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
              >
                Tahrirlash
              </button>
              <button
                onClick={() => handleToggleActive(room)}
                className={clsx(
                  'flex-1 text-sm font-medium py-1.5 rounded-lg transition-colors',
                  room.isActive
                    ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                    : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                )}
              >
                {room.isActive ? 'O\'chirish' : 'Yoqish'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <p className="font-medium">Xonalar topilmadi</p>
          <p className="text-sm mt-1">Yangi xona qo'shing</p>
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-5 sm:p-6 w-full max-w-md">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              {editingRoom ? 'Xonani tahrirlash' : 'Yangi xona'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Xona nomi</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Masalan: Xona 1"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
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
