"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { categories, districts, money, type Center, type Course } from "@/lib/data";
import { CourseClassification } from "./course-classification";
const statusLabels = { pending: "Хүлээгдэж буй", approved: "Нийтлэгдсэн", rejected: "Буцаасан" };
export function Dashboard() {
  const router = useRouter();
  const [loading,setLoading] = useState(true);
  const [userId,setUserId] = useState("");
  const [center,setCenter] = useState<Center | null>(null);
  const [courses,setCourses] = useState<Course[]>([]);
  const [editing,setEditing] = useState<Course | null>(null);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  const [admin,setAdmin] = useState(false);
  const [formKey,setFormKey] = useState(0);
  async function load(id: string) {
    if (!supabase) return;
    const result = await supabase.from("centers").select("*").eq("owner_id",id).maybeSingle();
    if (result.error) throw result.error;
    setCenter(result.data as Center | null);
    if (result.data) {
      const list = await supabase.from("courses").select("*").eq("center_id",result.data.id).order("created_at",{ ascending: false });
      if (list.error) throw list.error;
      setCourses(list.data as Course[]);
    } else { setCourses([]); }
  }
  useEffect(() => {
    async function init() {
      if (!supabase) { setLoading(false);return; }
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) { router.replace("/login");return; }
        setUserId(data.user.id);
        const profile = await supabase.from("profiles").select("role").eq("id",data.user.id).maybeSingle();
        setAdmin(profile.data?.role === "admin");
        await load(data.user.id);
      } catch { setMessage("Мэдээллийг ачаалж чадсангүй. Supabase хүснэгтүүд болон холболтоо шалгана уу."); }
      finally { setLoading(false); }
    } init();
  }, [router]);
  async function saveCenter(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();if (!supabase || !userId) return;
    setBusy(true);setMessage("");
    const form = new FormData(e.currentTarget);
    const values = { owner_id: userId, name: String(form.get("name")).trim(), description: String(form.get("description")).trim(), district: String(form.get("district")), address: String(form.get("address")).trim(), phone: String(form.get("phone")).trim(), email: String(form.get("email")).trim() };
    try {
      const result = center ? await supabase.from("centers").update(values).eq("id",center.id) : await supabase.from("centers").insert(values);
      if (result.error) throw result.error;
      await load(userId);setMessage("Төвийн мэдээллийг хадгаллаа.");
    } catch { setMessage("Хадгалж чадсангүй. Оруулсан мэдээлэл болон холболтоо шалгаарай."); } finally { setBusy(false); }
  }
  async function saveCourse(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();if (!supabase || !center) return;
    setBusy(true);setMessage("");
    const form = new FormData(e.currentTarget);
    const price = Number(form.get("price"));
    if (!Number.isFinite(price) || price < 0) { setMessage("Төлбөрөө зөв оруулна уу.");setBusy(false);return; }
    const values = { center_id: center.id, title: String(form.get("title")).trim(), category: String(form.get("category")), subcategory: String(form.get("subcategory") || "") || null, specialization: String(form.get("specialization") || "") || null, level: String(form.get("level") || "") || null, time_slots: form.getAll("time_slots").map(String), age_groups: form.getAll("age_groups").map(String), grade_groups: form.getAll("grade_groups").map(String), district: center.district, price, duration: String(form.get("duration")).trim(), schedule: String(form.get("schedule")).trim(), audience: String(form.get("audience")).trim(), format: String(form.get("format")), description: String(form.get("description")).trim(), syllabus: String(form.get("syllabus")).split("\n").map(s => s.trim()).filter(Boolean), status: "pending" };
    try {
      const result = editing ? await supabase.from("courses").update(values).eq("id",editing.id) : await supabase.from("courses").insert(values);
      if (result.error) throw result.error;
      await load(userId);setEditing(null);setFormKey(k => k+1);setMessage("Сургалтыг хадгалж, админд шалгуулахаар илгээлээ.");
    } catch { setMessage("Сургалтыг хадгалж чадсангүй. Дахин оролдоно уу."); } finally { setBusy(false); }
  }
  if (loading) return <div className="container empty-state">Удирдлагын хэсгийг ачаалж байна…</div>;
  if (!supabase) return <div className="container empty-state"><h1>Сургалтын төвийн удирдлага</h1><p>Supabase холбогдсоны дараа төвөө бүртгүүлж, сургалтаа нэмэх боломжтой.</p><Link className="button" href="/courses">Сургалтуудыг үзэх</Link></div>;
  if (!userId) return <div className="container empty-state"><Link className="button" href="/login">Нэвтрэх</Link></div>;
  return <section className="container page-section"><div className="dashboard-heading"><div><h1>Миний сургалтын төв</h1><p>Төвийн мэдээлэл болон сургалтуудаа удирдаарай.</p></div><div className="actions">{admin && <Link className="button button-small" href="/admin">Админ удирдлага</Link>}<button disabled={busy} onClick={async () => { setBusy(true); try { const { error } = await supabase!.auth.signOut(); if (error) throw error; router.push("/login"); } catch { setMessage("Гарч чадсангүй. Дахин оролдоно уу."); } finally { setBusy(false); } }}>Гарах</button></div></div><p className="form-message" role="status">{message}</p><div className="dashboard-grid"><div className="dashboard-panel"><h2>{center ? "Төвийн мэдээлэл" : "Төвөө бүртгүүлэх"}</h2><form key={center?.id || "new"} className="form-stack" onSubmit={saveCenter}><label>Төвийн нэр<input name="name" defaultValue={center?.name} required maxLength={120}/></label><label>Танилцуулга<textarea name="description" defaultValue={center?.description} required maxLength={3000}/></label><label>Дүүрэг<select name="district" defaultValue={center?.district || districts[0]}>{districts.map(d => <option key={d}>{d}</option>)}</select></label><label>Дэлгэрэнгүй хаяг<input name="address" defaultValue={center?.address} required maxLength={300}/></label><div className="form-row"><label>Холбоо барих утас<input name="phone" type="tel" defaultValue={center?.phone} required pattern="[+0-9 ()-]{8,20}" title="8–20 тэмдэгттэй утасны дугаар" maxLength={20}/></label><label>Нийтийн имэйл<input name="email" type="email" defaultValue={center?.email} required maxLength={254}/></label></div><p className="muted">Хаяг, утас, имэйл нь төвийн танилцуулгад нийтэд харагдана.</p><button className="button" disabled={busy}>{busy ? "Хадгалж байна…" : "Төвийн мэдээлэл хадгалах"}</button></form></div><div className="dashboard-panel"><h2>{editing ? "Сургалт засах" : "Шинэ сургалт нэмэх"}</h2>{!center ? <p className="notice">Эхлээд төвийн мэдээллээ бүртгүүлээрэй.</p> : <form key={`${editing?.id || "new"}-${formKey}`} className="form-stack" onSubmit={saveCourse}><label>Сургалтын нэр<input name="title" required maxLength={160} defaultValue={editing?.title}/></label><CourseClassification course={editing}/><div className="form-row"><label>Нийт төлбөр (₮)<input name="price" type="number" min={0} max={100000000} step={1} required defaultValue={editing?.price}/></label><label>Хугацаа<input name="duration" placeholder="8 долоо хоног" required maxLength={100} defaultValue={editing?.duration}/></label></div><label>Хуваарь<input name="schedule" placeholder="Даваа, Лхагва • 18:30–20:00" required maxLength={200} defaultValue={editing?.schedule}/></label><label>Нас / түвшин<input name="audience" placeholder="16+ нас • Анхан шат" required maxLength={100} defaultValue={editing?.audience}/></label><label>Сургалтын тухай<textarea name="description" required maxLength={5000} defaultValue={editing?.description}/></label><label>Хөтөлбөр (мөр бүрт нэг сэдэв)<textarea name="syllabus" required maxLength={5000} defaultValue={editing?.syllabus.join("\n")}/></label><p className="muted">Шинэ болон зассан сургалтыг админ шалгаж нийтэлнэ.</p><button className="button" disabled={busy}>{busy ? "Хадгалж байна…" : "Хадгалж, шалгуулахаар илгээх"}</button>{editing && <button className="button button-ghost" type="button" disabled={busy} onClick={() => { setEditing(null);setFormKey(k => k+1); }}>Засахыг цуцлах</button>}</form>}</div></div><div className="dashboard-courses"><h2>Миний сургалтууд ({courses.length})</h2>{!courses.length && <p className="notice">Та сургалтаа хараахан нэмээгүй байна.</p>}{courses.map(c => <div className="dashboard-course" key={c.id}><div><h3>{c.title}</h3><p>{money(c.price)} · {c.duration}</p></div><div className="actions"><span className={`status ${c.status}`}>{statusLabels[c.status]}</span><button disabled={busy} onClick={() => { setEditing(c);setFormKey(k => k+1);window.scrollTo({ top: 0, behavior: "smooth" }); }}>Засах</button>{c.status === "approved" && <Link className="text-link" href={`/courses/${c.id}`}>Харах →</Link>}</div></div>)}</div></section>;
}
