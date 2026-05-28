import Link from "next/link";
import type { Metadata } from "next";

const ACCENT = "#C4634E";
const BG = "#F8F7F5";
const TEXT = "#1C1C1E";
const MUTED = "#8E8E93";
const SURFACE = "#FFFFFF";
const SUBTLE_BORDER = "rgba(0,0,0,0.06)";

export const metadata: Metadata = {
  title: "time-manegur — 開いた瞬間に今日が決まる時間管理アプリ",
  description:
    "毎日固定の習慣化と、親指1本で完結する横スワイプUI。今日やるべきことと決まった時間にやることを1画面で。",
};

export default function LandingPage() {
  return (
    <main
      style={{
        height: "100dvh",
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
        overscrollBehaviorY: "contain",
        background: BG,
        color: TEXT,
        fontFamily:
          "var(--font-zen-kaku), -apple-system, system-ui, sans-serif",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          padding:
            "calc(env(safe-area-inset-top, 0px) + 56px) 24px 80px",
        }}
      >
        <Header />
        <Hero />
        <CTA />
        <Features />
        <BottomCTA />
        <PrivacySection />
        <Footer />
      </div>
    </main>
  );
}

function Header() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 48,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: ACCENT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 4px 12px ${ACCENT}33`,
        }}
        aria-hidden="true"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
      <span
        style={{
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: "-0.01em",
        }}
      >
        time-manegur
      </span>
    </div>
  );
}

function Hero() {
  return (
    <section style={{ marginBottom: 40 }}>
      <h1
        style={{
          fontSize: 40,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1.15,
          margin: 0,
          marginBottom: 20,
        }}
      >
        開いた瞬間に
        <br />
        <span style={{ color: ACCENT }}>今日が決まる</span>。
      </h1>
      <p
        style={{
          fontSize: 16,
          lineHeight: 1.75,
          color: "rgba(28,28,30,0.7)",
          margin: 0,
          maxWidth: 480,
        }}
      >
        今日やるべきことと、決まった時間にやることを、ひとつの画面に。
        親指1本の横スワイプで、迷いも探し物もない。
        習慣を、自然に積み重ねるための時間管理アプリ。
      </p>
    </section>
  );
}

function CTA() {
  return (
    <section style={{ marginBottom: 64 }}>
      <Link
        href="/login"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          background: ACCENT,
          color: "#FFFFFF",
          fontSize: 15,
          fontWeight: 700,
          padding: "14px 24px",
          borderRadius: 999,
          textDecoration: "none",
          boxShadow: `0 8px 20px ${ACCENT}40`,
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
        }}
      >
        アプリを始める
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <path
            d="M3 7h8M7.5 3.5L11 7l-3.5 3.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </Link>
      <div
        style={{
          fontSize: 12,
          color: MUTED,
          marginTop: 12,
          lineHeight: 1.6,
        }}
      >
        Googleアカウントで30秒で始められます
      </div>
    </section>
  );
}

function Features() {
  const items: { title: string; body: string; icon: React.ReactNode }[] = [
    {
      title: "毎日固定の習慣化",
      body: "朝のストレッチ、夕方の振り返り。毎日決まった時間に必ず現れる予定として固定。考える隙を作らず、続けることに集中できる。",
      icon: <IconRepeat />,
    },
    {
      title: "親指1本の横スワイプUI",
      body: "「タスク」と「タイムライン」を横スワイプで行き来。電車内でも片手で完結する設計。",
      icon: <IconSwipe />,
    },
    {
      title: "今日が一目で完結",
      body: "余計な装飾や階層なし。日付ヘッダから別日も呼び出せる。今日のことだけを、今日の画面で。",
      icon: <IconFocus />,
    },
  ];
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        marginBottom: 64,
      }}
    >
      {items.map((f) => (
        <article
          key={f.title}
          style={{
            background: SURFACE,
            borderRadius: 18,
            padding: "20px 22px",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.04), 0 1px 0 rgba(0,0,0,0.02)",
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: `${ACCENT}14`,
              color: ACCENT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            {f.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontSize: 15.5,
                fontWeight: 700,
                margin: 0,
                marginBottom: 6,
                letterSpacing: "-0.01em",
              }}
            >
              {f.title}
            </h3>
            <p
              style={{
                fontSize: 13.5,
                color: "rgba(28,28,30,0.65)",
                margin: 0,
                lineHeight: 1.7,
              }}
            >
              {f.body}
            </p>
          </div>
        </article>
      ))}
    </section>
  );
}

function BottomCTA() {
  return (
    <section
      style={{
        textAlign: "center",
        marginBottom: 64,
        padding: "32px 24px",
        background: SURFACE,
        borderRadius: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 16,
          letterSpacing: "-0.01em",
        }}
      >
        今日から、時間に追われない。
      </div>
      <Link
        href="/login"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: ACCENT,
          color: "#FFFFFF",
          fontSize: 14.5,
          fontWeight: 700,
          padding: "13px 22px",
          borderRadius: 999,
          textDecoration: "none",
          boxShadow: `0 6px 16px ${ACCENT}40`,
        }}
      >
        ログイン画面へ
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path
            d="M2.5 6h7M6.5 3l3 3-3 3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </Link>
    </section>
  );
}

function PrivacySection() {
  return (
    <section style={{ marginBottom: 32 }} id="privacy">
      <details
        style={{
          background: SURFACE,
          borderRadius: 16,
          border: `1px solid ${SUBTLE_BORDER}`,
          overflow: "hidden",
        }}
      >
        <summary
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px",
            cursor: "pointer",
            listStyle: "none",
            fontSize: 15,
            fontWeight: 700,
            color: TEXT,
          }}
        >
          <span>プライバシーポリシー（個人情報保護方針）</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            aria-hidden="true"
            style={{ color: MUTED }}
          >
            <path
              d="M3 5l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </summary>
        <div
          style={{
            padding: "0 20px 20px",
            fontSize: 13,
            lineHeight: 1.85,
            color: "rgba(28,28,30,0.78)",
            borderTop: `1px solid ${SUBTLE_BORDER}`,
          }}
        >
          <p style={{ marginTop: 16 }}>
            time-manegur（以下、「当アプリ」といいます）は、ユーザーの皆様の個人情報の重要性を認識し、その保護に万全を尽くします。当アプリがどのような情報を取得し、どのように利用するかについて、以下の通り定めます。
          </p>

          <PolicyHeading>1. 取得する情報と利用目的</PolicyHeading>
          <p>
            当アプリは、安全なログイン機能およびスケジュール管理サービスを提供するため、以下の情報を取得・利用します。
          </p>
          <ul>
            <li>
              <strong>Googleアカウント情報（氏名、メールアドレス、プロフィール画像）</strong>：ユーザー本人の確認（認証）および、アプリ内でのユーザー名やアイコン表示のためにのみ使用します。
            </li>
            <li>
              <strong>アプリ内の登録データ（タスク、予定、スケジュール）</strong>：ユーザーがアプリに入力したタスクや予定は、クラウドデータベース（Supabase）に安全に保存され、ユーザー自身のタイムラインに表示するためだけに利用します。
            </li>
          </ul>

          <PolicyHeading>2. データの保存と安全管理</PolicyHeading>
          <p>
            ユーザーの情報および登録データは、世界最高水準のセキュリティを持つ外部のクラウドサービス（SupabaseおよびVercel）のデータベースに暗号化されて保存されます（推測）。また、当アプリは「ユーザー本人のデータは、その本人しか閲覧・編集できない」仕組み（Row Level Security）を完全に導入しており、他人のデータが漏洩したり、第三者に覗き見られたりすることはありません（推測）。
          </p>

          <PolicyHeading>3. 第三者への情報提供・開示</PolicyHeading>
          <p>
            当アプリは、ユーザーの同意を得ることなく、取得した個人情報や登録データを第三者に販売、譲渡、または開示することは絶対にありません。ただし、法令に基づく正当な要請があった場合を除きます。
          </p>

          <PolicyHeading>4. データの削除（退会）について</PolicyHeading>
          <p>
            ユーザーは、アプリ内の設定画面よりいつでもログアウトやアカウントの利用停止を行うことができます（推測）。ユーザーがアカウントの削除を希望した場合、データベースに保存されているすべてのタスクおよび予定のデータは、連動して自動的に完全に消去されます（推測）。
          </p>

          <PolicyHeading>5. プライバシーポリシーの変更</PolicyHeading>
          <p>
            当アプリは、関連する法令の改正やアプリのアップデートに伴い、本プライバシーポリシーをいつでも変更できるものとします。変更があった場合は、アプリ内または適切な方法でユーザーに通知します（推測）。
          </p>

          <PolicyHeading>6. お問い合わせ</PolicyHeading>
          <p>
            本プライバシーポリシーに関するお問い合わせは、お問い合わせフォームまでお知らせください。
          </p>

          <p
            style={{
              marginTop: 24,
              fontSize: 11.5,
              color: MUTED,
            }}
          >
            最終更新日: 2026年5月28日
          </p>
        </div>
      </details>
    </section>
  );
}

function PolicyHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4
      style={{
        fontSize: 13.5,
        fontWeight: 700,
        color: TEXT,
        margin: "20px 0 6px",
        letterSpacing: "-0.005em",
      }}
    >
      {children}
    </h4>
  );
}

function Footer() {
  return (
    <footer
      style={{
        textAlign: "center",
        fontSize: 11.5,
        color: MUTED,
        paddingTop: 16,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <Link
          href="/contact"
          style={{
            color: MUTED,
            textDecoration: "none",
            borderBottom: `1px solid ${SUBTLE_BORDER}`,
            paddingBottom: 1,
            fontWeight: 500,
          }}
        >
          お問い合わせ
        </Link>
        <a
          href="#privacy"
          style={{
            color: MUTED,
            textDecoration: "none",
            borderBottom: `1px solid ${SUBTLE_BORDER}`,
            paddingBottom: 1,
            fontWeight: 500,
          }}
        >
          プライバシーポリシー
        </a>
      </div>
      <span>© {new Date().getFullYear()} time-manegur</span>
    </footer>
  );
}

function IconRepeat() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSwipe() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 18L3 12l6-6M15 6l6 6-6 6M3 12h18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconFocus() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
