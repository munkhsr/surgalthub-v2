"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { categories, districts, type Course, type Center } from "@/lib/data";
import { getCatalog } from "@/lib/catalog";
import { CourseCard } from "./course-card";
import { Flag } from "./flag";
import { Icon } from "./icon";
import { getSubcategories, getSpecializations, levels, timeSlots, ageGroups, gradeGroups } from "@/lib/categories";
export function Catalog({ home = false, initialCategory = "Бүгд" }: { home?: boolean; initialCategory?: string }) {
  const params = useSearchParams();
  const tabs = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || initialCategory);
  useEffect(() => {
    const strip = tabs.current;
    const selected = strip?.querySelector<HTMLButtonElement>("[aria-pressed='true']");
    if (strip && selected) {
      const left = selected.offsetLeft;
      const right = left + selected.offsetWidth;
      if (left < strip.scrollLeft) strip.scrollLeft = Math.max(0, left - 12);
      else if (right > strip.scrollLeft + strip.clientWidth) strip.scrollLeft = right - strip.clientWidth + 12;
    }
  }, [category]);
  const [subcategory,setSubcategory] = useState(params.get("subcategory") || "");
  const [specialization,setSpecialization] = useState(params.get("specialization") || "");
  const [level,setLevel] = useState("");
  const [timeSlot,setTimeSlot] = useState("");
  const [ageGroup,setAgeGroup] = useState("");
  const [gradeGroup,setGradeGroup] = useState("");
  const languageView = !home && category === "Гадаад хэл" && !!subcategory;
  const languageFlags: Record<string,string> = {"Англи хэл":"gb","Хятад хэл":"cn","Солонгос хэл":"kr","Япон хэл":"jp","Герман хэл":"de","Орос хэл":"ru","Франц хэл":"fr"};
  const subcategories = getSubcategories(category);
  const specializations = getSpecializations(category,subcategory);
  const chooseCategory = (value: string) => { setCategory(value);setSubcategory("");setSpecialization("");setAgeGroup("");setGradeGroup(""); };
  const [district, setDistrict] = useState("");
  const [format, setFormat] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [data, setData] = useState<{ courses: Course[]; centers: Center[]; demo: boolean; error?: string } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const clearFilters = () => { setQuery(""); chooseCategory(initialCategory);setLevel("");setTimeSlot(""); setDistrict(""); setFormat(""); setMaxPrice(""); };
  const activeFilters = [
    ...(query.trim() ? [{ label: `Хайлт: ${query.trim()}`, clear: () => setQuery("") }] : []),
    ...(category !== "Бүгд" ? [{ label: category, clear: () => chooseCategory("Бүгд") }] : []),
    ...(subcategory ? [{ label: subcategory, clear: () => { setSubcategory("");setSpecialization(""); } }] : []),
    ...(specialization ? [{ label: specialization, clear: () => setSpecialization("") }] : []),
    ...(level ? [{ label: level, clear: () => setLevel("") }] : []),
    ...(timeSlot ? [{ label: timeSlot, clear: () => setTimeSlot("") }] : []),
    ...(ageGroup ? [{ label: ageGroup+" нас", clear: () => setAgeGroup("") }] : []),
    ...(gradeGroup ? [{ label: gradeGroup+"-р анги", clear: () => setGradeGroup("") }] : []),
    ...(district ? [{ label: district, clear: () => setDistrict("") }] : []),
    ...(format ? [{ label: format, clear: () => setFormat("") }] : []),
    ...(maxPrice ? [{ label: `${Number(maxPrice).toLocaleString("mn-MN")} ₮ хүртэл`, clear: () => setMaxPrice("") }] : []),
  ];
  useEffect(() => { let live = true; getCatalog().then(result => { if (live) setData(result); }).catch(() => { if (live) setData({ courses: [], centers: [], demo: false, error: "Холболт тасарлаа. Дахин оролдоно уу." }); }); return () => { live = false; }; }, [attempt]);
  useEffect(() => { setQuery(params.get("q") || ""); chooseCategory(params.get("category") || initialCategory);setSubcategory(params.get("subcategory") || "");setSpecialization(params.get("specialization") || ""); }, [params, initialCategory]);
  const filtered = useMemo(() => {
    const result = (data?.courses || []).filter(c => (category === "Бүгд" || c.category === category) && (!district || c.district === district) && (!format || c.format === format) && (!maxPrice || c.price <= Number(maxPrice)) && `${c.title} ${c.category} ${c.subcategory || ""} ${c.specialization || ""} ${data?.centers.find(t => t.id === c.center_id)?.name || ""}`.toLocaleLowerCase("mn-MN").includes(query.trim().toLocaleLowerCase("mn-MN")));
    const selected = result.filter(c => (!subcategory || c.subcategory === subcategory) && (!specialization || c.specialization === specialization) && (!level || c.level === level) && (!timeSlot || c.time_slots?.includes(timeSlot)) && (!ageGroup || c.age_groups?.includes(ageGroup)) && (!gradeGroup || c.grade_groups?.includes(gradeGroup)));
    if (sort === "low") selected.sort((a,b) => a.price-b.price);
    if (sort === "high") selected.sort((a,b) => b.price-a.price);
    return selected;
  }, [data, category, district, format, maxPrice, query, sort, subcategory, specialization, level, timeSlot, ageGroup, gradeGroup]);
  return <section className={`catalog-section container ${home ? "home-catalog" : ""} ${languageView ? "language-catalog" : ""}`} id="catalog">
    {languageView && <div className="language-catalog-nav"><Link href="/#languages" aria-label="Хэл сонгох дэлгэц рүү буцах">←</Link>{languageFlags[subcategory] && <Flag country={languageFlags[subcategory]}/>}<strong>{subcategory}</strong><Link href="/" aria-label="Сургалтын жагсаалт хаах">×</Link></div>}
    <div className="section-heading"><div>{!home && <p className="catalog-eyebrow">СУРАЛЦАХ ДАРААГИЙН АЛХАМ</p>}<h2>{home ? (initialCategory === "Гадаад хэл" ? "Онцлох хэлний сургалтууд" : "Онцлох сургалтууд") : (/^(Англи|Хятад|Солонгос|Япон|Герман) хэл$/.test(subcategory || query) && category === "Гадаад хэл" ? `${subcategory || query}ний сургалт` : "Өөрт тохирох сургалтаа олоорой")}</h2><p>{home ? "Шинэ сонирхлоос шинэ ур чадвар руу."  : languageView ? `Бүх түвшний ${subcategory.toLocaleLowerCase()}ний сургалтууд` : "Үнэ, байршил, хуваариар хайж, харьцуулаарай."}</p></div>{home && <Link href={initialCategory === "Бүгд" ? "/courses" : `/courses?category=${encodeURIComponent(initialCategory)}`} className="text-link">Бүгд харах <Icon name="arrow"/></Link>}</div>
    <div ref={tabs} className="category-tabs" aria-label="Сургалтын чиглэл">{categories.map(c => <button key={c.name} aria-label={c.name} aria-pressed={category === c.name} className={category === c.name ? "category-tab selected" : "category-tab"} onClick={() => chooseCategory(c.name)}>{c.name === "ЕБС & Шалгалтын бэлтгэл" ? "ЕБС & Шалгалт" : c.name}</button>)}</div>
    {languageView && <div className="language-specialty-tabs"><button className={!specialization ? "selected" : ""} onClick={() => setSpecialization("")}>Бүх сургалт</button>{specializations.map(s => <button key={s} className={specialization === s ? "selected" : ""} onClick={() => setSpecialization(s)}>{s}</button>)}</div>}
    {languageView ? <><div className="language-filter-panel">
<label>Дүүрэг<select aria-label="Дүүрэг" value={district} onChange={e => setDistrict(e.target.value)}><option value="">Бүх дүүрэг</option>{districts.map(d => <option key={d}>{d}</option>)}</select></label>
<label>Хэлбэр<select aria-label="Хэлбэр" value={format} onChange={e => setFormat(e.target.value)}><option value="">Бүх хэлбэр</option>{["Танхим","Онлайн","Хосолсон"].map(f => <option key={f}>{f}</option>)}</select></label>
<label>Түвшин<select aria-label="Түвшин" value={level} onChange={e => setLevel(e.target.value)}><option value="">Бүх түвшин</option>{levels.map(l => <option key={l}>{l}</option>)}</select></label>
<label>Хичээллэх цаг<select aria-label="Хичээллэх цаг" value={timeSlot} onChange={e => setTimeSlot(e.target.value)}><option value="">Бүх цаг</option>{timeSlots.map(t => <option key={t}>{t}</option>)}</select></label>
<label>Үнэ<select aria-label="Төлбөрийн дээд хэмжээ" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}><option value="">Бүх үнэ</option><option value="200000">200,000 ₮ хүртэл</option><option value="300000">300,000 ₮ хүртэл</option><option value="500000">500,000 ₮ хүртэл</option></select></label>
<label>Эхлэх хугацаа<select aria-label="Эхлэх хугацаа" disabled title="Сургалтуудын эхлэх огноо хараахан нэмэгдээгүй"><option>Бүх огноо</option></select></label>
</div><label className="filter-search language-search"><span><Icon name="search"/></span><input aria-label="Сургалт хайх" placeholder="Сургалт эсвэл төвийн нэрээр хайх..." value={query} onChange={e => setQuery(e.target.value)}/></label></> : <>{!home && <div className="hierarchy-filters"><label>Дэд төрөл<select aria-label="Дэд төрөл" value={subcategory} disabled={!subcategories.length} onChange={e => { setSubcategory(e.target.value);setSpecialization(""); }}><option value="">{subcategories.length ? "Бүх дэд төрөл" : "Эхлээд ангиллаа сонгоорой"}</option>{subcategories.map(s => <option key={s.name}>{s.name}</option>)}</select></label>{specializations.length > 0 && <label>Чиглэл / зорилго<select aria-label="Чиглэл / зорилго" value={specialization} onChange={e => setSpecialization(e.target.value)}><option value="">Бүх чиглэл</option>{specializations.map(s => <option key={s}>{s}</option>)}</select></label>}<label>Түвшин<select aria-label="Түвшин" value={level} onChange={e => setLevel(e.target.value)}><option value="">Бүх түвшин</option>{levels.map(l => <option key={l}>{l}</option>)}</select></label><label>Хичээллэх цаг<select aria-label="Хичээллэх цаг" value={timeSlot} onChange={e => setTimeSlot(e.target.value)}><option value="">Бүх цаг</option>{timeSlots.map(t => <option key={t}>{t}</option>)}</select></label>{category === "Хүүхдийн хөгжил" && <label>Нас<select aria-label="Нас" value={ageGroup} onChange={e => setAgeGroup(e.target.value)}><option value="">Бүх нас</option>{ageGroups.filter(a => a !== "18+").map(a => <option value={a} key={a}>{a} нас</option>)}</select></label>}{category === "ЕБС & Шалгалтын бэлтгэл" && <label>Анги<select aria-label="Анги" value={gradeGroup} onChange={e => setGradeGroup(e.target.value)}><option value="">Бүх анги</option>{gradeGroups.map(g => <option value={g} key={g}>{g}-р анги</option>)}</select></label>}</div>}
    <div className="filters"><label className="filter-search"><span><Icon name="search"/></span><input aria-label="Сургалт хайх" placeholder="Сургалт эсвэл төвийн нэрээр хайх" value={query} onChange={e => setQuery(e.target.value)}/></label><select aria-label="Дүүрэг" value={district} onChange={e => setDistrict(e.target.value)}><option value="">Бүх дүүрэг</option>{districts.map(d => <option key={d}>{d}</option>)}</select><select aria-label="Хэлбэр" value={format} onChange={e => setFormat(e.target.value)}><option value="">Бүх хэлбэр</option>{["Танхим", "Онлайн", "Хосолсон"].map(f => <option key={f}>{f}</option>)}</select><select aria-label="Төлбөрийн дээд хэмжээ" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}><option value="">Бүх үнэ</option><option value="200000">200,000 ₮ хүртэл</option><option value="300000">300,000 ₮ хүртэл</option><option value="500000">500,000 ₮ хүртэл</option></select></div></>}
    {!home && activeFilters.length > 0 && <div className="active-filters" aria-label="Сонгосон шүүлтүүрүүд">{activeFilters.map(f => <button key={f.label} className="filter-chip" onClick={f.clear} aria-label={`${f.label} шүүлтүүрийг хасах`}>{f.label}<span aria-hidden="true">×</span></button>)}<button className="clear-filters" onClick={clearFilters}>Бүгдийг цэвэрлэх</button></div>}
    <div className="results-bar"><span aria-live="polite">{data ? <><strong>{filtered.length}</strong> сургалт олдлоо</> : "Сургалтуудыг ачаалж байна…"}{data?.demo && <span className="demo-pill">Жишээ мэдээлэл</span>}</span><label>Эрэмбэлэх <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Эрэмбэлэх"><option value="newest">Шинээр нэмэгдсэн</option><option value="low">Үнэ: багаас их</option><option value="high">Үнэ: ихээс бага</option></select></label></div>
    {data?.error ? <div className="empty-state"><h3>{data.error}</h3><button className="button" onClick={() => { setData(null); setAttempt(attempt+1); }}>Дахин ачаалах</button></div> : !data ? <div className="loading-grid" aria-busy="true">{[1,2,3].map(n => <div className="skeleton" key={n}/>)}</div> : filtered.length ? <div className="course-grid">{(home ? filtered.slice(0,6) : filtered).map(c => <CourseCard key={c.id} course={c} center={data.centers.find(t => t.id === c.center_id)}/>)}</div> : <div className="empty-state"><span><Icon name="search"/></span><h3>Тохирох сургалт олдсонгүй</h3><p>Өөр түлхүүр үг эсвэл шүүлтүүрээр хайгаарай.</p><button className="button" onClick={clearFilters}>Шүүлтүүр арилгах</button></div>}
    {home && <p className="swipe-hint">Хажуу тийш гүйлгэж бусад сургалтыг хараарай <Icon name="arrow"/></p>}
    {data?.demo && <p className="demo-note">Энэ бол сайтын танилцуулгын жишээ мэдээлэл. Төвүүд, хуваарь, төлбөр нь бодит санал биш.</p>}
  </section>;
}

