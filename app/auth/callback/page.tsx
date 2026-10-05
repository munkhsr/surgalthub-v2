"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
export default function AuthCallback() {
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let live = true;
    async function complete() {
      const query = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.slice(1));
      if (!supabase || query.has("error") || hash.has("error")) {
        history.replaceState(null, "", "/auth/callback");
        if (live) setFailed(true);
        return;
      }
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) throw new Error("No authenticated session");
        if (live) router.replace("/dashboard");
      } catch {
        history.replaceState(null, "", "/auth/callback");
        if (live) setFailed(true);
      }
    }
    complete();
    return () => { live = false; };
  }, [router]);
  return <section className="auth-layout"><h1>{failed ? "Нэвтэрч чадсангүй" : "Нэвтрэлтийг баталгаажуулж байна"}</h1><p aria-live="polite">{failed ? "Нэвтрэлт цуцлагдсан эсвэл холбоос хүчингүй байна. Дахин оролдоорой." : "Түр хүлээнэ үү…"}</p>{failed && <Link className="button" href="/login">Нэвтрэх хэсэгт буцах</Link>}</section>;
}
