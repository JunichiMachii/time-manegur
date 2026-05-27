"use client";

import { useState, type CSSProperties, type KeyboardEvent } from "react";
import type { Task } from "./types";

type Props = {
  tasks: Task[];
  onToggle: (id: number) => void;
  onAdd: (title: string) => void;
  onRemove: (id: number) => void;
  accent: string;
  dark?: boolean;
  headerBg?: string;
};

type TaskRowProps = {
  task: Task;
  onToggle: () => void;
  onRemove: () => void;
  accent: string;
  dark: boolean;
  isLast: boolean;
};

type CheckboxProps = {
  checked: boolean;
  onChange: () => void;
  accent: string;
};

function TaskCheckbox({ checked, onChange, accent }: CheckboxProps) {
  const style: CSSProperties = {
    width: 24,
    height: 24,
    borderRadius: 12,
    flexShrink: 0,
    border: checked ? "none" : "2px solid #D1D1D6",
    background: checked ? accent : "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  return (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onClick={onChange}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onChange();
        }
      }}
      style={style}
    >
      <svg
        width="12"
        height="10"
        viewBox="0 0 12 10"
        style={{
          opacity: checked ? 1 : 0,
          transform: checked ? "scale(1)" : "scale(0.5)",
          transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <path
          d="M1 5.5L4 8.5L11 1.5"
          stroke="#fff"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  onRemove,
  accent,
  dark,
  isLast,
}: TaskRowProps) {
  const deleteColor = dark ? "rgba(235,235,245,0.45)" : "rgba(60,60,67,0.5)";
  return (
    <div
      className="task-row"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 0",
        borderBottom: isLast
          ? "none"
          : dark
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid rgba(0,0,0,0.05)",
        transition: "opacity 0.4s ease",
        opacity: task.done ? 0.4 : 1,
      }}
    >
      <TaskCheckbox checked={task.done} onChange={onToggle} accent={accent} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 500,
            lineHeight: "22px",
            color: task.done ? "#8E8E93" : "inherit",
            textDecorationLine: task.done ? "line-through" : "none",
            textDecorationColor: "#C7C7CC",
            transition: "all 0.3s ease",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {task.title}
        </div>
        {task.tag && (
          <span
            style={{
              display: "inline-block",
              marginTop: 4,
              fontSize: 12,
              fontWeight: 500,
              color: accent,
              background: `${accent}14`,
              padding: "2px 8px",
              borderRadius: 6,
            }}
          >
            {task.tag}
          </span>
        )}
      </div>
      <button
        type="button"
        className="task-row-delete"
        aria-label={`「${task.title}」を削除`}
        onClick={onRemove}
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
          color: deleteColor,
          borderRadius: 6,
          flexShrink: 0,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <path
            d="M3 3l8 8M11 3l-8 8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

type AddRowProps = {
  onAdd: (title: string) => void;
  dark: boolean;
  accent: string;
};

function TaskAddRow({ onAdd, dark, accent }: AddRowProps) {
  const [value, setValue] = useState("");
  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue("");
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "Escape") {
      setValue("");
      (e.target as HTMLInputElement).blur();
    }
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 0 2px",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          border: `1.5px dashed ${dark ? "rgba(255,255,255,0.2)" : "#D1D1D6"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: value.trim() ? accent : dark ? "#636366" : "#C7C7CC",
          fontSize: 16,
          lineHeight: 1,
          flexShrink: 0,
          transition: "color 0.2s ease",
        }}
      >
        +
      </div>
      <input
        className="task-input"
        type="text"
        value={value}
        placeholder="タスクを追加..."
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={submit}
        aria-label="新しいタスク"
        style={{
          flex: 1,
          minWidth: 0,
          border: 0,
          background: "transparent",
          outline: "none",
          font: "inherit",
          fontSize: 16,
          fontWeight: 500,
          lineHeight: "22px",
          color: "inherit",
          padding: 0,
        }}
      />
    </div>
  );
}

export function TodayTasks({
  tasks,
  onToggle,
  onAdd,
  onRemove,
  accent,
  dark = false,
  headerBg = "transparent",
}: Props) {
  const doneCount = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const progress = total > 0 ? (doneCount / total) * 100 : 0;

  return (
    <div style={{ padding: "0 20px" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          background: headerBg,
          zIndex: 1,
          paddingTop: 2,
          paddingBottom: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#8E8E93",
            }}
          >
            今日やるべきこと
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: accent }}>
            {doneCount}/{total}
          </div>
        </div>

        <div
          style={{
            height: 3,
            borderRadius: 2,
            background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              borderRadius: 2,
              background: accent,
              width: `${progress}%`,
              transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </div>
      </div>

      <div>
        {tasks.map((task, i) => (
          <TaskRow
            key={task.id}
            task={task}
            onToggle={() => onToggle(task.id)}
            onRemove={() => onRemove(task.id)}
            accent={accent}
            dark={dark}
            isLast={i === tasks.length - 1}
          />
        ))}
        <TaskAddRow onAdd={onAdd} dark={dark} accent={accent} />
      </div>
    </div>
  );
}
