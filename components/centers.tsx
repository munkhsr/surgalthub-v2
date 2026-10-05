"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getCatalog } from "@/lib/catalog";
import type { Center, Course } from "@/lib/data";
import { CourseCard } from "./course-card";
export function CenterCard({ center, count, index = 0 }: { center: Center; count: number; index?: number }) {
  return <Link href={`/centers/${center.id}`} className="center-card"><span className={`center-logo logo-${index%3}`}>{center.name.slice(0,2)}</span><div><h3>{center.name}</h3><p>{count} сургалт</p><small>⌖ {center.district}</small></div></Link>;
}
export function HomeCenters() {
  const [data,setData] = useState<Awaited<ReturnType<typeof getCatalog>> | null>(null);
  useEffect(() => { getCatalog().then(setData).catch(() => {}); }, []);
  return <section className="container home-centers"><div className="home-centers-list"><div className="section-heading"><h2>Сургалтын төвүүд</h2><Link href="/centers" className="text-link">Бүгд харах →</Link></div><div className="center-grid">{data?.centers.slice(0,3).map((c,i) => <CenterCard key={c.id} center={c} index={i} count={data.courses.filter(t => t.center_id === c.id).length}/>)}</div></div><div className="center-cta"><h3>Сургалтын төвөөр бүртгүүлэх</h3><p>Төвөө танилцуулж, сургалтуудаа олон хүнд хүргээрэй.</p><Link href="/register" className="button">Сургалтын төвийн бүртгэл →</Link></div></section>;
}
export function Centers({ id }: { id?: string }) {
  const [data,setData] = useState<{ courses: Course[]; centers: Center[]; demo: boolean; error?: string } | null>(null);
  const [query,setQuery] = useState("");
  useEffect(() => { getCatalog().then(setData).catch(() => setData({ courses: [], centers: [], demo: false, error: "Мэдээллийг ачаалж чадсангүй." })); }, []);
  if (!data) return <div className="container empty-state">Ачаалж байна…</div>;
  if (data.error) return <div className="container empty-state" role="alert">{data.error}</div>;
  const center = id ? data.centers.find(c => c.id === id) : undefined;
  if (id && !center) return <div className="container empty-state"><h2>Сургалтын төв олдсонгүй</h2><Link href="/centers">Бүх төвүүдийг харах →</Link></div>;
  return <section className="container page-section">{data.demo && <p className="demo-pill">Жишээ мэдээлэл</p>}{center ? <><Link className="text-link" href="/centers">← Сургалтын төвүүд</Link><div className="center-profile"><span className="center-logo">{center.name.slice(0,2)}</span><div><h1>{center.name}</h1><p>{center.description}</p><p>⌖ {center.address}</p><div className="contact-links">{center.phone && <a href={`tel:${center.phone}`}>☏ {center.phone}</a>}{center.email && <a href={`mailto:${center.email}`}>{center.email}</a>}</div></div></div><h2>Тус төвийн сургалтууд</h2><div className="course-grid">{data.courses.filter(c => c.center_id === id).map(c => <CourseCard key={c.id} course={c} center={center}/>)}</div>{!data.courses.some(c => c.center_id === id) && <p className="empty-state">Одоогоор нийтэлсэн сургалт байхгүй.</p>}</> : <><h1>Сургалтын төвүүд</h1><p>Улаанбаатарын сургалтын төвүүдтэй танилцаарай.</p><input className="standalone-search" aria-label="Төвийн нэр хайх" placeholder="Төвийн нэр эсвэл дүүргээр хайх" value={query} onChange={e => setQuery(e.target.value)}/><div className="center-grid">{data.centers.filter(c => `${c.name} ${c.district}`.toLowerCase().includes(query.trim().toLowerCase())).map((c,i) => <CenterCard key={c.id} center={c} index={i} count={data.courses.filter(t => t.center_id === c.id).length}/>)}</div>{!data.centers.filter(c => `${c.name} ${c.district}`.toLowerCase().includes(query.trim().toLowerCase())).length && <p className="empty-state">Тохирох төв олдсонгүй.</p>}</>}</section>;
}
