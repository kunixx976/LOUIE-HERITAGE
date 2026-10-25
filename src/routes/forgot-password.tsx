import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — LOUIE HERITAGE" },
      { name: "description", content: "Reset the password for your LOUIE HERITAGE account." },
      { property: "og:title", content: "Reset Password — LOUIE HERITAGE" },
      { property: "og:description", content: "Reset the password for your account." },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const { authConfigured, passwordRecovery, requestPasswordReset, updatePassword } = useShop();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updated, setUpdated] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleResetRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to send a reset link. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await updatePassword(password);
      setUpdated(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to update your password. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-editorial flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <p className="eyebrow">Account</p>
        <h1 className="mt-3 text-3xl">
          {passwordRecovery ? "Choose a new password" : "Reset your password"}
        </h1>
        {!authConfigured ? (
          <p
            role="status"
            className="mt-6 rounded-[8px] border border-border p-4 text-sm text-muted-foreground"
          >
            Add your Supabase project URL and anon key to the app environment to enable password
            resets.
          </p>
        ) : updated ? (
          <p role="status" className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Your password has been updated. You can now sign in with your new password.
          </p>
        ) : passwordRecovery ? (
          <form className="mt-8 space-y-4" onSubmit={handlePasswordUpdate}>
            <input
              required
              minLength={8}
              autoComplete="new-password"
              type="password"
              aria-label="New password"
              placeholder="New password (at least 8 characters)"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 w-full rounded-[8px] border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-foreground"
            />
            <input
              required
              minLength={8}
              autoComplete="new-password"
              type="password"
              aria-label="Confirm new password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="h-12 w-full rounded-[8px] border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-foreground"
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
              {submitting ? "Updating password…" : "Update password"}
            </button>
          </form>
        ) : sent ? (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            If an account exists for {email}, a reset link is on its way. Follow the link in that
            email to choose a new password.
          </p>
        ) : (
          <>
            <p className="mt-3 text-sm text-muted-foreground">
              Enter your email and we'll send a link to set a new password.
            </p>
            <form className="mt-8 space-y-4" onSubmit={handleResetRequest}>
              <input
                required
                autoComplete="email"
                type="email"
                aria-label="Email address"
                placeholder="Email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 w-full rounded-[8px] border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-foreground"
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
                {submitting ? "Sending link…" : "Send reset link"}
              </button>
            </form>
          </>
        )}
        <Link
          to="/login"
          className="mt-6 block text-center text-xs text-muted-foreground link-underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
