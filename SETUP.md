# SurgaltHub V2

Next.js App Router + TypeScript + Supabase. This project is separate from the old SurgaltHub site.

## Local development

Use Node.js 22 LTS or newer.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Without environment variables the public pages show explicitly labeled fictional example data. Sign-up, login, dashboard and admin require Supabase. Saved courses persist only in the current browser. The hero and language illustration are local generated assets (prompts in `public/images/ASSETS.md`). Course images are illustrative Unsplash photos and the font comes from Google Fonts; those services require network access. The CSS has font and background fallbacks.

```sh
npm run typecheck
npm run build
npm start
```

## Automated checks

```sh
npm run test:security
npx playwright install chromium
npm run test:e2e
```

The SQL tests use embedded PostgreSQL with a minimal local mock of Supabase's auth schema and JWT context. They verify migration execution, profile creation, role escalation denial, grants, cross-owner isolation, approval and resubmission. They do not verify hosted Supabase sessions or email delivery. Browser tests use the production build without Supabase environment variables and cover search, filters, sorting, empty states, saved course persistence, detail/center navigation, unavailable auth, and widths 320, 390, 1440.

## New Supabase project

1. Create a **new** Supabase project. Do not use the old site's database.
2. Run `001_initial.sql`, `002_course_categories.sql`, and `003_course_hierarchy.sql` from `supabase/migrations/` in order in the SQL editor. Run only migrations that have not yet been applied. Migration 003 merges art/design into one of 10 main categories, creates the read-only subtype catalog, and adds separate fields for subtype, specialization, level, time slots, age groups, and grade groups. Existing courses keep their approval status; their new subtype fields stay empty until the center classifies them.
3. Copy `.env.example` to `.env.local`. Fill in your project URL and publishable key. Never place a service-role or secret key in a `NEXT_PUBLIC_` variable.
4. In Authentication → URL configuration, set Site URL to the new site's URL (http://localhost:3000 locally). Enable email/password sign-up and email confirmation. Configure production SMTP before launch. Confirmation uses Supabase's hosted confirmation link and redirects back to Site URL; users then log in.
5. Restart the app. Register and confirm your email, log in, then add your center and a course on `/dashboard`.
6. Assign an admin using trusted SQL only, replacing the UUID with the intended account's ID from Authentication → Users:

```sql
update public.profiles set role = 'admin' where id = 'YOUR-USER-UUID';
```

7. That admin can approve or return pending courses at `/admin`. Approved courses appear in the public catalog. Owner edits send courses back to pending. RLS prevents users from approving their own courses, editing other centers, or promoting themselves to admin.

Contact details entered for a center are public business contact information. No enrollment or payment is accepted by this version; learners contact the center directly by phone or email. Reviews, student totals, PRO/TOP promotions, banners, photo uploads, news/blog and payments remain future work.

## Verify connected behavior before launch

Use separate owner A, owner B, admin, and anonymous sessions. Verify: A creates a pending course; anonymous and B cannot see that pending row; B cannot edit A's course or center; A cannot set approval or profile role using direct API requests; admin approves and anonymous can see it; A edits and it becomes pending again; admin returns it; A edits and resubmits. Verify sign-up confirmation email, invalid login, logout, contact links, and network error messages.

## Vercel

Import `munkhsr/surgalthub-v2` into a new Vercel project using the Next.js preset. Add the two environment variables, deploy, and set Supabase Site URL to the new Vercel URL. Test the new deployment before moving any existing domain. This repository contains no automatic publishing configuration and does not change the existing site's domain.

## References

- Next.js installation: https://nextjs.org/docs/app/getting-started/installation
- Supabase JavaScript client: https://supabase.com/docs/reference/javascript/initializing
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security

The browser uses Supabase's client session. RLS is the authorization boundary. There is no SSR session or server-rendered protected data; SSR authentication later requires cookie clients and session refresh per https://supabase.com/docs/guides/auth/server-side.

OAuth login buttons automatically read enabled providers from Supabase Auth settings via /api/auth/providers. No NEXT_PUBLIC_AUTH_PROVIDERS list is needed. Add your deployed origin/auth/callback and origin/reset-password to the Supabase redirect URL allowlist. The password-reset email opens /reset-password. Remember me stores the session in localStorage; unchecked uses sessionStorage. Auth buttons remain disabled while Supabase environment variables are missing.

Registration collects full_name, email, password and matching confirmation. Required acceptance links to the preview /terms and /privacy pages. Email registration stores full_name, acceptance timestamp and preview policy version in Supabase user metadata; these values do not grant roles or permissions. OAuth provider buttons require consent before redirecting, but do not submit the name/password fields or persist this form's acceptance timestamp. Complete production policies and provider onboarding before launching live signup.
