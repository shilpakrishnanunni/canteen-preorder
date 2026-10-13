import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext.jsx';
import FindOrderModal from './FindOrderModal.jsx';

export default function Header() {
  const { lastToken } = useCart();
  const [findingOrder, setFindingOrder] = useState(false);
  const navigate = useNavigate();

  function trackOrder(token) {
    setFindingOrder(false);
    navigate(`/track/${encodeURIComponent(token)}`);
  }

  return (
    <header className="header">
      <Link to="/" className="brand">
        <span className="brand-logo">CC</span>
        <span className="brand-text">
          <strong>Campus Canteen</strong>
          <small>Pre-order and skip the queue</small>
        </span>
      </Link>
      <div className="header-right">
        <button
          type="button"
          className="btn btn-outline-light"
          onClick={() => setFindingOrder(true)}
        >
          Find your order
        </button>
        {lastToken && (
          <Link to={`/track/${encodeURIComponent(lastToken)}`} className="btn btn-outline-light">
            Track order · {lastToken}
          </Link>
        )}
      </div>
      {findingOrder && (
        <FindOrderModal
          onTrack={trackOrder}
          onClose={() => setFindingOrder(false)}
        />
      )}
    </header>
  );
}
