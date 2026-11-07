-- 방문자 수(오늘·누적) 카운터
-- Supabase 대시보드 → SQL Editor → New query 에 이 파일 전체를 붙여 넣고 Run.
--
-- 표(visit_daily)는 브라우저에서 직접 읽거나 쓸 수 없고(RLS + 권한 회수),
-- 아래 두 함수로만 숫자를 올리거나 읽는다.
--  - hit_visit():   오늘(한국 시간) 숫자 +1 후 {today, total} 반환 — 브라우저당 하루 1번만 호출
--  - visit_stats(): 읽기만 — 같은 날 다시 온 경우, 매일 예약 빌드의 활동 유지용

create table if not exists public.visit_daily (
  day   date    primary key,
  count integer not null default 0 check (count >= 0)
);

alter table public.visit_daily enable row level security;
-- 정책을 만들지 않음 = anon/authenticated 직접 접근 전부 거절
revoke all on table public.visit_daily from anon, authenticated;

create or replace function public.visit_stats()
returns table (today integer, total bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce((select v.count from public.visit_daily v
              where v.day = (now() at time zone 'Asia/Seoul')::date), 0),
    coalesce((select sum(v.count) from public.visit_daily v), 0)::bigint;
$$;

create or replace function public.hit_visit()
returns table (today integer, total bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.visit_daily as v (day, count)
  values ((now() at time zone 'Asia/Seoul')::date, 1)
  on conflict (day) do update set count = v.count + 1;

  return query select * from public.visit_stats();
end;
$$;

revoke all on function public.visit_stats() from public;
revoke all on function public.hit_visit()   from public;
grant execute on function public.visit_stats() to anon, authenticated;
grant execute on function public.hit_visit()   to anon, authenticated;
