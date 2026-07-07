import type { Profile } from "@/lib/profile-storage";
import { ContaEstatisticasPanel } from "@/components/dashboard/ContaEstatisticasPanel";

type Props = {
  profile: Profile;
};

export function DashboardEstatisticasPage({ profile }: Props) {
  return <ContaEstatisticasPanel profile={profile} />;
}
