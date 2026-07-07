import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import profilePreview1 from "@/assets/home-profile-preview-1.png?asset=20260706-1";
import profilePreview2 from "@/assets/home-profile-preview-2.png?asset=20260706-2";
import profilePreview3 from "@/assets/home-profile-preview-3.png?asset=20260706-3";

const PHONES = [
  {
    id: "phone-1",
    src: profilePreview1,
    alt: "Biosy profile preview",
    layer: "home-phone-fan-1",
    neon: "home-phone-neon-soft",
  },
  {
    id: "phone-3",
    src: profilePreview3,
    alt: "Biosy profile preview",
    layer: "home-phone-fan-2",
    neon: "home-phone-neon-bright",
  },
  {
    id: "phone-2",
    src: profilePreview2,
    alt: "Biosy profile preview",
    layer: "home-phone-fan-3",
    neon: "home-phone-neon-soft",
  },
] as const;

const AUTO_HOVER_CYCLE_MS = 6_000;
/** Ordem visual: esquerda → meio → direita */
const AUTO_HOVER_ORDER = ["phone-1", "phone-3", "phone-2"] as const;
const AUTO_HOVER_SLOT_MS = AUTO_HOVER_CYCLE_MS / AUTO_HOVER_ORDER.length;

type Layer = (typeof PHONES)[number]["layer"];

type Pose = {
  y: number;
  z: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scale: number;
};

/** Esquerda atrás → direita meio → centro na frente (hero) */
const PHONE_POSE: Record<Layer, Pose> = {
  "home-phone-fan-1": { y: 22, z: -70, rotateX: 5, rotateY: -14, rotateZ: -3, scale: 1.05 },
  "home-phone-fan-2": { y: 14, z: 65, rotateX: 4, rotateY: 0, rotateZ: 0, scale: 1 },
  "home-phone-fan-3": { y: 26, z: -15, rotateX: 5, rotateY: 14, rotateZ: 3, scale: 1.07 },
};

/** Pintura DOM: fundo → frente (evita z-index vs 3D) */
const FAN_RENDER_ORDER: Layer[] = ["home-phone-fan-1", "home-phone-fan-3", "home-phone-fan-2"];

/** Leque coordenado: esquerda → direita → meio (direita na frente antes do meio abrir) */
const ENTRANCE_BASE_DELAY_MS = 300;
const ENTRANCE_STAGGER_MS = 110;
const ENTRANCE_DURATION_MS = 980;
const ENTRANCE_Y_LIFT = 52;
const ENTRANCE_START_ROTATE_X = 22;
const ENTRANCE_START_SCALE = 0.88;

const ENTRANCE_DELAY_MS: Record<Layer, number> = {
  "home-phone-fan-1": ENTRANCE_BASE_DELAY_MS,
  "home-phone-fan-3": ENTRANCE_BASE_DELAY_MS + ENTRANCE_STAGGER_MS,
  "home-phone-fan-2": ENTRANCE_BASE_DELAY_MS + ENTRANCE_STAGGER_MS * 2,
};

const ENTRANCE_START_ANGLES: Record<Layer, { rotateY: number; rotateZ: number }> = {
  "home-phone-fan-1": { rotateY: -18, rotateZ: -4 },
  "home-phone-fan-2": { rotateY: 0, rotateZ: 0 },
  "home-phone-fan-3": { rotateY: 18, rotateZ: 4 },
};

type Pointer = { x: number; y: number };

function easeOutQuart(value: number) {
  return 1 - (1 - value) ** 4;
}

function easeOutBack(value: number) {
  const c1 = 1.2;
  const c3 = c1 + 1;
  return 1 + c3 * (value - 1) ** 3 + c1 * (value - 1) ** 2;
}

function entranceProgress(layer: Layer, elapsedMs: number) {
  const local = elapsedMs - ENTRANCE_DELAY_MS[layer];
  if (local <= 0) return 0;
  return Math.min(1, local / ENTRANCE_DURATION_MS);
}

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

function buildEntranceTransform(layer: Layer, elapsedMs: number) {
  const pose = PHONE_POSE[layer];
  const start = ENTRANCE_START_ANGLES[layer];
  const raw = entranceProgress(layer, elapsedMs);
  const t = easeOutQuart(raw);
  const scaleT = easeOutBack(raw);

  const y = lerp(ENTRANCE_Y_LIFT, pose.y, t);
  const z = pose.z;
  const rotateX = lerp(ENTRANCE_START_ROTATE_X, pose.rotateX, t);
  const rotateY = lerp(start.rotateY, pose.rotateY, t);
  const rotateZ = lerp(start.rotateZ, pose.rotateZ, t);
  const scale = lerp(ENTRANCE_START_SCALE, pose.scale, scaleT);

  return `translate3d(0, ${y}px, ${z}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`;
}

function entranceOpacity(progress: number) {
  if (progress <= 0) return 0;
  return Math.min(1, easeOutQuart(progress) * 1.2);
}

function entranceBlur(progress: number) {
  if (progress <= 0) return 8;
  return (1 - easeOutQuart(Math.min(1, progress * 1.35))) * 8;
}

