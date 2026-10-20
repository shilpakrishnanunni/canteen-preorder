import { Check, Circle, Clock3, X } from "lucide-react";

const steps = [
  { key: "PLACED", label: "Order placed", description: "Your order has been sent to the canteen." },
  { key: "ACCEPTED", label: "Accepted", description: "The canteen has accepted your order." },
  { key: "COMPLETED", label: "Completed", description: "Your order is complete." },
];
const stepIndex = { PLACED: 0, ACCEPTED: 1, COMPLETED: 2 };

const OrderStatusTimeline = ({ status }) => {
  if (status === "REJECTED") {
    return (
      <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5" role="status">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-red-100 text-red-700"><X size={20} /></span>
        <div>
          <h3 className="font-semibold text-red-900">Order rejected</h3>
          <p className="mt-1 text-sm leading-6 text-red-800">The canteen couldn't accept this order. If you need clarification, please contact the canteen staff.</p>
        </div>
      </div>
    );
  }

  const currentIndex = stepIndex[status] ?? 0;
  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const complete = index < currentIndex || status === "COMPLETED";
        const current = index === currentIndex && status !== "COMPLETED";
        const future = index > currentIndex;
        return (
          <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
            {index < steps.length - 1 && <span className={`absolute left-[1.05rem] top-9 h-[calc(100%-1.8rem)] w-px ${complete ? "bg-forest" : "bg-line"}`} aria-hidden="true" />}
            <span className={`relative z-10 grid size-[2.15rem] shrink-0 place-items-center rounded-full border ${complete ? "border-forest bg-forest text-white" : current ? "border-forest bg-forest-pale text-forest ring-4 ring-forest/10" : "border-line bg-white text-muted/60"}`}>
              {complete ? <Check size={16} strokeWidth={2.5} /> : current ? <Clock3 size={16} /> : <Circle size={12} />}
            </span>
            <div className="pt-0.5">
              <p className={`text-sm font-semibold ${future ? "text-muted" : "text-ink"}`}>{step.label}{current && <span className="ml-2 rounded-full bg-forest-pale px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-forest">Current</span>}</p>
              <p className={`mt-1 text-xs leading-5 ${future ? "text-muted/75" : "text-muted"}`}>{step.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default OrderStatusTimeline;
