export type PasswordRule = { label: string; test: (password: string) => boolean };

export const PASSWORD_RULES: PasswordRule[] = [
  { label: "Pelo menos 8 caracteres", test: (p) => p.length >= 8 },
  { label: "Uma letra maiúscula (A-Z)", test: (p) => /[A-Z]/.test(p) },
  { label: "Uma letra minúscula (a-z)", test: (p) => /[a-z]/.test(p) },
  { label: "Um número (0-9)", test: (p) => /[0-9]/.test(p) },
  { label: "Um caractere especial", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function passwordPolicyError(password: string): string | null {
  for (const rule of PASSWORD_RULES) {
    if (!rule.test(password)) {
      return `Senha inválida: ${rule.label.toLowerCase()}.`;
    }
  }
  return null;
}
