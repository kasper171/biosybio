import { checkUsernameTakenFn } from "@/lib/auth/auth.functions";

/** Disponibilidade via server fn (service_role + rate limit) — não usa RPC no client. */
export async function isUsernameTaken(username: string) {
  const result = await checkUsernameTakenFn({ data: { username } });
  if (!result.ok) {
    throw new Error(result.error);
  }
  return { clean: result.clean, taken: result.taken };
}
