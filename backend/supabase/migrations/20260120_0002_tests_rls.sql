-- 20260120_0002_tests_rls.sql
-- RefLab MVP: Row Level Security policies for Tests

-- Enable RLS
alter table public.tests enable row level security;
alter table public.test_questions enable row level security;
alter table public.test_attempts enable row level security;
alter table public.test_attempt_answers enable row level security;

-- TESTS + QUESTIONS: readable by everyone authenticated (or even public if you want later)
-- For MVP, allow authenticated read only.

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

-- ATTEMPTS: user can only read/write their own attempts
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

-- ATTEMPT ANSWERS: user can only read/write answers linked to their attempts
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
