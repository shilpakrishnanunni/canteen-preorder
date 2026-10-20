import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, LoaderCircle, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getMenuItems } from "../../api/menu.js";
import { createOrder } from "../../api/orders.js";
import CartLineItem from "../../components/cart/CartLineItem.jsx";
import { useCart } from "../../contexts/CartContext.jsx";
import { formatCurrency } from "../../utils/currency.js";
import { getApiErrorMessage } from "../../utils/apiError.js";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, setQuantity, removeItem, clearCart, totalItems, subtotal, unavailableItems, reconcileWithMenu } = useCart();
  const [checkingMenu, setCheckingMenu] = useState(true);
  const [menuCheckError, setMenuCheckError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [notice, setNotice] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    if (items.length === 0) {
      setCheckingMenu(false);
      return () => { active = false; };
    }

    setCheckingMenu(true);
    setMenuCheckError("");
    getMenuItems()
      .then((menuItems) => {
        if (!active) return;
        const result = reconcileWithMenu(menuItems);
        if (result.unavailableIds.length > 0) {
          setNotice("Some items in your cart are no longer available. Remove them before placing your order.");
        } else if (result.priceChanges.length > 0) {
          setNotice("Menu prices have changed. Review the updated total before placing your order.");
        } else {
          setNotice("");
        }
      })
      .catch((error) => {
        if (active) setMenuCheckError(getApiErrorMessage(error, "We couldn't verify current menu prices."));
      })
      .finally(() => { if (active) setCheckingMenu(false); });

    return () => { active = false; };
    // Reconcile once on entry. The submit action performs another check before POSTing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // The retry key deliberately reruns this one-time entry check on demand.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryKey]);

  const handlePlaceOrder = async () => {
    if (submitting || items.length === 0 || unavailableItems.length > 0) return;
    setSubmitting(true);
    setSubmitError("");
    setMenuCheckError("");

    try {
      const currentMenu = await getMenuItems();
      const result = reconcileWithMenu(currentMenu);

      if (result.unavailableIds.length > 0) {
        setNotice("Some items are no longer available. Remove them from your cart before placing the order.");
        setSubmitError("Your cart needs an update before checkout can continue.");
        return;
      }

      if (result.priceChanges.length > 0) {
        setNotice("One or more prices changed. The cart has been updated; review the new total and place the order again.");
        return;
      }

      const response = await createOrder(items);
      if (!response?.orderToken) {
        throw new Error("The server did not return an order reference. Your cart has been kept; check the order status before trying again.");
      }

      clearCart();
      navigate(`/orders/${encodeURIComponent(response.orderToken)}`, {
        state: { initialStatus: response.status },
        replace: true,
      });
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, error?.message || "We couldn't place your order. Your cart has been kept; please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !submitting) {
    return (
      <div className="min-h-screen bg-canvas px-4 py-16 text-ink">
        <section className="mx-auto max-w-lg rounded-[1.5rem] border border-line bg-white p-8 text-center sm:p-10">
          <h1 className="text-2xl font-semibold tracking-tight">Nothing to check out yet</h1>
          <p className="mt-3 text-sm leading-6 text-muted">Add something from the menu before placing an order.</p>
          <Link to="/" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-dark">Browse menu</Link>
        </section>
      </div>
    );
  }

  const blocked = checkingMenu || submitting || unavailableItems.length > 0 || Boolean(menuCheckError);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-line bg-canvas/90">
        <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-sm font-extrabold tracking-[0.15em] text-ink">CANTEEN</Link>
          <Link to="/cart" className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-muted transition hover:bg-white hover:text-ink"><ArrowLeft size={16} /> Back to cart</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow text-forest">Almost there</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Review your order<span className="text-forest">.</span></h1>
          <p className="mt-3 text-sm leading-6 text-muted">Check your items and total. You won't be charged online in this step.</p>
        </div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-10">
          <section className="rounded-[1.4rem] border border-line bg-white px-4 sm:px-6">
            <div className="flex items-center justify-between border-b border-line py-4">
              <h2 className="font-semibold">Order items</h2>
              <Link to="/cart" className="text-xs font-semibold text-forest hover:text-forest-dark">Edit cart</Link>
            </div>
            {items.map((item) => <CartLineItem key={item.menuItemId} item={item} onQuantityChange={setQuantity} onRemove={removeItem} />)}
          </section>

          <aside className="lg:sticky lg:top-6">
            <section className="rounded-[1.4rem] border border-line bg-white p-5 shadow-[0_8px_28px_rgb(32_37_31/4%)] sm:p-6">
              <h2 className="text-lg font-semibold tracking-tight">Order summary</h2>
              <div className="mt-5 flex items-center justify-between text-sm text-muted"><span>Items ({totalItems})</span><span className="font-medium tabular-nums text-ink">{formatCurrency(subtotal)}</span></div>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-4"><span className="font-semibold">Estimated total</span><span className="text-xl font-bold tracking-tight tabular-nums">{formatCurrency(subtotal)}</span></div>
              <p className="mt-2 text-xs leading-5 text-muted">The backend checks availability and calculates the final order total.</p>

              {checkingMenu && <p className="mt-4 flex items-center gap-2 rounded-xl bg-canvas px-3 py-3 text-xs text-muted"><LoaderCircle size={15} className="animate-spin" /> Checking availability and current prices…</p>}
              {menuCheckError && (
                <div role="alert" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-900">
                  <p>{menuCheckError}</p>
                  <button type="button" onClick={() => setRetryKey((value) => value + 1)} className="mt-2 font-bold underline underline-offset-2">Retry menu check</button>
                </div>
              )}
              {notice && !checkingMenu && <div role="status" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-900">{notice}</div>}
              {submitError && <div role="alert" className="mt-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-xs leading-5 text-red-800"><AlertCircle size={15} className="mt-0.5 shrink-0" />{submitError}</div>}

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={blocked}
                className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-forest px-4 text-sm font-semibold text-white transition hover:bg-forest-dark active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#b9c8ba]"
              >
                {submitting ? <><LoaderCircle size={17} className="animate-spin" /> Placing order…</> : "Place order"}
              </button>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] leading-5 text-muted"><ShieldCheck size={14} /> No payment details required</p>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
