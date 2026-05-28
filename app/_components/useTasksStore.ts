"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Task } from "./types";

const TABLE = "tasks";
const COLUMNS = "id, title, tag, done, scheduled_date";

export type TasksStore = {
  tasks: Task[];
  toggleTask: (id: number) => void;
  addTask: (title: string, tag?: string | null) => void;
  removeTask: (id: number) => void;
};

export function useTasksStore(
  initial: Task[],
  scheduledDate: string,
): TasksStore {
  const [tasks, setTasks] = useState<Task[]>(initial);
  const supabase = useMemo(() => createClient(), []);
  const tempIdRef = useRef(-1);

  // 日付切替時にサーバー側初期データへ同期
  useEffect(() => {
    setTasks(initial);
  }, [initial]);

  const toggleTask = useCallback(
    (id: number) => {
      setTasks((prev) => {
        const target = prev.find((t) => t.id === id);
        if (!target) return prev;
        const nextDone = !target.done;
        void supabase
          .from(TABLE)
          .update({ done: nextDone })
          .eq("id", id)
          .then(({ error }) => {
            if (error) {
              console.error("[tasks] update failed", error);
              setTasks((cur) =>
                cur.map((t) =>
                  t.id === id ? { ...t, done: !nextDone } : t,
                ),
              );
            }
          });
        return prev.map((t) =>
          t.id === id ? { ...t, done: nextDone } : t,
        );
      });
    },
    [supabase],
  );

  const addTask = useCallback(
    (title: string, tag: string | null = null) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      const tempId = tempIdRef.current--;
      const optimistic: Task = {
        id: tempId,
        title: trimmed,
        tag,
        done: false,
        scheduled_date: scheduledDate,
      };
      setTasks((prev) => [...prev, optimistic]);

      void supabase
        .from(TABLE)
        .insert({ title: trimmed, tag, done: false, scheduled_date: scheduledDate })
        .select(COLUMNS)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            console.error("[tasks] insert failed", error);
            setTasks((cur) => cur.filter((t) => t.id !== tempId));
            return;
          }
          setTasks((cur) =>
            cur.map((t) => (t.id === tempId ? (data as Task) : t)),
          );
        });
    },
    [supabase, scheduledDate],
  );

  const removeTask = useCallback(
    (id: number) => {
      let removed: Task | undefined;
      setTasks((prev) => {
        removed = prev.find((t) => t.id === id);
        return prev.filter((t) => t.id !== id);
      });
      if (id < 0) return; // 楽観挿入中の一時IDは無視

      void supabase
        .from(TABLE)
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (error) {
            console.error("[tasks] delete failed", error);
            if (removed) {
              const restored = removed;
              setTasks((cur) =>
                [...cur, restored].sort((a, b) => a.id - b.id),
              );
            }
          }
        });
    },
    [supabase],
  );

  return { tasks, toggleTask, addTask, removeTask };
}
