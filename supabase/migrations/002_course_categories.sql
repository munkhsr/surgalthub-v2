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
