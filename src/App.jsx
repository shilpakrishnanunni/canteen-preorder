import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

function MenuPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <section className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">
          CANTEEN
        </h1>

        <p className="mt-2 text-slate-600">
          Preorder your food before you arrive.
        </p>

        <button className="mt-6 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700">
          Browse menu
        </button>
      </section>
    </main>
  );
}

function CartPage() {
  return <main className="p-6">Your cart</main>;
}

function CheckoutPage() {
  return <main className="p-6">Checkout</main>;
}

function OrderTrackingPage() {
  return <main className="p-6">Order tracking</main>;
}

function LoginPage() {
  return <main className="p-6">Staff login</main>;
}

function StaffDashboard() {
  return <main className="p-6">Staff dashboard</main>;
}

function MenuManagementPage() {
  return <main className="p-6">Menu management</main>;
}

function AdminDashboard() {
  return <main className="p-6">Admin dashboard</main>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders/:orderToken" element={<OrderTrackingPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/staff/menu" element={<MenuManagementPage />} />

        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}