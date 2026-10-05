"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { coursePhoto, money, type Course, type Center } from "@/lib/data";
import { Icon } from "./icon";
export function SaveButton({ id }: { id: string }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => { const sync = () => { try { setSaved((JSON.parse(localStorage.getItem("surgalthub-saved") || "[]") as string[]).includes(id)); } catch { setSaved(false); } }; sync(); window.addEventListener("saved-updated", sync); return () => window.removeEventListener("saved-updated", sync); }, [id]);
  return <button className={`save-button ${saved ? "is-saved" : ""}`} aria-label={saved ? "Хадгалснаас хасах" : "Сургалт хадгалах"} aria-pressed={saved} onClick={() => { try { const ids: string[] = JSON.parse(localStorage.getItem("surgalthub-saved") || "[]"); localStorage.setItem("surgalthub-saved", JSON.stringify(saved ? ids.filter(i => i !== id) : [...new Set([...ids, id])])); setSaved(!saved); window.dispatchEvent(new Event("saved-updated")); } catch { /* Storage may be disabled in private browsing. */ } }}><Icon name="heart" fill={saved ? "currentColor" : "none"}/></button>;
}
export function CourseCard({ course, center }: { course: Course; center?: Center }) {
  return <article className="course-card"><Link href={`/courses/${course.id}`} className="course-image-link" tabIndex={-1} aria-hidden="true"><div className="course-art" style={{ backgroundImage: `url(${coursePhoto(course)})` }}><span className="format-badge">{course.category}</span></div></Link><SaveButton id={course.id}/><div className="card-body"><div className="card-meta"><span>{course.category}</span><span><Icon name="clock"/> {course.duration}</span></div><h3><Link href={`/courses/${course.id}`}>{course.title}</Link></h3><p className="center-name"><Icon name="building"/> {center?.name || "Сургалтын төв"}</p><p className="location"><Icon name="pin"/> {course.district} · {course.audience}</p><div className="card-bottom"><span className="card-format"><Icon name="laptop"/>{course.format}</span><strong>{money(course.price)}</strong></div></div></article>;
}
