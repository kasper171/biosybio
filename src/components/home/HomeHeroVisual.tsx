import { HomeProfilePhones } from "@/components/home/HomeProfilePhones";

export function HomeHeroVisual() {
  return (
    <div className="home-hero-stage relative mx-auto flex w-full max-w-[min(100%,1060px)] items-center justify-center">
      <div className="home-hero-phone-glow" aria-hidden />
      <div className="home-phone-stage relative w-full">
        <HomeProfilePhones />
      </div>
      <div className="home-phone-stage-fade" aria-hidden />
    </div>
  );
}
