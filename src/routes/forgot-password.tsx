import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useShop } from "@/lib/shop-store";
import { AuthLayout } from "@/components/site/AuthLayout";

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
    <AuthLayout
      eyebrow="Account assistance"
      title={passwordRecovery ? "Choose a new password" : "A fresh start"}
      description={
        passwordRecovery
          ? "Choose a new password for your account."
          : "Enter the email address connected to your account and we’ll send you a secure reset link."
      }
    >
      {!authConfigured ? (
        <p
          role="status"
          className="rounded-[6px] border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-muted-foreground"
        >
          Add your Supabase project URL and anon key to the app environment to enable password
          resets.
        </p>
      ) : updated ? (
        <p
          role="status"
          className="rounded-[6px] border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-muted-foreground"
        >
          Your password has been updated. You can now sign in with your new password.
        </p>
      ) : passwordRecovery ? (
        <form className="space-y-5" onSubmit={handlePasswordUpdate}>
          <input
            required
            minLength={8}
            autoComplete="new-password"
            type="password"
            aria-label="New password"
            placeholder="New password (at least 8 characters)"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 w-full rounded-[6px] border border-border bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/75 hover:border-muted-foreground/60 focus:border-foreground"
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
            className="h-12 w-full rounded-[6px] border border-border bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/75 hover:border-muted-foreground/60 focus:border-foreground"
          />
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-[6px] bg-foreground py-4 text-[11px] font-medium uppercase tracking-[0.16em] text-background transition-colors hover:bg-hover-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Updating password…" : "Update password"}
          </button>
        </form>
      ) : sent ? (
        <p className="rounded-[6px] border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          If an account exists for {email}, a reset link is on its way. Follow the link in that
          email to choose a new password.
        </p>
      ) : (
        <>
          <form className="space-y-5" onSubmit={handleResetRequest}>
            <input
              required
              autoComplete="email"
              type="email"
              aria-label="Email address"
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 w-full rounded-[6px] border border-border bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/75 hover:border-muted-foreground/60 focus:border-foreground"
            />
            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-[6px] bg-foreground py-4 text-[11px] font-medium uppercase tracking-[0.16em] text-background transition-colors hover:bg-hover-accent disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Sending link…" : "Send reset link"}
            </button>
          </form>
        </>
      )}
      <p className="mt-7 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        Remembered your password?{" "}
        <Link to="/login" className="font-medium text-foreground link-underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
