import { translate } from "@/i18n/LocaleProvider";

export type PasswordRule = { label: string; test: (password: string) => boolean };

export function getPasswordRules(): PasswordRule[] {
  return [
    { label: translate("lib.passwordMin"), test: (p) => p.length >= 8 },
    { label: translate("lib.passwordUpper"), test: (p) => /[A-Z]/.test(p) },
    { label: translate("lib.passwordLower"), test: (p) => /[a-z]/.test(p) },
    { label: translate("lib.passwordNumber"), test: (p) => /[0-9]/.test(p) },
    { label: translate("lib.passwordSpecial"), test: (p) => /[^A-Za-z0-9]/.test(p) },
  ];
}

export const PASSWORD_RULES: PasswordRule[] = getPasswordRules();

export function passwordPolicyError(password: string): string | null {
  for (const rule of getPasswordRules()) {
    if (!rule.test(password)) {
      return translate("lib.passwordInvalid", { rule: rule.label.toLowerCase() });
    }
  }
  return null;
}
