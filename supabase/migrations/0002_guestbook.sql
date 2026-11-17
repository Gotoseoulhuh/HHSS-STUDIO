-- 방명록
-- Supabase 대시보드 → SQL Editor → New query 에 이 파일 전체를 붙여 넣고 Run.
-- 그다음 '관리자 비밀번호 정하기'(맨 아래)를 따로 한 번 실행.
--
-- 표(guestbook_entries)는 브라우저에서 직접 읽거나 쓸 수 없고(RLS + 권한 회수), 아래 함수로만 다룬다.
--  - guestbook_list():   공개 목록. 확인 전(pending) 글은 이름 가운데를 *로 가려서 돌려줌 → 실명은 브라우저에 아예 오지 않음
--  - guestbook_write():  글 남기기. 길이 검사 + 같은 곳(IP)에서 10분에 3개까지
--  - guestbook_admin_list(비밀번호) / guestbook_admin_set(비밀번호, 글번호, 상태): 관리자용 (결과는 JSON)
--
-- 상태: pending(확인 전, 이름 가림) · approved(확인함, 실명) · hidden(숨김, 목록에서 빠짐)

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.guestbook_entries (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name       text not null check (char_length(name) between 1 and 20),
  role       text check (role is null or char_length(role) <= 20),
  favorites  text[] not null default '{}',
  feelings   text[] not null default '{}',
  body       text not null check (char_length(body) between 2 and 600),
  status     text not null default 'pending' check (status in ('pending', 'approved', 'hidden')),
  ip_hash    text
);
create index if not exists guestbook_entries_created_idx on public.guestbook_entries (created_at desc);

alter table public.guestbook_entries enable row level security;
revoke all on table public.guestbook_entries from anon, authenticated;

-- 관리자 비밀번호(해시만 저장) + 틀린 횟수 잠금
create table if not exists public.guestbook_admin (
  id           smallint primary key default 1 check (id = 1),
  pass_hash    text,
  fails        integer not null default 0,
  locked_until timestamptz
);
insert into public.guestbook_admin (id) values (1) on conflict do nothing;
alter table public.guestbook_admin enable row level security;
revoke all on table public.guestbook_admin from anon, authenticated;

-- 이름 가리기: 홍길동 → 홍*동, 남궁민수 → 남**수, 하늘 → 하*, 별 → *
create or replace function public.guestbook_mask(n text)
returns text
language sql
immutable
as $$
  select case
    when char_length(n) <= 1 then '*'
    when char_length(n) = 2 then left(n, 1) || '*'
    else left(n, 1) || repeat('*', char_length(n) - 2) || right(n, 1)
  end;
$$;

create or replace function public.guestbook_list()
returns table (
  id bigint, created_at timestamptz, name text, verified boolean,
  role text, favorites text[], feelings text[], body text
)
language sql
stable
security definer
set search_path = public
as $$
  select e.id, e.created_at,
         case when e.status = 'approved' then e.name else public.guestbook_mask(e.name) end,
         e.status = 'approved',
         e.role, e.favorites, e.feelings, e.body
  from public.guestbook_entries e
  where e.status <> 'hidden'
  order by e.created_at desc
  limit 300;
$$;

create or replace function public.guestbook_write(
  p_name text, p_role text, p_favorites text[], p_feelings text[], p_body text
)
returns bigint
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_name text := btrim(coalesce(p_name, ''));
  v_body text := btrim(coalesce(p_body, ''));
  v_role text := nullif(btrim(coalesce(p_role, '')), '');
  v_ip   text;
  v_hash text;
  v_id   bigint;
begin
  if char_length(v_name) not between 1 and 20 then raise exception 'name_length'; end if;
  if char_length(v_body) not between 2 and 600 then raise exception 'body_length'; end if;
  if coalesce(array_length(p_favorites, 1), 0) > 12 or coalesce(array_length(p_feelings, 1), 0) > 12 then
    raise exception 'too_many_tags';
  end if;

  -- 요청한 곳(IP)은 원문을 저장하지 않고 해시만 — 같은 곳에서 연달아 올리는 것만 막는 용도
  v_ip := split_part(coalesce(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ''), ',', 1);
  v_hash := encode(digest('hhss-guestbook:' || v_ip, 'sha256'), 'hex');

  if (select count(*) from public.guestbook_entries
      where ip_hash = v_hash and created_at > now() - interval '10 minutes') >= 3 then
    raise exception 'rate_limited';
  end if;
  -- 전체 안전장치: 10분에 60개 넘게 들어오면 잠시 멈춤
  if (select count(*) from public.guestbook_entries where created_at > now() - interval '10 minutes') >= 60 then
    raise exception 'rate_limited';
  end if;

  insert into public.guestbook_entries (name, role, favorites, feelings, body, ip_hash)
  values (
    v_name, left(v_role, 20),
    coalesce((select array_agg(left(t, 40)) from unnest(p_favorites) t where btrim(t) <> ''), '{}'),
    coalesce((select array_agg(left(t, 40)) from unnest(p_feelings) t where btrim(t) <> ''), '{}'),
    v_body, v_hash
  )
  returning id into v_id;
  return v_id;
