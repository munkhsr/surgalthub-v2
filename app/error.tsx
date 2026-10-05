"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="container empty-state"><h2>Хуудсыг ачаалж чадсангүй</h2><p>Дахин оролдоно уу.</p><button className="button" onClick={reset}>Дахин ачаалах</button></div>; }
