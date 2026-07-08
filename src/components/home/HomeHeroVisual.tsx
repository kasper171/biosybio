import { HomeHeroOrbit } from "@/components/home/HomeHeroOrbit";

type HomeHeroVisualProps = {
  parallax?: { x: number; y: number };
};

export function HomeHeroVisual({ parallax }: HomeHeroVisualProps) {
  return (
    <div className="home-hero-visual-stage relative mx-auto w-full max-w-[min(100%,640px)] lg:max-w-none">
      <HomeHeroOrbit parallax={parallax} />
    </div>
  );
}
