-- Ensure child records cannot point at another user's workspace or project.
drop policy if exists "Users manage their own projects" on public.projects;
create policy "Users manage their own projects"
on public.projects for all to authenticated
using (
  (select auth.uid()) = owner_id
  and exists (
    select 1 from public.workspaces workspace
    where workspace.id = workspace_id
      and workspace.owner_id = (select auth.uid())
  )
)
with check (
  (select auth.uid()) = owner_id
  and exists (
    select 1 from public.workspaces workspace
    where workspace.id = workspace_id
      and workspace.owner_id = (select auth.uid())
  )
);

drop policy if exists "Users manage their own query history" on public.query_history;
create policy "Users manage their own query history"
on public.query_history for all to authenticated
using (
  (select auth.uid()) = owner_id
  and exists (
    select 1 from public.workspaces workspace
    where workspace.id = workspace_id
      and workspace.owner_id = (select auth.uid())
  )
)
with check (
  (select auth.uid()) = owner_id
  and exists (
    select 1 from public.workspaces workspace
    where workspace.id = workspace_id
      and workspace.owner_id = (select auth.uid())
  )
  and (
    project_id is null
    or exists (
      select 1 from public.projects project
      where project.id = project_id
        and project.workspace_id = workspace_id
        and project.owner_id = (select auth.uid())
    )
  )
);
