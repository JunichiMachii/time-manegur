"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatDateLocal,
  parseLocal,
  todayLocal,
} from "./dateUtils";

type Props = {
  open: boolean;
  selectedDate: string;
  onSelect: (date: string) => void;
  onClose: () => void;
  accent: string;
  dark?: boolean;
};

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const;

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function buildMonthGrid(year: number, month: number): (string | null)[] {
  // month: 0-indexed。前月の空白で揃え、6行42セルの上限内で必要セルのみ。
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= lastDate; d++) {
    cells.push(formatDateLocal(new Date(year, month, d)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function DateCalendar({
  open,
  selectedDate,
  onSelect,
  onClose,
  accent,
  dark = false,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [cursor, setCursor] = useState<Date>(() =>
    startOfMonth(parseLocal(selectedDate)),
  );

  useEffect(() => {
    if (open) {
      setCursor(startOfMonth(parseLocal(selectedDate)));
    }
  }, [open, selectedDate]);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const t = window.setTimeout(() => setMounted(false), 240);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const cells = useMemo(
    () => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()),
    [cursor],
  );

  const today = todayLocal();

  if (!mounted) return null;

  const surface = dark ? "#1C1C1E" : "#FFFFFF";
  const text = dark ? "#F5F5F7" : "#1C1C1E";
  const muted = dark ? "rgba(235,235,245,0.55)" : "#8E8E93";
  const subtle = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="日付を選択"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10001,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 56px)",
        paddingLeft: 16,
        paddingRight: 16,
        pointerEvents: visible ? "auto" : "none",
        fontFamily:
          "var(--font-zen-kaku), -apple-system, system-ui, sans-serif",
      }}
    >
      <button
        type="button"
        aria-label="閉じる"
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          border: 0,
          appearance: "none",
          background: visible ? "rgba(0,0,0,0.32)" : "rgba(0,0,0,0)",
          transition: "background 220ms ease",
          cursor: "pointer",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 360,
          background: surface,
          color: text,
          borderRadius: 20,
          padding: 16,
          boxShadow: "0 16px 48px rgba(0,0,0,0.22)",
          transform: visible
            ? "translateY(0) scale(1)"
            : "translateY(-8px) scale(0.98)",
          opacity: visible ? 1 : 0,
          transition:
            "transform 240ms cubic-bezier(0.32, 0.72, 0, 1), opacity 200ms ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <button
            type="button"
            aria-label="前の月"
            onClick={() => setCursor((c) => addMonths(c, -1))}
            style={navBtnStyle(text)}
          >
            <ChevronLeft />
          </button>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.01em" }}>
            {cursor.getFullYear()}年 {cursor.getMonth() + 1}月
          </div>
          <button
            type="button"
            aria-label="次の月"
            onClick={() => setCursor((c) => addMonths(c, 1))}
            style={navBtnStyle(text)}
          >
            <ChevronRight />
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 2,
            marginBottom: 4,
          }}
        >
          {WEEKDAY_LABELS.map((w, i) => (
            <div
              key={w}
              style={{
                textAlign: "center",
                fontSize: 11,
                fontWeight: 600,
                color:
                  i === 0
                    ? "#E5654A"
                    : i === 6
                      ? "#5A8FC8"
                      : muted,
                padding: "8px 0 4px",
              }}
            >
              {w}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 2,
          }}
        >
          {cells.map((cellDate, idx) => {
            if (!cellDate) {
              return <div key={`empty-${idx}`} style={{ aspectRatio: "1 / 1" }} />;
            }
            const isSelected = cellDate === selectedDate;
            const isToday = cellDate === today;
            const dayNum = parseInt(cellDate.split("-")[2], 10);
            const weekday = idx % 7;
            const dayColor = isSelected
              ? "#FFFFFF"
              : weekday === 0
                ? "#C45045"
                : weekday === 6
                  ? "#4577A8"
                  : text;
            return (
              <button
                key={cellDate}
                type="button"
                onClick={() => onSelect(cellDate)}
                aria-pressed={isSelected}
                aria-label={`${cellDate}を選択`}
                style={{
                  aspectRatio: "1 / 1",
                  appearance: "none",
                  border: 0,
                  background: isSelected ? accent : "transparent",
                  color: dayColor,
                  fontSize: 14,
                  fontWeight: isToday || isSelected ? 700 : 500,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  cursor: "pointer",
                  transition: "background 0.15s ease, color 0.15s ease",
                  fontFamily: "inherit",
                  fontVariantNumeric: "tabular-nums",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = subtle;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {dayNum}
                {isToday && !isSelected && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      bottom: 4,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: accent,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 10,
            display: "flex",
            justifyContent: "flex-end",
            gap: 4,
          }}
        >
          <button
            type="button"
            onClick={() => onSelect(today)}
            style={{
              appearance: "none",
              border: 0,
              background: "transparent",
              color: accent,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "inherit",
              padding: "8px 12px",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            今日へ
          </button>
        </div>
      </div>
    </div>
  );
}

function navBtnStyle(color: string): React.CSSProperties {
  return {
    appearance: "none",
    border: 0,
    background: "transparent",
    color,
    width: 36,
    height: 36,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  };
}

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M9 1L3 7l6 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M5 1l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
