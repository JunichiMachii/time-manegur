"use client";

type Props = {
  dark?: boolean;
};

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

export function DateHeader({ dark = false }: Props) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekday = WEEKDAYS[now.getDay()];

  return (
    <div style={{ padding: "0 20px", marginBottom: 4 }}>
      <div
        suppressHydrationWarning
        style={{
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: dark ? "#F5F5F7" : "#1C1C1E",
          lineHeight: "34px",
        }}
      >
        {month}月{day}日
        <span
          suppressHydrationWarning
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: "#8E8E93",
            marginLeft: 8,
          }}
        >
          ({weekday})
        </span>
      </div>
    </div>
  );
}
