import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard/album")({
  beforeLoad: () => {
    throw redirect({
      to: "/dashboard",
      search: { view: "personalizar", panel: "album-layout" },
    });
  },
});
