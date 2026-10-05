-- Run once in a NEW Supabase project. Do not run against the existing site's database.
begin;
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'center' check (role in ('center','admin')),
  created_at timestamptz not null default now()
);
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
create function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
create table public.centers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  description text not null check (char_length(description) between 1 and 3000),
  district text not null check (district in ('Сүхбаатар','Баянзүрх','Хан-Уул','Баянгол','Чингэлтэй','Сонгинохайрхан','Налайх','Багануур','Багахангай')),
  address text not null check (char_length(address) between 1 and 300),
  phone text not null check (char_length(phone) between 8 and 20),
  email text not null check (char_length(email) between 3 and 254),
  created_at timestamptz not null default now()
);
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  category text not null check (category in ('Гадаад хэл','Технологи','Урлаг','Спорт','Бизнес','Хүүхэд')),
  district text not null check (district in ('Сүхбаатар','Баянзүрх','Хан-Уул','Баянгол','Чингэлтэй','Сонгинохайрхан','Налайх','Багануур','Багахангай')),
  price integer not null check (price between 0 and 100000000),
  duration text not null check (char_length(duration) between 1 and 100),
  schedule text not null check (char_length(schedule) between 1 and 200),
  audience text not null check (char_length(audience) between 1 and 100),
  format text not null check (format in ('Танхим','Онлайн','Хосолсон')),
  description text not null check (char_length(description) between 1 and 5000),
  syllabus text[] not null default '{}' check (cardinality(syllabus) between 1 and 100),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
create index courses_catalog on public.courses(status,category,district);
create index courses_center on public.courses(center_id);
-- Any owner content change requires review again; UI checks alone cannot protect approval.
create function public.guard_course_changes() returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' then
    if new.center_id <> old.center_id then raise exception 'Cannot transfer a course'; end if;
    if not public.is_admin() then new.status := 'pending'; end if;
  elsif not public.is_admin() then
    new.status := 'pending';
  end if;
  return new;
end;
$$;
create trigger guard_course_changes before insert or update on public.courses for each row execute function public.guard_course_changes();
alter table public.profiles enable row level security;
alter table public.centers enable row level security;
alter table public.courses enable row level security;
create policy profiles_read_self on public.profiles for select to authenticated using (id = auth.uid());
-- No client insert/update policies for profiles. Admin roles can only be assigned through trusted SQL.
create policy centers_public_read on public.centers for select to anon,authenticated using (true);
create policy centers_owner_insert on public.centers for insert to authenticated with check (owner_id = auth.uid());
create policy centers_owner_update on public.centers for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy courses_read on public.courses for select to anon,authenticated using (
  status = 'approved' or public.is_admin() or exists(select 1 from public.centers where id = courses.center_id and owner_id = auth.uid())
);
create policy courses_owner_insert on public.courses for insert to authenticated with check (
  status = 'pending' and exists(select 1 from public.centers where id = courses.center_id and owner_id = auth.uid())
);
create policy courses_owner_update on public.courses for update to authenticated
  using (exists(select 1 from public.centers where id = courses.center_id and owner_id = auth.uid()))
  with check (status = 'pending' and exists(select 1 from public.centers where id = courses.center_id and owner_id = auth.uid()));
create policy courses_admin_update on public.courses for update to authenticated using (public.is_admin()) with check (public.is_admin());
revoke all on public.profiles, public.centers, public.courses from anon,authenticated;
grant select on public.centers,public.courses to anon;
grant select on public.profiles to authenticated;
grant select,insert,update on public.centers,public.courses to authenticated;
revoke all on function public.handle_new_user() from public;
revoke all on function public.guard_course_changes() from public;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon,authenticated;
commit;


-- Apply after 001_initial.sql. Rename existing categories without changing approval status.
begin;
alter table public.courses drop constraint courses_category_check;
alter table public.courses disable trigger guard_course_changes;
update public.courses set category = case category
  when 'Технологи' then 'IT & Технологи'
  when 'Урлаг' then 'Урлаг & Бүтээлч хөгжил'
  when 'Спорт' then 'Спорт & Эрүүл мэнд'
  when 'Бизнес' then 'Бизнес & Мэргэжлийн хөгжил'
  when 'Хүүхэд' then 'Хүүхдийн хөгжил'
  else category end
