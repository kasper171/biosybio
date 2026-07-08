import { cn } from "@/lib/utils";
import { SocialIconWithGlow } from "@/components/SocialIconWithGlow";
import {
  getSocialIconDimensions,
  resolveSocialIconBloomColor,
} from "@/lib/social-icons";
import type { Profile } from "@/lib/profile-storage";
import type { ComponentType, MouseEvent, ReactNode, SVGProps } from "react";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type ProfileSocialIconLinkProps = {
  profile: Profile;
  icon: IconComponent;
  iconColor: string;
  compact: boolean;
  bloom: boolean;
  showTitle?: boolean;
  title?: string;
  href: string;
  onNavigate: (e: MouseEvent<HTMLAnchorElement>) => void;
};

/** Caixa de layout fixa; bloom renderiza fora do fluxo (nao afeta gap entre icones). */
function SocialIconLayoutSlot({
  width,
  height,
  children,
}: {
  width: number;
  height: number;
  children: ReactNode;
}) {
  return (
    <span
      className="relative inline-flex shrink-0 overflow-visible"
      style={{ width, height }}
    >
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible">
        {children}
      </span>
    </span>
  );
}

export function ProfileSocialIconLink({
  profile,
  icon: Icon,
  iconColor,
  compact,
  bloom,
  showTitle,
  title,
  href,
  onNavigate,
}: ProfileSocialIconLinkProps) {
  const logo = profile.social_icon_style === "logo";
  const { iconPx, boxPx } = getSocialIconDimensions(profile, compact);
  const bloomColor = resolveSocialIconBloomColor(profile, iconColor);
  const layoutW = logo ? iconPx : boxPx;
  const layoutH = logo ? iconPx : boxPx;

  const iconNode = (
    <SocialIconWithGlow
      icon={Icon}
      size={iconPx}
      color={iconColor}
      glow={bloom}
      glowColor={bloomColor}
    />
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={title}
      onClick={onNavigate}
      className={cn(
        "inline-flex shrink-0 flex-col items-center overflow-visible transition hover:scale-105 [isolation:isolate]",
        showTitle ? "gap-0.5" : "",
      )}
    >
      <SocialIconLayoutSlot width={layoutW} height={layoutH}>
        {logo ? (
          iconNode
        ) : (
          <span
            className="inline-flex items-center justify-center overflow-visible rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10"
            style={{ width: boxPx, height: boxPx }}
          >
            <SocialIconWithGlow
              icon={Icon}
              size={iconPx}
              color={iconColor}
              glow={bloom}
              glowColor={bloomColor}
            />
          </span>
        )}
      </SocialIconLayoutSlot>
      {showTitle && title && (
        <span className="max-w-[4.5rem] truncate text-center text-[10px] leading-tight text-white/65">
          {title}
        </span>
      )}
    </a>
  );
}
