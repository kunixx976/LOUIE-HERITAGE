import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — LOUIE HERITAGE" },
      { name: "description", content: "Create a LOUIE HERITAGE account for faster checkout, order tracking and early access to collections." },
      { property: "og:title", content: "Create Account — LOUIE HERITAGE" },
      { property: "og:description", content: "Faster checkout, order tracking and early access." },
    ],
  }),
  component: SignupPage,
});

const field =
  "h-12 w-full rounded-[8px] border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-foreground";

function SignupPage() {
  const { signIn } = useShop();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  return (
    <div className="container-editorial flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <p className="eyebrow">Account</p>
        <h1 className="mt-3 text-3xl">Create an account</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Early access to collections, faster checkout and free repairs registration.
        </p>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            signIn({ name: form.name, email: form.email });
            toast("Account created");
            navigate({ to: "/profile" });
          }}
        >
          <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} />
          <input required type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={field} />
          <input required type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={field} />
          <button
            type="submit"
            className="w-full rounded-[8px] bg-foreground py-4 text-[11px] font-medium uppercase tracking-[0.16em] text-background transition-colors hover:bg-hover-accent"
          >
            Create account
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
