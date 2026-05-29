"use client";

import { useState } from "react";

type Props = {
  startH: number;
  startM: number;
  endH: number;
  endM: number;
  onChange: (startH: number, startM: number, endH: number, endM: number) => void;
  dark: boolean;
  accent: string;
};

function to12(h: number): { h12: number; ampm: "AM" | "PM" } {
  return { h12: h % 12 || 12, ampm: h < 12 ? "AM" : "PM" };
}

function to24(h12: number, ampm: "AM" | "PM"): number {
  return ampm === "AM" ? h12 % 12 : (h12 % 12) + 12;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

const CX = 100;
const CY = 100;
const FACE_R = 88;
const HAND_LEN = 70;
const BADGE_R = 11;
const ARC_R = 68;

function degToRad(deg: number): number {
  return ((deg - 90) * Math.PI) / 180;
}

function handPoint(deg: number, len: number): { x: number; y: number } {
  const rad = degToRad(deg);
  return { x: CX + len * Math.cos(rad), y: CY + len * Math.sin(rad) };
}

function timeToDeg(h: number, m: number): number {
  return ((h % 12) * 60 + m) / (12 * 60) * 360;
}

function arcPath(startDeg: number, endDeg: number, r: number): string {
  const s = handPoint(startDeg, r);
  const e = handPoint(endDeg, r);
  let sweep = endDeg - startDeg;
  if (sweep <= 0) sweep += 360;
  const large = sweep > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

export function ClockTimePicker({ startH, startM, endH, endM, onChange, dark, accent }: Props) {
  const [mode, setMode] = useState<"start" | "end">("start");

  const { h12: sH12, ampm: sAmPm } = to12(startH);
  const { h12: eH12, ampm: eAmPm } = to12(endH);

  const text = dark ? "#F5F5F7" : "#1C1C1E";
  const muted = dark ? "rgba(235,235,245,0.6)" : "#8E8E93";
  const faceBg = dark ? "#2C2C2E" : "#F9F9F9";
  const faceBorder = dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";

  let durationMin = (endH * 60 + endM) - (startH * 60 + startM);
  if (durationMin < 0) durationMin += 24 * 60;
  const durLabel = durationMin === 0
    ? "—"
    : [durationMin >= 60 ? `${Math.floor(durationMin / 60)}時間` : "", durationMin % 60 > 0 ? `${durationMin % 60}分` : ""].join("");

  const startDeg = timeToDeg(startH, startM);
  const endDeg = timeToDeg(endH, endM);
  const startTip = handPoint(startDeg, HAND_LEN);
  const endTip = handPoint(endDeg, HAND_LEN);

  const handleClockClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = (e.clientX - rect.left) * (200 / rect.width);
    const sy = (e.clientY - rect.top) * (200 / rect.height);

    // Badge tap → mode switch only
    const sDist = Math.hypot(sx - startTip.x, sy - startTip.y);
    const eDist = Math.hypot(sx - endTip.x, sy - endTip.y);
    if (sDist <= BADGE_R + 4) { setMode("start"); return; }
    if (eDist <= BADGE_R + 4) { setMode("end"); return; }

    const dx = sx - CX;
    const dy = sy - CY;
    if (Math.hypot(dx, dy) < 20) return;

    const angle = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
    // 12時間 = 720分 / 360° → 1° = 2分。5分スナップ
    const totalMinutes = Math.round(angle * 2 / 5) * 5;
    const h12 = Math.floor(totalMinutes / 60) % 12 || 12;
    const min = totalMinutes % 60;

    if (mode === "start") {
      onChange(to24(h12, sAmPm), min, endH, endM);
      setMode("end");
    } else {
      onChange(startH, startM, to24(h12, eAmPm), min);
      setMode("start");
    }
  };

  const setStartAmPm = (v: "AM" | "PM") => onChange(to24(sH12, v), startM, endH, endM);
  const setEndAmPm = (v: "AM" | "PM") => onChange(startH, startM, to24(eH12, v), endM);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      {/* Top bar: start AM/PM + time chips */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
        <AmPmToggle value={sAmPm} onChange={setStartAmPm} dark={dark} color={accent} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <TimeChip
              label="始"
              value={`${pad2(sH12)}:${pad2(startM)}`}
              ampm={sAmPm}
              active={mode === "start"}
              color={accent}
              onClick={() => setMode("start")}
            />
            <span style={{ color: muted, fontSize: 11 }}>→</span>
            <TimeChip
              label="終"
              value={`${pad2(eH12)}:${pad2(endM)}`}
              ampm={eAmPm}
              active={mode === "end"}
              color="#FF9500"
              onClick={() => setMode("end")}
            />
          </div>
          <div style={{ fontSize: 11, color: muted, letterSpacing: "0.02em" }}>
            所要時間: {durLabel}
          </div>
        </div>
      </div>

      {/* SVG clock face */}
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        onClick={handleClockClick}
        style={{ cursor: "pointer", touchAction: "manipulation", flexShrink: 0 }}
      >
        <circle cx={CX} cy={CY} r={FACE_R} fill={faceBg} stroke={faceBorder} strokeWidth={1} />

        {/* Duration arc */}
        {durationMin > 0 && (
          <path
            d={arcPath(startDeg, endDeg, ARC_R)}
            fill="none"
            stroke="#FF9500"
            strokeWidth={8}
            strokeOpacity={0.18}
            strokeLinecap="round"
          />
        )}

        {/* 5-min dots at hour positions */}
        {Array.from({ length: 12 }, (_, i) => {
          const rad = degToRad(i * 30);
          const r = FACE_R - 7;
          return (
            <circle key={i} cx={CX + r * Math.cos(rad)} cy={CY + r * Math.sin(rad)} r={2} fill={muted} />
          );
        })}

        {/* Hour numbers */}
        {Array.from({ length: 12 }, (_, i) => {
          const n = i === 0 ? 12 : i;
          const rad = degToRad(i * 30);
          const r = FACE_R - 22;
          return (
            <text
              key={i}
              x={CX + r * Math.cos(rad)}
              y={CY + r * Math.sin(rad)}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="13"
              fontWeight="bold"
              fill={text}
              style={{ userSelect: "none", pointerEvents: "none" }}
            >
              {n}
            </text>
          );
        })}

        {/* End hand — dashed orange */}
        <line
          x1={CX} y1={CY}
          x2={endTip.x} y2={endTip.y}
          stroke="#FF9500"
          strokeWidth={3.5}
          strokeDasharray="5 3"
          strokeLinecap="round"
        />
        <circle cx={endTip.x} cy={endTip.y} r={BADGE_R} fill="#FF9500" />
        <text
          x={endTip.x} y={endTip.y}
          textAnchor="middle" dominantBaseline="central"
          fontSize="9" fontWeight="bold" fill="#fff"
          style={{ userSelect: "none", pointerEvents: "none" }}
        >
          終
        </text>

        {/* Start hand — solid accent */}
        <line
          x1={CX} y1={CY}
          x2={startTip.x} y2={startTip.y}
          stroke={accent}
          strokeWidth={5}
          strokeLinecap="round"
        />
        <circle cx={startTip.x} cy={startTip.y} r={BADGE_R} fill={accent} />
        <text
          x={startTip.x} y={startTip.y}
          textAnchor="middle" dominantBaseline="central"
          fontSize="9" fontWeight="bold" fill="#fff"
          style={{ userSelect: "none", pointerEvents: "none" }}
        >
          始
        </text>

        {/* Center dot */}
        <circle cx={CX} cy={CY} r={5} fill={dark ? "#1C1C1E" : "#3A3A3C"} />
      </svg>

      {/* End AM/PM — only in end mode */}
      {mode === "end" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: muted }}>終了時刻の AM/PM</span>
          <AmPmToggle value={eAmPm} onChange={setEndAmPm} dark={dark} color="#FF9500" />
        </div>
      )}
    </div>
  );
}

