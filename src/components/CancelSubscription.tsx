import { useState } from "react";

type Step = "closed" | "s1" | "s2" | "s3" | "form" | "done";

interface FormData {
  name: string;
  email: string;
  purchaseDate: string;
  reason: string;
}

export function CancelSubscription() {
  const [step, setStep] = useState<Step>("closed");
  const [form, setForm] = useState<FormData>({ name: "", email: "", purchaseDate: "", reason: "" });
  const [error, setError] = useState<string | null>(null);
  const ref = `UNO-${Date.now().toString().slice(-8)}`;
  const [reference] = useState(ref);

  const stay = () => setStep("closed");

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
    setStep("done");
  };

  if (step === "done") {
    return (
      <section className="shadow-pop mb-8 rounded-3xl border-4 border-border bg-card p-5 animate-pop-in">
        <div className="mb-4 border-b-4 border-dashed border-border pb-3 text-center">
          <p className="font-display text-2xl font-extrabold">✅ Cancellation Confirmed</p>
          <p className="text-sm font-bold text-muted-foreground">UNO Method · Subscription receipt</p>
        </div>
        <dl className="space-y-2 text-base font-bold">
          <Row label="Reference" value={reference} />
          <Row label="Full name" value={form.name} />
          <Row label="Purchase email" value={form.email} />
          <Row label="Purchase date" value={form.purchaseDate} />
          {form.reason && <Row label="Reason" value={form.reason} />}
          <Row label="Status" value="Cancelled immediately" />
          <Row label="Requested on" value={new Date().toLocaleDateString("en-US")} />
        </dl>
        <p className="mt-4 rounded-2xl bg-muted p-4 text-sm font-bold text-muted-foreground">
          Your subscription has been cancelled immediately and you will not be billed again. Refunds and returns can
          take <strong className="text-foreground">10–15 business days</strong> to appear on your card statement — this
          is normal and depends on your bank. Any questions, contact our support team at{" "}
          <a className="text-foreground underline" href="mailto:support@unomethod.com">
            support@unomethod.com
          </a>
          .
        </p>
        <button
          onClick={() => setStep("closed")}
          className="btn-bounce mt-4 w-full rounded-2xl border-4 border-border bg-card px-4 py-3 font-display text-base font-extrabold"
        >
          Close
        </button>
      </section>
    );
  }

  return (
    <section className="mb-8 rounded-3xl border-4 border-border bg-card p-5">
      <h2 className="font-display text-xl font-extrabold">Subscription</h2>
      <p className="mt-1 text-base font-bold text-muted-foreground">
        Manage your UNO Method membership — weekly new decks, games and printables.
      </p>

      {step === "closed" && (
        <button
          onClick={() => setStep("s1")}
          className="mt-4 w-full rounded-2xl border-2 border-border bg-muted px-4 py-2 font-display text-sm font-bold text-muted-foreground"
        >
          Cancel subscription
        </button>
      )}

      {step === "s1" && (
        <div className="mt-4 animate-pop-in">
          <p className="font-display text-lg font-extrabold">Are you sure you want to leave? 😢</p>
          <p className="mt-1 text-base font-bold text-muted-foreground">
            You will lose every weekly deck drop, the FIFA World Cup 2026 edition updates and all premium games.
          </p>
          <button
            onClick={stay}
            className="btn-bounce shadow-pop mt-4 w-full rounded-2xl border-4 border-border bg-fun-green px-4 py-4 font-display text-lg font-extrabold text-primary-foreground"
          >
            🎉 Keep my subscription
          </button>
          <button
            onClick={() => setStep("s2")}
            className="mt-3 w-full rounded-xl border border-border px-4 py-2 font-display text-xs font-bold text-muted-foreground"
          >
            Continue with cancellation
          </button>
        </div>
      )}

      {step === "s2" && (
        <div className="mt-4 animate-pop-in">
          <p className="font-display text-lg font-extrabold">How about a free month instead? 🎁</p>
          <p className="mt-1 text-base font-bold text-muted-foreground">
            Stay with us and your next 30 days are on the house — same decks, same games, zero charge.
          </p>
          <button
            onClick={stay}
            className="btn-bounce shadow-pop mt-4 w-full rounded-2xl border-4 border-border bg-fun-yellow px-4 py-4 font-display text-lg font-extrabold text-foreground"
          >
            🎁 Claim my free month
          </button>
          <button
            onClick={() => setStep("s3")}
            className="mt-3 w-full rounded-xl border border-border px-4 py-2 font-display text-xs font-bold text-muted-foreground"
          >
            No thanks, continue cancelling
          </button>
        </div>
      )}

      {step === "s3" && (
        <div className="mt-4 animate-pop-in">
          <p className="font-display text-lg font-extrabold">Your kid's progress will be paused ⭐</p>
          <p className="mt-1 text-base font-bold text-muted-foreground">
            Streaks, badges and the Math Road journey stay locked until you come back.
          </p>
          <button
            onClick={stay}
            className="btn-bounce shadow-pop mt-4 w-full rounded-2xl border-4 border-border bg-fun-blue px-4 py-4 font-display text-lg font-extrabold text-primary-foreground"
          >
            ⭐ Keep the progress, stay subscribed
          </button>
          <button
            onClick={() => setStep("form")}
            className="mt-3 w-full rounded-xl border border-border px-4 py-2 font-display text-xs font-bold text-muted-foreground"
          >
            I understand, proceed to cancel
          </button>
        </div>
      )}

      {step === "form" && (
        <div className="mt-4 animate-pop-in">
          <p className="font-display text-lg font-extrabold">Final step</p>
          <p className="mt-1 text-base font-bold text-muted-foreground">
            Confirm your purchase details so we can locate your order.
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
            ← Never mind, keep my subscription
          </button>
          <button
            onClick={submit}
            className="mt-3 w-full rounded-xl border border-border px-4 py-2 font-display text-xs font-bold text-muted-foreground"
          >
            Submit cancellation
          </button>
        </div>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b-2 border-dashed border-border pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-extrabold">{value}</dd>
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
