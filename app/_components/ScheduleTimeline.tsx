"use client";

import { useState, useSyncExternalStore } from "react";
import { ScheduleEditor, type EditorMode } from "./ScheduleEditor";
import type { ScheduleItem, ScheduleItemDraft } from "./types";

function subscribeMinute(callback: () => void): () => void {
  const now = new Date();
  const delay =
    (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
  let intervalId: ReturnType<typeof setInterval> | null = null;
  const timeoutId = setTimeout(() => {
    callback();
    intervalId = setInterval(callback, 60_000);
  }, Math.max(0, delay));
  return () => {
    clearTimeout(timeoutId);
    if (intervalId) clearInterval(intervalId);
  };
}

function getMinuteSnapshot(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function getServerMinuteSnapshot(): number {
  return -1;
}

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map((s) => parseInt(s, 10));
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
}

type Props = {
  items: ScheduleItem[];
  onAdd: (draft: ScheduleItemDraft) => void;
  onUpdate: (id: number, patch: Partial<ScheduleItemDraft>) => void;
  onRemove: (id: number) => void;
  accent: string;
  dark?: boolean;
  headerBg?: string;
};

type TimelineItemProps = {
  item: ScheduleItem;
  isNow: boolean;
  isPast: boolean;
  isLast: boolean;
  accent: string;
  dark: boolean;
  onEdit: () => void;
};

type BellIconProps = {
  color: string;
  size?: number;
};

function BellIcon({ color, size = 14 }: BellIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path
        d="M8 1.5C5.5 1.5 4 3.5 4 5.5V8.5L2.5 11H13.5L12 8.5V5.5C12 3.5 10.5 1.5 8 1.5Z"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 11V12C6.5 12.83 7.17 13.5 8 13.5C8.83 13.5 9.5 12.83 9.5 12V11"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatDuration(min: number): string {
  if (min < 60) return `${min}分`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}時間${m}分` : `${h}時間`;
}

function TimelineItem({
  item,
  isNow,
  isPast,
  isLast,
  accent,
  dark,
  onEdit,
}: TimelineItemProps) {
  const dotSize = isNow ? 12 : 8;
  const textColor = dark ? "#F5F5F7" : "#1C1C1E";
  const mutedColor = dark ? "#636366" : "#C7C7CC";
  const secondaryColor = "#8E8E93";
  const editColor = dark ? "rgba(235,235,245,0.45)" : "rgba(60,60,67,0.5)";

  return (
    <div
      className="schedule-row"
      style={{
        display: "flex",
        gap: 16,
        position: "relative",
        opacity: isPast ? 0.35 : 1,
        transition: "opacity 0.3s ease",
        paddingBottom: isLast ? 0 : 28,
      }}
    >
      <div
        style={{
          width: 48,
          flexShrink: 0,
          textAlign: "right",
          fontSize: 14,
          fontWeight: 600,
          paddingTop: 1,
          color: isNow ? accent : secondaryColor,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {item.time}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 12,
          flexShrink: 0,
          position: "relative",
        }}
      >
        <div
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: "50%",
            background: isNow
              ? accent
              : isPast
                ? mutedColor
                : dark
                  ? "#48484A"
                  : "#E5E5EA",
            flexShrink: 0,
            position: "relative",
            zIndex: 2,
            boxShadow: isNow
              ? `0 0 0 4px ${accent}22, 0 0 12px ${accent}44`
              : "none",
            marginTop: isNow ? 0 : 2,
            transition: "all 0.3s ease",
          }}
        >
          {isNow && (
            <div
              style={{
                position: "absolute",
                inset: -4,
                borderRadius: "50%",
                border: `2px solid ${accent}`,
                opacity: 0.3,
                animation: "timelinePulse 2s ease-in-out infinite",
              }}
            />
          )}
        </div>
        {!isLast && (
          <div
            style={{
              width: 1.5,
              flex: 1,
              marginTop: 4,
              background: dark
                ? "linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.04))"
                : "linear-gradient(to bottom, rgba(0,0,0,0.08), rgba(0,0,0,0.03))",
            }}
          />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontSize: 15,
              fontWeight: isNow ? 600 : 500,
              color: isNow ? textColor : isPast ? secondaryColor : textColor,
              lineHeight: "20px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.title}
          </span>
          {isNow && <BellIcon color={accent} size={14} />}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 3,
          }}
        >
          {item.duration_minutes > 0 && (
            <span
              style={{
                fontSize: 12,
                color: secondaryColor,
                fontWeight: 400,
              }}
            >
              {formatDuration(item.duration_minutes)}
            </span>
          )}
          {item.notify_minutes_before > 0 && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                fontSize: 11,
                color: secondaryColor,
                fontWeight: 500,
              }}
            >
              <BellIcon color={secondaryColor} size={10} />
              {item.notify_minutes_before}分前
            </span>
          )}
        </div>
        {isNow && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              marginTop: 6,
              padding: "3px 10px 3px 8px",
              borderRadius: 8,
              background: `${accent}12`,
              fontSize: 11,
              fontWeight: 600,
              color: accent,
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: accent,
                animation: "dotBlink 1.5s ease-in-out infinite",
              }}
            />
            いまここ
          </div>
        )}
      </div>

      <button
        type="button"
        className="schedule-row-edit"
        aria-label={`「${item.title}」を編集`}
        onClick={onEdit}
        style={{
          appearance: "none",
          border: 0,
          background: "transparent",
          padding: 4,
          width: 28,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: editColor,
          borderRadius: 6,
          flexShrink: 0,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <path
            d="M9.5 1.5l3 3-7.5 7.5H2v-3z"
            stroke="currentColor"
            strokeWidth="1.4"
            fill="none"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

export function ScheduleTimeline({
  items,
  onAdd,
  onUpdate,
  onRemove,
  accent,
  dark = false,
  headerBg = "transparent",
}: Props) {
  const nowMin = useSyncExternalStore(
    subscribeMinute,
    getMinuteSnapshot,
    getServerMinuteSnapshot,
  );
  const [mode, setMode] = useState<EditorMode | null>(null);

  const handleSave = (draft: ScheduleItemDraft) => {
    if (mode?.kind === "edit") {
      onUpdate(mode.item.id, draft);
    } else {
      onAdd(draft);
    }
  };

  return (
    <div style={{ padding: "0 20px" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          background: headerBg,
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          gap: 8,
          paddingTop: 2,
          paddingBottom: 18,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#8E8E93",
            flex: 1,
          }}
        >
          決まった時間にやること
        </div>
        <button
          type="button"
          onClick={() => setMode({ kind: "create" })}
          aria-label="予定を追加"
          style={{
            appearance: "none",
            border: 0,
            background: "transparent",
            color: accent,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            padding: "2px 6px",
            borderRadius: 6,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontFamily: "inherit",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path
              d="M6 1.5v9M1.5 6h9"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          追加
        </button>
      </div>

      <div suppressHydrationWarning>
        {items.map((item, i) => {
          const startMin = parseTimeToMinutes(item.time);
          const endMin = startMin + item.duration_minutes;
          const isNow =
            nowMin >= 0 && nowMin >= startMin && nowMin < endMin;
          const isPast = nowMin >= 0 && nowMin >= endMin;
          return (
            <TimelineItem
              key={item.id}
              item={item}
              isNow={isNow}
              isPast={isPast}
              isLast={i === items.length - 1}
              accent={accent}
              dark={dark}
              onEdit={() => setMode({ kind: "edit", item })}
            />
          );
        })}
      </div>

      <ScheduleEditor
        mode={mode}
        onSave={handleSave}
        onDelete={onRemove}
        onClose={() => setMode(null)}
        accent={accent}
        dark={dark}
      />
    </div>
  );
}
