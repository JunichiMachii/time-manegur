"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { ScheduleItem, ScheduleItemDraft } from "./types";

export type EditorMode =
  | { kind: "create" }
  | { kind: "edit"; item: ScheduleItem };

type Props = {
  mode: EditorMode | null;
  onSave: (draft: ScheduleItemDraft) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
  accent: string;
  dark: boolean;
};

const EMPTY: ScheduleItemDraft = {
  time: "09:00",
  title: "",
  duration_minutes: 30,
  notify_minutes_before: 0,
  is_recurring: false,
};

export function ScheduleEditor({
  mode,
  onSave,
  onDelete,
  onClose,
  accent,
  dark,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (mode) {
      if (!dlg.open) dlg.showModal();
    } else if (dlg.open) {
      dlg.close();
    }
  }, [mode]);

  const surface = dark ? "#1C1C1E" : "#FFFFFF";
  const text = dark ? "#F5F5F7" : "#1C1C1E";

  const formKey =
    mode == null
      ? "closed"
      : mode.kind === "edit"
        ? `edit-${mode.item.id}`
        : "create";

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="schedule-dialog"
      style={{
        padding: 0,
        border: 0,
        borderRadius: 18,
        background: surface,
        color: text,
        width: "min(92vw, 360px)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
      }}
    >
      {mode && (
        <ScheduleForm
          key={formKey}
          mode={mode}
          onSave={onSave}
          onDelete={onDelete}
          onClose={onClose}
          accent={accent}
          dark={dark}
        />
      )}
    </dialog>
  );
}

type FormProps = {
  mode: EditorMode;
  onSave: (draft: ScheduleItemDraft) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
  accent: string;
  dark: boolean;
};

function ScheduleForm({
  mode,
  onSave,
  onDelete,
  onClose,
  accent,
  dark,
}: FormProps) {
  const titleId = useId();
  const timeId = useId();
  const durId = useId();
  const notifyId = useId();

  const [draft, setDraft] = useState<ScheduleItemDraft>(() =>
    mode.kind === "edit"
      ? {
          time: mode.item.time,
          title: mode.item.title,
          duration_minutes: mode.item.duration_minutes,
          notify_minutes_before: mode.item.notify_minutes_before,
          is_recurring: mode.item.is_recurring,
        }
      : EMPTY,
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const title = draft.title.trim();
    if (!title) return;
    onSave({
      time: draft.time,
      title,
      duration_minutes: Math.max(1, Math.floor(draft.duration_minutes)),
      notify_minutes_before: Math.max(
        0,
        Math.floor(draft.notify_minutes_before),
      ),
      is_recurring: draft.is_recurring,
    });
    onClose();
  };

  const handleDelete = () => {
    if (mode.kind !== "edit") return;
    onDelete(mode.item.id);
    onClose();
  };

  const text = dark ? "#F5F5F7" : "#1C1C1E";
  const muted = dark ? "rgba(235,235,245,0.6)" : "#8E8E93";
  const border = dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
  const fieldBg = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)";

  const fieldStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${border}`,
    background: fieldBg,
    color: text,
    fontSize: 16,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: muted,
    marginBottom: 6,
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        padding: "20px 20px 16px",
        fontFamily:
          "var(--font-zen-kaku), -apple-system, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700 }}>
          {mode.kind === "edit" ? "予定を編集" : "予定を追加"}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          style={{
            appearance: "none",
            border: 0,
            background: "transparent",
            cursor: "pointer",
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: muted,
            borderRadius: 6,
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

      <div>
        <label htmlFor={timeId} style={labelStyle}>
          時間
        </label>
        <input
          id={timeId}
          type="time"
          required
          value={draft.time}
          onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))}
          style={fieldStyle}
        />
      </div>

      <div>
        <label htmlFor={titleId} style={labelStyle}>
          やること
        </label>
        <input
          id={titleId}
          type="text"
          required
          autoFocus
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          placeholder="例: チームMTG"
          style={fieldStyle}
        />
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label htmlFor={durId} style={labelStyle}>
            所要時間 (分)
          </label>
          <input
            id={durId}
            type="number"
            min={1}
            step={1}
            required
            value={draft.duration_minutes}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                duration_minutes: Number(e.target.value),
              }))
            }
            style={fieldStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor={notifyId} style={labelStyle}>
            通知 (何分前)
          </label>
          <input
            id={notifyId}
            type="number"
            min={0}
            step={1}
            required
            value={draft.notify_minutes_before}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                notify_minutes_before: Number(e.target.value),
              }))
            }
            style={fieldStyle}
          />
        </div>
      </div>

      <label
        htmlFor={`${titleId}-recur`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "12px 14px",
          borderRadius: 12,
          background: fieldBg,
          border: `1px solid ${border}`,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: text }}>
            毎日固定にする
          </span>
          <span style={{ fontSize: 11, color: muted, lineHeight: 1.5 }}>
            毎日同じ時間にやることとして固定表示します
          </span>
        </div>
        <input
          id={`${titleId}-recur`}
          type="checkbox"
          checked={draft.is_recurring}
          onChange={(e) =>
            setDraft((d) => ({ ...d, is_recurring: e.target.checked }))
          }
          style={{
            position: "absolute",
            opacity: 0,
            pointerEvents: "none",
          }}
        />
        <span
          aria-hidden="true"
          style={{
            position: "relative",
            width: 40,
            height: 24,
            borderRadius: 999,
            background: draft.is_recurring ? accent : dark ? "#48484A" : "#D1D1D6",
            transition: "background 0.18s ease",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 2,
              left: draft.is_recurring ? 18 : 2,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "#FFFFFF",
              boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
              transition: "left 0.18s ease",
            }}
          />
        </span>
      </label>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 4,
          alignItems: "center",
        }}
      >
        {mode.kind === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            style={{
              appearance: "none",
              border: 0,
              background: "transparent",
              color: "#FF3B30",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "inherit",
              cursor: "pointer",
              padding: "10px 12px",
              borderRadius: 10,
            }}
          >
            削除
          </button>
        )}
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={onClose}
          style={{
            appearance: "none",
            border: 0,
            background: "transparent",
            color: muted,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: "pointer",
            padding: "10px 12px",
            borderRadius: 10,
          }}
        >
          キャンセル
        </button>
        <button
          type="submit"
          style={{
            appearance: "none",
            border: 0,
            background: accent,
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "inherit",
            cursor: "pointer",
            padding: "10px 18px",
            borderRadius: 10,
          }}
        >
          保存
        </button>
      </div>
    </form>
  );
}
