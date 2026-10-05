"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { money, type Course, type Center } from "@/lib/data";
export function Admin() {
  const [loading,setLoading] = useState(true);
  const [allowed,setAllowed] = useState(false);
  const [courses,setCourses] = useState<Course[]>([]);
  const [centers,setCenters] = useState<Center[]>([]);
  const [message,setMessage] = useState("");
  const [busy,setBusy] = useState(false);
  async function load() {
    if (!supabase) return;
    const [a,b] = await Promise.all([supabase.from("courses").select("*").eq("status","pending").order("created_at"),supabase.from("centers").select("*")]);
    if (a.error || b.error) throw a.error || b.error;
    setCourses(a.data as Course[]);setCenters(b.data as Center[]);
  }
  useEffect(() => { async function init() {
    if (!supabase) { setLoading(false);return; }
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      const profile = await supabase.from("profiles").select("role").eq("id",data.user.id).maybeSingle();
      if (profile.data?.role !== "admin") return;
      setAllowed(true);await load();
    } catch { setMessage("Мэдээллийг ачаалж чадсангүй."); } finally { setLoading(false); }
  } init(); }, []);
  async function review(id: string,status: "approved" | "rejected") {
    if (!supabase) return;
    setBusy(true);setMessage("");
    try { const result = await supabase.from("courses").update({ status }).eq("id",id).eq("status","pending").select("id");if (result.error) throw result.error;if (!result.data?.length) throw new Error("Changed");await load();setMessage(status === "approved" ? "Сургалтыг нийтэллээ." : "Сургалтыг төвд буцаалаа."); } catch { setMessage("Үйлдлийг хийж чадсангүй. Мэдээлэл өөрчлөгдсөн эсвэл эрх хүрэлцэхгүй байж болно."); } finally { setBusy(false); }
  }
  if (loading) return <div className="container empty-state">Ачаалж байна…</div>;
  if (!allowed) return <div className="container empty-state"><h1>Админ эрх шаардлагатай</h1><p>{supabase ? "Энэ хуудсыг зөвхөн админ ашиглана." : "Supabase холболт хараахан тохируулагдаагүй."}</p><Link className="button" href="/dashboard">Төвийн удирдлага руу</Link></div>;
  return <section className="container page-section"><div className="section-heading"><h1>Сургалт шалгаж нийтлэх</h1><Link className="text-link" href="/dashboard">Миний төв →</Link></div><p role="status">{message}</p>{!courses.length && <p className="notice">Шалгах сургалт байхгүй байна.</p>}{courses.map(c => <article className="dashboard-panel" key={c.id} style={{ marginBottom: 20 }}><span className="status">Хүлээгдэж буй</span><h2 style={{ marginTop: 12 }}>{c.title}</h2><p>{centers.find(t => t.id === c.center_id)?.name} · {c.category} · {c.district}</p><p>{money(c.price)} · {c.duration} · {c.schedule} · {c.audience} · {c.format}</p><p>{[c.subcategory,c.specialization,c.level,...(c.time_slots || []),...(c.age_groups || []).map(a=>a+" нас"),...(c.grade_groups || []).map(g=>g+"-р анги")].filter(Boolean).join(" · ")}</p><p>{c.description}</p><ul>{c.syllabus.map((s,i) => <li key={i}>{s}</li>)}</ul><div className="actions"><button disabled={busy} onClick={() => review(c.id,"approved")}>Баталж нийтлэх</button><button disabled={busy} onClick={() => review(c.id,"rejected")}>Засуулахаар буцаах</button></div></article>)}</section>;
}
