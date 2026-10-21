import { useCallback, useEffect, useMemo, useState } from "react";
import { LogOut, RefreshCw, UtensilsCrossed, ClipboardList, CheckCircle2, Clock3, XCircle, AlertCircle, CalendarDays, ArrowUpRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getStaffOrders, updateOrderStatus } from "../../api/staff.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { getApiErrorMessage } from "../../utils/apiError.js";
import OrderCard from "../../components/staff/OrderCard.jsx";

const getLocalDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

const columns = [
  { status: "PLACED", label: "New orders", description: "Awaiting your decision", icon: Clock3, accent: "bg-amber-400", iconClass: "text-amber-700", countClass: "bg-amber-100 text-amber-800" },
  { status: "ACCEPTED", label: "In progress", description: "Accepted and being prepared", icon: ClipboardList, accent: "bg-blue-500", iconClass: "text-blue-700", countClass: "bg-blue-100 text-blue-800" },
  { status: "COMPLETED", label: "Completed", description: "Finished today", icon: CheckCircle2, accent: "bg-forest", iconClass: "text-forest", countClass: "bg-forest-pale text-forest" },
  { status: "REJECTED", label: "Rejected", description: "Unable to fulfil", icon: XCircle, accent: "bg-red-400", iconClass: "text-red-700", countClass: "bg-red-100 text-red-800" },
];

