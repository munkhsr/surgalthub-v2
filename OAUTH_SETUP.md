# Google, Apple, Facebook нэвтрэлт холбох

Код бэлэн боловч бодит нэвтрэлт хийхэд шинэ SurgaltHub V2 Supabase төсөл болон үйлчилгээ тус бүрийн OAuth тохиргоо шаардлагатай.

## 1. Supabase

`.env.example`-ийг `.env.local` болгон хуулж, Supabase төслийн URL болон publishable key-г оруулна. Secret/service-role key ашиглахгүй. App-ийг дахин build/start хийнэ.

Authentication → URL Configuration:

- Site URL: `http://localhost:3000` эсвэл шинэ сайтын production URL.
- Redirect URLs: `http://localhost:3000/auth/callback`, `http://localhost:3000/reset-password` болон production хувилбарын ижил замууд.

Өгөгдлийн суурь, profiles trigger, RLS-ийг тохируулахын тулд SETUP.md дахь migration-уудыг ажиллуулна.

## 2. Google

Google Cloud Console-д OAuth consent screen болон Web application OAuth client үүсгэнэ. Authorized redirect URI-д Supabase Google provider хэсэгт үзүүлсэн callback URL-ийг яг хуулж оруулна (`https://PROJECT.supabase.co/auth/v1/callback`). Client ID, Client secret-ийг **Supabase → Authentication → Providers → Google** хэсэгт оруулж Enable/Save хийнэ.

[Google-ийн Supabase заавар](https://supabase.com/docs/guides/auth/social-login/auth-google)

## 3. Apple

Apple Developer талд Sign in with Apple, Services ID болон түлхүүрээ тохируулна. Website domain, return URL-ийг Supabase-ийн зааврын дагуу бүртгэнэ. Client ID болон үүсгэсэн OAuth secret-ийг Supabase Apple provider хэсэгт оруулж идэвхжүүлнэ. Apple secret-ийн хүчинтэй хугацааг хянаж шинэчилнэ. Private key-г энэ repo эсвэл чатад оруулахгүй.

[Apple-ийн Supabase заавар](https://supabase.com/docs/guides/auth/social-login/auth-apple)

## 4. Facebook

Meta for Developers-д Facebook Login ашиглах app үүсгэнэ. Valid OAuth Redirect URI-д Supabase callback URL-ийг яг оруулна. App ID, App Secret-ийг Supabase Facebook provider хэсэгт оруулж идэвхжүүлнэ. Туршилтын app хэрэглэгчид болон нийтэд ашиглуулах тохиргоог Meta талд шалгана.

[Facebook-ийн Supabase заавар](https://supabase.com/docs/guides/auth/social-login/auth-facebook)

## 5. Баталгаажуулах

`/login`-ийг нээхэд идэвхжсэн provider-ийн товч автоматаар ажиллана. Тус бүрээр нэвтэрч `/auth/callback` → `/dashboard` руу орж байгаа эсэхийг шалгана. Цуцлахад ойлгомжтой алдаа, дахин нэвтрэх холбоос гарна. Logout, refresh болон “Намайг санаарай” сонголтыг тус бүр шалгана.

Provider enable төлөвийг таних нь үйлчилгээний Client ID/secret зөв эсэхийг батлахгүй. Аккаунтаар нэвтрэх бодит туршилт заавал хийнэ.
