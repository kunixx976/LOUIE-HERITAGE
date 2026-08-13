import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function NewsletterForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");

  return (
    <form
      className={cn("flex w-full max-w-md items-center gap-0 border-b border-border", className)}
      onSubmit={(e) => {
        e.preventDefault();
        if (!email.includes("@")) {
          toast("Please enter a valid email address");
          return;
        }
        toast("Welcome to LOUIE HERITAGE", {
          description: "Look out for the collection preview in your inbox.",
        });
        setEmail("");
      }}
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
      <button
        type="submit"
        className="shrink-0 pb-3 pt-3 text-[11px] font-medium uppercase tracking-[0.16em] transition-opacity hover:opacity-60"
      >
        Subscribe
      </button>
    </form>
  );
}
