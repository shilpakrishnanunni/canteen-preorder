import { useCart } from '../CartContext.jsx';
import { MAX_PER_ITEM } from '../config.js';
import Modal from './Modal.jsx';

export default function LimitModal() {
  const { limitItem, closeLimit } = useCart();
  if (!limitItem) return null;

  return (
    <Modal titleId="limit-title" onClose={closeLimit}>
      <div className="modal-icon warn" aria-hidden="true">!</div>
      <h2 id="limit-title">Limit reached</h2>
      <p>
        You can order a maximum of {MAX_PER_ITEM} of each item. <b>{limitItem.name}</b> is already
        at {MAX_PER_ITEM} in your cart.
      </p>
      <button className="btn btn-primary btn-block" onClick={closeLimit}>
        Got it
      </button>
    </Modal>
  );
}
