import { Routes, Route, Navigate } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout.jsx';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import StaffLayout from '../layouts/StaffLayout.jsx';

import MenuPage from '../features/menu/pages/MenuPage.jsx';
import TrackPage from '../features/orders/pages/TrackPage.jsx';

import StaffLoginPage from '../features/auth/pages/StaffLoginPage.jsx';
import RequireStaffAuth from '../features/auth/components/RequireStaffAuth.jsx';

import StaffDashboardPage from '../features/staff/pages/StaffDashboardPage.jsx';
import OrderManagementPage from '../features/staff/pages/OrderManagementPage.jsx';
import MenuManagementPage from '../features/staff/pages/MenuManagementPage.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<MenuPage />} />
        <Route path="/track/:token" element={<TrackPage />} />
        <Route path="/staff/login" element={<StaffLoginPage />} />
      </Route>

      {/* Customer routes */}
      <Route path="/customer" element={<CustomerLayout />}>
        {/* Customer-specific routes go here */}
      </Route>

      {/* Protected staff routes */}
      <Route element={<RequireStaffAuth />}>
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<StaffDashboardPage />} />
          <Route path="orders" element={<OrderManagementPage />} />
          <Route path="menu" element={<MenuManagementPage />} />
        </Route>
      </Route>

      {/* Unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}