import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../api.js';
import { useCart } from '../CartContext.jsx';
import Cart from '../components/Cart.jsx';
import CategoryTabs from '../components/CategoryTabs.jsx';
import MenuCard from '../components/MenuCard.jsx';
import OrderPlacedModal from '../components/OrderPlacedModal.jsx';
import useMenu from '../hooks/useMenu.js';
import { itemKey, saveOrder } from '../utils.js';

export default function MenuPage() {
  const navigate = useNavigate();
  const { categories, menu, loading, error, reload } = useMenu();
  const { cart, lines, total, add, remove, clear, favorites, toggleFavorite, setLastToken } =
    useCart();

  const [active, setActive] = useState('all');
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [placed, setPlaced] = useState(null);

  const visible = useMemo(() => {
    if (active === 'all') return menu;
    if (active === 'fav') return menu.filter((m) => favorites[itemKey(m)]);
    return menu.filter((m) => m.categoryId === active);
  }, [menu, active, favorites]);

  const favCount = menu.filter((m) => favorites[itemKey(m)]).length;

  async function handlePlace() {
    setOrderError('');

    // POST /api/orders needs menuItemId, so the menu API must return `id`.
    if (lines.some((l) => l.item.id == null)) {
      setOrderError(
        'The menu API does not return an "id" for each item, so the order cannot be sent. Add "id" to the menu response.'
      );
      return;
    }

    setPlacing(true);
    try {
      const res = await createOrder(
        lines.map((l) => ({ menuItemId: l.item.id, quantity: l.qty }))
      );
      const now = new Date().toISOString();
      const order = {
        orderToken: res.orderToken,
        status: res.status,
        placedAt: now,
        lines: lines.map((l) => ({ name: l.item.name, qty: l.qty, price: l.item.price })),
        total,
        history: [{ status: res.status, at: now }],
      };
      saveOrder(order);
      setLastToken(order.orderToken);
      clear();
      setPlaced(order);
    } catch (e) {
      setOrderError(e.message || 'Could not place the order. Please try again.');
    } finally {
      setPlacing(false);
    }
  }

  return (
    <main className="page">
      <section className="hero">
        <div>
          <span className="pill">
            <i /> Pre-order and skip the queue
          </span>
          <h1>
            Order ahead.
            <br />
            Pick up hot.
          </h1>
          <p>Choose your food, get a token and collect it at the counter when it is ready.</p>
        </div>
        <ol className="steps-mini">
          <li>
            <b>1</b>Pick your food
          </li>
          <li>
            <b>2</b>Place order, get token
          </li>
          <li>
            <b>3</b>Collect at the counter
          </li>
        </ol>
      </section>

      <div className="layout">
        <section className="menu">
          <div>
            <h2>Today's menu</h2>
            <p className="muted">Up to 5 of each item per order.</p>
          </div>

          <CategoryTabs
            categories={categories}
            active={active}
            onChange={setActive}
            favCount={favCount}
          />

          {loading && <p className="state">Loading menu…</p>}

          {error && (
            <div className="state error-box" role="alert">
              <p>Could not load the menu. Is the backend running on port 8080?</p>
              <small>{error}</small>
              <button className="btn btn-primary" onClick={reload}>
                Try again
              </button>
            </div>
          )}

          {!loading && !error && visible.length === 0 && (
            <p className="state">
              {active === 'fav'
                ? 'No favorites yet. Tap the heart on any dish to save it here.'
                : 'No items in this category.'}
            </p>
          )}

          <div className="grid">
            {visible.map((item) => {
              const key = itemKey(item);
              return (
                <MenuCard
                  key={key}
                  item={item}
                  qty={cart[key]?.qty ?? 0}
                  isFav={!!favorites[key]}
                  onAdd={() => add(item)}
                  onRemove={() => remove(item)}
                  onToggleFav={() => toggleFavorite(item)}
                />
              );
            })}
          </div>
        </section>

        <Cart onPlace={handlePlace} placing={placing} error={orderError} />
      </div>

      {placed && (
        <OrderPlacedModal
          order={placed}
          onClose={() => setPlaced(null)}
          onTrack={() => navigate(`/track/${placed.orderToken}`)}
        />
      )}
    </main>
  );
}
