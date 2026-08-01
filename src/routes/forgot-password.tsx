import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — Atelier Nord" },
      { name: "description", content: "Reset the password for your Atelier Nord account." },
      { property: "og:title", content: "Reset Password — Atelier Nord" },
      { property: "og:description", content: "Reset the password for your account." },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="container-editorial flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <p className="eyebrow">Account</p>
        <h1 className="mt-3 text-3xl">Reset your password</h1>
        {sent ? (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            If an account exists for {email}, a reset link is on its way. The link expires in 60
            minutes.
          </p>
        ) : (
          <>
            <p className="mt-3 text-sm text-muted-foreground">
              Enter your email and we'll send a link to set a new password.
            </p>
            <form
              className="mt-8 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
                toast("Reset link sent");
              }}
            >
              <input
                required
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full rounded-[8px] border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-foreground"
              />
              <button
                type="submit"
                className="w-full rounded-[8px] bg-foreground py-4 text-[11px] font-medium uppercase tracking-[0.16em] text-background transition-colors hover:bg-hover-accent"
              >
                Send reset link
              </button>
            </form>
          </>
        )}
        <Link to="/login" className="mt-6 block text-center text-xs text-muted-foreground link-underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
