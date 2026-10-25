import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useShop } from "@/lib/shop-store";
import { AuthLayout } from "@/components/site/AuthLayout";

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
  "mt-2 h-12 w-full rounded-[6px] border border-border bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/75 hover:border-muted-foreground/60 focus:border-foreground";

function LoginPage() {
  const { signIn, signInWithGoogle, authConfigured } = useShop();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState<"email" | "google" | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting("email");
    try {
      await signIn(email, password);
      await navigate({ to: "/profile" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in. Please try again.");
    } finally {
      setSubmitting(null);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setSubmitting("google");
    try {
      await signInWithGoogle();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to sign in with Google. Please try again.",
      );
      setSubmitting(null);
    }
  }

  return (
    <AuthLayout
      eyebrow="Your account"
      title="Welcome back"
      description="Sign in to revisit your saved pieces, orders and personal details."
    >
      {!authConfigured ? (
        <p
          role="status"
          className="mb-5 rounded-[6px] border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-muted-foreground"
        >
          Add your Supabase project URL and anon key to the app environment to enable accounts.
        </p>
      ) : null}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={submitting !== null || !authConfigured}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-[6px] border border-border bg-background text-sm font-medium transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg aria-hidden="true" viewBox="0 0 48 48" className="h-4 w-4">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.74 7.18l7.72 5.99c4.51-4.17 7.06-10.31 7.06-17.64Z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.89.93 7.59 2.56 10.78l7.97-6.19Z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.91-5.81l-7.72-5.99c-2.14 1.44-4.89 2.3-8.19 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
          />
        </svg>
        {submitting === "google" ? "Connecting to Google…" : "Continue with Google"}
      </button>

      <div className="my-7 flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Or use email
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block text-xs font-medium">
          Email address
          <input
            required
            autoComplete="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={field}
          />
        </label>
        <label className="block text-xs font-medium">
          <span className="flex items-center justify-between">
            Password
            <Link
              to="/forgot-password"
              className="font-normal text-muted-foreground transition-colors hover:text-foreground"
            >
              Forgot password?
            </Link>
          </span>
          <input
            required
            autoComplete="current-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={field}
          />
        </label>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={submitting !== null || !authConfigured}
          className="w-full rounded-[6px] bg-foreground py-4 text-[11px] font-medium uppercase tracking-[0.16em] text-background transition-colors hover:bg-hover-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting === "email" ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-7 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        New to Louie Heritage?{" "}
        <Link to="/signup" className="font-medium text-foreground link-underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
