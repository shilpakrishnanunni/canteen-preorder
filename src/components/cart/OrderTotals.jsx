import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/currency.js";

const OrderTotals = ({ subtotal, totalItems, actionLabel = "Continue to checkout", actionTo = "/checkout", disabled = false, note = "Prices are confirmed by the canteen when your order is placed." }) => (
  <section className="rounded-[1.4rem] border border-line bg-white p-5 shadow-[0_8px_28px_rgb(32_37_31/4%)] sm:p-6">
    <h2 className="text-lg font-semibold tracking-tight text-ink">Order summary</h2>
    <div className="mt-5 flex items-center justify-between text-sm text-muted">
      <span>Items ({totalItems})</span>
      <span className="font-medium tabular-nums text-ink">{formatCurrency(subtotal)}</span>
    </div>
    <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
      <span className="font-semibold text-ink">Estimated total</span>
      <span className="text-xl font-bold tracking-tight tabular-nums text-ink">{formatCurrency(subtotal)}</span>
    </div>
    <p className="mt-2 text-xs leading-5 text-muted">{note}</p>
    <Link
      to={actionTo}
      aria-disabled={disabled}
      onClick={(event) => { if (disabled) event.preventDefault(); }}
      className={`mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${disabled ? "cursor-not-allowed bg-[#e8e9e4] text-muted" : "bg-forest text-white hover:bg-forest-dark active:scale-[0.99]"}`}
    >
      {actionLabel} <ArrowRight size={17} />
    </Link>
    <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted"><ShieldCheck size={14} /> No payment is collected in this step</p>
  </section>
);

export default OrderTotals;
