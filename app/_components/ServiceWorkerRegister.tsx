"use client";

import { useEffect, useState } from "react";

type UpdateState = "idle" | "available" | "applying";

export function ServiceWorkerRegister() {
  const [state, setState] = useState<UpdateState>("idle");
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    let registration: ServiceWorkerRegistration | undefined;
    let cancelled = false;

    const handleControllerChange = () => {
      // 新SWが activate された後にリロード
      window.location.reload();
    };

    const watchUpdates = (reg: ServiceWorkerRegistration) => {
      // すでに waiting がいる場合
      if (reg.waiting && reg.active) {
        setWaiting(reg.waiting);
        setState("available");
      }

      reg.addEventListener("updatefound", () => {
        const installing = reg.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          if (
            installing.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            setWaiting(installing);
            setState("available");
          }
        });
      });
    };

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        if (cancelled) return;
        registration = reg;
        watchUpdates(reg);
      })
      .catch((err) => {
        console.error("[sw] register failed", err);
      });

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
      void registration;
    };
  }, []);

  const applyUpdate = () => {
    if (!waiting) return;
    setState("applying");
    waiting.postMessage({ type: "SKIP_WAITING" });
  };

  if (state === "idle") return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
        left: 16,
        right: 16,
        zIndex: 9999,
        background: "#1C1C1E",
        color: "#FFFFFF",
        borderRadius: 14,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
        fontFamily:
          "var(--font-zen-kaku), -apple-system, system-ui, sans-serif",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 500 }}>
        新しいバージョンがあります
      </span>
      <button
        type="button"
        onClick={applyUpdate}
        disabled={state === "applying"}
        style={{
          appearance: "none",
          border: "none",
          background: "#C4634E",
          color: "#FFFFFF",
          fontFamily: "inherit",
          fontSize: 13,
          fontWeight: 600,
          padding: "8px 14px",
          borderRadius: 10,
          cursor: "pointer",
        }}
      >
        {state === "applying" ? "更新中…" : "更新"}
      </button>
    </div>
  );
}
