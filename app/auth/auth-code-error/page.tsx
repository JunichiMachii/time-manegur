import Link from "next/link";

const ACCENT = "#C4634E";
const BG = "#F8F7F5";

export const metadata = {
  title: "ログインエラー | 時間管理アプリ",
};

export default function AuthCodeErrorPage() {
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
          gap: 24,
          textAlign: "center",
        }}
      >
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
            <path
              d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
              stroke="#fff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            ログインできませんでした
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#8E8E93",
              lineHeight: 1.6,
            }}
          >
            認証コードの交換に失敗しました。
            <br />
            時間をおいてもう一度お試しください。
          </div>
        </div>

        <Link
          href="/login"
          style={{
            width: "100%",
            appearance: "none",
            border: "none",
            background: ACCENT,
            color: "#FFFFFF",
            fontFamily: "inherit",
            fontSize: 15,
            fontWeight: 600,
            padding: "14px 20px",
            borderRadius: 14,
            textAlign: "center",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 12px ${ACCENT}33`,
          }}
        >
          ログイン画面に戻る
        </Link>
      </div>
    </main>
  );
}
