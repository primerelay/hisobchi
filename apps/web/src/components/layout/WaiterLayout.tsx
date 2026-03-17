import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { useSyncStatus } from '../../hooks/useSyncStatus';
import clsx from 'clsx';

export default function WaiterLayout() {
  const { user, logout } = useAuthStore();
  const { isOnline, isSyncing } = useUIStore();
  const { pendingCount } = useSyncStatus();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/waiter/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 safe-top">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isOnline && (
              <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                Offline
              </span>
            )}
            {isSyncing && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full flex items-center gap-1">
                <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Syncing
              </span>
            )}
            {!isSyncing && pendingCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                {pendingCount} pending
              </span>
            )}
            <span className="font-semibold text-gray-900">OshxonaPOS</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user?.name}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="bg-white border-t border-gray-200 safe-bottom">
        <div className="flex">
          <NavLink
            to="/waiter/rooms"
            className={({ isActive }) =>
              clsx(
                'flex-1 flex flex-col items-center py-3 text-xs font-medium',
                isActive ? 'text-primary-600' : 'text-gray-500'
              )
            }
          >
            <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Xonalar
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex-1 flex flex-col items-center py-3 text-xs font-medium text-gray-500"
          >
            <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Chiqish
          </button>
        </div>
      </nav>
    </div>
  );
}
