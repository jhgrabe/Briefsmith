create table if not exists public.briefs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null default 'Untitled Brief',
  fields     jsonb not null default '{}'::jsonb,
  score      integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index briefs_user_id_created_at_idx
  on public.briefs (user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger briefs_updated_at
  before update on public.briefs
  for each row execute procedure public.set_updated_at();

alter table public.briefs enable row level security;

create policy "Users read own briefs"
  on public.briefs for select
  using (auth.uid() = user_id);

create policy "Users insert own briefs"
  on public.briefs for insert
  with check (auth.uid() = user_id);

create policy "Users update own briefs"
  on public.briefs for update
  using (auth.uid() = user_id);

create policy "Users delete own briefs"
  on public.briefs for delete
  using (auth.uid() = user_id);
