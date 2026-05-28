"use client";

import { useEffect, useRef } from "react";
import { todayLocal } from "./dateUtils";
import type { ScheduleItem } from "./types";

function parseHHMM(s: string): { h: number; m: number } {
  const [hStr, mStr] = s.split(":");
  const h = parseInt(hStr ?? "", 10);
  const m = parseInt(mStr ?? "", 10);
  return {
    h: Number.isFinite(h) ? h : 0,
    m: Number.isFinite(m) ? m : 0,
  };
}

// 当日の予定について「開始時刻 - notify_minutes_before」にローカル通知を発火する。
// 制限: ブラウザがアクティブ or タブが残っている間のみ。PWA install済かつOS許可済が前提。
export function useNotifications(
  items: ScheduleItem[],
  selectedDate: string,
): void {
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    const clearAll = () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
    clearAll();

    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    // 過去の日付や未来の日付に通知を仕込んでも意味がない
    if (selectedDate !== todayLocal()) return;

    const now = new Date();
    items.forEach((item) => {
      if (item.notify_minutes_before <= 0) return;
      const { h, m } = parseHHMM(item.time);
      const itemTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        h,
        m,
        0,
        0,
      );
      const fireAt = itemTime.getTime() - item.notify_minutes_before * 60_000;
      const delay = fireAt - now.getTime();
      if (delay <= 0) return; // 既に過ぎている
      if (delay > 12 * 3600_000) return; // 12時間先までを対象（負荷防止）

      const id = window.setTimeout(() => {
        try {
          new Notification(item.title, {
            body: `${item.notify_minutes_before}分後に始まります (${item.time})`,
            icon: "/icon-192x192.png",
            badge: "/icon-192x192.png",
            tag: `schedule-${item.id}`,
          });
        } catch (e) {
          console.error("[notify] failed", e);
        }
      }, delay);
      timersRef.current.push(id);
    });

    return clearAll;
  }, [items, selectedDate]);
}
