import { useState } from "react";
import { ArrowLeft, ArrowRight, ClipboardList, Leaf, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const TrackOrderPage = () => {
  const [orderToken, setOrderToken] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    const token = orderToken.trim();

    if (!token) {
      setError("Enter the order reference from your confirmation.");
      return;
    }

    setError("");
    navigate(`/orders/${encodeURIComponent(token)}`);
  };

  return (
    <main className="min-h-screen bg-canvas px-4 py-6 text-ink sm:px-6 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center justify-between">
          <Link to="/" aria-label="Canteen home" className="inline-flex items-center gap-3 rounded-lg">
            <span className="grid size-10 place-items-center rounded-[0.9rem] bg-forest text-white">
              <Leaf size={19} strokeWidth={2.1} />
            </span>
            <span className="text-[15px] font-extrabold tracking-[0.14em]">CANTEEN</span>
          </Link>
          <Link to="/" className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-muted transition hover:bg-white hover:text-forest">
            <ArrowLeft size={15} /> <span>Back to menu</span>
          </Link>
        </header>

        <section className="mt-10 overflow-hidden rounded-[1.75rem] border border-line bg-white shadow-[0_12px_50px_rgb(32_37_31/5%)] sm:mt-16">
          <div className="bg-[#203f30] px-6 py-8 text-white sm:px-10 sm:py-10">
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-white/10 text-[#dce9d9]">
              <ClipboardList size={23} strokeWidth={1.8} />
            </span>
            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.17em] text-[#c7dfc1]">Already ordered?</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Track your order.</h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/70 sm:text-base">
              Enter the order reference you received after checkout to see its latest status and order summary.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-10" noValidate>
            <label htmlFor="orderToken" className="block text-sm font-semibold text-ink">
              Order reference
            </label>
            <div className={`mt-2 flex min-h-14 items-center gap-3 rounded-xl border bg-white px-4 transition focus-within:border-forest focus-within:ring-4 focus-within:ring-forest/10 ${error ? "border-red-400" : "border-line"}`}>
              <Search size={19} className="shrink-0 text-muted" aria-hidden="true" />
              <input
                id="orderToken"
                name="orderToken"
                type="text"
                autoComplete="off"
                spellCheck="false"
                value={orderToken}
                onChange={(event) => {
                  setOrderToken(event.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g. BBA00C515176"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "order-token-error" : "order-token-help"}
                className="min-w-0 flex-1 bg-transparent py-3 text-sm text-ink outline-none placeholder:text-muted/70"
              />
            </div>
            {error ? (
              <p id="order-token-error" role="alert" className="mt-2 text-sm text-red-700">{error}</p>
            ) : (
              <p id="order-token-help" className="mt-2 text-xs leading-5 text-muted">
                The reference is shown on your order confirmation. Enter it exactly as provided.
              </p>
            )}

            <button
              type="submit"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-forest px-5 text-sm font-bold text-white transition hover:bg-forest-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-forest/20 sm:w-auto sm:min-w-48"
            >
              Find my order <ArrowRight size={16} />
            </button>
          </form>
        </section>

        <p className="mt-6 text-center text-xs leading-5 text-muted">
          Need to place a new order? <Link to="/" className="font-semibold text-forest underline-offset-4 hover:underline">Browse the menu</Link>.
        </p>
      </div>
    </main>
  );
};

export default TrackOrderPage;