end;
$$;

-- 관리자 비밀번호 확인 (5번 틀리면 15분 잠금)
-- 오류(raise)를 내면 '틀린 횟수' 기록까지 되돌려지므로, 오류 대신 결과 코드를 돌려준다.
--   null = 통과 · 'not_set' · 'locked' · 'wrong'
create or replace function public.guestbook_admin_check(p_pass text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare a public.guestbook_admin;
begin
  select * into a from public.guestbook_admin where id = 1 for update;
  if a.pass_hash is null then return 'not_set'; end if;
  if a.locked_until is not null and a.locked_until > now() then return 'locked'; end if;
  if crypt(coalesce(p_pass, ''), a.pass_hash) <> a.pass_hash then
    update public.guestbook_admin
       set fails = case when a.fails + 1 >= 5 then 0 else a.fails + 1 end,
           locked_until = case when a.fails + 1 >= 5 then now() + interval '15 minutes' else null end
     where id = 1;
    return 'wrong';
  end if;
  if a.fails <> 0 then update public.guestbook_admin set fails = 0 where id = 1; end if;
  return null;
end;
$$;

-- 결과: { "error": 코드 } 또는 { "rows": [...] }
create or replace function public.guestbook_admin_list(p_pass text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_err text;
begin
  v_err := public.guestbook_admin_check(p_pass);
  if v_err is not null then return jsonb_build_object('error', v_err); end if;
  return jsonb_build_object('rows', coalesce((
    select jsonb_agg(to_jsonb(r) order by r.created_at desc)
    from (
      select e.id, e.created_at, e.name, e.status, e.role, e.favorites, e.feelings, e.body
      from public.guestbook_entries e
      order by e.created_at desc
      limit 500
    ) r
  ), '[]'::jsonb));
end;
$$;

-- 결과: { "error": 코드 } 또는 { "ok": true }
create or replace function public.guestbook_admin_set(p_pass text, p_id bigint, p_status text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_err text;
begin
  v_err := public.guestbook_admin_check(p_pass);
  if v_err is not null then return jsonb_build_object('error', v_err); end if;
  if p_status not in ('pending', 'approved', 'hidden') then return jsonb_build_object('error', 'bad_status'); end if;
  update public.guestbook_entries set status = p_status where id = p_id;
  return jsonb_build_object('ok', true);
end;
$$;

-- 가리기·확인 함수는 브라우저에서 직접 부르지 못하게 함(Supabase는 새 함수에 anon 권한을 따로 주므로 anon도 명시)
revoke all on function public.guestbook_mask(text) from public, anon, authenticated;
revoke all on function public.guestbook_admin_check(text) from public, anon, authenticated;
revoke all on function public.guestbook_list() from public;
revoke all on function public.guestbook_write(text, text, text[], text[], text) from public;
revoke all on function public.guestbook_admin_list(text) from public;
revoke all on function public.guestbook_admin_set(text, bigint, text) from public;
grant execute on function public.guestbook_list() to anon, authenticated;
grant execute on function public.guestbook_write(text, text, text[], text[], text) to anon, authenticated;
grant execute on function public.guestbook_admin_list(text) to anon, authenticated;
grant execute on function public.guestbook_admin_set(text, bigint, text) to anon, authenticated;

-- ─────────────────────────────────────────────
-- 관리자 비밀번호 정하기 (저장소에 비밀번호를 적지 말고, SQL Editor에서만 아래 한 줄을 고쳐 실행)
--   update public.guestbook_admin set pass_hash = extensions.crypt('여기에-비밀번호', extensions.gen_salt('bf')), fails = 0, locked_until = null where id = 1;
