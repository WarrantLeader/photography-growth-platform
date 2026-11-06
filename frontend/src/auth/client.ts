import type { Provider } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const authClient =
  url && key
    ? createClient(url, key, {
        auth: {
          flowType: "pkce",
          detectSessionInUrl: true,
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : null;
export const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(
  /\/$/,
  "",
);
export const configuredProviders = (import.meta.env.VITE_AUTH_PROVIDERS || "")
  .split(",")
  .map((s: string) => s.trim());
export function isProviderConfigured(provider: Provider) {
  return !!authClient && configuredProviders.includes(provider);
}
export async function apiRequest(path: string, options: RequestInit = {}) {
  if (!authClient)
    throw Error("Connect authentication before using live invoices.");
  const { data } = await authClient.auth.getSession();
  if (!data.session) throw Error("Sign in to continue.");
  const response = await fetch(apiBase + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + data.session.access_token,
      ...options.headers,
    },
  });
  const result = await response
    .json()
    .catch(() => ({ detail: "The server did not return a valid response." }));
  if (!response.ok)
    throw Error(
      typeof result.detail === "string"
        ? result.detail
        : "The request failed. Check your invoice details.",
    );
  return result;
}
