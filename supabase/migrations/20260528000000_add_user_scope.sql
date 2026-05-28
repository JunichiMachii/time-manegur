-- ユーザー単位の所有権を強制。anonポリシーを撤去し、authenticatedのみが自分のデータを操作可能。

-- 1) 既存のanonポリシーを削除
drop policy if exists "tasks_anon_select" on public.tasks;
drop policy if exists "tasks_anon_update" on public.tasks;
drop policy if exists "tasks_anon_insert" on public.tasks;
drop policy if exists "tasks_anon_delete" on public.tasks;

drop policy if exists "schedule_anon_select" on public.schedule_items;
drop policy if exists "schedule_anon_update" on public.schedule_items;
drop policy if exists "schedule_anon_insert" on public.schedule_items;
drop policy if exists "schedule_anon_delete" on public.schedule_items;

-- 2) user_idを持たない既存シードデータをクリア（開発DB前提）
truncate public.tasks restart identity cascade;
truncate public.schedule_items restart identity cascade;

-- 3) user_id列を追加（NOT NULL、デフォルトはauth.uid()）
alter table public.tasks
  add column user_id uuid not null default auth.uid()
  references auth.users(id) on delete cascade;

alter table public.schedule_items
  add column user_id uuid not null default auth.uid()
  references auth.users(id) on delete cascade;

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists schedule_items_user_id_idx on public.schedule_items (user_id);

-- 4) authenticatedのみが自分の行にアクセス可能
create policy "tasks_owner_select" on public.tasks
  for select to authenticated
  using (auth.uid() = user_id);

create policy "tasks_owner_insert" on public.tasks
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy "tasks_owner_update" on public.tasks
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "tasks_owner_delete" on public.tasks
  for delete to authenticated
  using (auth.uid() = user_id);

create policy "schedule_owner_select" on public.schedule_items
  for select to authenticated
  using (auth.uid() = user_id);

create policy "schedule_owner_insert" on public.schedule_items
  for insert to authenticated
  with check (auth.uid() = user_id);

create policy "schedule_owner_update" on public.schedule_items
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "schedule_owner_delete" on public.schedule_items
  for delete to authenticated
  using (auth.uid() = user_id);

-- 5) anonロールから操作権限を剥奪
revoke all on public.tasks from anon;
revoke all on public.schedule_items from anon;
