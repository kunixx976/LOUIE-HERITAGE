import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; to?: string; params?: Record<string, string> };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
    >
      <Link to="/" className="transition-colors hover:text-foreground">
        Home
      </Link>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
          {item.to ? (
            <Link
              to={item.to}
              params={item.params as never}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  crumbs,
  narrow = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs?: Crumb[];
  narrow?: boolean;
}) {
  return (
    <header className="border-b border-border">
      <div
        className="container-editorial py-9 md:py-16"
        style={narrow ? { maxWidth: "42rem" } : undefined}
      >
        {crumbs ? <Breadcrumbs items={crumbs} /> : null}
        {eyebrow ? <p className="eyebrow mt-5 md:mt-6">{eyebrow}</p> : null}
        <h1 className="mt-3 text-[clamp(2rem,9vw,2.75rem)] leading-[1.08] md:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:mt-5">
            {description}
          </p>
        ) : null}
      </div>
    </header>
  );
}
