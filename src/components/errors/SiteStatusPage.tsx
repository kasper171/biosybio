import type { ReactNode } from "react";
import { ErrorFace404 } from "@/components/errors/ErrorFace404";

type SiteStatusPageProps = {
  title: string;
  description: string;
  actions: ReactNode;
};

export function SiteStatusPage({ title, description, actions }: SiteStatusPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <ErrorFace404 />
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">{actions}</div>
      </div>
    </div>
  );
}

const gradientBtn =
  "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90";
const gradientStyle = {
  background: "linear-gradient(135deg, oklch(0.65 0.28 0), oklch(0.55 0.27 10))",
};

const outlineBtn =
  "inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white";

export function SiteStatusPrimaryButton({
  children,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button type={type} onClick={onClick} className={gradientBtn} style={gradientStyle}>
      {children}
    </button>
  );
}

export function SiteStatusOutlineLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className={outlineBtn}>
      {children}
    </a>
  );
}
