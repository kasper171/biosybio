import type { Profile } from "@/lib/profile-storage";
import { ContaOverviewPanel } from "@/components/dashboard/ContaOverviewPanel";

type Props = {
  profile: Profile;
};

export function DashboardOverviewPage({ profile }: Props) {
  return <ContaOverviewPanel profile={profile} />;
}
