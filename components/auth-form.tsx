"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Icon } from "./icon";

function FieldIcon({ kind }: { kind: "email" | "lock" | "eye" }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{kind === "email" ? <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/></> : kind === "lock" ? <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></> : <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>}</svg>;
}
const providers = ["google", "apple", "facebook"] as const;
export function AuthForm({ register = false }: { register?: boolean }) {
  const router = useRouter();
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  const [success,setSuccess] = useState(false);
  const [showPassword,setShowPassword] = useState(false);
  const [showConfirmation,setShowConfirmation] = useState(false);
  const [accepted,setAccepted] = useState(false);
  const [remember,setRemember] = useState(true);
  const [reset,setReset] = useState(false);
  const [enabledProviders,setEnabledProviders] = useState<string[]>([]);
  const [providerState,setProviderState] = useState<"loading" | "ready" | "unavailable">("loading");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/providers", { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error("Provider settings unavailable");
      const data = await response.json();
      setEnabledProviders(Array.isArray(data.providers) ? data.providers.filter((p: string) => providers.includes(p as typeof providers[number])) : []);
      setProviderState("ready");
    }).catch(() => { if (!controller.signal.aborted) setProviderState("unavailable"); });
    return () => controller.abort();
  }, []);
  function setPersistence() { localStorage.setItem("surgalthub-remember", String(remember)); }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email")).trim(); const password = String(form.get("password") || "");
    if (register && password !== String(form.get("confirmation"))) { setSuccess(false);setMessage("Нууц үгүүд таарахгүй байна."); return; }
    if (register && !accepted) { setSuccess(false);setMessage("Үйлчилгээний нөхцөл, нууцлалын бодлогыг зөвшөөрнө үү."); return; }
    if (!supabase) return;
    setBusy(true);setMessage("");setSuccess(false);
    try {
      if (reset) {
        const result = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/reset-password` });
        if (result.error) throw result.error;
        setSuccess(true); setMessage("Энэ имэйл бүртгэлтэй бол нууц үг сэргээх холбоос илгээгдэнэ.");
        return;
      }
      setPersistence();
      const result = register ? await supabase.auth.signUp({ email,password, options: { data: { full_name: String(form.get("full_name")).trim(), terms_accepted_at: new Date().toISOString(), terms_version: "preview-2026-10" } } }) : await supabase.auth.signInWithPassword({ email,password });
      if (result.error) { setMessage(register ? "Бүртгэл үүсгэж чадсангүй. Имэйл, нууц үгээ шалгаад дахин оролдоно уу." : "Нэвтэрч чадсангүй. Имэйл, нууц үг болон имэйл баталгаажуулалтаа шалгана уу."); }
      else if (result.data.session) { router.push("/dashboard");router.refresh(); }
      else { setSuccess(true);setMessage("Баталгаажуулах холбоосыг имэйл рүү илгээлээ. Имэйлээ баталгаажуулаад нэвтрээрэй."); }
    } catch { setMessage("Холболтын алдаа гарлаа. Дахин оролдоно уу."); } finally { setBusy(false); }
  }
  async function oauth(provider: typeof providers[number]) {
    if (register && !accepted) { setSuccess(false);setMessage("Үйлчилгээний нөхцөл, нууцлалын бодлогыг зөвшөөрнө үү."); return; }
    if (!supabase) return;
    setBusy(true);setMessage("");setSuccess(false);
    try {
      setPersistence();
      const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${location.origin}/auth/callback` } });
      if (error) throw error;
    } catch { setMessage("Энэ аргаар нэвтэрч чадсангүй. Дахин оролдоно уу.");setBusy(false); }
  }
  return <section className={`auth-experience ${register ? "register-experience" : ""}`}>
    {register && <Link href="/" className="register-close" aria-label="Бүртгүүлэх хэсгийг хаах">×</Link>}
    <div className="auth-welcome"><div className="auth-welcome-copy"><p className="auth-kicker">{register ? "СУРЧ, ХӨГЖ, ИРЭЭДҮЙГЭЭ БҮТЭЭ!" : "СУРАЛЦАХАД ОЙР БАЙЯ"}</p><h1>{register ? "Бүртгүүлэх" : "Тавтай морил"} <span aria-hidden="true">{register ? "✨" : "👋"}</span></h1><p>{register ? "SurgaltHub-д бүртгүүлээд сургалтуудаа хадгалж, сонирхсон чиглэлээрээ суралцаарай." : "Өөрийн сургалтын төв, сургалтуудаа удирдах, хадгалах, үргэлжлүүлэн үзэх боломжтой."}</p></div><img className="auth-illustration" src={register ? "/images/register-welcome.webp" : "/images/auth-welcome.webp"} alt=""/></div>
    <div className="auth-card"><nav className="auth-tabs" aria-label="Бүртгэлийн сонголт"><Link href="/login" aria-current={!register ? "page" : undefined} className={!register ? "selected" : ""}>Нэвтрэх</Link><Link href="/register" aria-current={register ? "page" : undefined} className={register ? "selected" : ""}>Бүртгүүлэх</Link></nav>
      {reset && <div className="auth-reset-heading"><h2>Нууц үг сэргээх</h2><p>Имэйл хаягаа оруулаад сэргээх холбоос аваарай.</p></div>}
      {!supabase && <p className="notice auth-service-note">Нэвтрэх, бүртгүүлэх үйлчилгээг хараахан холбоогүй байна.</p>}
      <form className="auth-fields" onSubmit={submit} onInput={event => { if (!register) return; const form = event.currentTarget; const password = form.elements.namedItem("password") as HTMLInputElement; const confirmation = form.elements.namedItem("confirmation") as HTMLInputElement; confirmation.setCustomValidity(confirmation.value && confirmation.value !== password.value ? "Нууц үгүүд таарахгүй байна." : ""); }}>
        {register && <label><span>Овог нэр <span className="auth-required" aria-hidden="true">*</span></span><span className="auth-input"><Icon name="user"/><input name="full_name" aria-label="Овог нэр" autoComplete="name" placeholder="Жишээ: Бат-Эрдэнэ" required maxLength={120}/></span></label>}
        <label><span>Имэйл хаяг {register && <span className="auth-required" aria-hidden="true">*</span>}</span><span className="auth-input"><FieldIcon kind="email"/><input aria-label="Имэйл хаяг" name="email" type="email" autoComplete="email" placeholder="name@example.com" required maxLength={254}/></span></label>
        {!reset && <label><span>Нууц үг {register && <span className="auth-required" aria-hidden="true">*</span>}</span><span className="auth-input"><FieldIcon kind="lock"/><input aria-label="Нууц үг" name="password" type={showPassword ? "text" : "password"} autoComplete={register ? "new-password" : "current-password"} minLength={8} maxLength={128} required placeholder="8 болон түүнээс олон тэмдэгт"/><button type="button" className="auth-eye" aria-label={showPassword ? "Нууц үг нуух" : "Нууц үг харах"} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}><FieldIcon kind="eye"/>{!showPassword && <span className="eye-slash"/>}</button></span></label>}
        {register && <><label><span>Нууц үг давтах <span className="auth-required" aria-hidden="true">*</span></span><span className="auth-input"><FieldIcon kind="lock"/><input aria-label="Нууц үг давтах" name="confirmation" type={showConfirmation ? "text" : "password"} autoComplete="new-password" minLength={8} maxLength={128} required placeholder="Нууц үгээ дахин оруулна уу"/><button type="button" className="auth-eye" aria-label={showConfirmation ? "Давтсан нууц үг нуух" : "Давтсан нууц үг харах"} aria-pressed={showConfirmation} onClick={() => setShowConfirmation(!showConfirmation)}><FieldIcon kind="eye"/>{!showConfirmation && <span className="eye-slash"/>}</button></span></label><label className="auth-terms"><input type="checkbox" name="terms" required checked={accepted} onChange={e => setAccepted(e.target.checked)}/><span><Link href="/terms" target="_blank">Үйлчилгээний нөхцөл</Link> болон <Link href="/privacy" target="_blank">Нууцлалын бодлого</Link>той санал нэг байна. <span className="auth-required" aria-hidden="true">*</span></span></label></>}
        {!register && !reset && <div className="auth-options"><label><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}/>Намайг санаарай</label><button type="button" onClick={() => { setReset(true);setMessage(""); }} className="auth-text-button">Нууц үгээ мартсан уу?</button></div>}
        <button className="button auth-submit" disabled={busy || !supabase}>{busy ? "Түр хүлээнэ үү…" : reset ? "Сэргээх холбоос авах" : register ? "Бүртгүүлэх" : "Нэвтрэх"}<Icon name="arrow"/></button>
        <p aria-live="polite" className={`form-message ${success ? "success" : "error"}`}>{message}</p>
      </form>
      {reset ? <button type="button" className="auth-text-button auth-back" onClick={() => { setReset(false);setMessage(""); }}>← Нэвтрэх хэсэгт буцах</button> : <><div className="auth-divider"><span>{register ? "Эсвэл дараах аргаар бүртгүүлж болно" : "Эсвэл дараах аргаар нэвтэрч болно"}</span></div><div className="auth-socials">{providers.map(provider => <button type="button" key={provider} disabled={busy || !supabase || !enabledProviders.includes(provider)} onClick={() => oauth(provider)}><span className={`social-mark ${provider}`} aria-hidden="true">{provider === "google" ? "G" : provider === "apple" ? <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.2 3c.7-.9 1.1-2 1-3-1 .1-2.2.7-2.9 1.5-.7.8-1.2 1.9-1.1 2.9 1.1.1 2.3-.5 3-1.4ZM20 17.5c-.5 1.2-.8 1.8-1.5 2.9-.9 1.2-2.1 2.7-3.6 2.7-1.3 0-1.6-.8-3.4-.8s-2.1.8-3.4.8c-1.5 0-2.6-1.4-3.5-2.7C2.2 16.9 1.5 12.1 3 9.6c1-1.8 2.7-2.9 4.4-2.9 1.5 0 2.4.8 3.6.8 1.1 0 1.9-.8 3.6-.8 1.5 0 3 .8 4 2.1-3.5 1.9-2.9 6.9 1.4 8.7Z"/></svg> : "f"}</span>{provider === "google" ? "Google" : provider === "apple" ? "Apple" : "Facebook"}-ээр {register ? "бүртгүүлэх" : "нэвтрэх"}</button>)}</div>{(!supabase || providers.some(p => !enabledProviders.includes(p))) && <p className="auth-provider-note">{providerState === "loading" ? "Нэвтрэх аргуудыг шалгаж байна…" : providerState === "unavailable" ? "Нэвтрэх үйлчилгээтэй холбогдож чадсангүй. Хуудсыг шинэчлээд дахин оролдоорой." : "Идэвхгүй товчтой нэвтрэх аргуудыг хараахан тохируулаагүй."}</p>}<p className="auth-switch">{register ? "Аль хэдийн бүртгэлтэй юу?" : "Бүртгэлгүй юу?"} <Link href={register ? "/login" : "/register"}>{register ? "Нэвтрэх" : "Бүртгүүлэх"} <Icon name="arrow"/></Link></p></>}
    </div>
  </section>;
}
