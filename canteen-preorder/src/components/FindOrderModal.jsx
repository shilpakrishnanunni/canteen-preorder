import { useState } from 'react';
import Modal from './Modal.jsx';

export default function FindOrderModal({ onTrack, onClose }) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  function submit(event) {
    event.preventDefault();
    const value = token.trim();
    if (!value) {
      setError('Enter the order token to continue.');
      return;
    }
    onTrack(value);
  }

  return (
    <Modal titleId="find-order-title" onClose={onClose}>
      <h2 id="find-order-title">Find your order</h2>
      <p>Enter the order token you received when you placed your order.</p>
      <form className="find-order-form" onSubmit={submit}>
        <label htmlFor="order-token">Order token</label>
        <input
          id="order-token"
          name="orderToken"
          type="text"
          autoComplete="off"
          autoFocus
          placeholder="e.g. GHI123"
          value={token}
          onChange={(event) => {
            setToken(event.target.value);
            setError('');
          }}
        />
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn btn-primary btn-block" type="submit">
          Track order
        </button>
        <button className="btn btn-outline btn-block" type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </Modal>
  );
}
