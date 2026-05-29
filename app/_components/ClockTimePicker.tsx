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
const MIN_LEN = 72;  // 分針: 長い
const HOUR_LEN = 50; // 時針: 短い
const ARC_R = 66;

function degToRad(deg: number): number {
  return ((deg - 90) * Math.PI) / 180;
}

function pt(deg: number, len: number): { x: number; y: number } {
  const r = degToRad(deg);
  return { x: CX + len * Math.cos(r), y: CY + len * Math.sin(r) };
}

function hourDeg(h: number, m: number): number {
  return (h % 12) * 30 + m * 0.5;
}

function minuteDeg(m: number): number {
  return m * 6;
}

function arcPath(d1: number, d2: number, r: number): string {
  const s = pt(d1, r);
  const e = pt(d2, r);
  let sweep = d2 - d1;
  if (sweep <= 0) sweep += 360;
  const large = sweep > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

type DragTarget = "hour" | "minute" | null;

export function ClockTimePicker({ startH, startM, endH, endM, onChange, dark, accent }: Props) {
  const [mode, setMode] = useState<"start" | "end">("start");
  const [dragging, setDragging] = useState<DragTarget>(null);

  const { h12: sH12, ampm: sAmPm } = to12(startH);
  const { h12: eH12, ampm: eAmPm } = to12(endH);

  const text = dark ? "#F5F5F7" : "#1C1C1E";
  const muted = dark ? "rgba(235,235,245,0.6)" : "#8E8E93";
  const faceBg = dark ? "#2C2C2E" : "#F9F9F9";
  const faceBorder = dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
  const activeColor = mode === "start" ? accent : "#FF9500";
  const ghostColor = mode === "start" ? "#FF9500" : accent;

  let durationMin = (endH * 60 + endM) - (startH * 60 + startM);
  if (durationMin < 0) durationMin += 24 * 60;
  const durLabel = durationMin === 0 ? "—"
    : [durationMin >= 60 ? `${Math.floor(durationMin / 60)}時間` : "", durationMin % 60 > 0 ? `${durationMin % 60}分` : ""].join("");

  const activeH = mode === "start" ? startH : endH;
  const activeM = mode === "start" ? startM : endM;
  const ghostH = mode === "start" ? endH : startH;
  const ghostM = mode === "start" ? endM : startM;

  const aHDeg = hourDeg(activeH, activeM);
  const aMDeg = minuteDeg(activeM);
  const gHDeg = hourDeg(ghostH, ghostM);
  const gMDeg = minuteDeg(ghostM);

  const aHTip = pt(aHDeg, HOUR_LEN);
  const aMTip = pt(aMDeg, MIN_LEN);

  const ampm = mode === "start" ? sAmPm : eAmPm;

  function getSVGCoords(e: React.PointerEvent<SVGSVGElement>): [number, number] {
    const rect = e.currentTarget.getBoundingClientRect();
    return [
      (e.clientX - rect.left) * (200 / rect.width),
      (e.clientY - rect.top) * (200 / rect.height),
    ];
  }

  function applyAngle(angle: number, target: DragTarget) {
    if (!target) return;
    const curAmPm = mode === "start" ? sAmPm : eAmPm;
    if (target === "hour") {
      const snapped = Math.round(angle / 30) * 30 % 360;
      const h12 = (snapped / 30) % 12 || 12;
      const newH = to24(h12, curAmPm);
      if (mode === "start") onChange(newH, startM, endH, endM);
      else onChange(startH, startM, newH, endM);
    } else {
      const m = Math.round(angle / 6 / 5) * 5 % 60;
      if (mode === "start") onChange(startH, m, endH, endM);
      else onChange(startH, startM, endH, m);
    }
  }

  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    const [sx, sy] = getSVGCoords(e);
    const dH = Math.hypot(sx - aHTip.x, sy - aHTip.y);
    const dM = Math.hypot(sx - aMTip.x, sy - aMTip.y);
    const GRAB = 20;
    if (dH < GRAB || dM < GRAB) {
      const target: DragTarget = dH <= dM ? "hour" : "minute";
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(target);
      e.preventDefault();
    }
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragging) return;
    const [sx, sy] = getSVGCoords(e);
    const dx = sx - CX;
    const dy = sy - CY;
    if (Math.hypot(dx, dy) < 10) return;
    const angle = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
    applyAngle(angle, dragging);
  }

  function handlePointerUp(e: React.PointerEvent<SVGSVGElement>) {
    if (dragging) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setDragging(null);
    }
  }

  const setStartAmPm = (v: "AM" | "PM") => onChange(to24(sH12, v), startM, endH, endM);
  const setEndAmPm = (v: "AM" | "PM") => onChange(startH, startM, to24(eH12, v), endM);
  const setAmPm = mode === "start" ? setStartAmPm : setEndAmPm;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
        <AmPmToggle value={ampm} onChange={setAmPm} dark={dark} color={activeColor} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <TimeChip label="始" value={`${pad2(sH12)}:${pad2(startM)}`} ampm={sAmPm}
              active={mode === "start"} color={accent} onClick={() => setMode("start")} />
            <span style={{ color: muted, fontSize: 11 }}>→</span>
            <TimeChip label="終" value={`${pad2(eH12)}:${pad2(endM)}`} ampm={eAmPm}
              active={mode === "end"} color="#FF9500" onClick={() => setMode("end")} />
          </div>
          <div style={{ fontSize: 11, color: muted }}>所要時間: {durLabel}</div>
        </div>
      </div>

      {/* Clock SVG */}
      <svg
        width="200" height="200" viewBox="0 0 200 200"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: "none", flexShrink: 0, cursor: dragging ? "grabbing" : "default" }}
      >
        {/* Face */}
        <circle cx={CX} cy={CY} r={FACE_R} fill={faceBg} stroke={faceBorder} strokeWidth={1} />

        {/* Duration arc */}
        {durationMin > 0 && (
          <path
            d={arcPath(hourDeg(startH, startM), hourDeg(endH, endM), ARC_R)}
            fill="none" stroke="#FF9500" strokeWidth={7}
            strokeOpacity={0.18} strokeLinecap="round"
          />
        )}

        {/* Tick marks */}
        {Array.from({ length: 60 }, (_, i) => {
          const isHour = i % 5 === 0;
          const r = degToRad(i * 6);
          const inner = FACE_R - (isHour ? 10 : 5);
          return (
            <line key={i}
              x1={CX + inner * Math.cos(r)} y1={CY + inner * Math.sin(r)}
              x2={CX + (FACE_R - 2) * Math.cos(r)} y2={CY + (FACE_R - 2) * Math.sin(r)}
              stroke={muted} strokeWidth={isHour ? 1.5 : 0.8} strokeOpacity={0.5}
            />
          );
        })}

        {/* Hour numbers */}
        {Array.from({ length: 12 }, (_, i) => {
          const n = i === 0 ? 12 : i;
          const r = degToRad(i * 30);
          const nr = FACE_R - 22;
          return (
            <text key={i}
              x={CX + nr * Math.cos(r)} y={CY + nr * Math.sin(r)}
              textAnchor="middle" dominantBaseline="central"
              fontSize="12" fontWeight="600" fill={text}
              style={{ userSelect: "none", pointerEvents: "none" }}
            >{n}</text>
          );
        })}

        {/* Ghost hour hand */}
        <line x1={CX} y1={CY} x2={pt(gHDeg, HOUR_LEN).x} y2={pt(gHDeg, HOUR_LEN).y}
          stroke={ghostColor} strokeWidth={4} strokeLinecap="round" strokeOpacity={0.2}
          style={{ pointerEvents: "none" }}
        />
        {/* Ghost minute hand */}
        <line x1={CX} y1={CY} x2={pt(gMDeg, MIN_LEN).x} y2={pt(gMDeg, MIN_LEN).y}
          stroke={ghostColor} strokeWidth={2} strokeLinecap="round" strokeOpacity={0.2}
          style={{ pointerEvents: "none" }}
        />

        {/* Active hour hand (短い・太い) */}
        <line x1={CX} y1={CY} x2={aHTip.x} y2={aHTip.y}
          stroke={activeColor} strokeWidth={5} strokeLinecap="round"
          style={{ pointerEvents: "none" }}
        />
        <circle cx={aHTip.x} cy={aHTip.y} r={8} fill={activeColor}
          style={{ cursor: dragging === "hour" ? "grabbing" : "grab" }}
        />

        {/* Active minute hand (長い・細い) */}
        <line x1={CX} y1={CY} x2={aMTip.x} y2={aMTip.y}
          stroke={activeColor} strokeWidth={2.5} strokeLinecap="round"
          style={{ pointerEvents: "none" }}
        />
        <circle cx={aMTip.x} cy={aMTip.y} r={7} fill={activeColor}
          style={{ cursor: dragging === "minute" ? "grabbing" : "grab" }}
        />

        {/* Center */}
        <circle cx={CX} cy={CY} r={5} fill={dark ? "#1C1C1E" : "#3A3A3C"} />
      </svg>

      <div style={{ fontSize: 11, color: muted }}>
        {mode === "start" ? "始" : "終"}時刻 — 針をドラッグ
      </div>
    </div>
  );
}

