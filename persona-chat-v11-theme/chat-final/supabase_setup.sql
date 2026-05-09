-- user_progress 테이블 생성
create table if not exists user_progress (
  user_id      text primary key,
  credits      integer not null default 0,
  today_count  integer not null default 0,
  today_date   text not null default '',
  total_count  integer not null default 0,
  week_counts  integer[] not null default '{0,0,0,0,0,0,0}',
  session_indices jsonb not null default '{}',
  scraps       jsonb not null default '[]',
  updated_at   timestamptz not null default now()
);

-- updated_at 자동 갱신 트리거
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on user_progress;
create trigger set_updated_at
  before update on user_progress
  for each row execute function update_updated_at();

-- RLS 활성화 (선택) — anon key로 접근 허용
alter table user_progress enable row level security;

create policy "allow all" on user_progress
  for all using (true) with check (true);
