import { Check, Clock3, IndianRupee, LoaderCircle, X } from "lucide-react";
import { formatCurrency } from "../../utils/currency.js";

const formatTime = (value) => {
  if (!value) return "Time unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Time unavailable"
    : date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const statusStyles = {
  PLACED: "bg-amber-50 text-amber-800 ring-amber-200",
  ACCEPTED: "bg-blue-50 text-blue-800 ring-blue-200",
  COMPLETED: "bg-forest-pale text-forest ring-green-200",
  REJECTED: "bg-red-50 text-red-800 ring-red-200",
};

const OrderCard = ({ order, onUpdateStatus, busy, error }) => {
  const status = String(order.status || "PLACED").toUpperCase();
  const items = Array.isArray(order.items) ? order.items : [];
  const itemCount = items.reduce((total, item) => total + Number(item.quantity || 0), 0);

  return (
    <article className="rounded-2xl border border-line bg-white p-4 shadow-[0_2px_10px_rgba(32,37,31,0.025)] transition hover:border-[#d7dfd5] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Order reference</p>
          <h3 className="mt-1 break-all text-lg font-semibold tracking-tight text-ink">#{order.orderToken || order.id}</h3>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ring-1 ring-inset ${statusStyles[status] || "bg-slate-50 text-slate-700 ring-slate-200"}`}>{status}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5"><Clock3 size={13} /> {formatTime(order.createdAt)}</span>
        <span>{itemCount} {itemCount === 1 ? "item" : "items"}</span>
      </div>

      <div className="my-4 border-t border-dashed border-line" />

      <ul className="space-y-2.5">
        {items.map((item, index) => (
          <li key={`${item.name}-${index}`} className="flex items-start justify-between gap-3 text-sm">
            <span className="min-w-0 leading-5 text-ink"><span className="mr-2 inline-flex min-w-6 items-center justify-center rounded-md bg-canvas px-1.5 py-0.5 text-xs font-semibold text-muted">{item.quantity}×</span>{item.name}</span>
            <span className="shrink-0 pt-0.5 text-muted">{formatCurrency(Number(item.unitPrice || 0) * Number(item.quantity || 0))}</span>
          </li>
        ))}
        {items.length === 0 && <li className="text-sm text-muted">No item details were returned.</li>}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <span className="text-sm font-medium text-muted">Order total</span>
        <span className="inline-flex items-center gap-0.5 text-lg font-bold tracking-tight text-ink"><IndianRupee size={16} />{Number(order.totalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>

      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs leading-5 text-red-800">{error}</p>}

      {status === "PLACED" && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" disabled={busy} onClick={() => onUpdateStatus(order, "ACCEPTED")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-forest px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-dark disabled:opacity-60">
            {busy ? <LoaderCircle size={16} className="animate-spin" /> : <Check size={16} />} Accept
          </button>
          <button type="button" disabled={busy} onClick={() => onUpdateStatus(order, "REJECTED")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-muted transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-60">
            {busy ? <LoaderCircle size={16} className="animate-spin" /> : <X size={16} />} Reject
          </button>
        </div>
      )}
      {status === "ACCEPTED" && (
        <button type="button" disabled={busy} onClick={() => onUpdateStatus(order, "COMPLETED")} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-forest px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-dark disabled:opacity-60">
          {busy ? <LoaderCircle size={16} className="animate-spin" /> : <Check size={16} />} Mark completed
        </button>
      )}
    </article>
  );
};

export default OrderCard;
