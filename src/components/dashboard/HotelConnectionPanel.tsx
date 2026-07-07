import { useCallback, useEffect, useState } from "react";
import { Loader2, Unplug } from "lucide-react";
import { toast } from "sonner";
import type { Profile } from "@/lib/profile-storage";
import { HotelProfileCard } from "@/components/HotelProfileCard";
import {
  clearHotelProfilePatch,
  fetchHotelProfile,
  HABBO_HOTELS,
  HOTEL_CARD_PLACEMENT_LABELS,
  HOTEL_CARD_ROW_LABELS,
  HOTEL_CARD_SHAPE_LABELS,
  HOTEL_CARD_SIZE_LABELS,
  HOTEL_FETCH_MESSAGES,
  hotelDataToProfilePatch,
  isHabboConnected,
  isHabbletConnected,
  profileToHabboData,
  profileToHabbletData,
  type HotelCardLayoutConfig,
  type HotelPlatform,
  type HotelProfileData,
} from "@/lib/hotel";

type Props = {
  profile: Profile;
  update: <K extends keyof Profile>(k: K, v: Profile[K]) => void;
  onBatchUpdate?: (patch: Partial<Profile>) => void;
};

const panelBtn = "rounded-lg border px-3 py-2 text-xs font-medium transition";
const panelBtnActive = "border-pink-hot/50 bg-pink-hot/15 text-white";
const panelBtnIdle =
  "border-white/10 bg-black/20 text-white/55 hover:border-white/20 hover:text-white";

const PLATFORM_LABELS: Record<HotelPlatform, string> = {
  habbo: "Habbo Hotel",
  habblet: "Habblet",
};

function applyPatch(
  update: Props["update"],
  onBatchUpdate: Props["onBatchUpdate"],
  patch: Partial<Profile>,
) {
  if (onBatchUpdate) {
    onBatchUpdate(patch);
    return;
  }
  (Object.entries(patch) as [keyof Profile, Profile[keyof Profile]][]).forEach(([k, v]) =>
    update(k, v),
  );
}

