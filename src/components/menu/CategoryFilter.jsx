import { ArrowRight, Utensils } from "lucide-react";

const CategoryFilter = ({ categories, selectedSlug, onSelect }) => (
  <nav aria-label="Menu categories" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    <button
      type="button"
      onClick={() => onSelect(null)}
      aria-pressed={!selectedSlug}
      className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition duration-200 ${!selectedSlug ? "bg-forest text-white shadow-sm" : "border border-line bg-white text-muted hover:border-forest/30 hover:text-ink"}`}
    >
      <Utensils size={15} strokeWidth={1.9} />
      All items
    </button>
    {categories.map((category) => {
      const selected = selectedSlug === category.slug;
      return (
        <button
          type="button"
          key={category.id}
          onClick={() => onSelect(category.slug)}
          aria-pressed={selected}
          className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition duration-200 ${selected ? "bg-forest text-white shadow-sm" : "border border-line bg-white text-muted hover:border-forest/30 hover:text-ink"}`}
        >
          {category.name}
          {selected && <ArrowRight size={14} />}
        </button>
      );
    })}
  </nav>
);

export default CategoryFilter;
