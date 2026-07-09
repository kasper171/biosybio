import { DashboardAccountLayout } from "@/components/dashboard/DashboardAccountLayout";
import { useDashboardProfile } from "@/hooks/useDashboardProfile";

export function DashboardAlbumRouteLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useDashboardProfile();

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-white/50">
        Carregando…
      </div>
    );
  }

  return <DashboardAccountLayout profile={profile}>{children}</DashboardAccountLayout>;
}
