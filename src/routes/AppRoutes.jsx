import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MenuPage from "../pages/MenuPage.jsx";
import CartPage from "../pages/student/CartPage.jsx";
import CheckoutPage from "../pages/student/CheckoutPage.jsx";
import OrderTrackingPage from "../pages/student/OrderTrackingPage.jsx";
import TrackOrderPage from "../pages/student/TrackOrderPage.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";
import StaffDashboard from "../pages/staff/StaffDashboard.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

const PlaceholderPage = ({ title, description }) => (
  <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
    <p className="eyebrow">CANTEEN</p>
    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">{title}</h1>
    <p className="mt-3 max-w-xl text-base leading-7 text-muted">{description}</p>
    <a href="/" className="mt-8 inline-flex w-fit items-center rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-dark">Back to menu</a>
  </main>
);

const AdminLanding = () => {
  const { logout } = useAuth();
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="eyebrow text-forest">CANTEEN · ADMIN</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">Administrator access confirmed</h1>
      <p className="mt-3 max-w-xl text-base leading-7 text-muted">The admin APIs for sales statistics, order history, and staff approval have been deferred. This protected page confirms the administrator login while those features are pending.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a href="/" className="inline-flex w-fit items-center rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-canvas">Back to menu</a>
        <button type="button" onClick={() => { logout(); window.location.assign("/login"); }} className="inline-flex w-fit items-center rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-dark">Sign out</button>
      </div>
    </main>
  );
};

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<MenuPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/track-order" element={<TrackOrderPage />} />
      <Route path="/orders/:orderToken" element={<OrderTrackingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/staff" element={
        <ProtectedRoute allowedRoles={["STAFF"]}>
          <StaffDashboard />
        </ProtectedRoute>
      } />
      <Route path="/staff/menu" element={
        <ProtectedRoute allowedRoles={["STAFF"]}>
          <PlaceholderPage title="Menu management" description="Menu management is the next staff feature to implement." />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
          <AdminLanding />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
