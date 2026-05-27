-- 追加・削除を anon に許可（認証未実装MVP）
drop policy if exists "tasks_anon_insert" on public.tasks;
create policy "tasks_anon_insert"
  on public.tasks for insert
  to anon, authenticated
  with check (true);

drop policy if exists "tasks_anon_delete" on public.tasks;
create policy "tasks_anon_delete"
  on public.tasks for delete
  to anon, authenticated
  using (true);