function buildTransform(
  layer: Layer,
  mode: "rest" | "hover" | "dim",
  pointer: Pointer,
  active: boolean,
) {
  const pose = PHONE_POSE[layer];
  const parallaxStrength = active ? 1.35 : 0.65;
  const px = (pointer.x - 0.5) * 22 * parallaxStrength;
  const py = (pointer.y - 0.5) * -16 * parallaxStrength;
  const prx = (pointer.y - 0.5) * -5 * parallaxStrength;
  const pry = (pointer.x - 0.5) * 7 * parallaxStrength;

  let { y, z, rotateX, rotateY, rotateZ, scale } = pose;

  if (mode === "hover") {
    y -= 16;
    z = 95;
    rotateX += 2;
    scale = pose.scale + 0.05;
  } else if (mode === "dim") {
    y += 10;
    z -= 40;
    scale -= 0.04;
    rotateX -= 1;
  }

  return [
    `translate3d(${px}px, ${y + py}px, ${z}px)`,
    `rotateX(${rotateX + prx}deg)`,
    `rotateY(${rotateY + pry}deg)`,
    `rotateZ(${rotateZ}deg)`,
    `scale(${scale})`,
  ].join(" ");
}

type PhoneProps = (typeof PHONES)[number] & {
  isHovered: boolean;
  isDimmed: boolean;
  motionReady: boolean;
  entranceMs: number;
  pointer: Pointer;
  onHover: (id: string | null) => void;
};

function PhonePreview({
  id,
  src,
  alt,
  layer,
  neon,
  isHovered,
  isDimmed,
  motionReady,
  entranceMs,
  pointer,
  onHover,
}: PhoneProps) {
  const mode = isHovered ? "hover" : isDimmed ? "dim" : "rest";
  const progress = entranceProgress(layer, entranceMs);
  const isEntering = !motionReady;

  return (
    <div
      className={cn(
        "home-phone-preview absolute",
        layer,
        isHovered && "is-hovered",
        isDimmed && "is-dimmed",
      )}
      data-phone-id={id}
      tabIndex={0}
      role="img"
      aria-label={alt}
      onFocus={() => onHover(id)}
      onBlur={() => onHover(null)}
    >
      <div
        className={cn("home-phone-motion", layer, motionReady && "is-ready")}
        style={
          isEntering
            ? {
                transform: buildEntranceTransform(layer, entranceMs),
                opacity: entranceOpacity(progress),
                filter: `blur(${entranceBlur(progress)}px)`,
              }
            : {
                transform: buildTransform(layer, mode, pointer, isHovered),
                opacity: isDimmed ? 0.48 : 1,
              }
        }
      >
        <div className="home-phone-card-3d">
          <div className="home-phone-card-clip">
            <div className={cn("home-phone-neon-ring", neon)} />
            <div className="home-phone-shot-wrap">
              <img src={src} alt={alt} className="home-phone-shot" draggable={false} />
            </div>
          </div>
          <div aria-hidden className="home-phone-cut-mask" />
        </div>
      </div>
    </div>
  );
}

export function HomeProfilePhones() {
  const fanRef = useRef<HTMLDivElement>(null);
  const autoIndexRef = useRef(0);
  const [userHoveredId, setUserHoveredId] = useState<string | null>(null);
  const [autoHoveredId, setAutoHoveredId] = useState<string | null>(null);
  const [motionReady, setMotionReady] = useState(false);
  const [entranceMs, setEntranceMs] = useState(0);
  const [pointer, setPointer] = useState<Pointer>({ x: 0.5, y: 0.5 });

  const activeId = userHoveredId ?? autoHoveredId;

  useEffect(() => {
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      setEntranceMs(elapsed);

      const lastDelay = Math.max(...Object.values(ENTRANCE_DELAY_MS));
      if (elapsed < lastDelay + ENTRANCE_DURATION_MS + 60) {
        frame = requestAnimationFrame(tick);
      } else {
        setMotionReady(true);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!motionReady) return;

    const advanceAutoHover = () => {
      setAutoHoveredId(AUTO_HOVER_ORDER[autoIndexRef.current]);
      autoIndexRef.current = (autoIndexRef.current + 1) % AUTO_HOVER_ORDER.length;
    };

    advanceAutoHover();
    const interval = window.setInterval(advanceAutoHover, AUTO_HOVER_SLOT_MS);

    return () => {
      window.clearInterval(interval);
      setAutoHoveredId(null);
    };
  }, [motionReady]);

  const pickHoveredPhone = useCallback((clientX: number, clientY: number) => {
    const hit = document.elementFromPoint(clientX, clientY);
    const phone = hit?.closest<HTMLElement>("[data-phone-id]");
    setUserHoveredId(phone?.dataset.phoneId ?? null);
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const rect = fanRef.current?.getBoundingClientRect();
      if (!rect) return;

      setPointer({
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      });

      if (event.pointerType === "mouse") {
        pickHoveredPhone(event.clientX, event.clientY);
      }
    },
    [pickHoveredPhone],
  );

  const handlePointerLeave = useCallback(() => {
    setPointer({ x: 0.5, y: 0.5 });
    setUserHoveredId(null);
  }, []);

  return (
    <div
      ref={fanRef}
      className={cn("home-phone-fan", !motionReady && "is-entrancing", activeId && "has-hover")}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {FAN_RENDER_ORDER.map((layer) => {
        const phone = PHONES.find((entry) => entry.layer === layer);
        if (!phone) return null;

        return (
          <PhonePreview
            key={phone.id}
            {...phone}
            isHovered={activeId === phone.id}
            isDimmed={activeId !== null && activeId !== phone.id}
            motionReady={motionReady}
            entranceMs={entranceMs}
            pointer={pointer}
            onHover={setUserHoveredId}
          />
        );
      })}
    </div>
  );
}
