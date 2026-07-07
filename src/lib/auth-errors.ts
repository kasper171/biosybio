import { AuthApiError } from "@supabase/supabase-js";

export type AuthNotice = { title: string; description?: string };

export function getAuthNotice(err: unknown): AuthNotice {
  if (err instanceof AuthApiError) {
    switch (err.code) {
      case "user_already_exists":
      case "email_exists":
        return {
          title: "Este email já está cadastrado",
          description: "Tente entrar ou use outro email.",
        };
      case "invalid_credentials":
        return {
          title: "Email ou senha incorretos",
          description: "Verifique seus dados e tente novamente.",
        };
      case "email_not_confirmed":
        return {
          title: "Confirme seu email",
          description: "Acesse o link enviado para sua caixa de entrada antes de entrar.",
        };
      case "weak_password":
        return {
          title: "Senha fraca",
          description: "Escolha uma senha mais forte ou que não tenha vazado em bancos públicos.",
        };
      case "signup_disabled":
        return {
          title: "Cadastro indisponível",
          description: "Novos cadastros estão temporariamente desativados.",
        };
      case "over_request_rate_limit":
        return {
          title: "Muitas tentativas",
          description: "Aguarde alguns minutos e tente novamente.",
        };
      case "captcha_failed":
        return {
          title: "Verificação de segurança falhou",
          description:
            "O Cloudflare não validou o check. Recarregue a página e tente novamente.",
        };
      case "user_banned":
        return {
          title: "Conta suspensa",
          description: "Entre em contato com o suporte se achar que isso é um engano.",
        };
    }
  }

  const msg = err instanceof Error ? err.message : "Erro ao autenticar";

  if (/captcha protection|turnstile/i.test(msg)) {
    return {
      title: "Verificação de segurança falhou",
      description:
        "Marque o check do Cloudflare novamente e envie o formulário em seguida. Se repetir, recarregue a página.",
    };
  }
  if (/weak.?password|pwned/i.test(msg)) {
    return {
      title: "Senha fraca",
      description: "Essa senha vazou em bancos públicos. Escolha outra.",
    };
  }
  if (/already.?registered|already.?exists|user.?already/i.test(msg)) {
    return {
      title: "Este email já está cadastrado",
      description: "Tente entrar ou use outro email.",
    };
  }
  if (/invalid.?login|invalid.?credentials/i.test(msg)) {
    return {
      title: "Email ou senha incorretos",
      description: "Verifique seus dados e tente novamente.",
    };
  }
  if (/email.?not.?confirmed/i.test(msg)) {
    return {
      title: "Confirme seu email",
      description: "Acesse o link enviado para sua caixa de entrada antes de entrar.",
    };
  }

  return { title: msg };
}

export function isExistingEmailSignup(user: { identities?: { id: string }[] } | null): boolean {
  return Boolean(user && (!user.identities || user.identities.length === 0));
}
