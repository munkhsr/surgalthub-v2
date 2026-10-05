# SurgaltHub course taxonomy

Implemented from the user's final pasted proposal: 10 main categories, 141 subcategories, 66 optional specializations. The previous art and media categories merge into `Урлаг & Дизайн`; the vocational label becomes `Мэргэжил олгох & Ур чадвар`.

`lib/taxonomy.json` is the canonical hierarchy for the homepage, dependent catalog dropdowns and course submission form. `lib/categories.ts` exposes helpers and independent filter choices. `003_course_hierarchy.sql` seeds the same hierarchy into a read-only Supabase table. Future taxonomy edits must include a matching migration.

The homepage displays five featured categories (languages, IT, school/exams, children's development, business) and a `Бүх ангилал` card. This opens a searchable dialog (full screen on mobile) with all ten categories, followed by a subcategory selection screen. All ten remain available in the catalog and submission form.

Examples:

- Гадаад хэл → Хятад хэл → HSK
- IT & Технологи → Программчлал → Python
- Урлаг & Дизайн → Хөгжим → Төгөлдөр хуур
- Урлаг & Дизайн → Дизайн & Медиа → Figma

Level, format, district, price and time are independent filters. Age groups appear for children's development; grade groups appear for school preparation. Switching parent category clears dependent subtype, specialization, age and grade selections. Courses may cover several time, age or grade groups.

## Evidence and limits — checked 2026-10-05

- [Duguilan](https://duguilan.mn/) exposes school subjects, languages, programming, robotics, music, art and sports categories. Some displayed listings are explicitly demo content, so those were not treated as verified active providers or imported into SurgaltHub.
- [ONEFIT](https://www.onefit.mn/en/home) describes its Ulaanbaatar studio network and lists yoga, pilates, swimming, boxing, tennis and other activities. This supports sports taxonomy coverage, not a guarantee of current course availability at every studio.
- [Сүбүтэй Майнинг Сервис](https://subutaims.mn/mn/services) lists safety and vocational training including electrical, welding, mechanical and operator skills, with a Ulaanbaatar contact address.
- [Doremi's own about page](https://doremi.mn/index.php/about/) search excerpt describes its music school activities. Full-page retrieval was unavailable, so no current enrollment or price claim was made.

The full hierarchy is a product classification based on the supplied proposal and these representative checks. Every subtype has **not** been independently verified as currently enrolling in Ulaanbaatar. Public course cards remain explicitly fictional examples; real center records and current schedules require provider submission/verification. Sports/health taxonomy is for classes and wellness skills, not clinical medical services.

Database constraints prevent a subtype from being attached to the wrong parent and a specialization from being attached to the wrong subtype. RLS protects the taxonomy from client edits. Old courses with unspecified subtypes remain visible under their parent category, but do not match a selected subtype filter.

