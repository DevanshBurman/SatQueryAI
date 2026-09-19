-- Private workspace, projects, and query history for every authenticated account.
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null default 'My workspace' check (char_length(name) between 1 and 120),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160), location text,
  status text not null default 'draft' check (status in ('draft', 'active', 'complete')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.query_history (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  query text not null check (char_length(query) between 1 and 4000),
  analysis_type text not null default 'visual', created_at timestamptz not null default now()
);
create index if not exists projects_owner_updated_idx on public.projects(owner_id, updated_at desc);
create index if not exists query_history_owner_created_idx on public.query_history(owner_id, created_at desc);

alter table public.workspaces enable row level security; alter table public.projects enable row level security; alter table public.query_history enable row level security;
revoke all on public.workspaces, public.projects, public.query_history from anon, authenticated;
grant select, insert, update, delete on public.workspaces, public.projects, public.query_history to authenticated;
create policy "Users manage their own workspace" on public.workspaces for all to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "Users manage their own projects" on public.projects for all to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "Users manage their own query history" on public.query_history for all to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name) values (new.id, new.raw_user_meta_data ->> 'full_name') on conflict (id) do nothing;
  insert into public.workspaces (owner_id, name) values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'My') || '''s workspace') on conflict (owner_id) do nothing;
  return new;
end;
$$;
insert into public.workspaces (owner_id, name)
select id, coalesce(nullif(raw_user_meta_data ->> 'full_name', ''), 'My') || '''s workspace' from auth.users
on conflict (owner_id) do nothing;
