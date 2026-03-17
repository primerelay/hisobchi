import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomsApi } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { useOrderStore } from '../../stores/orderStore';
import RoomCard from '../../components/waiter/RoomCard';

interface RoomWithOrder {
  _id: string;
  name: string;
  isActive: boolean;
  currentOrderId: string | null;
  currentOrder?: {
    _id: string;
    totalPrice: number;
    waiterId: string;
    waiterName: string;
  } | null;
}

export default function RoomSelectionPage() {
  const [rooms, setRooms] = useState<RoomWithOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Barcha xonalar uchun local orderlar
  const roomOrders = useOrderStore((state) => state.roomOrders);

  const loadRooms = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    }

    try {
      const { data } = await roomsApi.getAll({ isActive: true });
      setRooms(data.rooms);
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // Local o'zgarishlarni server data bilan birlashtirish
  const roomsWithLocalChanges = useMemo(() => {
    return rooms.map((room) => {
      const localRoomOrder = roomOrders[room._id];

      // Agar shu xonada local o'zgarishlar bo'lsa
      if (localRoomOrder?.isDirty && localRoomOrder.order.items.length > 0) {
        return {
          ...room,
          currentOrder: {
            _id: localRoomOrder.order._id,
            totalPrice: localRoomOrder.order.totalPrice,
            waiterId: localRoomOrder.order.waiterId,
            waiterName: user?.name || '',
          },
        };
      }

      return room;
    });
  }, [rooms, roomOrders, user?.name]);

  const handleRoomClick = (room: RoomWithOrder) => {
    navigate(`/waiter/rooms/${room._id}`);
  };

  const handleRefresh = () => {
    loadRooms(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-100">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Xonalar</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg
              className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-400 to-green-500" />
            <span className="text-gray-600">Bo'sh</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500" />
            <span className="text-gray-600">Mening</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />
            <span className="text-gray-600">Band</span>
          </div>
        </div>
      </div>

      {/* Room grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roomsWithLocalChanges.map((room) => (
            <RoomCard
              key={room._id}
              room={room}
              currentUserId={user?._id}
              onClick={handleRoomClick}
            />
          ))}
        </div>

        {rooms.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <p className="text-gray-500">Xonalar topilmadi</p>
          </div>
        )}
      </div>
    </div>
  );
}
