import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — LOUIE HERITAGE" },
      {
        name: "description",
        content:
          "Create a LOUIE HERITAGE account for faster checkout, order tracking and early access to collections.",
      },
      { property: "og:title", content: "Create Account — LOUIE HERITAGE" },
      { property: "og:description", content: "Faster checkout, order tracking and early access." },
    ],
  }),
  component: SignupPage,
});

const field =
  "h-12 w-full rounded-[8px] border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-foreground";

function SignupPage() {
  const { register, authConfigured } = useShop();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const signedIn = await register(form.name.trim(), form.email, form.password);
      if (signedIn) {
        await navigate({ to: "/profile" });
      } else {
        setMessage(
          "Your account is ready. Check your email to confirm your address, then sign in.",
        );
      }
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to create your account. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-editorial flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <p className="eyebrow">Account</p>
        <h1 className="mt-3 text-3xl">Create an account</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Early access to collections, faster checkout and free repairs registration.
        </p>

        {!authConfigured ? (
          <p
            role="status"
            className="mt-6 rounded-[8px] border border-border p-4 text-sm text-muted-foreground"
          >
            Add your Supabase project URL and anon key to the app environment to enable accounts.
          </p>
        ) : null}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            required
            autoComplete="name"
            aria-label="Full name"
            placeholder="Full name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className={field}
          />
          <input
            required
            autoComplete="email"
            type="email"
            aria-label="Email address"
            placeholder="Email address"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className={field}
          />
          <input
            required
            minLength={8}
            autoComplete="new-password"
            type="password"
            aria-label="Password (at least 8 characters)"
            placeholder="Password (at least 8 characters)"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            className={field}
          />
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {message ? (
            <p role="status" className="text-sm text-muted-foreground">
              {message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-[8px] bg-foreground py-4 text-[11px] font-medium uppercase tracking-[0.16em] text-background transition-colors hover:bg-hover-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-foreground link-underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
