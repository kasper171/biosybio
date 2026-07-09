import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { AlbumConnectionsRow } from "@/features/album/types/album.types";
import { fetchAlbumConnectionsClient } from "@/features/album/services/albumSupabaseService";
import {
  albumLinkVerifiedConnectionFn,
  albumVerifyDiscordFn,
  albumVerifyHotelMottoFn,
} from "@/features/album/services/album.functions";
import {
  albumGenerateConnectionOtp,
  ALBUM_CONNECTION_ALREADY_LINKED_MESSAGE,
  ALBUM_CONNECTION_OTP_VALIDATE_WINDOW_MS,
  ALBUM_CONNECTION_OTP_WAIT_MS,
  ALBUM_HOTEL_OTP_WAIT_SECONDS,
} from "@/features/album/lib/connection/album-connection-verify";
import { useAlbumI18n } from "@/features/album/i18n/album-messages";

type OtpSession = {
  otp: string;
  unlockAt: number;
  expiresAt: number;
};

type Props = {
  userId: string;
};

export function AlbumConnectionsPanel({ userId }: Props) {
  const { t } = useAlbumI18n();
  const [row, setRow] = useState<AlbumConnectionsRow | null>(null);
  const [discordId, setDiscordId] = useState("");
  const [habboUser, setHabboUser] = useState("");
  const [habbletUser, setHabbletUser] = useState("");
  const [otpSession, setOtpSession] = useState<OtpSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [transferPending, setTransferPending] = useState(false);
  const [waitSecondsLeft, setWaitSecondsLeft] = useState(0);

  useEffect(() => {
    void fetchAlbumConnectionsClient(userId).then(setRow).catch(() => setRow(null));
  }, [userId]);

  useEffect(() => {
    if (!otpSession) {
      setWaitSecondsLeft(0);
      return;
    }
    const tick = () => {
      const left = Math.max(0, Math.ceil((otpSession.unlockAt - Date.now()) / 1000));
      setWaitSecondsLeft(left);
    };
    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [otpSession]);

  const startOtp = () => {
    const now = Date.now();
    setOtpSession({
      otp: albumGenerateConnectionOtp(),
      unlockAt: now + ALBUM_CONNECTION_OTP_WAIT_MS,
      expiresAt: now + ALBUM_CONNECTION_OTP_WAIT_MS + ALBUM_CONNECTION_OTP_VALIDATE_WINDOW_MS,
    });
    setTransferPending(false);
  };

  const canValidate = Boolean(otpSession && waitSecondsLeft <= 0);

  const linkDiscord = async (forceTransfer: boolean) => {
    if (!otpSession || !/^\d{15,22}$/.test(discordId)) return;
    if (waitSecondsLeft > 0) {
      toast.error(t("album.connections.waiting"));
      return;
    }
    setLoading(true);
    try {
      const verified = await albumVerifyDiscordFn({
        data: {
          discordUserId: discordId,
          otp: otpSession.otp,
          unlockAt: otpSession.unlockAt,
          expiresAt: otpSession.expiresAt,
        },
      });
      if (!verified.ok) {
        toast.error(verified.error);
        return;
      }

      const linked = await albumLinkVerifiedConnectionFn({
        data: {
          type: "discord",
          discordUserId: discordId,
          otp: otpSession.otp,
          unlockAt: otpSession.unlockAt,
          expiresAt: otpSession.expiresAt,
          forceTransfer,
        },
      });

      if (linked.ok) {
        toast.success(forceTransfer ? t("album.connections.transferred") : t("album.connections.linked"));
        setOtpSession(null);
        setTransferPending(false);
        setRow(await fetchAlbumConnectionsClient(userId));
        return;
      }
      if (linked.needsTransfer) {
        setTransferPending(true);
        return;
      }
      toast.error("error" in linked ? linked.error : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const linkHotel = async (platform: "habbo" | "habblet", forceTransfer: boolean) => {
    if (!otpSession) return;
    if (waitSecondsLeft > 0) {
      toast.error(t("album.connections.waiting"));
      return;
    }
    const username = platform === "habbo" ? habboUser : habbletUser;
    setLoading(true);
    try {
      const verified = await albumVerifyHotelMottoFn({
        data: {
          platform,
          username,
          hotelDomain: "com.br",
          otp: otpSession.otp,
          unlockAt: otpSession.unlockAt,
          expiresAt: otpSession.expiresAt,
        },
      });
      if (!verified.ok) {
        toast.error(verified.error);
        return;
      }

      const linked = await albumLinkVerifiedConnectionFn({
        data: {
          type: platform,
          username: verified.profile.username,
          hotelDomain: "com.br",
          otp: otpSession.otp,
          unlockAt: otpSession.unlockAt,
          expiresAt: otpSession.expiresAt,
          forceTransfer,
        },
      });

      if (linked.ok) {
        toast.success(forceTransfer ? t("album.connections.transferred") : t("album.connections.linked"));
        setOtpSession(null);
        setTransferPending(false);
        setRow(await fetchAlbumConnectionsClient(userId));
        return;
      }
      if (linked.needsTransfer) {
        setTransferPending(true);
        return;
      }
      toast.error("error" in linked ? linked.error : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const transferBanner = (
    <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
      <p className="text-xs leading-relaxed text-amber-100/90">{ALBUM_CONNECTION_ALREADY_LINKED_MESSAGE}</p>
      <button
        type="button"
        className="album-btn w-full border-amber-400/40 bg-amber-500/20 text-amber-50"
        disabled={loading || !canValidate}
        onClick={() => {
          if (discordId) void linkDiscord(true);
          else if (habboUser) void linkHotel("habbo", true);
          else if (habbletUser) void linkHotel("habblet", true);
        }}
      >
        {t("album.connections.continueLink")}
      </button>
    </div>
  );

  return (
    <div className="album-connections-panel">
      <h3 className="album-connections-panel__title">{t("album.connections.title")}</h3>
      <p className="album-connections-panel__sub">{t("album.connections.subtitle")}</p>

      {!otpSession ? (
        <button type="button" className="album-btn album-btn--primary" onClick={startOtp}>
          {t("album.connections.generate")}
        </button>
      ) : (
        <div className="album-otp-box">
          <p className="album-otp-box__code">{otpSession.otp}</p>
          <p className="album-otp-box__hint">
            {waitSecondsLeft > 0
              ? t("album.connections.waitSeconds").replace("{{seconds}}", String(waitSecondsLeft))
              : t("album.connections.validateHint")}
          </p>
        </div>
      )}

      <div className="album-connections-panel__section">
        <label>{t("album.connections.discord")}</label>
        <input
          value={discordId}
          onChange={(e) => setDiscordId(e.target.value.replace(/\D/g, ""))}
          placeholder="ID do Discord"
          className="album-input"
        />
        <button
          type="button"
          className="album-btn"
          disabled={loading || !canValidate}
          onClick={() => void linkDiscord(false)}
        >
          {loading ? "…" : waitSecondsLeft > 0 ? `${waitSecondsLeft}s` : t("album.connections.validate")}
        </button>
        {transferPending && discordId ? transferBanner : null}
        {row?.discord_user_id ? <p className="album-connected">✓ {row.discord_user_id}</p> : null}
      </div>

      <div className="album-connections-panel__section">
        <label>{t("album.connections.habbo")}</label>
        <input value={habboUser} onChange={(e) => setHabboUser(e.target.value)} className="album-input" />
        <button
          type="button"
          className="album-btn"
          disabled={loading || !canValidate}
          onClick={() => void linkHotel("habbo", false)}
        >
          {loading ? "…" : waitSecondsLeft > 0 ? `${waitSecondsLeft}s` : t("album.connections.validate")}
        </button>
        {transferPending && habboUser ? transferBanner : null}
        {row?.habbo_username ? <p className="album-connected">✓ {row.habbo_username}</p> : null}
      </div>

      <div className="album-connections-panel__section">
        <label>{t("album.connections.habblet")}</label>
        <input value={habbletUser} onChange={(e) => setHabbletUser(e.target.value)} className="album-input" />
        <button
          type="button"
          className="album-btn"
          disabled={loading || !canValidate}
          onClick={() => void linkHotel("habblet", false)}
        >
          {loading ? "…" : waitSecondsLeft > 0 ? `${waitSecondsLeft}s` : t("album.connections.validate")}
        </button>
        {transferPending && habbletUser ? transferBanner : null}
        {row?.habblet_username ? <p className="album-connected">✓ {row.habblet_username}</p> : null}
      </div>
    </div>
  );
}
