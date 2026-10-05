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
