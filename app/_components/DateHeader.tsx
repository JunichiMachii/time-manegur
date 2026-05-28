"use client";

import { parseLocal, todayLocal } from "./dateUtils";

type Props = {
  dark?: boolean;
  selectedDate: string;
  onClick?: () => void;
};

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

export function DateHeader({ dark = false, selectedDate, onClick }: Props) {
  const d = parseLocal(selectedDate);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = WEEKDAYS[d.getDay()];
  const isToday = selectedDate === todayLocal();

  const text = dark ? "#F5F5F7" : "#1C1C1E";
  const sub = "#8E8E93";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="日付を選択"
      style={{
        appearance: "none",
        border: 0,
        background: "transparent",
        padding: "0 20px",
        marginBottom: 4,
        display: "flex",
        alignItems: "baseline",
        gap: 8,
        cursor: onClick ? "pointer" : "default",
        textAlign: "left",
        fontFamily: "inherit",
        color: text,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <span
        style={{
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: "34px",
        }}
      >
        {month}月{day}日
      </span>
      <span
        style={{
          fontSize: 16,
          fontWeight: 500,
          color: sub,
        }}
      >
        ({weekday})
      </span>
      {!isToday && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: sub,
            border: `1px solid ${sub}`,
            borderRadius: 999,
            padding: "2px 8px",
            marginLeft: 4,
          }}
        >
          表示中
        </span>
      )}
      <span
        aria-hidden="true"
        style={{
          fontSize: 12,
          color: sub,
          marginLeft: 2,
        }}
      >
        ▾
      </span>
    </button>
  );
}
