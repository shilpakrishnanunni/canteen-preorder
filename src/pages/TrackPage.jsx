import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrder } from '../api.js';
import { FINAL_STATUSES, POLL_MS, STATUS_FLOW } from '../config.js';
import { formatClock, formatTime, loadOrder, money, saveOrder } from '../utils.js';

export default function TrackPage() {
  const { token } = useParams();
  const [order, setOrder] = useState(() => loadOrder(token));
  const [status, setStatus] = useState(() => loadOrder(token)?.status ?? null);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const orderRef = useRef(order);

  // Poll GET /api/orders/{token} until the order reaches a final status.
  useEffect(() => {
    let stopped = false;
    let timer;
    const cachedOrder = loadOrder(token);
    orderRef.current = cachedOrder;
    setOrder(cachedOrder);
    setStatus(cachedOrder?.status ?? null);
    setError('');
    setNotFound(false);

    async function poll() {
      try {
        const res = await getOrder(token);
        if (stopped) return;
        setError('');
        setStatus(res.status);

        // Record the time each new status was first seen on this device.
        const base = orderRef.current ?? {
          orderToken: res.orderToken,
          placedAt: new Date().toISOString(),
          lines: [],
          total: 0,
          history: [],
        };
        const last = base.history[base.history.length - 1];
        if (!last || last.status !== res.status) {
          const next = {
            ...base,
            status: res.status,
            history: [...base.history, { status: res.status, at: new Date().toISOString() }],
          };
          orderRef.current = next;
          saveOrder(next);
          setOrder(next);
        }

        if (!FINAL_STATUSES.includes(res.status)) timer = setTimeout(poll, POLL_MS);
      } catch (e) {
        if (stopped) return;
        if (e.status === 404 || e.message === 'Order not found') {
          setError('');
          setNotFound(true);
          return;
        }
        setError(e.message || 'Could not refresh the status.');
        timer = setTimeout(poll, POLL_MS);
      }
    }

    poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [token]);

  const stage = STATUS_FLOW.findIndex((s) => s.key === status);
  const cancelled = status === 'CANCELLED';
  const rejected = status === 'REJECTED';
  const unsuccessful = cancelled || rejected;
  const finished = stage === STATUS_FLOW.length - 1;
  const ready = status === 'READY' || finished;
  const current = stage >= 0 ? STATUS_FLOW[stage] : null;
  const pct = stage >= 0 ? Math.round(((stage + 1) / STATUS_FLOW.length) * 100) : 0;

  const timeFor = (key) => {
    const h = order?.history?.find((x) => x.status === key);
    return h ? formatClock(h.at) : '';
  };

  return (
    <main className="page narrow">
      <div className="track-top">
        <div className="row">
          <Link to="/" className="btn btn-outline">
            ← Back to menu
          </Link>
          <h2>Track your order</h2>
        </div>
        <span className="token-pill">Token {token}</span>
      </div>

      {error && !notFound && (
        <p className="error" role="alert">
          Could not refresh the status ({error}). Trying again…
        </p>
      )}

      <div className="track-layout">
        <section className="panel">
          {notFound ? (
            <div className="state error-box" role="alert">
              <p>No order was found for token {token}. Check the token and try again.</p>
              <Link to="/" className="btn btn-outline">Back to menu</Link>
            </div>
          ) : status === null ? (
            <p className="state">Loading order…</p>
          ) : (
            <div className={`banner ${unsuccessful ? 'bad' : ready ? 'good' : ''}`}>
              <small>Current status</small>
              <strong>
                {cancelled
                  ? 'Order cancelled'
                  : rejected
                  ? 'Order rejected'
                  : current
                  ? current.banner
                  : status}
              </strong>
              <span>
                {cancelled
                  ? 'This order was cancelled. Nothing to pay.'
                  : rejected
                  ? 'The kitchen could not accept this order. Please contact the counter.'
                  : current
                  ? current.sub
                  : 'Status updates will appear here.'}
              </span>
              {!unsuccessful && (
                <div className="bar">
                  <div style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>
          )}

          {!unsuccessful && status !== null && (
            <ol className="timeline">
              {STATUS_FLOW.map((s, i) => {
                const done = i < stage || (i === stage && finished);
                const now = i === stage && !finished;
                const reached = i <= stage;
                return (
                  <li key={s.key} className={done ? 'done' : now ? 'now' : ''}>
                    <div className="dot">{done ? '✓' : i + 1}</div>
                    <div className="tl-body">
                      <div>
                        <strong>{s.title}</strong>
                        <p>{s.desc}</p>
                      </div>
                      <div className="tl-meta">
                        <span className={`state-pill ${done ? 'done' : now ? 'now' : ''}`}>
                          {done ? 'Done' : now ? 'In progress' : 'Pending'}
                        </span>
                        <small>{reached ? timeFor(s.key) : ''}</small>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          <p className="muted">
            Status refreshes automatically every {POLL_MS / 1000} seconds. Times show when this
            device first saw each status.
          </p>
        </section>

        <aside className="side">
          <div className="panel">
            <div className="token-box">
              <span>Show this token at the counter</span>
              <strong>{token}</strong>
            </div>
            <dl className="facts">
              <div>
                <dt>Placed at</dt>
                <dd>{order?.placedAt ? formatTime(order.placedAt) : '—'}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{status ?? '—'}</dd>
              </div>
              <div>
                <dt>Payment</dt>
                <dd>Pay at counter</dd>
              </div>
            </dl>
          </div>

          <div className="panel">
            <h3>Order details</h3>
            {order?.lines?.length ? (
              <>
                <ul className="detail-lines">
                  {order.lines.map((l) => (
                    <li key={l.name}>
                      <span>
                        {l.qty} × {l.name}
                      </span>
                      <b>{money(l.price * l.qty)}</b>
                    </li>
                  ))}
                </ul>
                <div className="total-row">
                  <span>Total to pay</span>
                  <strong>{money(order.total)}</strong>
                </div>
              </>
            ) : (
              <p className="muted">
                Item details are only stored on the device that placed the order.
              </p>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
