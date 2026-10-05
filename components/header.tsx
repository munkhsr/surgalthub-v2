"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "./icon";
export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return <header className="header"><div className="container header-inner">
    <Link className="brand" href="/" aria-label="SurgaltHub нүүр"><svg className="brand-symbol" viewBox="0 0 40 36" fill="none" aria-hidden="true"><path d="M2 10 20 2l18 8-18 9L2 10Z" fill="currentColor"/><path d="M8 17v10l12 7 12-7V17l-12 6-12-6Z" fill="currentColor"/><path d="M37 12v14" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg><span>Surgalt<span className="brand-accent">Hub</span></span></Link>
    <div className="mobile-header-actions"><Link href="/courses" aria-label="Сургалт хайх"><Icon name="search"/></Link><Link href="/saved" aria-label="Хадгалсан сургалтууд"><Icon name="heart"/></Link><button className="menu-toggle" aria-label="Цэс" aria-expanded={open} onClick={() => setOpen(!open)}><Icon name="menu"/></button></div>
    <nav className={open ? "nav open" : "nav"} aria-label="Үндсэн цэс">
      <Link onClick={() => setOpen(false)} className={path === "/" ? "active" : ""} href="/">Нүүр</Link>
      <Link onClick={() => setOpen(false)} className={path.startsWith("/courses") ? "active" : ""} href="/courses">Сургалтууд</Link>
      <Link onClick={() => setOpen(false)} className={path.startsWith("/centers") ? "active" : ""} href="/centers">Сургалтын төвүүд</Link>
      <Link className="header-icon-button" onClick={() => setOpen(false)} href="/courses" aria-label="Сургалт хайх"><Icon name="search"/></Link>
      <Link className="header-icon-button" onClick={() => setOpen(false)} href="/saved" aria-label="Хадгалсан сургалтууд"><Icon name="heart"/></Link>
      <Link onClick={() => setOpen(false)} className="button button-ghost button-small" href="/login">Нэвтрэх</Link>
      <Link onClick={() => setOpen(false)} className="button button-small" href="/register">Бүртгүүлэх</Link>
    </nav>
  </div><nav className="bottom-nav" aria-label="Гар утасны цэс"><Link href="/" className={path === "/" ? "active" : ""}><Icon name="home"/>Нүүр</Link><Link href="/courses" className={path.startsWith("/courses") || path === "/languages" ? "active" : ""}><Icon name="book"/>Сургалтууд</Link><Link href="/saved" className={path === "/saved" ? "active" : ""}><Icon name="heart"/>Хадгалсан</Link><Link href="/login" className={path === "/login" ? "active" : ""}><Icon name="user"/>Нэвтрэх</Link></nav></header>;
}
