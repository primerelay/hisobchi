import { formatCurrency } from '@repo/utils';
import clsx from 'clsx';

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

type RoomStatus = 'empty' | 'mine' | 'occupied';

interface RoomCardProps {
  room: RoomWithOrder;
  currentUserId: string | undefined;
  onClick: (room: RoomWithOrder) => void;
}

function getStatusInfo(room: RoomWithOrder, currentUserId: string | undefined): {
  status: RoomStatus;
  label: string;
  gradient: string;
  textColor: string;
  icon: 'check' | 'user' | 'lock';
} {
  if (!room.currentOrder) {
    return {
      status: 'empty',
      label: "Bo'sh",
      gradient: 'from-emerald-400 to-green-500',
      textColor: 'text-emerald-50',
      icon: 'check',
    };
  }

  if (room.currentOrder.waiterId === currentUserId) {
    return {
      status: 'mine',
      label: formatCurrency(room.currentOrder.totalPrice),
      gradient: 'from-blue-400 to-indigo-500',
      textColor: 'text-blue-50',
      icon: 'user',
    };
  }

  return {
    status: 'occupied',
    label: formatCurrency(room.currentOrder.totalPrice),
    gradient: 'from-amber-400 to-orange-500',
    textColor: 'text-amber-50',
    icon: 'lock',
  };
}

export default function RoomCard({ room, currentUserId, onClick }: RoomCardProps) {
  const { status, label, gradient, textColor, icon } = getStatusInfo(room, currentUserId);

  return (
    <button
      onClick={() => onClick(room)}
      className={clsx(
        'relative w-full rounded-2xl p-4 shadow-lg transition-all duration-200',
        'active:scale-[0.97] active:shadow-md',
        'bg-gradient-to-br',
        gradient,
        status === 'mine' && 'ring-2 ring-blue-300 ring-offset-2'
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 rounded-2xl opacity-10 overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white rounded-full" />
        <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-white rounded-full" />
      </div>

      {/* Content */}
      <div className="relative flex items-start justify-between">
        {/* Left: Icon and name */}
        <div className="flex items-center gap-3">
          <div className={clsx('w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center', textColor)}>
            {icon === 'check' && (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {icon === 'user' && (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
            {icon === 'lock' && (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-white">{room.name}</h3>
            {status === 'occupied' && room.currentOrder?.waiterName && (
              <p className={clsx('text-sm opacity-80', textColor)}>{room.currentOrder.waiterName}</p>
            )}
            {status === 'mine' && <p className={clsx('text-sm opacity-80', textColor)}>Sizning buyurtmangiz</p>}
          </div>
        </div>

        {/* Right: Price/Status */}
        <div className="text-right">
          <span
            className={clsx(
              'inline-block px-3 py-1 rounded-full text-sm font-semibold',
              status === 'empty' && 'bg-white/20 text-white',
              status === 'mine' && 'bg-white text-blue-600',
              status === 'occupied' && 'bg-white/20 text-white'
            )}
          >
            {label}
          </span>
        </div>
      </div>

      {/* Pulse animation for user's own room */}
      {status === 'mine' && (
        <div className="absolute -top-1 -right-1">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
          </span>
        </div>
      )}
    </button>
  );
}