function AmPmToggle({
  value,
  onChange,
  dark,
  color,
}: {
  value: "AM" | "PM";
  onChange: (v: "AM" | "PM") => void;
  dark: boolean;
  color: string;
}) {
  const bg = dark ? "#3A3A3C" : "#E5E5EA";
  const border = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  return (
    <div style={{ display: "flex", flexDirection: "column", borderRadius: 7, overflow: "hidden", border: `1px solid ${border}` }}>
      {(["AM", "PM"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          style={{
            appearance: "none",
            border: 0,
            background: value === v ? color : bg,
            color: value === v ? "#fff" : dark ? "#F5F5F7" : "#1C1C1E",
            fontSize: 11,
            fontWeight: 700,
            padding: "5px 9px",
            cursor: "pointer",
            letterSpacing: "0.03em",
            lineHeight: 1,
          }}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

function TimeChip({
  label,
  value,
  ampm,
  active,
  color,
  onClick,
}: {
  label: string;
  value: string;
  ampm: string;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        appearance: "none",
        border: `2px solid ${active ? color : "transparent"}`,
        background: "transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 3,
        padding: "2px 7px",
        borderRadius: 8,
      }}
    >
      <span style={{ fontSize: 9, fontWeight: 700, color, opacity: 0.85 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>
        {value}
      </span>
      <span style={{ fontSize: 9, fontWeight: 600, color, opacity: 0.7 }}>{ampm}</span>
    </button>
  );
}
