import { NextResponse } from "next/server";
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.json({ providers: [], configured: false });
  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/auth/v1/settings`, {
      headers: { apikey: key }, cache: "no-store", signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("Auth settings unavailable");
    const settings = await response.json();
    const providers = ["google", "apple", "facebook"].filter(name => settings.external?.[name] === true);
    return NextResponse.json({ providers, configured: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ providers: [], configured: true, unavailable: true }, { status: 503 });
  }
}
