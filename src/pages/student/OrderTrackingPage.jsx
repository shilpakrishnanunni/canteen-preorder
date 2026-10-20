import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Clock3, LoaderCircle, RefreshCw, ShoppingBag } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getOrder } from "../../api/orders.js";
import OrderStatusTimeline from "../../components/orders/OrderStatusTimeline.jsx";
import { formatCurrency } from "../../utils/currency.js";
import { getApiErrorMessage } from "../../utils/apiError.js";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(date);
};

const OrderTrackingPage = () => {
  const { orderToken } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadOrder = useCallback(async ({ quiet = false } = {}) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const data = await getOrder(orderToken);
      setOrder(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "We couldn't load this order. Check the reference and try again."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderToken]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const rejected = order?.status === "REJECTED";
  const terminal = order?.status === "COMPLETED" || rejected;

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-line bg-canvas/90">
        <div className="mx-auto flex h-[4.5rem] max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-sm font-extrabold tracking-[0.15em] text-ink">CANTEEN</Link>
          <Link to="/" className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-muted transition hover:bg-white hover:text-ink"><ArrowLeft size={16} /> Menu</Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow text-forest">Order confirmation</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Your order<span className="text-forest">.</span></h1>
          <p className="mt-3 text-sm leading-6 text-muted">Keep this reference handy to check your order status.</p>
        </div>

        {loading && !order ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
            <div className="h-72 animate-pulse rounded-[1.4rem] border border-line bg-white" />
            <div className="h-72 animate-pulse rounded-[1.4rem] border border-line bg-white" />
          </div>
        ) : error && !order ? (
          <section className="mt-8 rounded-[1.4rem] border border-line bg-white p-6 sm:p-8" role="alert">
            <h2 className="font-semibold">Order details unavailable</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{error}</p>
            <button type="button" onClick={() => loadOrder()} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-forest px-4 text-sm font-semibold text-white hover:bg-forest-dark"><RefreshCw size={15} /> Try again</button>
          </section>
        ) : order ? (
          <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-8">
            <div className="space-y-6">
              <section className="overflow-hidden rounded-[1.5rem] border border-line bg-white">
                <div className={`p-5 sm:p-7 ${rejected ? "bg-red-50" : "bg-[#edf3e9]"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Order reference</p>
                      <p className="mt-2 break-all text-xl font-bold tracking-[0.02em] text-ink sm:text-2xl">{order.orderToken || orderToken}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold ${rejected ? "bg-red-100 text-red-800" : order.status === "COMPLETED" ? "bg-forest text-white" : "bg-white text-forest"}`}>{String(order.status || "UNKNOWN").replaceAll("_", " ")}</span>
                  </div>
                  <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-black/10 pt-5">
                    <div>
                      <p className="text-xs text-muted">Order total</p>
                      <p className="mt-1 text-3xl font-bold tracking-tight text-ink">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    <p className="inline-flex items-center gap-1.5 text-xs text-muted"><Clock3 size={14} /> Placed {formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="p-5 sm:p-7">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold tracking-tight">Order status</h2>
                    <button type="button" onClick={() => loadOrder({ quiet: true })} disabled={refreshing} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-line px-3 text-xs font-semibold text-ink transition hover:bg-canvas disabled:opacity-60">
                      <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> {refreshing ? "Refreshing" : "Refresh status"}
                    </button>
                  </div>
                  <OrderStatusTimeline status={order.status} />
                  {error && <p role="status" className="mt-4 text-xs text-amber-800">The latest refresh failed: {error}</p>}
                  {terminal && <p className="mt-5 border-t border-line pt-4 text-xs leading-5 text-muted">Last updated {formatDate(order.updateAt)}.</p>}
                </div>
              </section>
            </div>

            <aside className="rounded-[1.4rem] border border-line bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2"><ShoppingBag size={18} className="text-forest" /><h2 className="text-lg font-semibold tracking-tight">Order summary</h2></div>
              <p className="mt-1 text-xs text-muted">{Array.isArray(order.orderItems) ? order.orderItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) : 0} items</p>
              <div className="mt-5 divide-y divide-line">
                {(Array.isArray(order.orderItems) ? order.orderItems : []).map((item, index) => (
                  <div key={`${item.itemName}-${index}`} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-5 text-ink">{item.itemName}</p>
                      <p className="mt-1 text-xs text-muted">{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums text-ink">{formatCurrency(item.subtotal)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-line pt-4"><span className="text-sm font-semibold">Total</span><span className="text-lg font-bold tabular-nums">{formatCurrency(order.totalAmount)}</span></div>
              <Link to="/" className="mt-5 flex min-h-11 w-full items-center justify-center rounded-xl border border-line px-4 text-sm font-semibold text-ink transition hover:bg-canvas">Back to menu</Link>
            </aside>
          </div>
        ) : null}

        {!loading && !error && order && <p className="mt-6 text-center text-xs text-muted">Status doesn't update automatically yet. Use Refresh status to check for changes.</p>}
      </main>
    </div>
  );
};

export default OrderTrackingPage;
