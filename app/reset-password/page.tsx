"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
export default function ResetPassword() {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!supabase) return;
    let live = true;
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (live && event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (live) setReady(!!data.session); });
    return () => { live = false; data.subscription.unsubscribe(); };
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!supabase || !ready) return;
    const form = new FormData(event.currentTarget);
    if (form.get("password") !== form.get("confirmation")) { setMessage("Нууц үгүүд таарахгүй байна."); return; }
    setBusy(true); setMessage("");
    try {
      const { error } = await supabase.auth.updateUser({ password: String(form.get("password")) });
      if (error) throw error;
      await supabase.auth.signOut(); setDone(true); setMessage("Нууц үг шинэчлэгдлээ. Шинэ нууц үгээрээ нэвтрээрэй.");
    } catch { setMessage("Нууц үг шинэчилж чадсангүй. Сэргээх холбоосоо дахин аваарай."); }
    finally { setBusy(false); }
  }
  return <section className="auth-layout"><h1>Шинэ нууц үг</h1>{!ready && <p className="notice">Имэйлд ирсэн нууц үг сэргээх холбоосоор энэ хуудсыг нээгээрэй.</p>}{!done && <form className="form-stack" onSubmit={submit}><label>Шинэ нууц үг<input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required/></label><label>Нууц үг давтах<input name="confirmation" type="password" autoComplete="new-password" minLength={8} maxLength={128} required/></label><button className="button" disabled={!ready || busy}>Нууц үг шинэчлэх</button></form>}<p aria-live="polite">{message}</p><Link className="text-link" href="/login">Нэвтрэх хэсэгт буцах →</Link></section>;
}
