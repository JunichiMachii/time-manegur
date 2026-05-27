"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ScheduleItem, ScheduleItemDraft } from "./types";

const TABLE = "schedule_items";
const COLUMNS = "id, time, title, duration_minutes, notify_minutes_before";

export type ScheduleStore = {
  items: ScheduleItem[];
  addItem: (draft: ScheduleItemDraft) => void;
  updateItem: (id: number, patch: Partial<ScheduleItemDraft>) => void;
  removeItem: (id: number) => void;
};

function sortByTime(items: ScheduleItem[]): ScheduleItem[] {
  return [...items].sort((a, b) => a.time.localeCompare(b.time));
}

export function useScheduleStore(): ScheduleStore {
  const [items, setItems] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    (async () => {
      const { data, error } = await supabase
        .from(TABLE)
        .select(COLUMNS)
        .order("time", { ascending: true });
      if (cancelled) return;
      if (error) {
        console.error("[schedule] fetch failed", error);
        return;
      }
      setItems((data ?? []) as ScheduleItem[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const addItem = useCallback((draft: ScheduleItemDraft) => {
    const tempId = -Date.now();
    const optimistic: ScheduleItem = { id: tempId, ...draft };
    setItems((prev) => sortByTime([...prev, optimistic]));

    const supabase = createClient();
    void supabase
      .from(TABLE)
      .insert(draft)
      .select(COLUMNS)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          console.error("[schedule] insert failed", error);
          setItems((cur) => cur.filter((t) => t.id !== tempId));
          return;
        }
        setItems((cur) =>
          sortByTime(
            cur.map((t) => (t.id === tempId ? (data as ScheduleItem) : t)),
          ),
        );
      });
  }, []);

  const updateItem = useCallback(
    (id: number, patch: Partial<ScheduleItemDraft>) => {
      let prevItem: ScheduleItem | undefined;
      setItems((prev) => {
        prevItem = prev.find((t) => t.id === id);
        if (!prevItem) return prev;
        return sortByTime(
          prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        );
      });
      if (id < 0 || !prevItem) return; // 楽観挿入中は同期しない
      const snapshot = prevItem;

      const supabase = createClient();
      void supabase
        .from(TABLE)
        .update(patch)
        .eq("id", id)
        .then(({ error }) => {
          if (error) {
            console.error("[schedule] update failed", error);
            setItems((cur) =>
              sortByTime(cur.map((t) => (t.id === id ? snapshot : t))),
            );
          }
        });
    },
    [],
  );

  const removeItem = useCallback((id: number) => {
    let removed: ScheduleItem | undefined;
    setItems((prev) => {
      removed = prev.find((t) => t.id === id);
      return prev.filter((t) => t.id !== id);
    });
    if (id < 0) return;

    const supabase = createClient();
    void supabase
      .from(TABLE)
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) {
          console.error("[schedule] delete failed", error);
          if (removed) {
            const restored = removed;
            setItems((cur) => sortByTime([...cur, restored]));
          }
        }
      });
  }, []);

  return { items, addItem, updateItem, removeItem };
}
