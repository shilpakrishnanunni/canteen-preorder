import { useCart } from '../CartContext.jsx';
import { money } from '../utils.js';

export default function Cart({ onPlace, placing, error }) {
  const { lines, count, total, add, remove } = useCart();

  return (
    <aside className="cart">
      <div className="cart-head">
        <h2>Your order</h2>
        <span>
          {count} {count === 1 ? 'item' : 'items'}
        </span>
      </div>

      {lines.length === 0 ? (
        <p className="cart-empty">Your cart is empty. Add something tasty from the menu.</p>
      ) : (
        <ul className="cart-lines">
          {lines.map(({ item, qty }) => (
            <li key={item.id ?? `${item.categoryId}:${item.name}`}>
              <div className="cart-info">
                <strong>{item.name}</strong>
                <small>{money(item.price)} each</small>
                <div className="qty small">
                  <button aria-label={`Remove one ${item.name}`} onClick={() => remove(item)}>
                    −
                  </button>
                  <span>{qty}</span>
                  <button aria-label={`Add one more ${item.name}`} onClick={() => add(item)}>
                    +
                  </button>
                </div>
              </div>
              <span className="line-total">{money(item.price * qty)}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="totals">
        <div className="total-row">
          <span>Total</span>
          <strong>{money(total)}</strong>
        </div>
      </div>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <button className="btn btn-primary btn-lg btn-block" disabled={count === 0 || placing} onClick={onPlace}>
        {placing ? 'Placing order…' : 'Place order'}
      </button>
      <p className="muted center">Pay at the counter when you collect.</p>
    </aside>
  );
}
