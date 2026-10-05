import Link from "next/link";
import { Suspense } from "react";
import { Catalog } from "@/components/catalog";
import { Flag } from "@/components/flag";
import { Icon } from "@/components/icon";
export const metadata = { title: "Хэлний сургалт" };
const languages = [["gb", "Англи хэл"], ["cn", "Хятад хэл"], ["kr", "Солонгос хэл"], ["jp", "Япон хэл"], ["de", "Герман хэл"], ["ru", "Орос хэл"], ["fr", "Франц хэл"], ["other", "Бусад хэл"]];
export default function Page() { return <><section className="container page-section"><div className="breadcrumbs"><Link href="/">Нүүр</Link> › Хэлний сургалт</div><div className="language-hero"><div><h1>Хэлний<br/>сургалт</h1><p>Гадаад хэл сурч, шинэ<br/>боломжуудаа нээгээрэй.</p></div><img className="language-art" src="/images/language-globe-v2.webp" alt=""/></div><h2>Хэл сонгох</h2><div className="language-grid">{languages.map(([flag,name]) => <Link className="language-tile" href={`/courses?category=${encodeURIComponent("Гадаад хэл")}&subcategory=${encodeURIComponent(name)}`} key={name}><span>{flag === "other" ? <span className="language-other-icon"><Icon name="grid"/></span> : <Flag country={flag}/>}</span><h3>{name}</h3><small>Сургалт үзэх</small></Link>)}</div><div className="language-banner"><span>📚</span><div><h2>Гадаад хэл сураад шинэ боломж нээ!</h2><p>Өөрт тохирох хэл, хуваарь, төлбөрөө сонгоорой.</p></div></div></section><Suspense><Catalog home initialCategory="Гадаад хэл"/></Suspense></>; }
