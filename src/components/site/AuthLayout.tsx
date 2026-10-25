import type { ReactNode } from "react";
import editorialImage from "@/assets/editorial.jpg";

type AuthLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthLayout({ eyebrow, title, description, children }: AuthLayoutProps) {
  return (
    <div className="container-editorial py-6 md:py-10">
      <div className="grid overflow-hidden rounded-[10px] border border-border bg-card lg:min-h-[620px] lg:grid-cols-2">
        <aside className="relative hidden min-h-[620px] overflow-hidden bg-surface lg:block">
          <img
            src={editorialImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[58%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-white xl:p-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/75">
              LOUIE HERITAGE
            </p>
            <p className="mt-4 max-w-sm font-display text-3xl leading-tight xl:text-4xl">
              Considered pieces.
              <br />
              Made for everyday.
            </p>
          </div>
        </aside>

        <section className="flex items-center justify-center px-6 py-12 sm:px-10 md:px-14 lg:px-12 xl:px-20">
          <div className="w-full max-w-[400px]">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-4 text-4xl leading-[1.08] md:text-[2.75rem]">{title}</h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{description}</p>
            <div className="mt-8">{children}</div>
          </div>
        </section>
      </div>
    </div>
  );
}
