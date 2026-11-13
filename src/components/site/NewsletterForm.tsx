import { useId, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export function NewsletterForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputId = useId();

  const subscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!supabase) {
      toast.error("Newsletter signup is temporarily unavailable");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("subscribe-newsletter", {
        body: { email: normalizedEmail },
      });
      if (error) throw error;
      toast.success("Thanks for subscribing!", {
        description: "Your welcome note is on its way.",
      });
      setEmail("");
    } catch (error) {
      console.error("Unable to subscribe to the newsletter.", error);
      toast.error(error instanceof Error ? error.message : "Unable to subscribe. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      className={cn("flex w-full max-w-md items-center gap-0 border-b border-border", className)}
      onSubmit={(event) => void subscribe(event)}
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
        disabled={submitting}
        className="shrink-0 pb-3 pt-3 text-[11px] font-medium uppercase tracking-[0.16em] transition-opacity hover:opacity-60 disabled:cursor-wait disabled:opacity-50"
      >
        {submitting ? "Sending…" : "Subscribe"}
      </button>
    </form>
  );
}
