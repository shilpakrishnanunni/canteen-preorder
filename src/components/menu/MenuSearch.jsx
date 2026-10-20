import { Search, X } from "lucide-react";

const MenuSearch = ({ value, onChange }) => (
  <label className="group flex min-h-14 w-full items-center gap-3 rounded-2xl border border-line bg-white px-4 shadow-[0_3px_16px_rgb(32_37_31/3%)] transition focus-within:border-forest/40 focus-within:ring-4 focus-within:ring-forest/5 sm:px-5">
    <Search className="shrink-0 text-muted transition group-focus-within:text-forest" size={20} strokeWidth={1.8} aria-hidden="true" />
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search dishes, snacks, coffee..."
      aria-label="Search menu by food name or description"
      className="min-w-0 flex-1 border-0 bg-transparent py-3 text-sm text-ink outline-none placeholder:text-[#a0a39c] focus:ring-0"
    />
    {value && (
      <button type="button" onClick={() => onChange("")} aria-label="Clear search" className="grid size-8 shrink-0 place-items-center rounded-full text-muted transition hover:bg-canvas hover:text-ink">
        <X size={16} />
      </button>
    )}
  </label>
);

export default MenuSearch;
