import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import WaiterLoginPage from './pages/auth/WaiterLoginPage';
import SuperAdminLoginPage from './pages/auth/SuperAdminLoginPage';

// Waiter pages
import WaiterLayout from './components/layout/WaiterLayout';
import RoomSelectionPage from './pages/waiter/RoomSelectionPage';
import OrderPage from './pages/waiter/OrderPage';
import MyStatsPage from './pages/waiter/MyStatsPage';

// Admin pages
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import MenuPage from './pages/admin/MenuPage';
import RoomsPage from './pages/admin/RoomsPage';
import WaitersPage from './pages/admin/WaitersPage';
import OrdersPage from './pages/admin/OrdersPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import SettingsPage from './pages/admin/SettingsPage';

// Super admin pages
import SuperAdminLayout from './components/layout/SuperAdminLayout';
import SuperDashboardPage from './pages/super-admin/DashboardPage';
import RestaurantsPage from './pages/super-admin/RestaurantsPage';
import RestaurantDetailPage from './pages/super-admin/RestaurantDetailPage';
import CreateRestaurantPage from './pages/super-admin/CreateRestaurantPage';

function ProtectedRoute({
  children,
  roles,
  loginPath = '/login',
}: {
  children: React.ReactNode;
  roles: string[];
  loginPath?: string;
}) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace />;
  }

  if (!roles.includes(user?.role || '')) {
    // Redirect based on role
    if (user?.role === 'waiter') {
      return <Navigate to="/waiter/rooms" replace />;
    }
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user?.role === 'superAdmin') {
      return <Navigate to="/super-admin/dashboard" replace />;
    }
    return <Navigate to={loginPath} replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/waiter/login" element={<WaiterLoginPage />} />
      <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />

      {/* Waiter routes */}
      <Route
        path="/waiter"
        element={
          <ProtectedRoute roles={['waiter']}>
            <WaiterLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="rooms" replace />} />
        <Route path="rooms" element={<RoomSelectionPage />} />
        <Route path="rooms/:roomId" element={<OrderPage />} />
        <Route path="stats" element={<MyStatsPage />} />
      </Route>

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="waiters" element={<WaitersPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Super admin routes */}
      <Route
        path="/super-admin"
        element={
          <ProtectedRoute roles={['superAdmin']} loginPath="/super-admin/login">
            <SuperAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SuperDashboardPage />} />
        <Route path="restaurants" element={<RestaurantsPage />} />
        <Route path="restaurants/new" element={<CreateRestaurantPage />} />
        <Route path="restaurants/:id" element={<RestaurantDetailPage />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
