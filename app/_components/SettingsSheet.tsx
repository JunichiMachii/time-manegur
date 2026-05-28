"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "./types";

const APP_VERSION = "v1.1.0";
const PRIVACY_POLICY_URL = "https://time-manegur.vercel.app/privacy";

type Props = {
  open: boolean;
  onClose: () => void;
  user: UserProfile;
  accent: string;
  dark?: boolean;
};

export function SettingsSheet({
  open,
  onClose,
  user,
  accent,
  dark = false,
}: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // mount → next frame で visible=true にして滑り込みアニメ
  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const t = window.setTimeout(() => setMounted(false), 320);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("[settings] signOut failed", error);
        setLoggingOut(false);
        return;
      }
      router.replace("/login");
      router.refresh();
    } catch (e) {
      console.error("[settings] signOut crashed", e);
      setLoggingOut(false);
    }
  };

  if (!mounted) return null;

  const surface = dark ? "#1C1C1E" : "#FFFFFF";
  const text = dark ? "#F5F5F7" : "#1C1C1E";
  const muted = dark ? "rgba(235,235,245,0.6)" : "#8E8E93";
  const divider = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const rowHover = dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)";

  const displayName = user.name ?? user.email ?? "ゲスト";
  const displaySub = user.name && user.email ? user.email : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="設定"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        pointerEvents: visible ? "auto" : "none",
        fontFamily:
          "var(--font-zen-kaku), -apple-system, system-ui, sans-serif",
      }}
    >
      <button
        type="button"
        aria-label="閉じる"
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          border: 0,
          appearance: "none",
          background: visible ? "rgba(0,0,0,0.32)" : "rgba(0,0,0,0)",
          transition: "background 280ms ease",
          cursor: "pointer",
        }}
      />

      <div
        style={{
          position: "relative",
          background: surface,
          color: text,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: 8,
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
          paddingLeft: 16,
          paddingRight: 16,
          boxShadow: "0 -8px 32px rgba(0,0,0,0.18)",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 320ms cubic-bezier(0.32, 0.72, 0, 1)",
          maxHeight: "85dvh",
          overflowY: "auto",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 40,
            height: 4,
            borderRadius: 999,
            background: dark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.14)",
            margin: "8px auto 16px",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "8px 8px 18px",
          }}
        >
          <Avatar
            src={user.avatarUrl}
            name={displayName}
            accent={accent}
            dark={dark}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                lineHeight: 1.35,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {displayName}
            </div>
            {displaySub && (
              <div
                style={{
                  fontSize: 12.5,
                  color: muted,
                  marginTop: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {displaySub}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderTop: `1px solid ${divider}`,
          }}
        >
          <SheetRow
            label="プライバシーポリシー"
            text={text}
            muted={muted}
            divider={divider}
            hoverBg={rowHover}
            href={PRIVACY_POLICY_URL}
            external
          />
          <SheetRow
            label="アプリバージョン"
            value={APP_VERSION}
            text={text}
            muted={muted}
            divider={divider}
            hoverBg={rowHover}
          />
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            marginTop: 18,
            width: "100%",
            appearance: "none",
            border: 0,
            background: "transparent",
            color: accent,
            fontSize: 15,
            fontWeight: 700,
            fontFamily: "inherit",
            padding: "14px",
            borderRadius: 14,
            cursor: loggingOut ? "default" : "pointer",
            opacity: loggingOut ? 0.5 : 1,
          }}
        >
          {loggingOut ? "ログアウト中…" : "ログアウト"}
        </button>
      </div>
    </div>
  );
}

type RowProps = {
  label: string;
  value?: string;
  href?: string;
  external?: boolean;
  text: string;
  muted: string;
  divider: string;
  hoverBg: string;
};

function SheetRow({
  label,
  value,
  href,
  external,
  text,
  muted,
  divider,
}: RowProps) {
  const content = (
    <>
      <span style={{ fontSize: 15, fontWeight: 500, color: text }}>{label}</span>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13.5,
          color: muted,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
        {href && <ChevronRight color={muted} />}
      </span>
    </>
  );

  const baseStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 8px",
    borderBottom: `1px solid ${divider}`,
    textDecoration: "none",
    color: "inherit",
    fontFamily: "inherit",
  } as const;

  if (href) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer noopener" : undefined}
        style={baseStyle}
      >
        {content}
      </a>
    );
  }
  return <div style={baseStyle}>{content}</div>;
}

function ChevronRight({ color }: { color: string }) {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" aria-hidden="true">
      <path
        d="M2 1l6 6-6 6"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

type AvatarProps = {
  src: string | null;
  name: string;
  accent: string;
  dark: boolean;
};

function Avatar({ src, name, accent, dark }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const size = 48;
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        unoptimized
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          background: dark ? "#2C2C2E" : "#F2F2F7",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `${accent}22`,
        color: accent,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}
