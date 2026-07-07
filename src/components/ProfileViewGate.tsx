import { TurnstileWidget } from "@/components/TurnstileWidget";
import { isTurnstileEnabled } from "@/lib/turnstile/config";

type ProfileViewGateProps = {
  displayName: string;
  onToken: (token: string) => void;
  onExpire: () => void;
};

export function ProfileViewGate({ displayName, onToken, onExpire }: ProfileViewGateProps) {
  if (!isTurnstileEnabled()) return null;

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="card-surface w-full max-w-md rounded-2xl p-8 text-center">
        <p className="text-sm text-white/55">Perfil de</p>
        <h1 className="mt-1 text-xl font-bold">{displayName}</h1>
        <p className="mt-4 text-sm text-white/60">
          Confirme abaixo para continuar. Isso ajuda a proteger o perfil contra acessos automáticos.
        </p>
        <div className="mt-6 flex justify-center">
          <TurnstileWidget
            action="profile_view"
            onToken={onToken}
            onExpire={onExpire}
          />
        </div>
      </div>
    </div>
  );
}
