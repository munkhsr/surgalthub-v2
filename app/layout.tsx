import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import "./globals.css";
import "./design-refinements.css";
import "./polish.css";
import "./hierarchy.css";
export const metadata: Metadata = { title: { default: "СургалтHub — Шинэ чадвар. Шинэ боломж.", template: "%s | СургалтHub" }, description: "Улаанбаатарын сургалтуудыг чиглэл, дүүрэг, үнэ, хуваариар хайж, өөрт тохирох сургалтаа олоорой." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="mn"><body><a className="skip-link" href="#main">Үндсэн агуулга руу</a><Header/><main id="main">{children}</main><footer className="footer"><div className="container footer-main"><div><Link className="brand" href="/">Сургалт<span className="brand-accent">Hub</span></Link><p>Суралцах хүсэл бүрд<br/>шинэ боломж нээе.</p></div><div><h4>Суралцагчдад</h4><Link href="/courses">Сургалт хайх</Link><Link href="/centers">Сургалтын төвүүд</Link></div><div><h4>Сургалтын төвүүдэд</h4><Link href="/register">Төвөө бүртгүүлэх</Link><Link href="/dashboard">Сургалт удирдах</Link></div><div className="footer-location"><span>⌖</span><p>Улаанбаатар хот<br/>Монгол Улс</p></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} СургалтHub</span><span>Өнөөдрийн сонирхол. Маргаашийн ур чадвар.</span></div></footer></body></html>;
}
