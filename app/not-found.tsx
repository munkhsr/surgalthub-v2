import Link from "next/link";
export default function NotFound() { return <div className="container empty-state"><p className="eyebrow">404</p><h1>Хуудас олдсонгүй</h1><p>Хаягаа шалгах эсвэл нүүр хуудас руу буцаарай.</p><Link className="button" href="/">Нүүр рүү очих</Link></div>; }
