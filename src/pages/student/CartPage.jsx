import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import CartLineItem from "../../components/cart/CartLineItem.jsx";
import OrderTotals from "../../components/cart/OrderTotals.jsx";
import { useCart } from "../../contexts/CartContext.jsx";
import { formatCurrency } from "../../utils/currency.js";

const CartPage = () => {
  const { items, setQuantity, removeItem, totalItems, subtotal, unavailableItems } = useCart();

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-line bg-canvas/90">
        <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-sm font-extrabold tracking-[0.15em] text-ink">CANTEEN</Link>
          <Link to="/" className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-muted transition hover:bg-white hover:text-ink">
            <ArrowLeft size={16} /> Continue browsing
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow text-forest">Your selection</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Your cart<span className="text-forest">.</span></h1>
          <p className="mt-3 text-sm leading-6 text-muted">Check your items and quantities before placing your order.</p>
        </div>

        {items.length === 0 ? (
          <section className="mx-auto mt-12 flex max-w-lg flex-col items-center rounded-[1.5rem] border border-line bg-white px-6 py-12 text-center sm:mt-16">
            <span className="grid size-16 place-items-center rounded-2xl bg-forest-pale text-forest"><ShoppingBag size={27} strokeWidth={1.5} /></span>
            <h2 className="mt-5 text-xl font-semibold tracking-tight">Your cart is taking a break</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted">Browse the menu and add something to eat. Your selections will appear here.</p>
            <Link to="/" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-forest px-5 text-sm font-semibold text-white transition hover:bg-forest-dark">Browse the menu</Link>
          </section>
        ) : (
          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-10">
            <section className="min-w-0 rounded-[1.4rem] border border-line bg-white px-4 sm:px-6">
              <div className="flex items-center justify-between gap-4 border-b border-line py-4">
                <h2 className="font-semibold text-ink">Items in your order</h2>
                <span className="text-xs font-medium text-muted">{totalItems} {totalItems === 1 ? "item" : "items"}</span>
              </div>
              {unavailableItems.length > 0 && (
                <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-800">
                  {unavailableItems.length === 1 ? "One item is no longer available." : `${unavailableItems.length} items are no longer available.`} Remove {unavailableItems.length === 1 ? "it" : "them"} before checkout.
                </div>
              )}
              <div>
                {items.map((item) => (
                  <CartLineItem key={item.menuItemId} item={item} onQuantityChange={setQuantity} onRemove={removeItem} />
                ))}
              </div>
              <div className="border-t border-line py-4">
                <Link to="/" className="inline-flex min-h-9 items-center gap-2 text-sm font-semibold text-forest transition hover:text-forest-dark">
                  <ArrowLeft size={15} /> Add more items
                </Link>
              </div>
            </section>

            <div className="lg:sticky lg:top-6">
              <OrderTotals
                subtotal={subtotal}
                totalItems={totalItems}
                disabled={items.length === 0 || unavailableItems.length > 0}
                note={unavailableItems.length > 0 ? "Remove unavailable items to continue." : "Prices are checked again before your order is submitted."}
              />
              <p className="mt-3 px-2 text-center text-xs leading-5 text-muted">Estimated total: {formatCurrency(subtotal)}. The backend confirms the final amount.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;
