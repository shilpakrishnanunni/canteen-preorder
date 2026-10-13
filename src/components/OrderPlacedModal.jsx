import { money } from '../utils.js';
import Modal from './Modal.jsx';

export default function OrderPlacedModal({ order, onTrack, onClose }) {
  return (
    <Modal titleId="placed-title" onClose={onClose}>
      <div className="modal-icon ok" aria-hidden="true">✓</div>
      <h2 id="placed-title">Order placed!</h2>
      <p>Your order has been sent to the kitchen. Keep this token ready.</p>
      <div className="token-box">
        <span>Your order token</span>
        <strong>{order.orderToken}</strong>
      </div>
      <p className="muted">Pay {money(order.total)} at the counter.</p>
      <div className="stack">
        <button className="btn btn-primary btn-block" onClick={onTrack}>
          Track order
        </button>
        <button className="btn btn-outline btn-block" onClick={onClose}>
          Back to menu
        </button>
      </div>
    </Modal>
  );
}
