import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import {
  SiteStatusOutlineLink,
  SiteStatusPage,
  SiteStatusPrimaryButton,
} from "@/components/errors/SiteStatusPage";
import { reportClientError } from "../lib/report-client-error";
import { SITE_ORIGIN } from "@/lib/site";

function NotFoundComponent() {
  return (
    <SiteStatusPage
      title="Page not found"
      description="The page you're looking for doesn't exist or has been moved."
      actions={
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, oklch(0.65 0.28 0), oklch(0.55 0.27 10))",
          }}
        >
          Go home
        </Link>
      }
    />
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportClientError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <SiteStatusPage
      title="This page didn't load"
      description="Something went wrong on our end. You can try refreshing or head back home."
      actions={
        <>
          <SiteStatusPrimaryButton
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Try again
          </SiteStatusPrimaryButton>
          <SiteStatusOutlineLink href="/">Go home</SiteStatusOutlineLink>
        </>
      }
    />
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Biosy — Your world. Your profile. Your way." },
      { name: "description", content: "Create a unique profile with links, music, albums, cards, social media, and more. Everything in one place." },
      { name: "author", content: "Biosy" },
      { property: "og:title", content: "Biosy — Your world. Your profile. Your way." },
      { property: "og:description", content: "Create a unique profile with links, music, albums, cards, social media, and more. Everything in one place." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_ORIGIN },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Biosy — Your world. Your profile. Your way." },
      { name: "twitter:description", content: "Create a unique profile with links, music, albums, cards, social media, and more. Everything in one place." },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
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
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster theme="dark" richColors position="top-center" closeButton />
    </QueryClientProvider>
  );
}
