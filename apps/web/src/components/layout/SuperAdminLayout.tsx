import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import clsx from 'clsx';

const navItems = [
  { to: '/super-admin/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/super-admin/restaurants', label: 'Restoranlar', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
];

export default function SuperAdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/super-admin/login');
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <div className="w-64 flex flex-col bg-gray-800">
          <div className="h-16 flex items-center px-6 border-b border-gray-700">
            <span className="text-xl font-bold text-white">Super Admin</span>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  )
                }
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-700">
            <div className="text-sm text-gray-400 mb-2">{user?.name}</div>
            <button
              onClick={handleLogout}
              className="w-full btn bg-gray-700 text-gray-300 hover:bg-gray-600"
            >
              Chiqish
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black/50" onClick={toggleSidebar} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-gray-800 z-50">
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
              <span className="text-lg font-bold text-white">Super Admin</span>
              <button onClick={toggleSidebar} className="p-2 text-gray-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="px-3 py-4 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={toggleSidebar}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium',
                      isActive
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300'
                    )
                  }
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
              <div className="text-sm text-gray-400 mb-2">{user?.name}</div>
              <button
                onClick={handleLogout}
                className="w-full btn bg-gray-700 text-gray-300 hover:bg-gray-600"
              >
                Chiqish
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-4 bg-gray-800 lg:bg-gray-50 border-b border-gray-700 lg:border-gray-200">
          <button className="lg:hidden p-2 text-white" onClick={toggleSidebar}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="lg:hidden text-white font-semibold">Super Admin</span>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-white lg:text-gray-600">{user?.name}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
