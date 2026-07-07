import { HomeHeroOrbit } from "@/components/home/HomeHeroOrbit";

export function HomeHeroVisual() {
  return (
    <div className="home-hero-visual-stage relative mx-auto w-full max-w-[min(100%,640px)] lg:max-w-none">
      <HomeHeroOrbit />
    </div>
  );
}
