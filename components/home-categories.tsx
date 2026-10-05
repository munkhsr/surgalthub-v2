"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { courseCategories, type CourseCategory } from "@/lib/categories";
import { Flag } from "./flag";
import { getCatalog } from "@/lib/catalog";
import { Icon } from "./icon";

const featuredNames = ["Гадаад хэл", "IT & Технологи", "ЕБС & Шалгалтын бэлтгэл", "Хүүхдийн хөгжил", "Бизнес & Мэргэжлийн хөгжил"];
const allNames = ["Гадаад хэл", "ЕБС & Шалгалтын бэлтгэл", "Хүүхдийн хөгжил", "IT & Технологи", "Бизнес & Мэргэжлийн хөгжил", "Спорт & Эрүүл мэнд", "Урлаг & Дизайн", "Гоо сайхан", "Жолооны сургалт", "Мэргэжил олгох & Ур чадвар"];
const ordered = allNames.map(name => courseCategories.find(c => c.name === name)!);
const featured = featuredNames.map(name => courseCategories.find(c => c.name === name)!);
const countries: Record<string,string> = {"Англи хэл":"gb","Хятад хэл":"cn","Солонгос хэл":"kr","Япон хэл":"jp","Герман хэл":"de","Орос хэл":"ru","Франц хэл":"fr"};
const categoryIcon = (category: CourseCategory) => category.name === "Хүүхдийн хөгжил" ? "👶" : category.icon;

export function HomeCategories() {
  const [counts, setCounts] = useState<Record<string,number>>({});
  useEffect(() => { let live = true; getCatalog().then(data => { if (!live) return; const totals: Record<string,number> = {}; data.courses.forEach(c => { if (c.category === "Гадаад хэл" && c.subcategory) totals[c.subcategory] = (totals[c.subcategory] || 0) + 1; }); setCounts(totals); }); return () => { live = false; }; }, []);
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<CourseCategory | null>(null);
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  function showAll() {
    setSelected(null); setQuery(""); setOpen(true); dialog.current?.showModal();
  }
  function close() { dialog.current?.close(); }
  useEffect(() => { if (window.location.hash === "#languages") { setSelected(courseCategories.find(c => c.name === "Гадаад хэл")!); setOpen(true); dialog.current?.showModal(); } }, []);
  const matches = (name: string) => name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
  const visibleCategories = ordered.filter(c => matches(c.name));
  const visibleSubcategories = selected?.subcategories.filter(c => matches(c.name)) || [];
  return <section className="container categories-section">
    <div className="section-heading"><h2>Сургалтын ангилал</h2><button type="button" className="text-link category-open-link" onClick={showAll}>Бүх ангилал харах →</button></div>
    <div className="category-grid featured-category-grid">
      {featured.map(category => <Link key={category.name} className="category-tile" href={category.name === "Гадаад хэл" ? "/languages" : `/courses?category=${encodeURIComponent(category.name)}`}><span aria-hidden="true">{categoryIcon(category)}</span><h3>{category.name === "ЕБС & Шалгалтын бэлтгэл" ? "ЕБС & Шалгалтын бэлтгэл" : category.name}</h3><p>{category.description}</p></Link>)}
      <button type="button" className="category-tile all-category-toggle" aria-haspopup="dialog" onClick={showAll}><span aria-hidden="true"><Icon name="grid"/></span><h3>Бүх ангилал</h3><p>Бүх төрлийн сургалт →</p></button>
    </div>
    <dialog ref={dialog} className="category-dialog" aria-labelledby="category-dialog-title" onClose={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div className="category-dialog-surface">
        <header className="category-dialog-header">
          {selected && <button type="button" className="category-dialog-icon" aria-label="Бүх ангилал руу буцах" onClick={() => { setSelected(null); setQuery(""); }}>←</button>}
          <h2 id="category-dialog-title">{selected ? `${categoryIcon(selected)} ${selected.name}` : "Бүх сургалтын ангилал"}</h2>
          <button type="button" className="category-dialog-icon" aria-label="Ангиллын цонх хаах" onClick={close}>×</button>
        </header>
        <div className="category-dialog-content">
          <label className="category-dialog-search"><Icon name="search"/><input autoFocus type="search" aria-label={selected ? "Дэд төрөл хайх" : "Ангилал хайх"} placeholder={selected ? "Дэд төрөл хайх" : "Ангилал хайх"} value={query} onChange={event => setQuery(event.target.value)}/></label>
          <div className="category-dialog-list">
            {selected ? <>
              <Link className="category-dialog-row category-view-all" href={`/courses?category=${encodeURIComponent(selected.name)}`} onClick={close}><span>Энэ ангиллын бүх сургалт</span><Icon name="arrow"/></Link>
              {visibleSubcategories.map(sub => <Link className="category-dialog-row" key={sub.name} href={`/courses?category=${encodeURIComponent(selected.name)}&subcategory=${encodeURIComponent(sub.name)}`} onClick={close}>{selected.name === "Гадаад хэл" && <span className="category-row-emoji">{countries[sub.name] ? <Flag country={countries[sub.name]}/> : "🌐"}</span>}<span className="category-row-copy"><strong>{sub.name}</strong>{selected.name === "Гадаад хэл" && <small>{counts[sub.name] || 0} сургалт</small>}</span><Icon name="arrow"/></Link>)}
            </> : visibleCategories.map(category => <button type="button" className="category-dialog-row" aria-label={category.name} key={category.name} onClick={() => { setSelected(category); setQuery(""); }}><span className="category-row-emoji" aria-hidden="true">{categoryIcon(category)}</span><span className="category-row-copy"><strong>{category.name}</strong><small>{category.subcategories.slice(0,3).map(sub => sub.name).join(", ")}...</small></span><Icon name="arrow"/></button>)}
            {(selected ? visibleSubcategories.length : visibleCategories.length) === 0 && <p className="category-search-empty">Тохирох ангилал олдсонгүй.</p>}
          </div>
        </div>
      </div>
    </dialog>
  </section>;
}
