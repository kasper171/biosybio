import { HomeProfilePhones } from "@/components/home/HomeProfilePhones";

export function HomeHeroVisual() {
  return (
    <div className="home-hero-stage relative mx-auto flex w-full max-w-[920px] items-center justify-center lg:max-w-[980px]">
      <div className="home-phone-stage relative w-full">
        <HomeProfilePhones />
      </div>
    </div>
  );
}
