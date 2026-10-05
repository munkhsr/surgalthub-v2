export { categories } from "./categories";
export const districts = ["Сүхбаатар", "Баянзүрх", "Хан-Уул", "Баянгол", "Чингэлтэй", "Сонгинохайрхан", "Налайх", "Багануур", "Багахангай"];
export type Center = { id: string; owner_id?: string; name: string; description: string; district: string; address: string; phone: string; email: string };
export type Course = { subcategory?: string | null; specialization?: string | null; level?: string | null; time_slots?: string[]; age_groups?: string[]; grade_groups?: string[]; id: string; center_id: string; title: string; category: string; district: string; price: number; duration: string; schedule: string; audience: string; format: string; description: string; syllabus: string[]; status: "pending" | "approved" | "rejected"; created_at?: string };
export const centers: Center[] = [
  { id: "demo-language", name: "Хэлний академи", description: "Гадаад хэлний суурь мэдлэгээс ахисан түвшин хүртэл суралцах жишээ сургалтын төв.", district: "Сүхбаатар", address: "Сүхбаатар дүүрэг • Жишээ байршил", phone: "", email: "" },
  { id: "demo-digital", name: "Дижитал ур чадварын төв", description: "Технологи, дизайн, бизнесийн ур чадварыг бодит төсөл дээр хөгжүүлэх жишээ төв.", district: "Баянзүрх", address: "Баянзүрх дүүрэг • Жишээ байршил", phone: "", email: "" },
  { id: "demo-creative", name: "Бүтээлч студи", description: "Хүүхэд болон насанд хүрэгчдэд зориулсан урлаг, бүтээлч сэтгэлгээний жишээ төв.", district: "Хан-Уул", address: "Хан-Уул дүүрэг • Жишээ байршил", phone: "", email: "" },
];
export const courses: Course[] = [
  { id: "english-foundations", center_id: "demo-language", title: "Англи хэлний ярианы сургалт", category: "Гадаад хэл", district: "Сүхбаатар", price: 280000, duration: "8 долоо хоног", schedule: "Даваа, Лхагва • 18:30", audience: "16+ нас", format: "Танхим", description: "Өдөр тутмын нөхцөлд англи хэлээр өөртөө итгэлтэй ярьж суръя. Жижиг бүлэг, харилцан яриа, практик дасгалд тулгуурласан хөтөлбөр.", syllabus: ["Түвшин тогтоох, суралцах төлөвлөгөө", "Өдөр тутмын үг хэллэг ба дуудлага", "Харилцан яриа, сонсголын дасгал", "Эцсийн дадлага ба түвшний үнэлгээ"], status: "approved" },
  { id: "web-development", center_id: "demo-digital", title: "Вэб хөгжүүлэлтийн анхан шат", category: "IT & Технологи", district: "Баянзүрх", price: 450000, duration: "12 долоо хоног", schedule: "Мягмар, Пүрэв • 19:00", audience: "16+ нас", format: "Хосолсон", description: "Код бичиж үзээгүй байсан ч өөрийн анхны вэб сайтыг бүтээх алхам бүрийг сурна. Хичээл бүрийн дараа жижиг төсөл хийж мэдлэгээ бататгана.", syllabus: ["HTML, CSS ба responsive загвар", "JavaScript-ийн үндэс", "React компонент ба өгөгдөл", "Өөрийн вэб төслийг нийтлэх"], status: "approved" },
  { id: "piano-beginners", center_id: "demo-creative", title: "Төгөлдөр хуурын анхан шат", category: "Урлаг & Дизайн", district: "Хан-Уул", price: 220000, duration: "4 долоо хоног", schedule: "Бямба, Ням • 11:00", audience: "7+ нас", format: "Танхим", description: "Хөгжмийн ертөнцтэй танилцаж, нот унших болон дуртай аялгуугаа тоглож сурах эхний алхам.", syllabus: ["Нот ба хэмнэлийн үндэс", "Гарын байрлал, техник", "Хоёр гараар тоглох дасгал", "Богино бүтээл тоглох"], status: "approved" },
  { id: "yoga", center_id: "demo-creative", title: "Иог ба зөв хөдөлгөөний дадал", category: "Спорт & Эрүүл мэнд", district: "Хан-Уул", price: 180000, duration: "4 долоо хоног", schedule: "Даваа, Лхагва, Баасан • 07:00", audience: "18+ нас", format: "Танхим", description: "Анхан шатны хөдөлгөөн, сунгалт, амьсгалын дасгалаар тогтмол хөдөлгөөний дадал бий болгох жишээ сургалт.", syllabus: ["Зөв амьсгал", "Суурь байрлалууд", "Уян хатан байдлын дасгал", "Өдөр тутмын хөтөлбөр"], status: "approved" },
  { id: "digital-marketing", center_id: "demo-digital", title: "Дижитал маркетингийн практик", category: "Бизнес & Мэргэжлийн хөгжил", district: "Баянзүрх", price: 320000, duration: "6 долоо хоног", schedule: "Бямба • 10:00", audience: "18+ нас", format: "Онлайн", description: "Өөрийн бизнес эсвэл брэндэд зориулсан контент, сурталчилгааны төлөвлөгөө боловсруулах практик хөтөлбөр.", syllabus: ["Зорилтот хэрэглэгчээ тодорхойлох", "Контент төлөвлөлт", "Сурталчилгааны үндэс", "Үр дүн хэмжих"], status: "approved" },
  { id: "kids-art", center_id: "demo-creative", title: "Хүүхдийн бүтээлч зургийн дугуйлан", category: "Хүүхдийн хөгжил", district: "Хан-Уул", price: 150000, duration: "4 долоо хоног", schedule: "Бямба • 14:00", audience: "6–12 нас", format: "Танхим", description: "Өнгө, дүрс, өөр өөр материалаар туршиж, хүүхэд өөрийн төсөөллийг бүтээл болгон илэрхийлнэ.", syllabus: ["Өнгөтэй танилцах", "Дүрс, зохиомж", "Холимог материалын бүтээл", "Бүтээлийн жижиг үзэсгэлэн"], status: "approved" },
];
export const money = (amount: number) => new Intl.NumberFormat("mn-MN").format(amount) + " ₮";
export const photos: Record<string, string> = {
  hero: "/images/study-hero-v2.webp",
  "Гадаад хэл": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=700&q=80",
  "IT & Технологи": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=700&q=80",
  "Урлаг & Дизайн": "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=700&q=80",
  "Спорт & Эрүүл мэнд": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=700&q=80",
  "Бизнес & Мэргэжлийн хөгжил": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=700&q=80",
  "Хүүхдийн хөгжил": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=80",
  chinese: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=700&q=80",
};
courses.unshift({ id: "chinese-beginners", center_id: "demo-language", title: "Хятад хэлний анхан шат", category: "Гадаад хэл", district: "Сүхбаатар", price: 300000, duration: "12 долоо хоног", schedule: "Даваа, Лхагва, Баасан • 19:00–21:00", audience: "16+ нас", format: "Танхим", description: "Хятад хэлний анхан шатны сургалтаар өдөр тутмын харилцаанд хэрэгтэй үг хэллэг, дүрэм, сонсох, ярих чадварыг системтэйгээр эзэмшинэ. Суурь мэдлэггүй суралцагчдад тохиромжтой жишээ хөтөлбөр.", syllabus: ["Пиньинь болон дуудлага", "Өдөр тутмын анхан харилцаа", "200+ үндсэн үг хэллэг", "Сонсох, ярих, унших, бичих суурь"], status: "approved" });
export const coursePhoto = (course: Course) => course.id === "chinese-beginners" ? photos.chinese : photos[course.category] || photos["IT & Технологи"];

const demoClassification: Record<string, Partial<Course>> = {
  "english-foundations": { subcategory: "Англи хэл", specialization: "Ярианы англи", level: "Анхан", time_slots: ["Орой"] },
  "chinese-beginners": { subcategory: "Хятад хэл", specialization: "HSK", level: "Анхан", time_slots: ["Орой"] },
  "web-development": { subcategory: "Web development", specialization: "Frontend", level: "Анхан", time_slots: ["Орой"] },
  "piano-beginners": { subcategory: "Хөгжим", specialization: "Төгөлдөр хуур", level: "Анхан", time_slots: ["Амралтын өдөр"] },
  "yoga": { subcategory: "Иог", level: "Анхан", time_slots: ["Өдөр"] },
  "digital-marketing": { subcategory: "Digital marketing", level: "Дунд", time_slots: ["Амралтын өдөр"] },
  "kids-art": { subcategory: "Уран зураг", level: "Анхан", time_slots: ["Амралтын өдөр"], age_groups: ["6–8", "9–12"] },
};
for (const course of courses) Object.assign(course, demoClassification[course.id]);
