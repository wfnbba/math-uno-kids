import { useEffect, useState } from "react";

type RequestType = "refund" | "help";

type Step = "closed" | "type" | "s1" | "s2" | "form" | "loading" | "done";

interface FormData {
  name: string;
  email: string;
  purchaseDate: string;
  reason: string;
}

const TYPE_META: Record<RequestType, { label: string; emoji: string; desc: string; status: string }> = {
  refund: {
    label: "Request a refund",
    emoji: "💸",
    desc: "Get your money back for your one-time purchase.",
    status: "Refund approved",
  },
  help: {
    label: "Problem with my order",
    emoji: "🛠️",
    desc: "Files not opening, download issues or wrong product.",
    status: "Order review requested",
  },
};

export function RefundRequest() {
  const [step, setStep] = useState<Step>("closed");
  const [type, setType] = useState<RequestType>("refund");
  const [form, setForm] = useState<FormData>({ name: "", email: "", purchaseDate: "", reason: "" });
  const [error, setError] = useState<string | null>(null);
  const [reference] = useState(() => `UNO-${Date.now().toString().slice(-8)}`);

  const stay = () => {
    setStep("closed");
    setError(null);
  };

  useEffect(() => {
    if (step !== "loading") return;
    const t = setTimeout(() => setStep("done"), 2600);
    return () => clearTimeout(t);
  }, [step]);

  const submit = () => {
    if (!form.name.trim() || !form.email.trim() || !form.purchaseDate) {
      setError("Please fill in your full name, purchase email and purchase date.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setStep("loading");
  };

  if (step === "loading") {
    return (
      <section className="shadow-pop mb-8 rounded-3xl border-4 border-border bg-card p-6 text-center animate-pop-in">
        <div className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <p className="font-display text-xl font-extrabold">Processing your request…</p>
        <p className="mt-2 text-base font-bold text-muted-foreground">
          We're contacting the payment provider. Please keep this screen open.
        </p>
        <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
        </div>
      </section>
    );
  }

  if (step === "done") {
    return (
      <section className="shadow-pop mb-8 rounded-3xl border-4 border-border bg-card p-5 animate-pop-in">
        <div className="mb-4 border-b-4 border-dashed border-border pb-3 text-center">
          <p className="font-display text-2xl font-extrabold">✅ Request Confirmed</p>
          <p className="text-sm font-bold text-muted-foreground">UNO Method · {TYPE_META[type].label}</p>
        </div>
        <dl className="space-y-2 text-base font-bold">
          <Row label="Reference" value={reference} />
          <Row label="Request" value={TYPE_META[type].label} />
          <Row label="Full name" value={form.name} />
          <Row label="Purchase email" value={form.email} />
          <Row label="Purchase date" value={form.purchaseDate} />
          {form.reason && <Row label="Reason" value={form.reason} />}
          <Row label="Status" value={TYPE_META[type].status} />
          <Row label="Requested on" value={new Date().toLocaleDateString("en-US")} />
        </dl>
        <p className="mt-4 rounded-2xl bg-muted p-4 text-sm font-bold text-muted-foreground">
          Your request has been confirmed. Refunds usually take{" "}
          <strong className="text-foreground">5–10 business days</strong> to appear on your credit or debit card
          statement — the exact timing varies from bank to bank. You'll also receive a confirmation email at{" "}
          <strong className="text-foreground break-all">{form.email}</strong>. Any questions, contact our support team
          through your account dashboard.
        </p>
        <button
          onClick={stay}
          className="btn-bounce mt-4 w-full rounded-2xl border-4 border-border bg-card px-4 py-4 font-display text-base font-extrabold"
        >
          Close
        </button>
      </section>
    );
  }

  return (
    <section className="mb-8 rounded-3xl border-4 border-border bg-card p-5">
      <h2 className="font-display text-xl font-extrabold">Refund / Order help</h2>
      <p className="mt-1 text-base font-bold text-muted-foreground">
        Something wrong with your one-time purchase? Request a refund or get help with your order.
      </p>

      {step === "closed" && (
        <button
          onClick={() => setStep("type")}
          className="mt-4 w-full rounded-2xl border-2 border-border bg-muted px-4 py-3 font-display text-base font-bold text-muted-foreground"
        >
          Refund / Order help
        </button>
      )}

      {step === "type" && (
        <div className="mt-4 animate-pop-in">
          <p className="font-display text-lg font-extrabold">What would you like to do?</p>
          <div className="mt-3 space-y-3">
            {(Object.keys(TYPE_META) as RequestType[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t);
                  setStep("s1");
                }}
                className="btn-bounce w-full rounded-2xl border-4 border-border bg-background px-4 py-4 text-left"
              >
                <span className="font-display text-base font-extrabold">
                  {TYPE_META[t].emoji} {TYPE_META[t].label}
                </span>
                <span className="mt-1 block text-sm font-bold text-muted-foreground">{TYPE_META[t].desc}</span>
              </button>
            ))}
          </div>
          <button
            onClick={stay}
            className="mt-3 w-full rounded-xl border border-border px-4 py-3 font-display text-sm font-bold text-muted-foreground"
          >
            Never mind, go back
          </button>
        </div>
      )}

      {step === "s1" && (
        <OfferStep
          title="Are you sure? 😢"
          text="You will lose access to your printable decks, the FIFA World Cup 2026 edition and all premium games."
          keepLabel="🎉 Keep my decks"
          keepClass="bg-fun-green text-primary-foreground"
          onKeep={stay}
          onNext={() => setStep("s2")}
          nextLabel="Continue with my request"
        />
      )}

      {step === "s2" && (
        <OfferStep
          title="Your kid's progress will be lost ⭐"
          text="Streaks, badges and the Math Road journey stay locked once your access is removed."
          keepLabel="⭐ Keep the progress"
          keepClass="bg-fun-blue text-primary-foreground"
          onKeep={stay}
          onNext={() => setStep("form")}
          nextLabel="I understand, proceed"
        />
      )}

      {step === "form" && (
        <div className="mt-4 animate-pop-in">
          <p className="font-display text-lg font-extrabold">Final step</p>
          <p className="mt-1 text-base font-bold text-muted-foreground">
            Confirm your purchase details so we can locate your order ({TYPE_META[type].label.toLowerCase()}).
          </p>
          <div className="mt-3 space-y-3">
            <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Jane Smith" />
            <Field
              label="Purchase email"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              placeholder="jane@email.com"
            />
            <Field
              label="Purchase date"
              type="date"
              value={form.purchaseDate}
              onChange={(v) => setForm({ ...form, purchaseDate: v })}
            />
            <Field
              label="Reason (optional)"
              value={form.reason}
              onChange={(v) => setForm({ ...form, reason: v })}
              placeholder="Tell us what we could do better"
            />
          </div>
          {error && <p className="mt-2 text-sm font-bold text-destructive">{error}</p>}
          <button
            onClick={stay}
            className="btn-bounce shadow-pop mt-4 w-full rounded-2xl border-4 border-border bg-fun-green px-4 py-4 font-display text-lg font-extrabold text-primary-foreground"
          >
            ← Never mind, keep my access
          </button>
          <button
            onClick={submit}
            className="mt-3 w-full rounded-xl border border-border px-4 py-3 font-display text-sm font-bold text-muted-foreground"
          >
            Submit request
          </button>
        </div>
      )}
    </section>
  );
}

function OfferStep({
  title,
  text,
  keepLabel,
  keepClass,
  onKeep,
  onNext,
  nextLabel,
}: {
  title: string;
  text: string;
  keepLabel: string;
  keepClass: string;
  onKeep: () => void;
  onNext: () => void;
  nextLabel: string;
}) {
  return (
    <div className="mt-4 animate-pop-in">
      <p className="font-display text-lg font-extrabold">{title}</p>
      <p className="mt-1 text-base font-bold text-muted-foreground">{text}</p>
      <button
        onClick={onKeep}
        className={`btn-bounce shadow-pop mt-4 w-full rounded-2xl border-4 border-border px-4 py-4 font-display text-lg font-extrabold ${keepClass}`}
      >
        {keepLabel}
      </button>
      <button
        onClick={onNext}
        className="mt-3 w-full rounded-xl border border-border px-4 py-3 font-display text-sm font-bold text-muted-foreground"
      >
        {nextLabel}
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b-2 border-dashed border-border pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-words text-right font-extrabold">{value}</dd>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-display text-sm font-extrabold text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        maxLength={120}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border-4 border-border bg-background px-3 py-3 font-display text-base font-bold outline-none"
      />
    </label>
  );
}