const StaffDashboard = () => {
  const { logout, role } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState("");
  const [cardErrors, setCardErrors] = useState({});
  const [busyOrder, setBusyOrder] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const today = useMemo(() => getLocalDate(), []);

  const loadOrders = useCallback(async ({ quiet = false } = {}) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setPageError("");
    try {
      const data = await getStaffOrders({ startDate: today, endDate: today });
      if (!Array.isArray(data)) throw new Error("The orders endpoint returned an unexpected response.");
      setOrders(data);
      setLastUpdated(new Date());
    } catch (error) {
      setPageError(getApiErrorMessage(error, error.message || "Unable to load today's orders."));
      if (error?.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [today, logout, navigate]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleUpdateStatus = async (order, status) => {
    const key = order.orderToken || String(order.id);
    setBusyOrder(key);
    setCardErrors((current) => ({ ...current, [key]: "" }));
    try {
      await updateOrderStatus({ orderToken: order.orderToken, status });
      await loadOrders({ quiet: true });
    } catch (error) {
      setCardErrors((current) => ({
        ...current,
        [key]: getApiErrorMessage(error, "The order could not be updated. Refresh and try again."),
      }));
      if (error?.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
      }
    } finally {
      setBusyOrder(null);
    }
  };

  const counts = useMemo(() => orders.reduce((result, order) => {
    const status = String(order.status || "").toUpperCase();
    result[status] = (result[status] || 0) + 1;
    return result;
  }, {}), [orders]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <Link to="/staff" className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-forest text-white"><UtensilsCrossed size={19} /></span>
            <span className="min-w-0"><span className="block text-sm font-bold tracking-tight">CANTEEN</span><span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Operations</span></span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden rounded-full border border-line bg-canvas px-3 py-1.5 text-xs font-semibold text-muted sm:inline-flex">{role === "ADMIN" ? "Administrator" : "Staff portal"}</span>
            <Link to="/staff/menu" className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-muted transition hover:bg-canvas hover:text-ink md:inline-flex">Menu management <ArrowUpRight size={15} className="ml-1" /></Link>
            <button type="button" onClick={handleLogout} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm font-semibold text-muted transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"><LogOut size={16} /><span className="hidden sm:inline">Sign out</span></button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
        <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-forest"><span className="size-2 rounded-full bg-forest" /> Live service overview</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Order management</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">Keep today’s orders moving from the queue to completion.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white px-3.5 text-sm font-medium text-muted"><CalendarDays size={16} /><span>{new Date(`${today}T12:00:00`).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span></div>
            <button type="button" onClick={() => loadOrders({ quiet: true })} disabled={refreshing || loading} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:border-forest/30 hover:bg-forest-pale disabled:opacity-60"><RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> {refreshing ? "Refreshing…" : "Refresh orders"}</button>
          </div>
        </section>

        <section aria-label="Today's order summary" className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          <SummaryCard label="Orders today" value={orders.length} icon={ClipboardList} note="All returned statuses" />
          <SummaryCard label="Awaiting action" value={counts.PLACED || 0} icon={Clock3} note="Needs staff decision" tone="amber" />
          <SummaryCard label="In progress" value={counts.ACCEPTED || 0} icon={UtensilsCrossed} note="Accepted orders" tone="blue" />
          <SummaryCard label="Rejected" value={counts.REJECTED || 0} icon={XCircle} note="Orders unable to fulfil" tone="neutral" />
        </section>

        {pageError && (
          <div role="alert" className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <div className="flex-1"><p className="font-semibold">Couldn’t load orders</p><p className="mt-1 leading-6">{pageError}</p></div>
            <button type="button" onClick={() => loadOrders()} className="shrink-0 rounded-lg px-3 py-2 font-semibold hover:bg-red-100">Retry</button>
          </div>
        )}

        <section className="mt-9" aria-label="Orders grouped by status">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div><h2 className="text-lg font-semibold tracking-tight">Today’s queue</h2><p className="mt-1 text-sm text-muted">Move each order forward as it is handled.</p></div>
            {lastUpdated && <p className="hidden text-xs text-muted sm:block">Updated {lastUpdated.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</p>}
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((key) => <div key={key} className="h-64 animate-pulse rounded-2xl border border-line bg-white" />)}</div>
          ) : orders.length === 0 && !pageError ? (
            <div className="rounded-3xl border border-dashed border-[#d8ddd3] bg-white px-6 py-14 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-forest-pale text-forest"><ClipboardList size={24} /></span>
              <h3 className="mt-4 text-lg font-semibold">No orders in today’s queue</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">New student orders will appear here when they are placed.</p>
              <button type="button" onClick={() => loadOrders({ quiet: true })} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-dark"><RefreshCw size={15} /> Check again</button>
            </div>
          ) : (
            <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
              {columns.map((column) => {
                const Icon = column.icon;
                const columnOrders = orders.filter((order) => String(order.status || "").toUpperCase() === column.status);
                return (
                  <section key={column.status} className="min-w-0 overflow-hidden rounded-2xl border border-line bg-[#f4f4ef]">
                    <div className="flex items-start gap-3 border-b border-line bg-white px-4 py-4">
                      <span className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl ${column.status === "PLACED" ? "bg-amber-50" : column.status === "ACCEPTED" ? "bg-blue-50" : column.status === "COMPLETED" ? "bg-forest-pale" : "bg-red-50"}`}><Icon size={17} className={column.iconClass} /></span>
                      <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">{column.label}</h3><span className={`inline-flex min-w-6 justify-center rounded-full px-2 py-0.5 text-xs font-bold ${column.countClass}`}>{columnOrders.length}</span></div><p className="mt-1 text-xs leading-5 text-muted">{column.description}</p></div>
                    </div>
                    <div className="space-y-3 p-3">
                      {columnOrders.map((order) => {
                        const key = order.orderToken || String(order.id);
                        return <OrderCard key={key} order={order} onUpdateStatus={handleUpdateStatus} busy={busyOrder === key} error={cardErrors[key]} />;
                      })}
                      {columnOrders.length === 0 && <div className="rounded-xl border border-dashed border-[#d9dcd4] px-3 py-7 text-center text-xs text-muted">No orders here</div>}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </section>
        <footer className="mt-10 flex flex-col gap-2 border-t border-line pt-5 text-xs leading-5 text-muted sm:flex-row sm:items-center sm:justify-between"><span>Order data is loaded for today. Refresh to check for new orders.</span><span>Order actions are validated by the server.</span></footer>
      </main>
    </div>
  );
};

const SummaryCard = ({ label, value, icon: Icon, note, tone = "neutral" }) => {
  const tones = {
    neutral: "bg-canvas text-ink",
    amber: "bg-amber-50 text-amber-800",
    blue: "bg-blue-50 text-blue-800",
    green: "bg-forest-pale text-forest",
  };
  return (
    <article className="rounded-2xl border border-line bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2"><p className="text-xs font-semibold text-muted sm:text-sm">{label}</p><span className={`grid size-8 shrink-0 place-items-center rounded-lg ${tones[tone]}`}><Icon size={16} /></span></div>
      <p className="mt-3 break-words text-2xl font-semibold tracking-tight sm:text-3xl">{value}</p>
      <p className="mt-1.5 text-[11px] leading-4 text-muted sm:text-xs">{note}</p>
    </article>
  );
};

export default StaffDashboard;
