import { MAX_PER_ITEM } from '../config.js';
import { money } from '../utils.js';

// Tile colours cycle by category id so each category looks different.
const TINTS = [
  { bg: '#FFE3BD', ink: '#9A5A00' },
  { bg: '#FFF0A8', ink: '#7A6200' },
  { bg: '#DCD3EA', ink: '#4B3A72' },
  { bg: '#F6D5D5', ink: '#8E2E2E' },
  { bg: '#CFF0DC', ink: '#1D6B45' },
];

function Icon({ name, color }) {
  const n = (name || '').toLowerCase();
  const props = {
    viewBox: '0 0 64 64',
    width: 84,
    height: 84,
    fill: 'none',
    stroke: color,
    strokeWidth: 3,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };
  if (n.includes('beverage') || n.includes('drink')) {
    return (
      <svg {...props}>
        <path d="M14 26h32l-4 28H18z" />
        <path d="M46 32h5a6 6 0 0 1 0 12h-7" />
        <path d="M24 18c-2-3 2-4 0-8" />
        <path d="M34 18c-2-3 2-4 0-8" />
      </svg>
    );
  }
  if (n.includes('snack')) {
    return (
      <svg {...props}>
        <path d="M32 10L58 52H6z" />
        <path d="M32 28l9 15" />
      </svg>
    );
  }
  if (n.includes('biscuit')) {
    return (
      <svg {...props}>
        <circle cx="32" cy="32" r="22" />
        <circle cx="24" cy="26" r="2" />
        <circle cx="38" cy="24" r="2" />
        <circle cx="30" cy="40" r="2" />
        <circle cx="42" cy="38" r="2" />
      </svg>
    );
  }
  if (n.includes('chocolate')) {
    return (
      <svg {...props}>
        <rect x="14" y="8" width="36" height="48" rx="4" />
        <path d="M14 24h36M14 40h36M32 8v48" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M8 30h48a24 24 0 0 1-48 0z" />
      <path d="M24 22c-3-4 3-6 0-10" />
      <path d="M36 22c-3-4 3-6 0-10" />
    </svg>
  );
}

export default function MenuCard({ item, qty, isFav, onAdd, onRemove, onToggleFav }) {
  const tint = TINTS[(item.categoryId ?? 0) % TINTS.length];
  const atMax = qty >= MAX_PER_ITEM;

  return (
    <article className="card">
      <div className="card-tile" style={{ background: tint.bg }}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} />
        ) : (
          <Icon name={item.categoryName} color={tint.ink} />
        )}
        <span className="chip">{item.categoryName}</span>
        <button
          className="fav"
          aria-label={isFav ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
          aria-pressed={isFav}
          onClick={onToggleFav}
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill={isFav ? '#D6285A' : 'none'}
            stroke={isFav ? '#D6285A' : '#4B4F57'}
            strokeWidth="2"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 20.5C5.5 16 3 12.7 3 9.5 3 6.9 5 5 7.4 5c1.7 0 3.2.9 4.6 2.8C13.4 5.9 14.9 5 16.6 5 19 5 21 6.9 21 9.5c0 3.2-2.5 6.5-9 11z" />
          </svg>
        </button>
      </div>

      <div className="card-body">
        <div>
          <h3>{item.name}</h3>
          <p>{item.description}</p>
        </div>
        <div className="card-foot">
          <span className="price">{money(item.price)}</span>
          {qty > 0 ? (
            <div className="qty">
              <button aria-label={`Remove one ${item.name}`} onClick={onRemove}>
                −
              </button>
              <span>{qty}</span>
              <button
                aria-label={`Add one more ${item.name}`}
                className={`plus ${atMax ? 'maxed' : ''}`}
                onClick={onAdd}
              >
                +
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={onAdd}>
              Add
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