function OptionGrid<T extends string>({
  label,
  value,
  options,
  labels,
  onChange,
  cols = 2,
}: {
  label: string;
  value: T;
  options: T[];
  labels: Record<T, string>;
  onChange: (v: T) => void;
  cols?: 2 | 3;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs text-white/50">{label}</p>
      <div className={`grid gap-1.5 ${cols === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`${panelBtn} ${value === opt ? panelBtnActive : panelBtnIdle}`}
          >
            {labels[opt]}
          </button>
        ))}
      </div>
    </div>
  );
}

function PlatformConnectSection({
  platform,
  profile,
  layout,
  update,
  onBatchUpdate,
}: {
  platform: HotelPlatform;
  profile: Profile;
  layout: HotelCardLayoutConfig;
  update: Props["update"];
  onBatchUpdate?: Props["onBatchUpdate"];
}) {
  const connected =
    platform === "habbo" ? isHabboConnected(profile) : isHabbletConnected(profile);
  const storedData =
    platform === "habbo" ? profileToHabboData(profile) : profileToHabbletData(profile);

  const [connecting, setConnecting] = useState(false);
  const [hotelDomain, setHotelDomain] = useState(profile.habbo_domain ?? "com.br");
  const [username, setUsername] = useState(
    platform === "habbo" ? (profile.habbo_username ?? "") : (profile.habblet_username ?? ""),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<HotelProfileData | null>(null);

  const runLookup = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (trimmed.length < 2) {
        setPreview(null);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const result = await fetchHotelProfile(
          platform,
          trimmed,
          platform === "habbo" ? hotelDomain : null,
        );
        if (!result.ok) {
          setPreview(null);
          setError(HOTEL_FETCH_MESSAGES[result.error]);
          return;
        }
        setPreview(result.data);
      } catch {
        setPreview(null);
        setError(HOTEL_FETCH_MESSAGES.service_unavailable);
      } finally {
        setLoading(false);
      }
    },
    [platform, hotelDomain],
  );

  useEffect(() => {
    if (!connecting) return;
    const timer = setTimeout(() => void runLookup(username), 500);
    return () => clearTimeout(timer);
  }, [username, hotelDomain, connecting, runLookup]);

  const confirmConnect = () => {
    if (!preview) return;
    applyPatch(update, onBatchUpdate, hotelDataToProfilePatch(preview));
    setConnecting(false);
    setPreview(null);
    toast.success(`${PLATFORM_LABELS[platform]} conectado!`);
  };

  const disconnect = () => {
    applyPatch(update, onBatchUpdate, clearHotelProfilePatch(platform));
    setUsername("");
    setPreview(null);
    setConnecting(false);
    toast.success(`${PLATFORM_LABELS[platform]} desconectado`);
  };

  const displayData = preview ?? storedData;

  return (
    <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-white/80">{PLATFORM_LABELS[platform]}</p>
        {connected && (
          <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
            Conectado
          </span>
        )}
      </div>

      {connected && displayData && !connecting && (
        <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-black/20 p-2">
          <HotelProfileCard
            data={displayData}
            profile={profile}
            layout={layout}
            variant="inside"
          />
        </div>
      )}

      {!connected && !connecting && (
        <button
          type="button"
          onClick={() => setConnecting(true)}
          className="w-full rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2.5 text-xs font-medium text-white/80 transition hover:bg-white/[0.1]"
        >
          Conectar {PLATFORM_LABELS[platform]}
        </button>
      )}

      {connecting && (
        <div className="space-y-3">
          {platform === "habbo" && (
            <label className="block">
              <span className="mb-1 block text-xs text-white/50">Hotel</span>
              <select
                value={hotelDomain}
                onChange={(e) => setHotelDomain(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
              >
                {HABBO_HOTELS.map((h) => (
                  <option key={h.id} value={h.domain}>
                    {h.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block">
            <span className="mb-1 flex items-center gap-2 text-xs text-white/50">
              Nome do jogador
              {loading && <Loader2 className="h-3 w-3 animate-spin" />}
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              placeholder="Ex: Grabando"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30 disabled:opacity-60"
            />
          </label>

          {error && (
            <p className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}

          {preview && (
            <div className="overflow-hidden rounded-xl border border-pink-500/20 bg-pink-500/5 p-2">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/45">
                Pré-visualização
              </p>
              <HotelProfileCard
                data={preview}
                profile={profile}
                layout={layout}
                variant="inside"
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmConnect}
              disabled={loading || !preview}
              className="flex-1 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Buscando..." : "Confirmar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setConnecting(false);
                setPreview(null);
                setError(null);
              }}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {connected && !connecting && (
        <button
          type="button"
          onClick={disconnect}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/15"
        >
          <Unplug className="h-3.5 w-3.5" />
          Desconectar {PLATFORM_LABELS[platform]}
        </button>
      )}
    </div>
  );
}

export function HotelConnectionPanel({ profile, update, onBatchUpdate }: Props) {
  const layout: HotelCardLayoutConfig = {
    placement: profile.hotel_card_placement === "outside" ? "outside" : "inside",
    row: profile.hotel_card_row === "same_row" ? "same_row" : "separate_row",
    shape: profile.hotel_card_shape === "square" ? "square" : "rectangle",
    size:
      profile.hotel_card_size === "sm" || profile.hotel_card_size === "lg"
        ? profile.hotel_card_size
        : "md",
  };

  const anyConnected = isHabboConnected(profile) || isHabbletConnected(profile);

  return (
    <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
        Habbo & Habblet
      </p>
      <p className="text-[11px] leading-relaxed text-white/40">
        Você pode conectar Habbo Hotel e Habblet ao mesmo tempo — são perfis separados.
      </p>

      <PlatformConnectSection
        platform="habbo"
        profile={profile}
        layout={layout}
        update={update}
        onBatchUpdate={onBatchUpdate}
      />

      <PlatformConnectSection
        platform="habblet"
        profile={profile}
        layout={layout}
        update={update}
        onBatchUpdate={onBatchUpdate}
      />

      {anyConnected && (
        <div className="space-y-3 border-t border-white/[0.06] pt-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
            Layout dos cards
          </p>
          <OptionGrid
            label="Posição"
            value={layout.placement}
            options={["inside", "outside"]}
            labels={HOTEL_CARD_PLACEMENT_LABELS}
            onChange={(placement) =>
              applyPatch(update, onBatchUpdate, {
                hotel_card_placement: placement,
              })
            }
          />
          <OptionGrid
            label="Disposição"
            value={layout.row}
            options={["same_row", "separate_row"]}
            labels={HOTEL_CARD_ROW_LABELS}
            onChange={(row) =>
              applyPatch(update, onBatchUpdate, { hotel_card_row: row })
            }
          />
          {layout.placement === "outside" && (
            <p className="text-[10px] leading-relaxed text-white/35">
              Ao lado: coluna estreita em pé, mesma altura do card — nome em cima, avatar grande no centro, info embaixo. Abaixo: faixa horizontal na largura do card — um ocupa tudo, dois dividem a linha.
            </p>
          )}
          {layout.placement === "inside" && (
            <p className="text-[10px] leading-relaxed text-white/35">
              Ao lado: Habbo e Habblet lado a lado no rodapé do card. Abaixo: um embaixo do outro. Com um só conectado, ocupa a largura inteira.
            </p>
          )}
          <OptionGrid
            label="Forma"
            value={layout.shape}
            options={["rectangle", "square"]}
            labels={HOTEL_CARD_SHAPE_LABELS}
            onChange={(shape) =>
              applyPatch(update, onBatchUpdate, { hotel_card_shape: shape })
            }
          />
          {layout.placement === "outside" && layout.row === "same_row" && (
            <p className="text-[10px] leading-relaxed text-white/35">
              Ao lado: altura sempre igual ao card principal. Tamanho só muda a finura (largura) do retângulo.
            </p>
          )}
          <OptionGrid
            label="Tamanho"
            value={layout.size}
            options={["sm", "md", "lg"]}
            labels={HOTEL_CARD_SIZE_LABELS}
            cols={3}
            onChange={(size) =>
              applyPatch(update, onBatchUpdate, { hotel_card_size: size })
            }
          />
        </div>
      )}
    </div>
  );
}
