import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

// A real embedded PostgreSQL engine with the minimal Supabase auth context.
// This verifies SQL/RLS behavior, not hosted Supabase email delivery or session handling.
const db = new PGlite();
const ownerA = '00000000-0000-0000-0000-000000000001';
const ownerB = '00000000-0000-0000-0000-000000000002';
const admin = '00000000-0000-0000-0000-000000000003';
const centerId = '10000000-0000-0000-0000-000000000001';
const courseId = '20000000-0000-0000-0000-000000000001';
await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  create schema auth;
  create table auth.users(id uuid primary key);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  $$;
  grant usage on schema auth, public to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
`);
await db.exec(await readFile(new URL('../supabase/migrations/001_initial.sql', import.meta.url), 'utf8'));
await db.exec(await readFile(new URL('../supabase/migrations/002_course_categories.sql', import.meta.url), 'utf8'));
await db.query('insert into auth.users(id) values ($1),($2),($3)', [ownerA, ownerB, admin]);
await db.query("update public.profiles set role = 'admin' where id = $1", [admin]);
await db.query("select set_config('request.jwt.claim.sub',$1,false)", [admin]);
await db.query("insert into centers(id,owner_id,name,description,district,address,phone,email) values ($1,$2,'Legacy center','Test description','Сүхбаатар','Test address','99112233','test@example.com')", [centerId,admin]);
await db.query("insert into courses(id,center_id,title,category,district,price,duration,schedule,audience,format,description,syllabus,status) values ($1,$2,'Legacy art','Урлаг & Бүтээлч хөгжил','Сүхбаатар',300000,'8 weeks','Mon','16+','Танхим','Test description',array['One topic'],'approved')", [courseId,centerId]);
await db.query("select set_config('request.jwt.claim.sub','',false)");
await db.exec(await readFile(new URL('../supabase/migrations/003_course_hierarchy.sql', import.meta.url), 'utf8'));
assert.deepEqual((await db.query('select category,status from courses')).rows[0], { category: 'Урлаг & Дизайн', status: 'approved' }, 'hierarchy migration preserves approved legacy courses');
await db.exec('delete from centers');
async function as(role, id = '') {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
  await db.exec(`set role ${role}`);
}
async function count(sql, params = []) { return (await db.query(sql, params)).rows.length; }

await as('authenticated', ownerA);
assert.equal((await db.query('select role from profiles')).rows[0].role, 'center', 'signup defaults to center role');
await assert.rejects(db.exec("update profiles set role = 'admin'"), /permission denied/, 'cannot self-promote');
await db.query("insert into centers(id,owner_id,name,description,district,address,phone,email) values ($1,$2,'Test center','Test description','Сүхбаатар','Test address','99112233','test@example.com')", [centerId,ownerA]);
await db.query("insert into courses(id,center_id,title,category,district,price,duration,schedule,audience,format,description,syllabus,status) values ($1,$2,'Test course','Гадаад хэл','Сүхбаатар',300000,'8 weeks','Mon','16+','Танхим','Test description',array['One topic'],'approved')", [courseId,centerId]);
assert.equal((await db.query('select status from courses')).rows[0].status, 'pending', 'owner cannot insert an approved course');
await db.exec("update courses set subcategory = 'Хятад хэл', specialization = 'HSK', level = 'Анхан', time_slots = array['Орой']");
await assert.rejects(db.exec("update courses set specialization = 'IELTS'"), /Invalid course specialization/, 'specialization must belong to its language');
await assert.rejects(db.exec("update courses set subcategory = 'Физик', specialization = null"), /foreign key/, 'subcategory must belong to its main category');
await assert.rejects(db.exec("update courses set level = 'Unknown'"), /check constraint/, 'level is validated independently');
await assert.rejects(db.exec("update courses set time_slots = array['Unknown']"), /check constraint/, 'time filters are validated');
await assert.rejects(db.exec("update course_taxonomy set subcategory = 'Untrusted'"), /permission denied/, 'clients cannot change taxonomy');
await as('anon');
assert.equal(await count('select * from courses'), 0, 'anonymous cannot read pending course');
assert.equal(await count('select * from centers'), 1, 'business center details are public');
await assert.rejects(db.exec("insert into profiles(id) values ('00000000-0000-0000-0000-000000000004')"), /permission denied/);
await as('authenticated',ownerB);
assert.equal(await count('select * from courses'), 0, 'other owner cannot read pending course');
assert.equal(await count("update courses set title = 'Stolen' returning id"), 0, 'other owner cannot edit course');
assert.equal(await count("update centers set name = 'Stolen' returning id"), 0, 'other owner cannot edit center');
await assert.rejects(db.query("insert into centers(owner_id,name,description,district,address,phone,email) values ($1,'Stolen','Test description','Сүхбаатар','Test address','99112233','test@example.com')", [ownerA]), /row-level security/, 'cannot create center for another user');
await as('authenticated',ownerA);
await db.exec("update courses set status = 'approved'");
assert.equal((await db.query('select status from courses')).rows[0].status, 'pending', 'owner cannot approve their own course');
await assert.rejects(db.exec('delete from courses'), /permission denied/, 'client delete is not granted');
await as('authenticated',admin);
assert.equal(await count('select * from courses'), 1, 'admin sees pending course');
await db.exec("update courses set status = 'approved'");
await as('anon');
assert.equal(await count('select * from courses'), 1, 'approved course becomes public');
await as('authenticated',ownerA);
await db.exec("update courses set title = 'Revised title'");
assert.equal((await db.query('select status from courses')).rows[0].status, 'pending', 'owner content edits require review');
await as('anon');
assert.equal(await count('select * from courses'), 0, 'edited course is no longer public');
await as('authenticated',admin);
await db.exec("update courses set status = 'rejected'");
await as('authenticated',ownerA);
assert.equal((await db.query('select status from courses')).rows[0].status, 'rejected');
await db.exec("update courses set title = 'Resubmitted title'");
assert.equal((await db.query('select status from courses')).rows[0].status, 'pending', 'rejected course can be resubmitted');
await db.close();
console.log('PASS: migration, auth trigger, grants, owner isolation, admin approval, and resubmission (embedded PostgreSQL).');
