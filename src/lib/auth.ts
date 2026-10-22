import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "./supabase";
import type { Json } from "./types/database";

export interface AdminAuthState {
  user: { email: string; id: string } | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
}

const LOCAL_SESSION_KEY = "blend_admin_auth_session";

export function getLocalAdminSession(): { email: string; id: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.email && parsed.expiresAt > Date.now()) {
      return { email: parsed.email, id: parsed.id || "admin" };
    }
    localStorage.removeItem(LOCAL_SESSION_KEY);
  } catch {
    // Ignore error
  }
  return null;
}

export function setLocalAdminSession(email: string) {
  if (typeof window === "undefined") return;
  const payload = {
    email,
    id: "local-admin",
    // 7 days expiry
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(payload));
}

export function clearLocalAdminSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LOCAL_SESSION_KEY);
}

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>(() => {
    const local = getLocalAdminSession();
    return {
      // A local development passcode is never a Supabase session. Once a
      // Supabase project is connected, require its authenticated session so
      // database and Storage RLS policies work as intended.
      user: isSupabaseConfigured ? null : local,
      session: null,
      loading: isSupabaseConfigured,
      isConfigured: isSupabaseConfigured,
    };
  });

  useEffect(() => {
    const localUser = getLocalAdminSession();
    if (!isSupabaseConfigured) {
      setState((prev) => ({
        ...prev,
        user: localUser,
        loading: false,
        isConfigured: false,
      }));
      return;
    }

    // Check live Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ? { email: session.user.email || "", id: session.user.id } : null,
        session: session ?? null,
        loading: false,
        isConfigured: true,
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ? { email: session.user.email || "", id: session.user.id } : null,
        session: session ?? null,
        loading: false,
        isConfigured: true,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return state;
}

export async function loginWithEmail(email: string, password: string) {
  const cleanEmail = email.trim();

  // If Supabase is configured, use real Supabase authentication
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      throw error;
    }

    setLocalAdminSession(data.user?.email || cleanEmail);

    await recordAuditLog({
      action: "login",
      entity_type: "auth",
      entity_id: data.user?.id,
      new_data: { email: data.user?.email },
    }).catch(() => {});

    return data;
  }

  // Fallback: Local Admin Passcode (for dev or before Supabase keys are entered)
  // Default master password is 'blend2026' or custom VITE_ADMIN_PASSWORD
  const expectedPassword = (import.meta.env["VITE_ADMIN_PASSWORD"] as string) || "blend2026";

  if (password === expectedPassword) {
    setLocalAdminSession(cleanEmail || "admin@blenddecor.com");
    return {
      user: { email: cleanEmail || "admin@blenddecor.com", id: "local-admin" },
      session: null,
    };
  }

  throw new Error("Invalid login credentials");
}

export async function logoutAdmin() {
  clearLocalAdminSession();
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
}

export async function recordAuditLog(params: {
  action: "create" | "update" | "delete" | "restore" | "login";
  entity_type: "product" | "collection" | "image" | "settings" | "auth";
  entity_id?: string;
  old_data?: Json;
  new_data?: Json;
}) {
  if (!isSupabaseConfigured) return;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase.from("audit_log").insert({
      admin_id: user?.id || null,
      admin_email: user?.email || null,
      action: params.action,
      entity_type: params.entity_type,
      entity_id: params.entity_id || null,
      old_data: params.old_data || null,
      new_data: params.new_data || null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
