"use client";

import { useEffect, useState } from "react";
import { useOnlineStatus } from "./useOnlineStatus";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  // オンライン復帰後もアニメーション分だけ残してから DOM から外す
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setMounted(true);
      return;
    }
    if (!mounted) return;
    const t = window.setTimeout(() => setMounted(false), 320);
    return () => window.clearTimeout(t);
  }, [isOnline, mounted]);

  if (!mounted) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9998,
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)",
        paddingBottom: 12,
        paddingLeft: 16,
        paddingRight: 16,
        background: "rgba(28, 28, 30, 0.92)",
        color: "#FFFFFF",
        textAlign: "center",
        fontSize: 12.5,
        fontWeight: 500,
        letterSpacing: "0.01em",
        lineHeight: 1.5,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        transform: isOnline ? "translateY(-110%)" : "translateY(0)",
        transition: "transform 300ms cubic-bezier(0.32, 0.72, 0, 1)",
        pointerEvents: "none",
        fontFamily:
          "var(--font-zen-kaku), -apple-system, system-ui, sans-serif",
      }}
    >
      オフライン中です。電波の良い場所でご利用ください
    </div>
  );
}
