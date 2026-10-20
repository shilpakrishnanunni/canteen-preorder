import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowRight, Clock3, Leaf, ShoppingBag, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { getCategories, getMenuItems } from "../api/menu.js";
import CategoryFilter from "../components/menu/CategoryFilter.jsx";
import MenuItemCard from "../components/menu/MenuItemCard.jsx";
import MenuSearch from "../components/menu/MenuSearch.jsx";
import { MenuEmptyState, MenuErrorState, MenuLoadingState } from "../components/common/MenuStates.jsx";
import { useCart } from "../contexts/CartContext.jsx";
import { formatCurrency } from "../utils/currency.js";

const MenuPage = () => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [search, setSearch] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const { totalItems, subtotal } = useCart();

  useEffect(() => {
    let active = true;
    setLoadingCategories(true);
    setCategoryError("");
    getCategories()
      .then((data) => { if (active) setCategories(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) setCategoryError("Categories couldn't be loaded. You can still browse all available items."); })
      .finally(() => { if (active) setLoadingCategories(false); });
    return () => { active = false; };
  }, [reloadKey]);

  useEffect(() => {
    let active = true;
    setLoadingMenu(true);
    setMenuError("");
    getMenuItems(selectedSlug)
      .then((data) => { if (active) setItems(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) setMenuError("We couldn't reach the canteen menu. Check your connection and try again."); })
      .finally(() => { if (active) setLoadingMenu(false); });
    return () => { active = false; };
  }, [selectedSlug, reloadKey]);

  const visibleItems = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return items;
    return items.filter((item) => `${item.name || ""} ${item.description || ""}`.toLocaleLowerCase().includes(query));
  }, [items, search]);

  const handleCategorySelect = useCallback((slug) => {
    setSelectedSlug(slug);
    setSearch("");
  }, []);

  const retry = useCallback(() => setReloadKey((value) => value + 1), []);

  return (
    <div className="min-h-screen bg-canvas pb-28 text-ink sm:pb-24">
      <header className="sticky top-0 z-30 border-b border-[#e9e8e1]/90 bg-canvas/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Canteen home" className="group inline-flex items-center gap-3 rounded-lg">
            <span className="grid size-10 place-items-center rounded-[0.9rem] bg-forest text-white shadow-sm transition group-hover:rotate-[-3deg]">
              <Leaf size={19} strokeWidth={2.1} />
            </span>
            <span className="leading-none">
              <span className="block text-[15px] font-extrabold tracking-[0.14em] text-ink">CANTEEN</span>
              <span className="mt-1.5 block text-[10px] font-medium tracking-[0.09em] text-muted">GOOD FOOD. GOOD DAY.</span>
            </span>
          </Link>

          <Link to="/cart" className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-line bg-white px-3.5 text-sm font-semibold text-ink shadow-[0_2px_10px_rgb(32_37_31/3%)] transition hover:border-forest/30 hover:bg-[#fdfefc] sm:px-4">
            <span className="relative grid size-7 place-items-center text-forest">
              <ShoppingBag size={19} strokeWidth={1.8} />
              {totalItems > 0 && <span className="absolute -right-1 -top-1 grid min-w-[17px] place-items-center rounded-full bg-forest px-1 text-[10px] font-bold leading-[17px] text-white">{totalItems > 99 ? "99+" : totalItems}</span>}
            </span>
            <span className="hidden sm:inline">Your order</span>
            <span className="hidden text-muted sm:inline">{formatCurrency(subtotal)}</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="pt-6 sm:pt-9 lg:pt-11">
          <div className="hero-pattern relative isolate overflow-hidden rounded-[1.75rem] bg-[#203f30] px-5 py-8 text-white sm:px-9 sm:py-10 lg:px-12 lg:py-12">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#dce9d9] sm:text-[11px]">
                <Sparkles size={13} /> Your campus, your favourites
              </span>
              <h1 className="mt-5 max-w-xl text-[2.35rem] font-semibold leading-[1.05] tracking-[-0.055em] sm:text-5xl lg:text-[3.6rem]">
                Good food,<br className="hidden sm:block" /> <span className="font-serif font-normal italic text-[#c7dfc1]">without the wait.</span>
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/70 sm:text-base sm:leading-7">
                Find your favourite, order ahead, and make your break count.
              </p>
              <a href="#menu" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#e6eddf] px-5 text-sm font-bold text-[#203f30] transition hover:bg-white">
                Explore the menu <ArrowDownRight size={16} />
              </a>
            </div>
            <div className="pointer-events-none absolute -right-12 -top-20 hidden size-[21rem] rounded-full border border-white/10 lg:block" />
            <div className="pointer-events-none absolute -right-2 -top-10 hidden size-[15rem] rounded-full border border-white/10 lg:block" />
            <div className="pointer-events-none absolute bottom-[-7rem] right-[9rem] hidden size-[13rem] rounded-full bg-[#9dbb8b]/10 blur-2xl lg:block" />
            <div className="relative z-10 mt-7 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/15 pt-5 text-xs font-medium text-white/70 sm:mt-8 sm:gap-x-7 sm:pt-6">
              <span className="inline-flex items-center gap-2"><Clock3 size={14} /> Skip the queue</span>
              <span className="inline-flex items-center gap-2"><Leaf size={14} /> Fresh campus favourites</span>
            </div>
          </div>
        </section>

        <section id="menu" className="scroll-mt-24 pt-8 sm:pt-10 lg:pt-12">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.72fr)] lg:items-center lg:gap-6">
            <div>
              <p className="eyebrow text-forest">Find your next favourite</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-ink sm:text-[1.85rem]">What's on the menu?</h2>
            </div>
            <div className="w-full lg:justify-self-end">
              <MenuSearch value={search} onChange={setSearch} />
            </div>
          </div>

          <div className="mt-5 sm:mt-6">
            {categoryError && <p role="status" className="mb-3 text-xs text-amber-800">{categoryError}</p>}
            <CategoryFilter categories={categories} selectedSlug={selectedSlug} onSelect={handleCategorySelect} />
            {loadingCategories && <p className="mt-1 text-xs text-muted">Loading categories…</p>}
          </div>

          <div className="mb-4 mt-7 flex items-end justify-between gap-4 sm:mb-5 sm:mt-9">
            <div>
              <h3 className="text-lg font-semibold tracking-[-0.035em] text-ink sm:text-xl">
                {search.trim() ? "Search results" : selectedSlug ? categories.find((category) => category.slug === selectedSlug)?.name || "Menu" : "The canteen menu"}
              </h3>
              <p className="mt-1 text-xs text-muted sm:text-sm">
                {loadingMenu ? "Finding something good…" : `${visibleItems.length} ${visibleItems.length === 1 ? "item" : "items"} to choose from`}
              </p>
            </div>
            <span className="hidden items-center gap-1.5 pb-0.5 text-xs font-medium text-muted sm:inline-flex"><span className="size-1.5 rounded-full bg-[#6f9a6b]" /> Available now</span>
          </div>

          {loadingMenu ? (
            <MenuLoadingState />
          ) : menuError ? (
            <MenuErrorState message={menuError} onRetry={retry} />
          ) : visibleItems.length === 0 ? (
            <MenuEmptyState searching={Boolean(search.trim())} onClear={() => setSearch("")} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4">
              {visibleItems.map((item, index) => <MenuItemCard key={item.id} item={item} index={index} />)}
            </div>
          )}
        </section>

        <footer className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-line py-7 text-center sm:mt-16 sm:flex-row sm:text-left">
          <p className="text-xs font-semibold tracking-[0.12em] text-ink/65">CANTEEN <span className="font-normal tracking-normal text-muted">· Made for your break.</span></p>
          <a href="#menu" className="inline-flex items-center gap-1 text-xs font-semibold text-forest hover:text-forest-dark">Back to top <ArrowRight size={13} /></a>
        </footer>
      </main>

      {totalItems > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-6">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#203f30] px-4 py-3.5 text-white shadow-[0_12px_45px_rgb(18_38_27/24%)] sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10"><ShoppingBag size={18} /></span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{totalItems} {totalItems === 1 ? "item" : "items"} in your order</p>
                <p className="mt-0.5 text-xs text-white/65">Subtotal · {formatCurrency(subtotal)}</p>
              </div>
            </div>
            <Link to="/cart" className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl bg-[#e6eddf] px-4 text-sm font-bold text-[#203f30] transition hover:bg-white">
              View cart <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
