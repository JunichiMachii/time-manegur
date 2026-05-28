"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { TimeSlotPicker } from "./TimeSlotPicker";
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

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function parseHHMM(s: string): { h: number; m: number } {
  const [hStr, mStr] = s.split(":");
  const h = parseInt(hStr ?? "", 10);
  const m = parseInt(mStr ?? "", 10);
  return {
    h: Number.isFinite(h) ? Math.max(0, Math.min(23, h)) : 0,
    m: Number.isFinite(m) ? Math.max(0, Math.min(59, m)) : 0,
  };
}

function nowHHMM(): { h: number; m: number } {
  // 分は 0 に固定（未操作時に意図しない現在分が入るのを防ぐ）
  return { h: new Date().getHours(), m: 0 };
}

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
  const notifyId = useId();

  // create時は title/is_recurring/scheduled_date のみdraftで管理
  const initialRecurring =
    mode.kind === "edit" ? mode.item.is_recurring : false;
  const initialScheduledDate =
    mode.kind === "edit" ? mode.item.scheduled_date : null;

  const [title, setTitle] = useState<string>(
    mode.kind === "edit" ? mode.item.title : "",
  );
  const [isRecurring, setIsRecurring] = useState<boolean>(initialRecurring);
  const [scheduledDate] = useState<string | null>(initialScheduledDate);

  // 時刻スロット: 編集時は item.time、新規は現在時刻
  const initialTime =
    mode.kind === "edit" ? parseHHMM(mode.item.time) : nowHHMM();
  const [hour, setHour] = useState<number>(initialTime.h);
  const [minute, setMinute] = useState<number>(initialTime.m);

  // 所要時間スロット: 編集時は item.duration_minutes を分解。新規は 0 (未指定)。
  const initialDuration =
    mode.kind === "edit" ? mode.item.duration_minutes : 0;
  const [durHours, setDurHours] = useState<number>(
    Math.floor(initialDuration / 60),
  );
  const [durMinutes, setDurMinutes] = useState<number>(initialDuration % 60);

  // 通知は数値テキスト入力のまま
  const [notifyText, setNotifyText] = useState<string>(() =>
    String(mode.kind === "edit" ? mode.item.notify_minutes_before : 0),
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    const totalDuration = Math.max(0, durHours * 60 + durMinutes);
    const notify = Math.max(0, parseInt(notifyText, 10) || 0);
    onSave({
      time: `${pad2(hour)}:${pad2(minute)}`,
      title: trimmed,
      duration_minutes: totalDuration,
      notify_minutes_before: notify,
      is_recurring: isRecurring,
      scheduled_date: scheduledDate,
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
        <div style={labelStyle}>時間</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            padding: "8px 0",
            background: fieldBg,
            border: `1px solid ${border}`,
            borderRadius: 12,
          }}
        >
          <TimeSlotPicker
            value={hour}
            min={0}
            max={23}
            onChange={setHour}
            ariaLabel="時"
            dark={dark}
          />
          <div
            aria-hidden="true"
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: text,
              padding: "0 4px",
            }}
          >
            :
          </div>
          <TimeSlotPicker
            value={minute}
            min={0}
            max={59}
            onChange={setMinute}
            ariaLabel="分"
            dark={dark}
          />
        </div>
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
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: チームMTG"
          style={fieldStyle}
        />
      </div>

      <div>
        <div style={labelStyle}>所要時間</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            padding: "8px 0",
            background: fieldBg,
            border: `1px solid ${border}`,
            borderRadius: 12,
          }}
        >
          <TimeSlotPicker
            value={durHours}
            min={0}
            max={23}
            onChange={setDurHours}
            padZero={false}
            ariaLabel="所要時間 時"
            dark={dark}
          />
          <span
            style={{ fontSize: 14, fontWeight: 600, color: muted, padding: "0 2px" }}
          >
            時間
          </span>
          <TimeSlotPicker
            value={durMinutes}
            min={0}
            max={59}
            onChange={setDurMinutes}
            padZero={false}
            ariaLabel="所要時間 分"
            dark={dark}
          />
          <span
            style={{ fontSize: 14, fontWeight: 600, color: muted, padding: "0 2px" }}
          >
            分
          </span>
        </div>
      </div>

      <div>
        <label htmlFor={notifyId} style={labelStyle}>
          通知 (何分前)
        </label>
        <input
          id={notifyId}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          required
          value={notifyText}
          onChange={(e) =>
            setNotifyText(
              e.target.value.replace(/\D/g, "").replace(/^0+(?=\d)/, ""),
            )
          }
          onBlur={() => {
            if (notifyText === "") setNotifyText("0");
          }}
          style={fieldStyle}
        />
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
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
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
            background: isRecurring ? accent : dark ? "#48484A" : "#D1D1D6",
            transition: "background 0.18s ease",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 2,
              left: isRecurring ? 18 : 2,
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