where category in ('Технологи','Урлаг','Спорт','Бизнес','Хүүхэд');
alter table public.courses enable trigger guard_course_changes;
alter table public.courses add constraint courses_category_check check (category in (
  'Гадаад хэл', 'ЕБС & Шалгалтын бэлтгэл', 'Хүүхдийн хөгжил',
  'IT & Технологи', 'Жолооны сургалт', 'Гоо сайхан',
  'Бизнес & Мэргэжлийн хөгжил', 'Спорт & Эрүүл мэнд',
  'Мэргэжил олгох сургалт', 'Урлаг & Бүтээлч хөгжил', 'Дизайн & Медиа'
));
commit;


-- Generated from lib/taxonomy.json. Apply after migrations 001 and 002.
begin;
alter table public.courses drop constraint courses_category_check;
alter table public.courses disable trigger guard_course_changes;
update public.courses set category = case
  when category in ('Урлаг & Бүтээлч хөгжил','Дизайн & Медиа') then 'Урлаг & Дизайн'
  when category = 'Мэргэжил олгох сургалт' then 'Мэргэжил олгох & Ур чадвар'
  else category end;
alter table public.courses enable trigger guard_course_changes;
alter table public.courses add constraint courses_category_check check (category in ('Гадаад хэл','ЕБС & Шалгалтын бэлтгэл','Хүүхдийн хөгжил','IT & Технологи','Жолооны сургалт','Гоо сайхан','Бизнес & Мэргэжлийн хөгжил','Спорт & Эрүүл мэнд','Мэргэжил олгох & Ур чадвар','Урлаг & Дизайн'));
create table public.course_taxonomy (
  category text not null,
  subcategory text not null,
  specializations text[] not null default '{}',
  primary key (category,subcategory)
);
insert into public.course_taxonomy(category,subcategory,specializations) values
('Гадаад хэл','Англи хэл',array['General English','IELTS','TOEFL','Business English','Ярианы англи','Хүүхдийн англи хэл']::text[]),
('Гадаад хэл','Хятад хэл',array['HSK','Ярианы хятад','Бизнесийн хятад','Хүүхдийн хятад хэл']::text[]),
('Гадаад хэл','Солонгос хэл',array['TOPIK','Ярианы солонгос']::text[]),
('Гадаад хэл','Япон хэл',array['JLPT','Ярианы япон']::text[]),
('Гадаад хэл','Герман хэл',array[]::text[]),
('Гадаад хэл','Орос хэл',array[]::text[]),
('Гадаад хэл','Франц хэл',array[]::text[]),
('Гадаад хэл','Бусад хэл',array[]::text[]),
('ЕБС & Шалгалтын бэлтгэл','Математик',array[]::text[]),
('ЕБС & Шалгалтын бэлтгэл','Монгол хэл',array[]::text[]),
('ЕБС & Шалгалтын бэлтгэл','Монгол бичиг',array[]::text[]),
('ЕБС & Шалгалтын бэлтгэл','Англи хэл',array[]::text[]),
('ЕБС & Шалгалтын бэлтгэл','Физик',array[]::text[]),
('ЕБС & Шалгалтын бэлтгэл','Хими',array[]::text[]),
('ЕБС & Шалгалтын бэлтгэл','Биологи',array[]::text[]),
('ЕБС & Шалгалтын бэлтгэл','Нийгэм судлал',array[]::text[]),
('ЕБС & Шалгалтын бэлтгэл','Түүх',array[]::text[]),
('ЕБС & Шалгалтын бэлтгэл','Газарзүй',array[]::text[]),
('ЕБС & Шалгалтын бэлтгэл','Мэдээлэл зүй',array[]::text[]),
('ЕБС & Шалгалтын бэлтгэл','ЭЕШ бэлтгэл',array['Математик','Монгол хэл','Англи хэл','Физик','Хими','Биологи','Нийгэм судлал','Түүх','Газарзүй']::text[]),
('ЕБС & Шалгалтын бэлтгэл','Олимпиадын бэлтгэл',array[]::text[]),
('ЕБС & Шалгалтын бэлтгэл','Хоцрогдол нөхөх',array[]::text[]),
('ЕБС & Шалгалтын бэлтгэл','Давтлага',array[]::text[]),
('ЕБС & Шалгалтын бэлтгэл','Хувийн багш',array[]::text[]),
('ЕБС & Шалгалтын бэлтгэл','Ахлах ангийн бэлтгэл',array[]::text[]),
('ЕБС & Шалгалтын бэлтгэл','Элсэлтийн шалгалтын бэлтгэл',array[]::text[]),
('Хүүхдийн хөгжил','Сургуулийн бэлтгэл',array[]::text[]),
('Хүүхдийн хөгжил','Өдөр өнжүүлэх',array[]::text[]),
('Хүүхдийн хөгжил','Ментал арифметик',array[]::text[]),
('Хүүхдийн хөгжил','Логик сэтгэлгээ',array[]::text[]),
('Хүүхдийн хөгжил','Ой тогтоолт',array[]::text[]),
('Хүүхдийн хөгжил','Шатар',array[]::text[]),
('Хүүхдийн хөгжил','Робот техник',array[]::text[]),
('Хүүхдийн хөгжил','Хүүхдийн программчлал',array[]::text[]),
('Хүүхдийн хөгжил','STEM/Science',array[]::text[]),
('Хүүхдийн хөгжил','Хүүхдийн англи хэл',array[]::text[]),
('Хүүхдийн хөгжил','Хүүхдийн хятад хэл',array[]::text[]),
('Хүүхдийн хөгжил','Уран зураг',array[]::text[]),
('Хүүхдийн хөгжил','Гар урлал',array[]::text[]),
('Хүүхдийн хөгжил','Бүжиг',array[]::text[]),
('Хүүхдийн хөгжил','Хөгжим',array[]::text[]),
('Хүүхдийн хөгжил','Хэл яриа/илтгэх чадвар',array[]::text[]),
('Хүүхдийн хөгжил','Харилцааны чадвар',array[]::text[]),
('IT & Технологи','Компьютерийн анхан шат',array[]::text[]),
('IT & Технологи','Microsoft Office',array[]::text[]),
('IT & Технологи','Excel',array[]::text[]),
('IT & Технологи','Программчлал',array['Python','JavaScript','Java','C#','C++']::text[]),
('IT & Технологи','Web development',array['Frontend','Backend','Full-stack','React']::text[]),
('IT & Технологи','Mobile development',array['Android','iOS','Flutter','React Native']::text[]),
('IT & Технологи','Database/SQL',array[]::text[]),
('IT & Технологи','Data analysis',array[]::text[]),
('IT & Технологи','Data science',array[]::text[]),
('IT & Технологи','AI/Хиймэл оюун',array[]::text[]),
('IT & Технологи','Machine learning',array[]::text[]),
('IT & Технологи','Cybersecurity',array[]::text[]),
('IT & Технологи','Network/System administration',array[]::text[]),
('IT & Технологи','Cloud/DevOps',array[]::text[]),
('IT & Технологи','Software testing/QA',array[]::text[]),
('IT & Технологи','Робот техник',array[]::text[]),
('Жолооны сургалт','B ангилал',array[]::text[]),
('Жолооны сургалт','C ангилал',array[]::text[]),
('Жолооны сургалт','D ангилал',array[]::text[]),
('Жолооны сургалт','E ангилал',array[]::text[]),
('Жолооны сургалт','Мотоцикл',array[]::text[]),
('Жолооны сургалт','Ангилал ахиулах',array[]::text[]),
('Жолооны сургалт','Мэргэшсэн жолооч',array[]::text[]),
('Жолооны сургалт','Жолооны дадлага',array[]::text[]),
('Жолооны сургалт','Замын хөдөлгөөний дүрэм',array[]::text[]),
('Гоо сайхан','Үсчин',array[]::text[]),
('Гоо сайхан','Barber',array[]::text[]),
('Гоо сайхан','Маникюр',array[]::text[]),
('Гоо сайхан','Педикюр',array[]::text[]),
('Гоо сайхан','Nail art',array[]::text[]),
('Гоо сайхан','Нүүр будалт/Makeup',array[]::text[]),
('Гоо сайхан','Сормуус',array[]::text[]),
('Гоо сайхан','Хөмсөг',array[]::text[]),
('Гоо сайхан','Гоо сайханч',array[]::text[]),
('Гоо сайхан','Арьс арчилгаа',array[]::text[]),
('Гоо сайхан','Массаж',array[]::text[]),
('Гоо сайхан','Косметик үйлчилгээний сургалт',array[]::text[]),
('Бизнес & Мэргэжлийн хөгжил','Нягтлан бодох бүртгэл',array[]::text[]),
('Бизнес & Мэргэжлийн хөгжил','Нярав',array[]::text[]),
('Бизнес & Мэргэжлийн хөгжил','Татвар',array[]::text[]),
('Бизнес & Мэргэжлийн хөгжил','Санхүү',array[]::text[]),
('Бизнес & Мэргэжлийн хөгжил','Excel for Business',array[]::text[]),
('Бизнес & Мэргэжлийн хөгжил','Маркетинг',array[]::text[]),
('Бизнес & Мэргэжлийн хөгжил','Digital marketing',array[]::text[]),
('Бизнес & Мэргэжлийн хөгжил','Social media marketing',array[]::text[]),
('Бизнес & Мэргэжлийн хөгжил','Борлуулалт',array[]::text[]),
('Бизнес & Мэргэжлийн хөгжил','HR/Хүний нөөц',array[]::text[]),
('Бизнес & Мэргэжлийн хөгжил','Менежмент',array[]::text[]),
('Бизнес & Мэргэжлийн хөгжил','Төслийн удирдлага',array[]::text[]),
('Бизнес & Мэргэжлийн хөгжил','Бизнес эхлүүлэх',array[]::text[]),
('Бизнес & Мэргэжлийн хөгжил','Entrepreneurship',array[]::text[]),
('Бизнес & Мэргэжлийн хөгжил','Leadership',array[]::text[]),
('Бизнес & Мэргэжлийн хөгжил','Харилцааны ур чадвар',array[]::text[]),
('Бизнес & Мэргэжлийн хөгжил','Илтгэх ур чадвар',array[]::text[]),
('Бизнес & Мэргэжлийн хөгжил','Customer service',array[]::text[]),
('Бизнес & Мэргэжлийн хөгжил','Оффисын ур чадвар',array[]::text[]),
('Спорт & Эрүүл мэнд','Фитнес',array['Gym','Bodybuilding','CrossFit/Functional training','Aerobic','Cardio','Spinning']::text[]),
('Спорт & Эрүүл мэнд','Иог',array[]::text[]),
('Спорт & Эрүүл мэнд','Пилатес',array[]::text[]),
('Спорт & Эрүүл мэнд','Сунгалт/Stretching',array[]::text[]),
('Спорт & Эрүүл мэнд','Усанд сэлэлт',array[]::text[]),
('Спорт & Эрүүл мэнд','Сагсан бөмбөг',array[]::text[]),
('Спорт & Эрүүл мэнд','Хөлбөмбөг',array[]::text[]),
('Спорт & Эрүүл мэнд','Волейбол',array[]::text[]),
('Спорт & Эрүүл мэнд','Теннис',array[]::text[]),
('Спорт & Эрүүл мэнд','Ширээний теннис',array[]::text[]),
('Спорт & Эрүүл мэнд','Бокс',array[]::text[]),
('Спорт & Эрүүл мэнд','Кикбокс',array[]::text[]),
('Спорт & Эрүүл мэнд','MMA',array[]::text[]),
('Спорт & Эрүүл мэнд','Жүдо',array[]::text[]),
('Спорт & Эрүүл мэнд','Каратэ',array[]::text[]),
('Спорт & Эрүүл мэнд','Таеквондо',array[]::text[]),
('Спорт & Эрүүл мэнд','Бөх',array[]::text[]),
('Спорт & Эрүүл мэнд','Гимнастик',array[]::text[]),
('Спорт & Эрүүл мэнд','Туялзуур сэлэм',array[]::text[]),
('Спорт & Эрүүл мэнд','Байт харваа',array[]::text[]),
('Спорт & Эрүүл мэнд','Морьт харваа',array[]::text[]),
('Спорт & Эрүүл мэнд','Бүжгийн фитнес',array[]::text[]),
('Спорт & Эрүүл мэнд','Эрүүл хооллолт/Wellness',array[]::text[]),
('Мэргэжил олгох & Ур чадвар','Тогооч',array[]::text[]),
('Мэргэжил олгох & Ур чадвар','Нарийн боов',array[]::text[]),
('Мэргэжил олгох & Ур чадвар','Бариста',array[]::text[]),
('Мэргэжил олгох & Ур чадвар','Гагнуурчин',array[]::text[]),
('Мэргэжил олгох & Ур чадвар','Цахилгаанчин',array[]::text[]),
('Мэргэжил олгох & Ур чадвар','Сантехникч',array[]::text[]),
('Мэргэжил олгох & Ур чадвар','Мужаан',array[]::text[]),
('Мэргэжил олгох & Ур чадвар','Барилгын мэргэжил',array[]::text[]),
('Мэргэжил олгох & Ур чадвар','Оёдолчин',array[]::text[]),
('Мэргэжил олгох & Ур чадвар','Авто засвар',array[]::text[]),
('Мэргэжил олгох & Ур чадвар','Ковш оператор',array[]::text[]),
('Мэргэжил олгох & Ур чадвар','Экскаватор оператор',array[]::text[]),
('Мэргэжил олгох & Ур чадвар','Хүнд машин механизм',array[]::text[]),
('Мэргэжил олгох & Ур чадвар','ХАБЭА',array[]::text[]),
('Мэргэжил олгох & Ур чадвар','Агуулах/логистик',array[]::text[]),
('Мэргэжил олгох & Ур чадвар','Үйлчилгээний ажилтан',array[]::text[]),
('Урлаг & Дизайн','Хөгжим',array['Дуу/Вокал','Төгөлдөр хуур','Гитар','Морин хуур','Хийл','Бусад хөгжмийн зэмсэг']::text[]),
('Урлаг & Дизайн','Урлаг',array['Уран зураг','Зураг','Гар урлал','Театр/Жүжиг','Бүжиг','Балет']::text[]),
('Урлаг & Дизайн','Дизайн & Медиа',array['Graphic design','UI/UX','Photoshop','Illustrator','Figma','3D загварчлал','Interior design','AutoCAD','Video editing','Motion graphics','Photography','Content creation']::text[]);
alter table public.course_taxonomy enable row level security;
revoke all on public.course_taxonomy from anon,authenticated;
grant select on public.course_taxonomy to anon,authenticated;
create policy taxonomy_read on public.course_taxonomy for select to anon,authenticated using (true);
alter table public.courses
  add column subcategory text,
  add column specialization text,
  add column level text check (level in ('Анхан','Дунд','Ахисан')),
  add column time_slots text[] not null default '{}' check (time_slots <@ array['Өдөр','Орой','Амралтын өдөр']),
  add column age_groups text[] not null default '{}' check (age_groups <@ array['2–5','6–8','9–12','13–17','18+']),
  add column grade_groups text[] not null default '{}' check (grade_groups <@ array['1–5','6–9','10–12']),
  add constraint courses_subcategory_fk foreign key (category,subcategory) references public.course_taxonomy(category,subcategory),
  add constraint courses_specialization_requires_subcategory check (specialization is null or subcategory is not null);
create function public.validate_course_specialization() returns trigger language plpgsql set search_path = '' as $$
begin
  if new.specialization is not null and not exists (
    select 1 from public.course_taxonomy where category = new.category and subcategory = new.subcategory and new.specialization = any(specializations)
  ) then raise exception 'Invalid course specialization'; end if;
  return new;
end;
$$;
create trigger validate_course_specialization before insert or update on public.courses for each row execute function public.validate_course_specialization();
revoke all on function public.validate_course_specialization() from public;
create index courses_hierarchy on public.courses(category,subcategory,specialization);
commit;

