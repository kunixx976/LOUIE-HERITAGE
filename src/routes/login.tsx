import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useShop } from "@/lib/shop-store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — MishraClothings" },
      { name: "description", content: "Sign in to your MishraClothings account to track orders, manage addresses and view your wishlist." },
      { property: "og:title", content: "Sign In — MishraClothings" },
      { property: "og:description", content: "Sign in to track orders and manage your account." },
    ],
  }),
  component: LoginPage,
});

const field =
  "h-12 w-full rounded-[8px] border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-foreground";

function LoginPage() {
  const { signIn } = useShop();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="container-editorial flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <p className="eyebrow">Account</p>
        <h1 className="mt-3 text-3xl">Sign in</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Track orders, save addresses and keep your wishlist across devices.
        </p>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            signIn({ name: email.split("@")[0] || "Guest", email });
            toast("Welcome back");
            navigate({ to: "/profile" });
          }}
        >
          <input required type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
          <input required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
          <button
            type="submit"
            className="w-full rounded-[8px] bg-foreground py-4 text-[11px] font-medium uppercase tracking-[0.16em] text-background transition-colors hover:bg-hover-accent"
          >
            Sign in
          </button>
        </form>

        <button
          type="button"
          onClick={() => toast("Google sign-in coming soon")}
          className="mt-3 w-full rounded-[8px] border border-border py-4 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors hover:border-foreground"
        >
          Continue with Google
        </button>

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
