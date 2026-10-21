import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UtensilsCrossed } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { getApiErrorMessage } from "../../utils/apiError.js";

const LoginPage = () => {
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    if (isAuthenticated) navigate(role === "ADMIN" ? "/admin" : "/staff", { replace: true });
  }, [isAuthenticated, role, navigate]);

  if (isAuthenticated) return <Navigate to={role === "ADMIN" ? "/admin" : "/staff"} replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const session = await login({ email: email.trim(), password });
      const defaultDestination = session.role === "ADMIN" ? "/admin" : "/staff";
      const requestedPath = location.state?.from?.pathname;
      const safeDestination = requestedPath?.startsWith(session.role === "ADMIN" ? "/admin" : "/staff")
        ? requestedPath
        : defaultDestination;
      navigate(safeDestination, { replace: true });
    } catch (requestError) {
      setError(requestError?.response
        ? getApiErrorMessage(requestError, "Unable to sign in. Check your details and try again.")
        : (requestError.message || "Unable to sign in. Check your details and try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-canvas lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.82fr)]">
      <section className="relative hidden overflow-hidden bg-forest px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="hero-pattern pointer-events-none absolute inset-0 opacity-70" />
        <Link to="/" className="relative inline-flex w-fit items-center gap-3 text-sm font-semibold text-white/90 transition hover:text-white">
          <span className="grid size-10 place-items-center rounded-2xl bg-white/12"><UtensilsCrossed size={19} /></span>
          CANTEEN <span className="font-normal text-white/60">· STAFF PORTAL</span>
        </Link>
        <div className="relative max-w-xl pb-10">
          <span className="eyebrow text-white/60">A smoother service starts here</span>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.08] tracking-tight xl:text-6xl">Good service.<br />One order at a time.</h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-white/75">Manage incoming orders, keep the queue moving, and help the campus get back to its day.</p>
          <div className="mt-10 flex items-center gap-3 text-sm text-white/80"><ShieldCheck size={18} /> Secure access for authorised canteen staff</div>
        </div>
        <p className="relative text-xs text-white/50">Canteen operations · Staff access</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink lg:hidden"><ArrowLeft size={16} /> Back to menu</Link>
          <div className="mb-9 mt-10 lg:mt-0">
            <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-forest-pale text-forest"><LockKeyhole size={22} /></div>
            <p className="eyebrow text-forest">Staff & administrator access</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Welcome back.</h2>
            <p className="mt-3 leading-7 text-muted">Sign in with your canteen account to manage orders.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-ink">Email address</label>
              <div className="relative">
                <Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input id="email" name="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@canteen.com" className="w-full rounded-xl border border-line bg-white py-3.5 pl-11 pr-4 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-forest focus:ring-4 focus:ring-forest/10" />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between gap-3"><label htmlFor="password" className="block text-sm font-semibold text-ink">Password</label></div>
              <div className="relative">
                <LockKeyhole size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="w-full rounded-xl border border-line bg-white py-3.5 pl-11 pr-12 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-forest focus:ring-4 focus:ring-forest/10" />
                <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted transition hover:bg-canvas hover:text-ink">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>

            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">{error}</div>}

            <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-forest-dark disabled:cursor-wait disabled:opacity-65">
              {submitting ? "Signing in…" : "Sign in"}
              {!submitting && <ArrowRight size={17} />}
            </button>
          </form>

          <div className="mt-8 border-t border-line pt-6">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-forest"><ArrowLeft size={16} /> Return to student menu</Link>
            <p className="mt-6 text-xs leading-5 text-muted">Access is restricted to authorised staff and administrators. If you need an account, contact your canteen administrator.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
