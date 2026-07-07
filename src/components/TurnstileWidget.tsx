import {
  forwardRef,
  memo,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { getTurnstileSiteKey, type TurnstileAction } from "@/lib/turnstile/config";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          action?: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          retry?: "auto" | "never";
          appearance?: "always" | "execute" | "interaction-only";
          execution?: "render" | "execute";
          "refresh-expired"?: "auto" | "manual" | "never";
        },
      ) => string;
      execute: (widgetId?: string) => void;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

let turnstileScriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (turnstileScriptPromise) return turnstileScriptPromise;

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]',
    );
    if (existing) {
      if (window.turnstile) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Turnstile script failed")), { once: true });
      return;
    }

    window.onTurnstileLoad = () => resolve();
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Turnstile script failed"));
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
}

export type TurnstileWidgetHandle = {
  /** Gera um token novo imediatamente antes do envio do formulário. */
  requestToken: () => Promise<string>;
};

type TurnstileWidgetProps = {
  action: TurnstileAction;
  onToken?: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  className?: string;
};

const TurnstileWidgetInner = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  function TurnstileWidgetInner({ action, onToken, onExpire, onError, className }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const pendingTokenRef = useRef<{
      resolve: (token: string) => void;
      reject: (error: Error) => void;
    } | null>(null);
    const reactId = useId();
    const [failed, setFailed] = useState(false);
    const [ready, setReady] = useState(false);

    const onTokenRef = useRef(onToken);
    const onExpireRef = useRef(onExpire);
    const onErrorRef = useRef(onError);
    onTokenRef.current = onToken;
    onExpireRef.current = onExpire;
    onErrorRef.current = onError;

    const siteKey = getTurnstileSiteKey();

    useImperativeHandle(
      ref,
      () => ({
        requestToken: () =>
          new Promise<string>((resolve, reject) => {
            if (!ready || !widgetIdRef.current || !window.turnstile) {
              reject(new Error("Turnstile não está pronto. Recarregue a página."));
              return;
            }

            if (pendingTokenRef.current) {
              reject(new Error("Verificação já em andamento."));
              return;
            }

            const timeout = window.setTimeout(() => {
              if (!pendingTokenRef.current) return;
              pendingTokenRef.current.reject(
                new Error("Tempo esgotado na verificação. Marque o check e tente de novo."),
              );
              pendingTokenRef.current = null;
            }, 60_000);

            pendingTokenRef.current = {
              resolve: (token) => {
                window.clearTimeout(timeout);
                resolve(token);
              },
              reject: (error) => {
                window.clearTimeout(timeout);
                reject(error);
              },
            };

            try {
              window.turnstile.reset(widgetIdRef.current);
              window.turnstile.execute(widgetIdRef.current);
            } catch (err) {
              window.clearTimeout(timeout);
              pendingTokenRef.current = null;
              reject(err instanceof Error ? err : new Error("Falha ao iniciar verificação."));
            }
          }),
      }),
      [ready],
    );

    useEffect(() => {
      if (!siteKey || !containerRef.current) return;

      let cancelled = false;
      setFailed(false);
      setReady(false);

      void loadTurnstileScript()
        .then(() => {
          if (cancelled || !containerRef.current || !window.turnstile) return;
          if (widgetIdRef.current) return;

          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            action,
            theme: "dark",
            retry: "auto",
            execution: "execute",
            appearance: "always",
            "refresh-expired": "auto",
            callback: (token) => {
              onTokenRef.current?.(token);
              if (pendingTokenRef.current) {
                pendingTokenRef.current.resolve(token);
                pendingTokenRef.current = null;
              }
            },
            "expired-callback": () => {
              onExpireRef.current?.();
              if (pendingTokenRef.current) {
                pendingTokenRef.current.reject(
                  new Error("A verificação expirou. Tente criar a conta novamente."),
                );
                pendingTokenRef.current = null;
              }
            },
            "error-callback": () => {
              onErrorRef.current?.();
              setFailed(true);
              if (pendingTokenRef.current) {
                pendingTokenRef.current.reject(
                  new Error("Não foi possível completar a verificação do Cloudflare."),
                );
                pendingTokenRef.current = null;
              }
            },
          });
          setReady(true);
        })
        .catch(() => setFailed(true));

      return () => {
        cancelled = true;
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }
        setReady(false);
      };
    }, [action, siteKey]);

    if (!siteKey) return null;

    return (
      <div className={className}>
        <div
          ref={containerRef}
          id={`turnstile-${reactId}`}
          className="flex min-h-[65px] items-center justify-center"
        />
        {failed && (
          <p className="mt-2 text-center text-xs leading-relaxed text-red-400">
            Não foi possível carregar a verificação. Recarregue a página ou teste outro navegador/rede.
          </p>
        )}
      </div>
    );
  },
);

export const TurnstileWidget = memo(TurnstileWidgetInner);

export function resetTurnstileWidget(widgetId?: string) {
  window.turnstile?.reset(widgetId ?? undefined);
}
