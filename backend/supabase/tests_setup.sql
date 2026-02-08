-- tests_setup.sql
-- One-shot setup for the Tests feature: schema + RLS + seed content.
--
-- Use this if you're running SQL manually in the Supabase SQL editor and
-- you want a single script (instead of running migrations + seed separately).

begin;

-- Enable UUID generation if not enabled (Supabase usually has it)
create extension if not exists "pgcrypto";

-- 1) tests
create table if not exists public.tests (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- 2) test_questions
create table if not exists public.test_questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  order_index int not null,
  question_text text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option text not null check (correct_option in ('A','B','C','D')),
  updated_at timestamptz not null default now(),
  unique(test_id, order_index)
);

-- 3) test_attempts
create table if not exists public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  test_id uuid not null references public.tests(id) on delete cascade,
  status text not null check (status in ('in_progress','submitted')) default 'in_progress',
  started_at timestamptz not null default now(),
  submitted_at timestamptz null,
  score_correct int null,
  score_total int null,
  score_percent numeric null,
  updated_at timestamptz not null default now()
);

create index if not exists idx_test_attempts_user_test_status
  on public.test_attempts (user_id, test_id, status);

-- 4) test_attempt_answers
create table if not exists public.test_attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.test_attempts(id) on delete cascade,
  question_id uuid not null references public.test_questions(id) on delete cascade,
  selected_option text not null check (selected_option in ('A','B','C','D')),
  is_correct boolean null,
  confirmed_at timestamptz not null default now(),

  -- AI cache (for wrong answers)
  ai_explanation text null,
  ai_explanation_created_at timestamptz null,

  unique(attempt_id, question_id)
);

create index if not exists idx_attempt_answers_attempt
  on public.test_attempt_answers (attempt_id);

create index if not exists idx_attempt_answers_question
  on public.test_attempt_answers (question_id);

-- updated_at helper + triggers
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_tests_updated_at on public.tests;
create trigger trg_tests_updated_at
before update on public.tests
for each row execute function public.set_updated_at();

drop trigger if exists trg_test_questions_updated_at on public.test_questions;
create trigger trg_test_questions_updated_at
before update on public.test_questions
for each row execute function public.set_updated_at();

drop trigger if exists trg_test_attempts_updated_at on public.test_attempts;
create trigger trg_test_attempts_updated_at
before update on public.test_attempts
for each row execute function public.set_updated_at();

-- RLS
alter table public.tests enable row level security;
alter table public.test_questions enable row level security;
alter table public.test_attempts enable row level security;
alter table public.test_attempt_answers enable row level security;

drop policy if exists "tests_select_authenticated" on public.tests;
create policy "tests_select_authenticated"
on public.tests for select
to authenticated
using (true);

drop policy if exists "test_questions_select_authenticated" on public.test_questions;
create policy "test_questions_select_authenticated"
on public.test_questions for select
to authenticated
using (true);

drop policy if exists "test_attempts_select_own" on public.test_attempts;
create policy "test_attempts_select_own"
on public.test_attempts for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "test_attempts_insert_own" on public.test_attempts;
create policy "test_attempts_insert_own"
on public.test_attempts for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "test_attempts_update_own" on public.test_attempts;
create policy "test_attempts_update_own"
on public.test_attempts for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "attempt_answers_select_own" on public.test_attempt_answers;
create policy "attempt_answers_select_own"
on public.test_attempt_answers for select
to authenticated
using (
  exists (
    select 1
    from public.test_attempts a
    where a.id = attempt_id
      and a.user_id = auth.uid()
  )
);

drop policy if exists "attempt_answers_insert_own" on public.test_attempt_answers;
create policy "attempt_answers_insert_own"
on public.test_attempt_answers for insert
to authenticated
with check (
  exists (
    select 1
    from public.test_attempts a
    where a.id = attempt_id
      and a.user_id = auth.uid()
  )
);

drop policy if exists "attempt_answers_update_own" on public.test_attempt_answers;
create policy "attempt_answers_update_own"
on public.test_attempt_answers for update
to authenticated
using (
  exists (
    select 1
    from public.test_attempts a
    where a.id = attempt_id
      and a.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.test_attempts a
    where a.id = attempt_id
      and a.user_id = auth.uid()
  )
);

-- Seed content (idempotent upserts)
insert into public.tests (slug, title, is_active)
values
  ('offside-basics', 'Offside Basics', true),
  ('handball-basics', 'Handball Basics', true),
  ('fouls-misconduct', 'Fouls & Misconduct', true),
  ('restarts-of-play', 'Restarts of Play', true)
on conflict (slug) do update set
  title = excluded.title,
  is_active = excluded.is_active;

-- Offside Basics
with t as (
  select id as test_id from public.tests where slug = 'offside-basics'
)
insert into public.test_questions
  (test_id, order_index, question_text, option_a, option_b, option_c, option_d, correct_option)
select
  t.test_id,
  q.order_index,
  q.question_text,
  q.option_a,
  q.option_b,
  q.option_c,
  q.option_d,
  q.correct_option
