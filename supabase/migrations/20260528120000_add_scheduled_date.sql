-- 日付単位の表示・編集に対応するための scheduled_date 列を追加。

alter table public.tasks
  add column if not exists scheduled_date date not null default current_date;

create index if not exists tasks_scheduled_date_idx
  on public.tasks (scheduled_date);

-- schedule_items は is_recurring=true のとき NULL（毎日扱い）を許す
alter table public.schedule_items
  add column if not exists scheduled_date date;

create index if not exists schedule_items_scheduled_date_idx
  on public.schedule_items (scheduled_date);
