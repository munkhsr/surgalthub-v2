import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const storage = {
  getItem: (name: string) => typeof window === "undefined" ? null : sessionStorage.getItem(name) ?? localStorage.getItem(name),
  setItem: (name: string, value: string) => {
    if (typeof window === "undefined") return;
    const persistent = localStorage.getItem("surgalthub-remember") !== "false";
    (persistent ? sessionStorage : localStorage).removeItem(name);
    (persistent ? localStorage : sessionStorage).setItem(name, value);
  },
  removeItem: (name: string) => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(name); localStorage.removeItem(name);
  },
};
export const supabase = url && key ? createClient(url, key, { auth: { storage } }) : null;