from t
cross join (
  values
    (1, 'A player is in an offside position if...', 'They are in the opponent half', 'They are nearer to the goal line than both the ball and the second-last opponent', 'They touch the ball', 'They are behind the ball', 'B'),
    (2, 'Offside is punished when the player in offside position...', 'Receives the ball anywhere', 'Is closer to the corner flag', 'Becomes involved in active play', 'Is in their own half', 'C'),
    (3, 'A player cannot be offside directly from...', 'A goal kick', 'A throw-in', 'A corner kick', 'All of the above', 'D')
) as q(order_index, question_text, option_a, option_b, option_c, option_d, correct_option)
on conflict (test_id, order_index) do update set
  question_text = excluded.question_text,
  option_a = excluded.option_a,
  option_b = excluded.option_b,
  option_c = excluded.option_c,
  option_d = excluded.option_d,
  correct_option = excluded.correct_option;

-- Handball Basics
with t as (
  select id as test_id from public.tests where slug = 'handball-basics'
)
insert into public.test_questions
  (test_id, order_index, question_text, option_a, option_b, option_c, option_d, correct_option)
select
  t.test_id,
  q.order_index,
  q.question_text,
  q.option_a,
  q.option_b,
  q.option_c,
  q.option_d,
  q.correct_option
from t
cross join (
  values
    (1, 'Handball is usually penalized when a player...', 'Touches the ball with the hand/arm accidentally in all cases', 'Deliberately touches the ball with the hand/arm', 'Has arms behind the back', 'Is hit at close range every time', 'B'),
    (2, 'A player makes their body unnaturally bigger mainly by...', 'Running fast', 'Having the arm position not justified by the body movement', 'Jumping', 'Turning around', 'B'),
    (3, 'If the ball hits a player''s arm that is supporting the body on the ground, the correct decision is...', 'Always a penalty', 'Always a direct free kick', 'Usually no offense', 'Yellow card for stopping attack', 'C'),
    (4, 'After an accidental hand/arm contact, a goal can be awarded when...', 'The scorer handled the ball immediately before scoring', 'Any attacker handled the ball at any time', 'There is no immediate advantage', 'It depends only on intent', 'A')
) as q(order_index, question_text, option_a, option_b, option_c, option_d, correct_option)
on conflict (test_id, order_index) do update set
  question_text = excluded.question_text,
  option_a = excluded.option_a,
  option_b = excluded.option_b,
  option_c = excluded.option_c,
  option_d = excluded.option_d,
  correct_option = excluded.correct_option;

-- Fouls & Misconduct
with t as (
  select id as test_id from public.tests where slug = 'fouls-misconduct'
)
insert into public.test_questions
  (test_id, order_index, question_text, option_a, option_b, option_c, option_d, correct_option)
select
  t.test_id,
  q.order_index,
  q.question_text,
  q.option_a,
  q.option_b,
  q.option_c,
  q.option_d,
  q.correct_option
from t
cross join (
  values
    (1, 'A direct free kick is awarded if a player commits a careless, reckless, or using excessive force action such as...', 'Impeding without contact', 'Playing in a dangerous manner', 'Kicking or attempting to kick an opponent', 'Offside', 'C'),
    (2, 'Reckless means the player...', 'Acted with little attention and risked injury', 'Used excessive force', 'Committed an accidental action', 'Was last defender', 'A'),
    (3, 'Using excessive force means...', 'Normal physical contact', 'The challenge endangered the safety of an opponent', 'A minor trip', 'A tactical foul only', 'B'),
    (4, 'DOGSO is most commonly associated with...', 'Delaying the restart', 'Denying an obvious goal-scoring opportunity', 'Dissent', 'Encroachment', 'B')
) as q(order_index, question_text, option_a, option_b, option_c, option_d, correct_option)
on conflict (test_id, order_index) do update set
  question_text = excluded.question_text,
  option_a = excluded.option_a,
  option_b = excluded.option_b,
  option_c = excluded.option_c,
  option_d = excluded.option_d,
  correct_option = excluded.correct_option;

-- Restarts of Play
with t as (
  select id as test_id from public.tests where slug = 'restarts-of-play'
)
insert into public.test_questions
  (test_id, order_index, question_text, option_a, option_b, option_c, option_d, correct_option)
select
  t.test_id,
  q.order_index,
  q.question_text,
  q.option_a,
  q.option_b,
  q.option_c,
  q.option_d,
  q.correct_option
from t
cross join (
  values
    (1, 'A throw-in is awarded when the whole of the ball passes over the touchline...', 'On the ground only', 'In the air only', 'On the ground or in the air', 'Only if last touched by attacker', 'C'),
    (2, 'A goal kick is awarded when the whole of the ball passes over the goal line (not between the posts) having last touched...', 'An attacker', 'A defender', 'The goalkeeper', 'The referee', 'A'),
    (3, 'A corner kick is awarded when the whole of the ball passes over the goal line (not between the posts) having last touched...', 'An attacker', 'A defender', 'The referee', 'No one', 'B'),
    (4, 'For a dropped ball, if it enters the goal without touching at least two players, the correct restart is...', 'Kick-off', 'Goal kick / corner kick', 'Goal stands', 'Indirect free kick', 'B')
) as q(order_index, question_text, option_a, option_b, option_c, option_d, correct_option)
on conflict (test_id, order_index) do update set
  question_text = excluded.question_text,
  option_a = excluded.option_a,
  option_b = excluded.option_b,
  option_c = excluded.option_c,
  option_d = excluded.option_d,
  correct_option = excluded.correct_option;

commit;

