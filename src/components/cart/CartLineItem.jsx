import { ImageOff, Trash2, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "../../utils/currency.js";
import QuantityControl from "./QuantityControl.jsx";

const CartLineItem = ({ item, onQuantityChange, onRemove }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const unavailable = item.available === false;
  const imageUrl = item.imageUrl?.trim();

  return (
    <article className={`flex gap-4 border-b border-line py-5 last:border-b-0 sm:gap-5 ${unavailable ? "opacity-80" : ""}`}>
      <div className="grid size-[5.5rem] shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#e9eee5] sm:size-24">
        {imageUrl && !imageFailed ? (
          <img src={imageUrl} alt={item.name} loading="lazy" onError={() => setImageFailed(true)} className="h-full w-full object-cover" />
        ) : (
          <span className="text-forest/55" aria-hidden="true">{imageFailed ? <ImageOff size={23} /> : <UtensilsCrossed size={25} strokeWidth={1.4} />}</span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0">
          {item.categoryName && <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{item.categoryName}</p>}
          <h3 className="truncate text-sm font-semibold text-ink sm:text-base">{item.name}</h3>
          <p className="mt-1 text-sm text-muted">{formatCurrency(item.price)} <span className="text-muted/70">each</span></p>
          {unavailable && <p className="mt-2 text-xs font-semibold text-red-700">Currently unavailable. Remove this item to continue.</p>}
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-5">
          <QuantityControl
            name={item.name}
            quantity={item.quantity}
            onChange={(quantity) => onQuantityChange(item.menuItemId, quantity)}
            disabled={unavailable}
            compact
          />
          <div className="min-w-[4.5rem] text-right">
            <p className="text-sm font-bold tabular-nums text-ink">{formatCurrency(item.price * item.quantity)}</p>
            <button type="button" onClick={() => onRemove(item.menuItemId)} className="mt-1 inline-flex min-h-8 items-center gap-1 text-xs font-medium text-muted transition hover:text-red-700">
              <Trash2 size={13} /> Remove
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default CartLineItem;
