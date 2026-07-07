import { HomeProfilePhones } from "@/components/home/HomeProfilePhones";

export function HomeHeroVisual() {
  return (
    <div className="home-hero-stage relative mx-auto flex w-full max-w-[820px] items-center justify-center">
      <div className="home-phone-stage relative w-full">
        <HomeProfilePhones />
      </div>
    </div>
  );
}
