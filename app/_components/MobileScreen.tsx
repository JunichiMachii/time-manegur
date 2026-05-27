"use client";

import type { ReactNode } from "react";
import { DateHeader } from "./DateHeader";
import { ScheduleTimeline } from "./ScheduleTimeline";
import { TodayTasks } from "./TodayTasks";
import { useScheduleStore } from "./useScheduleStore";
import { useTasksStore } from "./useTasksStore";

export type MobileScreenStyle = "minimal" | "card";

type Props = {
  accent: string;
  dark?: boolean;
  layoutStyle?: MobileScreenStyle;
  topInset?: number;
};

export function MobileScreen({
  accent,
  dark = false,
  layoutStyle = "card",
  topInset = 0,
}: Props) {
  const { tasks, toggleTask, addTask, removeTask } = useTasksStore();
  const { items, addItem, updateItem, removeItem } = useScheduleStore();
  const bg = dark ? "#000000" : "#F8F7F5";
  const surfaceBg = dark ? "#1C1C1E" : "#FFFFFF";
  const textColor = dark ? "#F5F5F7" : "#1C1C1E";
  const dividerColor = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const cardShadow = dark
    ? "0 2px 12px rgba(0,0,0,0.3)"
    : "0 1px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)";
  const isCard = layoutStyle === "card";

  const wrapCard = (children: ReactNode) =>
    isCard ? (
      <div style={{ padding: "0 16px" }}>
        <div
          style={{
            background: surfaceBg,
            borderRadius: 20,
            padding: "16px 20px",
            boxShadow: cardShadow,
          }}
        >
          {children}
        </div>
      </div>
    ) : (
      children
    );

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        background: bg,
        color: textColor,
        fontFamily:
          "var(--font-zen-kaku), -apple-system, system-ui, sans-serif",
        paddingTop: topInset,
        overflow: "hidden",
      }}
    >
      <div style={{ paddingTop: 12, paddingBottom: 8, flexShrink: 0 }}>
        <DateHeader dark={dark} />
      </div>

      <div style={{ flexShrink: 0, paddingTop: 12, paddingBottom: 20 }}>
        {wrapCard(
          <TodayTasks
            tasks={tasks}
            onToggle={toggleTask}
            onAdd={addTask}
            onRemove={removeTask}
            accent={accent}
            dark={dark}
          />,
        )}
      </div>

      <div
        style={{
          height: 1,
          margin: "0 20px",
          background: dividerColor,
          flexShrink: 0,
        }}
      />

      <div
        className="scroll-area"
        style={{
          flex: 1,
          overflow: "auto",
          paddingTop: 20,
          paddingBottom: 40,
        }}
      >
        {wrapCard(
          <ScheduleTimeline
            items={items}
            onAdd={addItem}
            onUpdate={updateItem}
            onRemove={removeItem}
            accent={accent}
            dark={dark}
          />,
        )}
      </div>
    </div>
  );
}
