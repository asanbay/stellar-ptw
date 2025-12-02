-- Edit locks table for corporate-grade concurrent editing control
create table if not exists public.edit_locks (
  id uuid primary key default gen_random_uuid(),
  resource_type text not null,
  resource_id text not null,
  owner_id text not null,
  owner_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint edit_locks_unique unique (resource_type, resource_id)
);

-- Helpful indexes
create index if not exists edit_locks_expires_idx on public.edit_locks (expires_at);

-- Enable RLS
alter table public.edit_locks enable row level security;

-- Policies: everyone can read to see who holds a lock
create policy "edit_locks_select_all" on public.edit_locks
  for select using (true);

-- Only owners can delete/update their locks
create policy "edit_locks_owner_modify" on public.edit_locks
  for all
  using (auth.uid()::text = owner_id)
  with check (auth.uid()::text = owner_id);

-- Upsert helper: use triggers to update updated_at
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

drop trigger if exists set_edit_locks_updated_at on public.edit_locks;
create trigger set_edit_locks_updated_at
before update on public.edit_locks
for each row execute function public.set_updated_at();
