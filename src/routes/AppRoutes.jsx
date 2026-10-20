import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MenuPage from "../pages/MenuPage.jsx";

const PlaceholderPage = ({ title, description }) => (
  <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
    <p className="eyebrow">CANTEEN</p>
    <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">{title}</h1>
    <p className="mt-3 max-w-xl text-base leading-7 text-muted">{description}</p>
    <a href="/" className="mt-8 inline-flex w-fit items-center rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-dark">Back to menu</a>
  </main>
);

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<MenuPage />} />
      <Route path="/cart" element={<PlaceholderPage title="Your cart" description="The cart page will be implemented next. Your selections are already saved in this browser." />} />
      <Route path="/checkout" element={<PlaceholderPage title="Checkout" description="Checkout and order submission will be implemented next." />} />
      <Route path="/orders/:orderToken" element={<PlaceholderPage title="Track your order" description="Order confirmation and live status details will be implemented next." />} />
      <Route path="/login" element={<PlaceholderPage title="Staff sign in" description="Staff and admin authentication will be implemented after the student ordering flow." />} />
      <Route path="/staff" element={<PlaceholderPage title="Staff dashboard" description="Staff order management will be implemented in a later stage." />} />
      <Route path="/staff/menu" element={<PlaceholderPage title="Menu management" description="Staff menu management will be implemented in a later stage." />} />
      <Route path="/admin" element={<PlaceholderPage title="Admin dashboard" description="Admin tools will be implemented when their API contracts are available." />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
