import type { Task } from "./types";

// シードデータの参考値。実データはSupabaseの `tasks` / `schedule_items` テーブル。
export const INITIAL_TASKS: Task[] = [
  { id: 1, title: "企画書の修正を完了する", tag: "仕事", done: false },
  { id: 2, title: "牛乳とパンを買う", tag: null, done: false },
  { id: 3, title: "レポートのレビュー依頼", tag: "仕事", done: true },
  { id: 4, title: "田中さんにメール返信", tag: null, done: false },
];
