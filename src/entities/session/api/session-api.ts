"use client";

import { createSupabaseBrowserClient } from "@/shared/api/supabase/client";

export async function signUpWithEmail(email: string, password: string) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}
