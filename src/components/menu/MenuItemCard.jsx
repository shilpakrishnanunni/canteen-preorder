import { useState } from "react";
import { Check, Minus, Plus, UtensilsCrossed } from "lucide-react";
import { useCart } from "../../contexts/CartContext.jsx";
import { formatCurrency } from "../../utils/currency.js";

const placeholderTones = ["from-[#f4ead8] to-[#e8d6b8]", "from-[#e5eee3] to-[#cbdcc9]", "from-[#f2e3dc] to-[#e8cfc1]", "from-[#e8e8f0] to-[#d2d3e2]"];

const MenuItemCard = ({ item, index = 0 }) => {
  const { addItem, setQuantity, getQuantity } = useCart();
  const [imageFailed, setImageFailed] = useState(false);
  const quantity = getQuantity(item.id);
  const imageUrl = item.imageUrl?.trim();

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-[1.35rem] border border-[#eeede7] bg-white transition duration-300 hover:-translate-y-0.5 hover:border-[#d9e4d8] hover:shadow-[0_14px_38px_rgb(32_37_31/7%)]">
      <div className={`relative aspect-[1.55/1] overflow-hidden bg-gradient-to-br ${placeholderTones[index % placeholderTones.length]}`}>
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt={item.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink/45">
            <span className="grid size-14 place-items-center rounded-2xl border border-white/60 bg-white/45 shadow-sm backdrop-blur-sm">
              <UtensilsCrossed size={25} strokeWidth={1.35} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Made fresh</span>
          </div>
        )}
        {item.categoryName && (
          <span className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] truncate rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[10px] font-bold tracking-wide text-ink/75 shadow-sm backdrop-blur">
            {item.categoryName}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="min-h-[3.5rem]">
          <h3 className="line-clamp-1 text-[15px] font-semibold tracking-[-0.025em] text-ink sm:text-base" title={item.name}>{item.name}</h3>
          <p className="mt-1.5 line-clamp-2 min-h-10 text-xs leading-5 text-muted sm:text-[13px]">{item.description || "A canteen favourite, ready to enjoy."}</p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#f0efe9] pt-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-muted/80">Price</p>
            <p className="mt-0.5 text-base font-bold tracking-tight text-ink">{formatCurrency(item.price)}</p>
          </div>

          {quantity === 0 ? (
            <button
              type="button"
              onClick={() => addItem(item)}
              aria-label={`Add ${item.name} to cart`}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-forest px-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-forest-dark active:scale-[0.97] focus-visible:outline-offset-2"
            >
              <Plus size={16} strokeWidth={2.4} />
              <span>Add</span>
            </button>
          ) : (
            <div className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-forest/15 bg-forest-pale p-1" aria-label={`${quantity} ${item.name} in cart`}>
              <button type="button" onClick={() => setQuantity(item.id, quantity - 1)} aria-label={`Remove one ${item.name}`} className="grid size-8 place-items-center rounded-lg text-forest transition hover:bg-white">
                <Minus size={15} />
              </button>
              <span className="min-w-5 text-center text-sm font-bold tabular-nums text-forest">{quantity}</span>
              <button type="button" onClick={() => addItem(item)} aria-label={`Add one ${item.name}`} className="grid size-8 place-items-center rounded-lg text-forest transition hover:bg-white">
                <Plus size={15} />
              </button>
              {/* <Check size={13} className="mr-1 text-forest/60" aria-hidden="true" /> */}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default MenuItemCard;
