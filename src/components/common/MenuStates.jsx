import { AlertCircle, LoaderCircle, RefreshCw, SearchX } from "lucide-react";

export const MenuLoadingState = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" aria-label="Loading menu" aria-busy="true">
    {Array.from({ length: 8 }, (_, index) => (
      <div key={index} className="overflow-hidden rounded-[1.35rem] border border-line bg-white">
        <div className="aspect-[1.55/1] animate-pulse bg-[#eeeee8]" />
        <div className="space-y-3 p-5">
          <div className="h-4 w-2/3 animate-pulse rounded bg-[#eeeee8]" />
          <div className="h-3 w-full animate-pulse rounded bg-[#f2f1ec]" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-[#f2f1ec]" />
          <div className="flex justify-between pt-3"><div className="h-8 w-16 animate-pulse rounded bg-[#eeeee8]" /><div className="h-10 w-20 animate-pulse rounded-xl bg-[#eeeee8]" /></div>
        </div>
      </div>
    ))}
  </div>
);

export const MenuErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center rounded-3xl border border-rose-100 bg-white px-6 py-14 text-center">
    <span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-700"><AlertCircle size={23} /></span>
    <h3 className="mt-4 text-base font-semibold text-ink">We couldn't load the menu</h3>
    <p className="mt-2 max-w-md text-sm leading-6 text-muted">{message || "Check your connection and try again."}</p>
    <button type="button" onClick={onRetry} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-forest px-4 text-sm font-semibold text-white transition hover:bg-forest-dark">
      <RefreshCw size={15} /> Try again
    </button>
  </div>
);

export const MenuEmptyState = ({ searching, onClear }) => (
  <div className="flex flex-col items-center rounded-3xl border border-dashed border-[#deded5] bg-white/70 px-6 py-14 text-center">
    <span className="grid size-12 place-items-center rounded-2xl bg-[#f0efe8] text-muted"><SearchX size={23} /></span>
    <h3 className="mt-4 text-base font-semibold text-ink">{searching ? "No dishes found" : "Nothing on the menu yet"}</h3>
    <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{searching ? "Try a different dish name or clear your search to see the full menu." : "There aren't any available items in this category right now."}</p>
    {searching && <button type="button" onClick={onClear} className="mt-4 rounded-full px-4 py-2 text-sm font-semibold text-forest transition hover:bg-forest-pale">Clear search</button>}
  </div>
);

export const InlineLoading = () => <span className="inline-flex items-center gap-2 text-sm text-muted"><LoaderCircle className="animate-spin" size={15} /> Updating menu…</span>;
