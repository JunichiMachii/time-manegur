-- schedule_items に毎日固定フラグを追加。
-- 既存行は false（その日限りの予定）として扱う。

alter table public.schedule_items
  add column if not exists is_recurring boolean not null default false;

create index if not exists schedule_items_is_recurring_idx
  on public.schedule_items (is_recurring);