function AmPmToggle({ value, onChange, dark, color }: {
  value: "AM" | "PM"; onChange: (v: "AM" | "PM") => void; dark: boolean; color: string;
}) {
  const bg = dark ? "#3A3A3C" : "#E5E5EA";
  const border = dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  return (
    <div style={{ display: "flex", flexDirection: "column", borderRadius: 7, overflow: "hidden", border: `1px solid ${border}` }}>
      {(["AM", "PM"] as const).map((v) => (
        <button key={v} type="button" onClick={() => onChange(v)} style={{
          appearance: "none", border: 0,
          background: value === v ? color : bg,
          color: value === v ? "#fff" : dark ? "#F5F5F7" : "#1C1C1E",
          fontSize: 11, fontWeight: 700, padding: "5px 9px",
          cursor: "pointer", letterSpacing: "0.03em", lineHeight: 1,
        }}>{v}</button>
      ))}
    </div>
  );
}

function TimeChip({ label, value, ampm, active, color, onClick }: {
  label: string; value: string; ampm: string;
  active: boolean; color: string; onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} style={{
      appearance: "none",
      border: `2px solid ${active ? color : "transparent"}`,
      background: "transparent", cursor: "pointer",
      display: "flex", alignItems: "center", gap: 3,
      padding: "2px 7px", borderRadius: 8,
    }}>
      <span style={{ fontSize: 9, fontWeight: 700, color, opacity: 0.85 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>{value}</span>
      <span style={{ fontSize: 9, fontWeight: 600, color, opacity: 0.7 }}>{ampm}</span>
    </button>
  );
}
