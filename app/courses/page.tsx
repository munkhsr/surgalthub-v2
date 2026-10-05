import { Suspense } from "react";
import { Catalog } from "@/components/catalog";
export const metadata = { title: "Сургалтууд" };
export default function CoursesPage() { return <Suspense fallback={<div className="empty-state">Ачаалж байна…</div>}><Catalog/></Suspense>; }
