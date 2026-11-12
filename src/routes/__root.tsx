import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useMemo, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ShopProvider } from "../lib/shop-store";
import { Navbar } from "../components/site/Navbar";
import { CookieConsent } from "../components/site/CookieConsent";
import { Footer } from "../components/site/Footer";
import { Toaster } from "../components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-4 text-4xl">We couldn't find that page</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          The address may be out of date, or the page may have moved. Head back to the collection or
          return to the home page.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/shop"
            className="inline-flex items-center justify-center rounded-[8px] bg-foreground px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] text-background transition-colors hover:bg-hover-accent"
          >
            Shop the collection
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-[8px] border border-border px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors hover:border-foreground"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  const reportedError = useMemo(
    () => (error instanceof Error ? error : new Error(String(error))),
    [error],
  );
  console.error(reportedError);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(reportedError, { boundary: "tanstack_root_error_component" });
  }, [reportedError]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-3xl">This page didn't load</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Something went wrong on our end. Try again, or return to the homepage.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-[8px] bg-foreground px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] text-background transition-colors hover:bg-hover-accent"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-[8px] border border-border px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors hover:border-foreground"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "LOUIE HERITAGE — Clothing & Home Textiles" },
      {
        name: "description",
        content: "Explore clothing, accessories and home textiles from LOUIE HERITAGE.",
      },
      { name: "author", content: "LOUIE HERITAGE" },
      { property: "og:site_name", content: "LOUIE HERITAGE" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";

  return (
    <QueryClientProvider client={queryClient}>
      <ShopProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main id="main" className="flex-1 pt-16 md:pt-[72px]">
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <div key={pathname} className="animate-fade-up">
              <Outlet />
            </div>
          </main>
          <Footer />
        </div>
        <Toaster position="bottom-right" />
        <CookieConsent />
      </ShopProvider>
    </QueryClientProvider>
  );
}
