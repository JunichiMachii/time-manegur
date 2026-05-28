"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { DateCalendar } from "./DateCalendar";
import { DateHeader } from "./DateHeader";
import { ScheduleTimeline } from "./ScheduleTimeline";
import { SettingsSheet } from "./SettingsSheet";
import { TodayTasks } from "./TodayTasks";
import type { ScheduleItem, Task, UserProfile } from "./types";
import { todayLocal } from "./dateUtils";
import { useScheduleStore } from "./useScheduleStore";
import { useTasksStore } from "./useTasksStore";

export type MobileScreenStyle = "minimal" | "card";

type Props = {
  accent: string;
  dark?: boolean;
  layoutStyle?: MobileScreenStyle;
  topInset?: number;
  initialTasks?: Task[];
  initialItems?: ScheduleItem[];
  userProfile?: UserProfile;
  selectedDate?: string;
  userId?: string;
};

const EMPTY_PROFILE: UserProfile = {
  email: null,
  name: null,
  avatarUrl: null,
};

type TabKey = "tasks" | "schedule";

const TABS: { key: TabKey; label: string }[] = [
  { key: "tasks", label: "タスク" },
  { key: "schedule", label: "タイムライン" },
];

export function MobileScreen({
  accent,
  dark = false,
  layoutStyle = "card",
  topInset = 0,
  initialTasks = [],
  initialItems = [],
  userProfile = EMPTY_PROFILE,
  selectedDate,
  userId,
}: Props) {
  const router = useRouter();
  const effectiveDate = selectedDate ?? todayLocal();
  const { tasks, toggleTask, addTask, removeTask } = useTasksStore(
    initialTasks,
    effectiveDate,
    userId ?? null,
  );
  const { items, addItem, updateItem, removeItem } = useScheduleStore(
    initialItems,
    effectiveDate,
    userId ?? null,
  );

  const [activeTab, setActiveTab] = useState<TabKey>("tasks");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleSelectDate = (date: string) => {
    setCalendarOpen(false);
    if (date === effectiveDate) return;
    if (date === todayLocal()) {
      router.push("/");
    } else {
      router.push(`/?date=${date}`);
    }
  };
  const pagerRef = useRef<HTMLDivElement | null>(null);
  const scrollRafRef = useRef<number | null>(null);

  const bg = dark ? "#000000" : "#F8F7F5";
  const surfaceBg = dark ? "#1C1C1E" : "#FFFFFF";
  const textColor = dark ? "#F5F5F7" : "#1C1C1E";
  const mutedColor = dark ? "rgba(245,245,247,0.55)" : "rgba(28,28,30,0.5)";
  const cardShadow = dark
    ? "0 2px 12px rgba(0,0,0,0.3)"
    : "0 1px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)";
  const isCard = layoutStyle === "card";
  const headerBg = isCard ? surfaceBg : bg;

  const wrapScrollable = (children: ReactNode) => {
    if (isCard) {
      return (
        <div
          style={{
            padding: "0 16px",
            height: "100%",
            boxSizing: "border-box",
          }}
        >
          <div
            className="scroll-area"
            style={{
              background: surfaceBg,
              borderRadius: 20,
              padding: "16px 20px",
              boxShadow: cardShadow,
              height: "100%",
              overflowY: "auto",
              overflowX: "hidden",
              boxSizing: "border-box",
            }}
          >
            {children}
          </div>
        </div>
      );
    }
    return (
      <div
        className="scroll-area"
        style={{
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {children}
      </div>
    );
  };

  const scrollToTab = useCallback((tab: TabKey) => {
    const el = pagerRef.current;
    if (!el) return;
    const index = TABS.findIndex((t) => t.key === tab);
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  }, []);

  const handleTabClick = useCallback(
    (tab: TabKey) => {
      setActiveTab(tab);
      scrollToTab(tab);
    },
    [scrollToTab],
  );

  const handlePagerScroll = useCallback(() => {
    if (scrollRafRef.current !== null) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const el = pagerRef.current;
      if (!el || el.clientWidth === 0) return;
      const index = Math.round(el.scrollLeft / el.clientWidth);
      const next = TABS[index]?.key;
      if (next && next !== activeTab) setActiveTab(next);
    });
  }, [activeTab]);

  useEffect(() => {
    return () => {
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, []);

  const panelStyle: CSSProperties = {
    flex: "0 0 100%",
    width: "100%",
    height: "100%",
    scrollSnapAlign: "start",
    boxSizing: "border-box",
  };

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
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          paddingTop: 12,
          paddingBottom: 4,
          paddingRight: 12,
          flexShrink: 0,
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <DateHeader
            dark={dark}
            selectedDate={effectiveDate}
            onClick={() => setCalendarOpen(true)}
          />
        </div>
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label="メニューを開く"
          style={{
            appearance: "none",
            border: 0,
            background: "transparent",
            padding: 10,
            margin: "-2px -4px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: dark ? "rgba(245,245,247,0.65)" : "rgba(28,28,30,0.55)",
            borderRadius: 12,
            transition: "color 0.18s ease, background 0.18s ease",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <MenuIcon />
        </button>
      </div>

      <div
        role="tablist"
        aria-label="表示切り替え"
        style={{
          display: "flex",
          padding: "0 20px",
          gap: 4,
          flexShrink: 0,
          marginTop: 8,
          marginBottom: 8,
        }}
      >
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabClick(tab.key)}
              style={{
                flex: 1,
                appearance: "none",
                background: "transparent",
                border: "none",
                padding: "10px 4px 12px",
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                letterSpacing: "-0.01em",
                color: isActive ? accent : mutedColor,
                cursor: "pointer",
                position: "relative",
                transition: "color 0.18s ease",
              }}
            >
              {tab.label}
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: 0,
                  transform: `translateX(-50%) scaleX(${isActive ? 1 : 0})`,
                  transformOrigin: "center",
                  width: 28,
                  height: 2,
                  borderRadius: 2,
                  background: accent,
                  transition: "transform 0.22s ease",
                }}
              />
            </button>
          );
        })}
      </div>

      <div
        ref={pagerRef}
        onScroll={handlePagerScroll}
        className="hide-scrollbar"
        style={{
          flex: "1 1 0",
          minHeight: 0,
          display: "flex",
          flexDirection: "row",
          overflowX: "auto",
          overflowY: "hidden",
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorX: "contain",
        }}
      >
        <div style={panelStyle}>
          <div style={{ height: "100%", paddingTop: 8, paddingBottom: 24, boxSizing: "border-box" }}>
            {wrapScrollable(
              <TodayTasks
                tasks={tasks}
                onToggle={toggleTask}
                onAdd={addTask}
                onRemove={removeTask}
                accent={accent}
                dark={dark}
                headerBg={headerBg}
              />,
            )}
          </div>
        </div>

        <div style={panelStyle}>
          <div style={{ height: "100%", paddingTop: 8, paddingBottom: 24, boxSizing: "border-box" }}>
            {wrapScrollable(
              <ScheduleTimeline
                items={items}
                onAdd={addItem}
                onUpdate={updateItem}
                onRemove={removeItem}
                accent={accent}
                dark={dark}
                headerBg={headerBg}
              />,
            )}
          </div>
        </div>
      </div>

      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        user={userProfile}
        accent={accent}
        dark={dark}
      />

      <DateCalendar
        open={calendarOpen}
        selectedDate={effectiveDate}
        onSelect={handleSelectDate}
        onClose={() => setCalendarOpen(false)}
        accent={accent}
        dark={dark}
      />
    </div>
  );
}

function MenuIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
