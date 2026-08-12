import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — MishraClothings" },
      { name: "description", content: "Reach the MishraClothings care team in Copenhagen for sizing advice, orders, repairs and press enquiries." },
      { property: "og:title", content: "Contact — MishraClothings" },
      { property: "og:description", content: "Sizing advice, orders, repairs and press enquiries." },
    ],
  }),
  component: ContactPage,
});

const field =
  "h-12 w-full rounded-[8px] border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-foreground";

function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Say hello"
        title="Contact"
        description="Our care team answers within one working day, Monday to Friday, 09:00–17:00 CET."
        crumbs={[{ label: "Contact" }]}
      />
      <div className="container-editorial grid gap-14 py-12 md:py-16 lg:grid-cols-12">
        <form
          className="space-y-4 lg:col-span-7"
          onSubmit={(e) => {
            e.preventDefault();
            toast("Message sent", { description: "We'll reply within one working day." });
            (e.target as HTMLFormElement).reset();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <input required placeholder="Full name" className={field} />
            <input required type="email" placeholder="Email address" className={field} />
          </div>
          <input placeholder="Order number (optional)" className={field} />
          <textarea
            required
            rows={7}
            placeholder="How can we help?"
            className="w-full rounded-[8px] border border-border bg-background p-4 text-sm outline-none transition-colors focus:border-foreground"
          />
          <button
            type="submit"
            className="rounded-[8px] bg-foreground px-9 py-4 text-[11px] font-medium uppercase tracking-[0.16em] text-background transition-colors hover:bg-hover-accent"
          >
            Send message
          </button>
        </form>

        <aside className="space-y-8 text-sm lg:col-span-4 lg:col-start-9">
          <div>
            <p className="eyebrow mb-2">Customer care</p>
            <p className="text-muted-foreground">care@mishraclothings.in</p>
            <p className="text-muted-foreground">+45 33 12 45 90</p>
          </div>
          <div>
            <p className="eyebrow mb-2">Press & wholesale</p>
            <p className="text-muted-foreground">studio@mishraclothings.in</p>
          </div>
          <div>
            <p className="eyebrow mb-2">Studio & showroom</p>
            <p className="text-muted-foreground">
              Bredgade 42, 1st floor
              <br />
              1260 Copenhagen K, Denmark
              <br />
              Visits by appointment
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
