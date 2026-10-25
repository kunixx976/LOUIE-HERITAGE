import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — LOUIE HERITAGE" },
      {
        name: "description",
        content:
          "Sign in to your LOUIE HERITAGE account to track orders, manage addresses and view your wishlist.",
      },
      { property: "og:title", content: "Sign In — LOUIE HERITAGE" },
      { property: "og:description", content: "Sign in to track orders and manage your account." },
    ],
  }),
  component: LoginPage,
});

const field =
  "h-12 w-full rounded-[8px] border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-foreground";

function LoginPage() {
  const { signIn, authConfigured } = useShop();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signIn(email, password);
      await navigate({ to: "/profile" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-editorial flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <p className="eyebrow">Account</p>
        <h1 className="mt-3 text-3xl">Sign in</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Track orders, save addresses and keep your wishlist across devices.
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
            autoComplete="email"
            type="email"
            aria-label="Email address"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={field}
          />
          <input
            required
            autoComplete="current-password"
            type="password"
            aria-label="Password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={field}
          />
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-[8px] bg-foreground py-4 text-[11px] font-medium uppercase tracking-[0.16em] text-background transition-colors hover:bg-hover-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 flex justify-between text-xs text-muted-foreground">
          <Link to="/forgot-password" className="link-underline">
            Forgot password?
          </Link>
          <Link to="/signup" className="link-underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
