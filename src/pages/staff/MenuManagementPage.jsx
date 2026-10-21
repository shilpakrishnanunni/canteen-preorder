import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  CircleOff,
  Image as ImageIcon,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getCategories } from "../../api/menu.js";
import { addMenuItem, deleteMenuItem, getStaffMenuItems, updateMenuItem } from "../../api/staff.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { getApiErrorMessage } from "../../utils/apiError.js";
import { formatCurrency } from "../../utils/currency.js";
import MenuItemForm from "../../components/staff/MenuItemForm.jsx";

const filters = [
  { id: "ALL", label: "All items" },
  { id: "AVAILABLE", label: "Available" },
  { id: "UNAVAILABLE", label: "Unavailable" },
];

const MenuManagementPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [availabilityFilter, setAvailabilityFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [formItem, setFormItem] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyItemId, setBusyItemId] = useState(null);
  const [itemErrors, setItemErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState("");

  const loadData = useCallback(async ({ quiet = false } = {}) => {
    quiet ? setRefreshing(true) : setLoading(true);
    setPageError("");
    try {
      const [menuResult, categoryResult] = await Promise.allSettled([
        getStaffMenuItems(),
        getCategories(),
      ]);

      if (menuResult.status === "rejected") throw menuResult.reason;
      if (!Array.isArray(menuResult.value)) throw new Error("The menu endpoint returned an unexpected response.");
      setItems(menuResult.value);

      if (categoryResult.status === "fulfilled" && Array.isArray(categoryResult.value)) {
        setCategories(categoryResult.value);
        setCategoryError("");
      } else {
        setCategoryError(getApiErrorMessage(categoryResult.reason, "Unable to load categories."));
      }
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Unable to load the menu. Please try again."));
      if (error?.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [logout, navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const categoryNameById = useMemo(() => new Map(categories.map((category) => [Number(category.id), category.name])), [categories]);

  const visibleItems = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return items.filter((item) => {
      const available = item.available === true;
      if (availabilityFilter === "AVAILABLE" && !available) return false;
      if (availabilityFilter === "UNAVAILABLE" && available) return false;
      if (categoryFilter !== "ALL" && String(item.categoryId) !== categoryFilter) return false;
      if (query && ![item.name, item.description, item.categoryName].some((value) => String(value || "").toLocaleLowerCase().includes(query))) return false;
      return true;
    });
  }, [items, search, categoryFilter, availabilityFilter]);

  const counts = useMemo(() => ({
    total: items.length,
    available: items.filter((item) => item.available === true).length,
    unavailable: items.filter((item) => item.available !== true).length,
  }), [items]);

  const openAddForm = () => {
    setFormItem(null);
    setFormError("");
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setFormItem(item);
    setFormError("");
    setFormOpen(true);
  };

  const handleSave = async (values) => {
    setSaving(true);
    setFormError("");
    try {
      if (formItem) {
        await updateMenuItem({
          menuItemId: formItem.id,
          name: values.name,
          description: values.description,
          price: values.price,
          imageUrl: values.imageUrl,
          available: formItem.available === true,
        });
        setToast(`${values.name} updated`);
      } else {
        await addMenuItem(values);
        setToast(`${values.name} added to the menu`);
      }
      setFormOpen(false);
      setFormItem(null);
      await loadData({ quiet: true });
    } catch (error) {
      setFormError(getApiErrorMessage(error, "The item could not be saved. Check the details and try again."));
      if (error?.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAvailability = async (item) => {
    const nextAvailable = item.available !== true;
    setBusyItemId(item.id);
    setItemErrors((current) => ({ ...current, [item.id]: "" }));
    try {
      await updateMenuItem({
        menuItemId: item.id,
        name: item.name,
        description: item.description || "",
        price: Number(item.price),
        imageUrl: item.imageUrl || null,
        available: nextAvailable,
      });
      setItems((current) => current.map((candidate) => candidate.id === item.id ? { ...candidate, available: nextAvailable } : candidate));
      setToast(`${item.name} marked ${nextAvailable ? "available" : "unavailable"}`);
    } catch (error) {
      setItemErrors((current) => ({ ...current, [item.id]: getApiErrorMessage(error, "Availability could not be changed. Try again.") }));
      if (error?.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
      }
    } finally {
      setBusyItemId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMenuItem(deleteTarget.id);
      setItems((current) => current.filter((item) => item.id !== deleteTarget.id));
      setToast(`${deleteTarget.name} deleted`);
      setDeleteTarget(null);
    } catch (error) {
      setPageError(getApiErrorMessage(error, "The item could not be deleted. Try again."));
      if (error?.response?.status === 401) {
        logout();
        navigate("/login", { replace: true });
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/staff" aria-label="Back to order management" className="grid size-10 shrink-0 place-items-center rounded-xl border border-line text-muted transition hover:bg-canvas hover:text-ink"><ArrowLeft size={18} /></Link>
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-forest text-white"><UtensilsCrossed size={19} /></span>
            <div className="min-w-0"><p className="text-sm font-bold tracking-tight">CANTEEN</p><p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Menu management</p></div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/staff" className="hidden min-h-10 items-center rounded-xl px-3 text-sm font-semibold text-muted transition hover:bg-canvas hover:text-ink sm:inline-flex">Order dashboard</Link>
            <button type="button" onClick={() => loadData({ quiet: true })} disabled={loading || refreshing} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-white px-3.5 text-sm font-semibold text-ink transition hover:bg-canvas disabled:opacity-60"><RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /><span className="hidden sm:inline">Refresh</span></button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
        <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="eyebrow text-forest">STAFF WORKSPACE</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Your menu, in good order.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">Add dishes, update prices, and control what students can order.</p>
          </div>
          <button type="button" onClick={openAddForm} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-forest px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-forest-dark focus-visible:outline-forest"><Plus size={18} /> Add menu item</button>
        </section>

        <section aria-label="Menu summary" className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <SummaryTile label="Menu items" value={counts.total} note="Across all categories" icon={UtensilsCrossed} />
          <SummaryTile label="Available to order" value={counts.available} note="Visible to students" icon={Check} tone="green" />
          <SummaryTile label="Currently unavailable" value={counts.unavailable} note="Hidden from student menu" icon={CircleOff} tone="amber" />
        </section>

        {pageError && <div role="alert" className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"><AlertCircle size={19} className="mt-0.5 shrink-0" /><div className="flex-1"><p className="font-semibold">Something went wrong</p><p className="mt-1 leading-6">{pageError}</p></div><button type="button" onClick={() => { setPageError(""); loadData(); }} className="shrink-0 rounded-lg px-3 py-2 font-semibold hover:bg-red-100">Retry</button><button type="button" onClick={() => setPageError("")} aria-label="Dismiss error" className="grid size-8 place-items-center rounded-lg hover:bg-red-100"><X size={16} /></button></div>}
        {categoryError && <div role="status" className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><AlertCircle size={17} className="mt-0.5 shrink-0" /><span>{categoryError} You can still edit existing items; adding a new item requires categories.</span><button type="button" onClick={() => loadData({ quiet: true })} className="ml-auto shrink-0 font-semibold underline underline-offset-2">Retry</button></div>}

        <section className="mt-8 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_2px_8px_rgb(32_37_31/3%)]">
          <div className="border-b border-line p-4 sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div><h2 className="text-lg font-semibold tracking-tight">Menu items</h2><p className="mt-1 text-sm text-muted">{visibleItems.length} {visibleItems.length === 1 ? "item" : "items"} shown</p></div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="relative block sm:w-64">
                  <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search menu items" aria-label="Search menu items" className="min-h-11 w-full rounded-xl border border-line bg-white pl-10 pr-9 text-sm outline-none transition placeholder:text-[#9a9e95] focus:border-forest focus:ring-4 focus:ring-forest/10" />
                  {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-canvas"><X size={14} /></button>}
                </label>
                <label className="relative block sm:min-w-44">
                  <span className="sr-only">Filter by category</span>
                  <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="min-h-11 w-full appearance-none rounded-xl border border-line bg-white px-3.5 pr-9 text-sm font-medium text-ink outline-none focus:border-forest focus:ring-4 focus:ring-forest/10">
                    <option value="ALL">All categories</option>
                    {categories.map((category) => <option key={category.id} value={String(category.id)}>{category.name}</option>)}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
                </label>
              </div>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-0.5" role="group" aria-label="Filter by availability">
              {filters.map((filter) => <button key={filter.id} type="button" onClick={() => setAvailabilityFilter(filter.id)} aria-pressed={availabilityFilter === filter.id} className={`min-h-9 shrink-0 rounded-full px-4 text-sm font-semibold transition ${availabilityFilter === filter.id ? "bg-forest text-white" : "border border-line bg-white text-muted hover:bg-canvas hover:text-ink"}`}>{filter.label}{filter.id === "ALL" ? ` · ${counts.total}` : filter.id === "AVAILABLE" ? ` · ${counts.available}` : ` · ${counts.unavailable}`}</button>)}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-4 sm:p-5">{[1, 2, 3, 4].map((key) => <div key={key} className="h-[88px] animate-pulse rounded-xl bg-canvas" />)}</div>
          ) : visibleItems.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-canvas text-muted"><Search size={23} /></span>
              <h3 className="mt-4 text-base font-semibold">No matching menu items</h3>
              <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-muted">Try another search or change the category and availability filters.</p>
              <button type="button" onClick={() => { setSearch(""); setCategoryFilter("ALL"); setAvailabilityFilter("ALL"); }} className="mt-4 rounded-lg px-3 py-2 text-sm font-semibold text-forest hover:bg-forest-pale">Clear filters</button>
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-[#fbfbf8] text-[11px] font-bold uppercase tracking-[0.12em] text-muted"><tr><th className="px-5 py-3.5">Item</th><th className="px-4 py-3.5">Category</th><th className="px-4 py-3.5">Price</th><th className="px-4 py-3.5">Availability</th><th className="px-5 py-3.5 text-right">Actions</th></tr></thead>
                  <tbody className="divide-y divide-line">
                    {visibleItems.map((item) => <MenuTableRow key={item.id} item={item} categoryName={item.categoryName || categoryNameById.get(Number(item.categoryId)) || "Uncategorised"} busy={busyItemId === item.id} error={itemErrors[item.id]} onEdit={() => openEditForm(item)} onToggle={() => handleAvailability(item)} onDelete={() => setDeleteTarget(item)} />)}
                  </tbody>
                </table>
              </div>
              <div className="divide-y divide-line md:hidden">
                {visibleItems.map((item) => <MenuMobileCard key={item.id} item={item} categoryName={item.categoryName || categoryNameById.get(Number(item.categoryId)) || "Uncategorised"} busy={busyItemId === item.id} error={itemErrors[item.id]} onEdit={() => openEditForm(item)} onToggle={() => handleAvailability(item)} onDelete={() => setDeleteTarget(item)} />)}
              </div>
            </>
          )}
        </section>

        <footer className="mt-6 flex flex-col gap-1 border-t border-line pt-5 text-xs leading-5 text-muted sm:flex-row sm:items-center sm:justify-between"><span>Changes are saved to the canteen menu.</span><span>Unavailable items are hidden from students.</span></footer>
      </main>

      {formOpen && <MenuItemForm item={formItem} categories={categories} saving={saving} error={formError} onClose={() => { if (!saving) { setFormOpen(false); setFormError(""); } }} onSubmit={handleSave} />}

      {deleteTarget && <DeleteConfirmation item={deleteTarget} deleting={deleting} onCancel={() => { if (!deleting) setDeleteTarget(null); }} onConfirm={handleDelete} />}

      {toast && <div role="status" className="fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[#20251f] px-4 py-3 text-sm font-semibold text-white shadow-xl"><Check size={17} className="text-[#a8d5b2]" />{toast}</div>}
    </div>
  );
};

const SummaryTile = ({ label, value, note, icon: Icon, tone = "neutral" }) => {
  const iconTone = tone === "green" ? "bg-forest-pale text-forest" : tone === "amber" ? "bg-amber-50 text-amber-800" : "bg-canvas text-muted";
  return <div className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4 sm:p-5"><span className={`grid size-11 shrink-0 place-items-center rounded-xl ${iconTone}`}><Icon size={19} /></span><div className="min-w-0"><p className="text-sm font-medium text-muted">{label}</p><p className="mt-0.5 text-2xl font-semibold tracking-tight">{value}</p><p className="mt-0.5 text-xs text-muted">{note}</p></div></div>;
};

const AvailabilityBadge = ({ available }) => <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${available ? "bg-forest-pale text-forest" : "bg-[#f1f0ec] text-muted"}`}><span className={`size-1.5 rounded-full ${available ? "bg-forest" : "bg-[#9a9e95]"}`} />{available ? "Available" : "Unavailable"}</span>;

const ItemImage = ({ item, compact = false }) => {
  const [failed, setFailed] = useState(false);
  const sizeClass = compact ? "size-14 rounded-xl" : "size-[68px] rounded-xl";
  return <div className={`relative grid shrink-0 place-items-center overflow-hidden border border-line bg-canvas ${sizeClass}`}>
    {item.imageUrl && !failed ? <img src={item.imageUrl} alt="" loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover" /> : <ImageIcon size={compact ? 18 : 21} className="text-[#b3b7ad]" />}
  </div>;
};

const MenuTableRow = ({ item, categoryName, busy, error, onEdit, onToggle, onDelete }) => (
  <tr className="align-middle transition hover:bg-[#fdfdfa]">
    <td className="px-5 py-4"><div className="flex min-w-0 items-center gap-3"><ItemImage item={item} /><div className="min-w-0"><p className="max-w-[360px] truncate text-sm font-semibold text-ink">{item.name}</p><p className="mt-1 max-w-[360px] truncate text-xs text-muted">{item.description || "No description"}</p>{error && <p className="mt-1 max-w-[360px] text-xs leading-5 text-red-700">{error}</p>}</div></div></td>
    <td className="px-4 py-4"><span className="inline-flex max-w-40 truncate rounded-lg bg-canvas px-2.5 py-1.5 text-xs font-medium text-muted">{categoryName}</span></td>
    <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold">{formatCurrency(Number(item.price) || 0)}</td>
    <td className="px-4 py-4"><AvailabilityBadge available={item.available === true} /></td>
    <td className="px-5 py-4"><div className="flex items-center justify-end gap-1.5">
      <button type="button" onClick={onToggle} disabled={busy} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line px-2.5 text-xs font-semibold text-muted transition hover:border-forest/30 hover:bg-forest-pale hover:text-forest disabled:opacity-50">{busy ? <LoaderCircle size={14} className="animate-spin" /> : item.available === true ? <CircleOff size={14} /> : <Check size={14} />}{item.available === true ? "Unavailable" : "Make available"}</button>
      <button type="button" onClick={onEdit} aria-label={`Edit ${item.name}`} className="grid size-9 place-items-center rounded-lg text-muted transition hover:bg-canvas hover:text-ink"><Pencil size={15} /></button>
      <button type="button" onClick={onDelete} aria-label={`Delete ${item.name}`} className="grid size-9 place-items-center rounded-lg text-muted transition hover:bg-red-50 hover:text-red-700"><Trash2 size={15} /></button>
    </div></td>
  </tr>
);

const MenuMobileCard = ({ item, categoryName, busy, error, onEdit, onToggle, onDelete }) => (
  <article className="p-4">
    <div className="flex items-start gap-3"><ItemImage item={item} compact /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="min-w-0 flex-1 text-sm font-semibold leading-5">{item.name}</h3><p className="shrink-0 text-sm font-bold">{formatCurrency(Number(item.price) || 0)}</p></div><p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{item.description || "No description"}</p><div className="mt-2 flex flex-wrap items-center gap-2"><span className="rounded-md bg-canvas px-2 py-1 text-[11px] font-medium text-muted">{categoryName}</span><AvailabilityBadge available={item.available === true} /></div></div></div>
    {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs leading-5 text-red-800">{error}</p>}
    <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
      <button type="button" onClick={onToggle} disabled={busy} className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-line px-3 text-xs font-semibold text-muted transition hover:bg-canvas disabled:opacity-50">{busy ? <LoaderCircle size={14} className="animate-spin" /> : item.available === true ? <CircleOff size={14} /> : <Check size={14} />}{item.available === true ? "Mark unavailable" : "Make available"}</button>
      <button type="button" onClick={onEdit} className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-line px-3 text-xs font-semibold text-ink transition hover:bg-canvas"><Pencil size={14} /> Edit</button>
      <button type="button" onClick={onDelete} aria-label={`Delete ${item.name}`} className="grid size-9 place-items-center rounded-lg border border-line text-muted transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"><Trash2 size={14} /></button>
    </div>
  </article>
);

const DeleteConfirmation = ({ item, deleting, onCancel, onConfirm }) => (
  <div className="fixed inset-0 z-[55] flex items-center justify-center bg-[#172019]/45 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !deleting) onCancel(); }}>
    <section role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description" className="w-full max-w-md rounded-3xl border border-line bg-white p-6 shadow-2xl sm:p-7">
      <span className="grid size-12 place-items-center rounded-2xl bg-red-50 text-red-700"><Trash2 size={21} /></span>
      <h2 id="delete-title" className="mt-4 text-xl font-semibold tracking-tight">Delete {item.name}?</h2>
      <p id="delete-description" className="mt-2 text-sm leading-6 text-muted">This removes the item from menu management. This action cannot be undone from this screen.</p>
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} disabled={deleting} className="min-h-11 rounded-xl border border-line px-4 text-sm font-semibold text-ink transition hover:bg-canvas disabled:opacity-50">Keep item</button>
        <button type="button" onClick={onConfirm} disabled={deleting} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white transition hover:bg-red-800 disabled:opacity-60">{deleting && <LoaderCircle size={15} className="animate-spin" />}{deleting ? "Deleting…" : "Delete item"}</button>
      </div>
    </section>
  </div>
);

export default MenuManagementPage;
