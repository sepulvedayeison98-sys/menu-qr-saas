/* Auth con Supabase (módulo ES). Lee window.SUPABASE_CONFIG. */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cfg = window.SUPABASE_CONFIG || {};
export const supabase = createClient(
  cfg.url || "https://placeholder.supabase.co",
  cfg.anonKey || "placeholder-key"
);

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
  location.href = "login.html";
}

// Bloquea la página si no hay sesión: redirige al login.
export async function requireSession() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) { location.replace("login.html"); return null; }
  return data.session;
}
