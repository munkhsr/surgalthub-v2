"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getCatalog } from "@/lib/catalog";
import { CourseCard } from "@/components/course-card";
export default function Page() {
  const [ids,setIds] = useState<string[]>([]);
  const [data,setData] = useState<Awaited<ReturnType<typeof getCatalog>> | null>(null);
  useEffect(() => { const sync = () => { try { setIds(JSON.parse(localStorage.getItem("surgalthub-saved") || "[]")); } catch { setIds([]); } }; sync(); window.addEventListener("saved-updated",sync); getCatalog().then(setData).catch(() => setData({ courses: [], centers: [], demo: false, error: "Мэдээллийг ачаалж чадсангүй." })); return () => window.removeEventListener("saved-updated",sync); }, []);
  const saved = data?.courses.filter(c => ids.includes(c.id)) || [];
  return <section className="container page-section"><h1>Хадгалсан сургалтууд</h1><p>Таны энэ төхөөрөмж дээр хадгалсан сонголтууд.</p>{!data ? <p className="empty-state">Ачаалж байна…</p> : data.error ? <p role="alert">{data.error}</p> : saved.length ? <div className="course-grid">{saved.map(c => <CourseCard key={c.id} course={c} center={data.centers.find(t => t.id === c.center_id)}/>)}</div> : <div className="empty-state"><span>♡</span><h2>Хадгалсан сургалт байхгүй</h2><p>Сургалтын зүрхэн товчийг дарж энд хадгалаарай.</p><Link className="button" href="/courses">Сургалт хайх</Link></div>}</section>;
}
