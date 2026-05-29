"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const ACCENT = "#C4634E";
const BG = "#F8F7F5";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (oauthError) {
        throw new Error(oauthError.message);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "サインインに失敗しました";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100dvh",
        width: "100vw",
        background: BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily:
          "var(--font-zen-kaku), -apple-system, system-ui, sans-serif",
        color: "#1C1C1E",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 40,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.02em",
              marginBottom: 8,
            }}
          >
            時間管理アプリ
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#8E8E93",
              fontWeight: 500,
              lineHeight: 1.6,
            }}
          >
            開いた瞬間に
            <br />
            すべてが完結する
          </div>
        </div>

        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: ACCENT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 16px ${ACCENT}33`,
          }}
          aria-hidden="true"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="1.8" />
            <path
              d="M12 7v5l3 2"
              stroke="#fff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <button
          type="button"
          onClick={handleSignIn}
          disabled={loading}
          aria-label="Googleでログイン"
          style={{
            width: "100%",
            appearance: "none",
            border: "1px solid rgba(0,0,0,0.08)",
            background: "#FFFFFF",
            color: "#1C1C1E",
            fontFamily: "inherit",
            fontSize: 15,
            fontWeight: 600,
            padding: "14px 20px",
            borderRadius: 14,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.6 : 1,
            transition: "opacity 0.2s ease, transform 0.1s ease",
            boxShadow:
              "0 1px 2px rgba(0,0,0,0.04), 0 1px 0 rgba(0,0,0,0.02)",
          }}
        >
          <GoogleIcon />
          <span>{loading ? "リダイレクト中..." : "Googleでログイン"}</span>
        </button>

        {error && (
          <div
            role="alert"
            style={{
              fontSize: 12,
              color: "#C4634E",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            fontSize: 11,
            color: "#C7C7CC",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          ログインすることで、データは
          <br />
          あなたのアカウントに紐付けられます
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.257h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
