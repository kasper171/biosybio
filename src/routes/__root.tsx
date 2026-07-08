import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { ErrorFace404 } from "@/components/errors/ErrorFace404";
import { SiteStatusPage } from "@/components/errors/SiteStatusPage";
import { reportClientError } from "../lib/report-client-error";
import { SITE_NAME, SITE_ORIGIN, SITE_TITLE } from "@/lib/site";
import { DEFAULT_SITE_FAVICON_URL } from "@/lib/page-meta";
import { LocaleProvider, translate } from "@/i18n/LocaleProvider";

function NotFoundComponent() {
  return (
    <SiteStatusPage
      title={translate("errors.notFoundTitle")}
      description={translate("errors.notFoundDesc")}
      actions={
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, oklch(0.65 0.28 0), oklch(0.55 0.27 10))",
          }}
        >
          {translate("common.goHome")}
        </Link>
      }
    />
  );
}

function ErrorComponent({ error }: { error: Error; reset: () => void }) {
  console.error(error);
  useEffect(() => {
    reportClientError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <ErrorFace404 />
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: SITE_TITLE },
      { name: "description", content: "Create a unique profile with links, music, albums, cards, social media, and more. Everything in one place." },
      { name: "author", content: SITE_NAME },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: "Create a unique profile with links, music, albums, cards, social media, and more. Everything in one place." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_ORIGIN },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_TITLE },
      { name: "twitter:description", content: "Create a unique profile with links, music, albums, cards, social media, and more. Everything in one place." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        href: DEFAULT_SITE_FAVICON_URL,
      },
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

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <Toaster theme="dark" richColors position="top-center" closeButton />
      </LocaleProvider>
    </QueryClientProvider>
  );
}
