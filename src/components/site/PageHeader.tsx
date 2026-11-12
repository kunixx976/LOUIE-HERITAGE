import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; to?: string; params?: Record<string, string> };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
      <Link to="/" className="transition-colors hover:text-foreground">Home</Link>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
          {item.to ? (
            <Link to={item.to} params={item.params as never} className="transition-colors hover:text-foreground">{item.label}</Link>
          ) : <span className="text-foreground">{item.label}</span>}
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
    <header className="page-masthead">
      <div className="container-editorial page-masthead__inner" style={narrow ? { maxWidth: "42rem" } : undefined}>
        {crumbs ? <Breadcrumbs items={crumbs} /> : null}
        <div className="page-masthead__content">
          <div className="page-masthead__title">
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            <h1>{title}</h1>
          </div>
          {description ? <p className="page-masthead__description">{description}</p> : null}
        </div>
        <span className="page-masthead__seal" aria-hidden="true"><i /> LOUIE HERITAGE <i /></span>
      </div>
    </header>
  );
}
