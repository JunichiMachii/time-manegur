"use client";

import { useLayoutEffect, useRef } from "react";

type Props = {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  padZero?: boolean;
  ariaLabel?: string;
  dark?: boolean;
};

const ITEM_HEIGHT = 36;
const VISIBLE = 5; // 表示行数（奇数で中央1行が選択）
const PAD = Math.floor(VISIBLE / 2);

export function TimeSlotPicker({
  value,
  min,
  max,
  onChange,
  padZero = true,
  ariaLabel,
  dark = false,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);
  const lastReportedRef = useRef<number>(value);

  const count = max - min + 1;
  const items: number[] = [];
  for (let i = 0; i < count; i++) items.push(min + i);

  // 初回マウントで value 位置にスクロール
  useLayoutEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = (value - min) * ITEM_HEIGHT;
    lastReportedRef.current = value;
    // 依存配列空: マウント時のみ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      const el = scrollRef.current;
      if (!el) return;
      const idx = Math.round(el.scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(idx, count - 1));
      const next = min + clamped;
      if (next !== lastReportedRef.current) {
        lastReportedRef.current = next;
        onChange(next);
      }
    }, 70);
  };

  const text = dark ? "#F5F5F7" : "#1C1C1E";
  const muted = dark ? "rgba(235,235,245,0.32)" : "rgba(28,28,30,0.32)";
  const line = dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";

  return (
    <div
      style={{
        position: "relative",
        height: ITEM_HEIGHT * VISIBLE,
        width: 64,
        overflow: "hidden",
      }}
    >
      <div
        ref={scrollRef}
        role="listbox"
        aria-label={ariaLabel}
        onScroll={handleScroll}
        className="hide-scrollbar"
        style={{
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          scrollSnapType: "y mandatory",
          paddingTop: ITEM_HEIGHT * PAD,
          paddingBottom: ITEM_HEIGHT * PAD,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {items.map((n) => {
          const isSelected = n === value;
          return (
            <div
              key={n}
              role="option"
              aria-selected={isSelected}
              style={{
                height: ITEM_HEIGHT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                scrollSnapAlign: "center",
                scrollSnapStop: "always",
                fontSize: 22,
                fontWeight: isSelected ? 700 : 500,
                color: isSelected ? text : muted,
                fontVariantNumeric: "tabular-nums",
                transition: "color 0.15s ease, font-weight 0.15s ease",
                userSelect: "none",
              }}
            >
              {padZero ? String(n).padStart(2, "0") : String(n)}
            </div>
          );
        })}
      </div>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: ITEM_HEIGHT * PAD,
          height: ITEM_HEIGHT,
          pointerEvents: "none",
          borderTop: `1px solid ${line}`,
          borderBottom: `1px solid ${line}`,
        }}
      />
    </div>
  );
}
