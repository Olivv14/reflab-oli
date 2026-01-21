-- 20260120_0001_tests_tables.sql
-- RefLab MVP: Tests schema (supports resume + locked answers + AI explanation cache)

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

-- Updated_at trigger helper (optional, but good practice)
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger to tables that have updated_at
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
