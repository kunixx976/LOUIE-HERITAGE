import { useId, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function NewsletterForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const inputId = useId();

  return (
    <form
      className={cn("flex w-full max-w-md items-center gap-0 border-b border-border", className)}
      onSubmit={(e) => {
        e.preventDefault();

        const normalizedEmail = email.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
          toast.error("Please enter a valid email address");
          return;
        }

        toast.success("Thanks for subscribing!", {
          description: `A welcome note will be sent to ${normalizedEmail}.`,
        });
        setEmail("");
      }}
    >
      <label htmlFor={inputId} className="sr-only">
        Email address
      </label>
      <input
        id={inputId}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        autoComplete="email"
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
