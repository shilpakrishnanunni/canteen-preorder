import { Minus, Plus } from "lucide-react";

const QuantityControl = ({ name, quantity, onChange, disabled = false, compact = false }) => (
  <div className={`inline-flex items-center rounded-xl border border-line bg-white p-1 ${disabled ? "opacity-50" : ""}`}>
    <button
      type="button"
      onClick={() => onChange(quantity - 1)}
      disabled={disabled}
      aria-label={`Remove one ${name}`}
      className={`${compact ? "size-8" : "size-9"} grid place-items-center rounded-lg text-ink transition hover:bg-canvas disabled:cursor-not-allowed`}
    >
      <Minus size={15} />
    </button>
    <span className="min-w-8 px-1 text-center text-sm font-semibold tabular-nums text-ink" aria-live="polite">{quantity}</span>
    <button
      type="button"
      onClick={() => onChange(quantity + 1)}
      disabled={disabled}
      aria-label={`Add one ${name}`}
      className={`${compact ? "size-8" : "size-9"} grid place-items-center rounded-lg text-forest transition hover:bg-forest-pale disabled:cursor-not-allowed`}
    >
      <Plus size={15} />
    </button>
  </div>
);

export default QuantityControl;
