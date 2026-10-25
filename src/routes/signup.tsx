import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useShop } from "@/lib/shop-store";
import { AuthLayout } from "@/components/site/AuthLayout";

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
  "mt-2 h-12 w-full rounded-[6px] border border-border bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/75 hover:border-muted-foreground/60 focus:border-foreground";

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
    <AuthLayout
      eyebrow="Become a member"
      title="A little more personal"
      description="Create an account for a considered shopping experience, with your saved pieces and orders all in one place."
    >
      {!authConfigured ? (
        <p
          role="status"
          className="mb-5 rounded-[6px] border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-muted-foreground"
        >
          Add your Supabase project URL and anon key to the app environment to enable accounts.
        </p>
      ) : null}
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block text-xs font-medium">
          Full name
          <input
            required
            autoComplete="name"
            placeholder="Your name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className={field}
          />
        </label>
        <label className="block text-xs font-medium">
          Email address
          <input
            required
            autoComplete="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className={field}
          />
        </label>
        <label className="block text-xs font-medium">
          Password
          <input
            required
            minLength={8}
            autoComplete="new-password"
            type="password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            className={field}
          />
        </label>
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
          disabled={submitting || !authConfigured}
          className="w-full rounded-[6px] bg-foreground py-4 text-[11px] font-medium uppercase tracking-[0.16em] text-background transition-colors hover:bg-hover-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-7 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-foreground link-underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
