"use client";

import Link from "next/link";
import Script from "next/script";
import { useState, type FormEvent } from "react";

const ACCENT = "#C4634E";
const BG = "#F8F7F5";
const TEXT = "#1C1C1E";
const MUTED = "#8E8E93";
const SURFACE = "#FFFFFF";
const BORDER = "rgba(0,0,0,0.08)";
const FIELD_BG = "rgba(0,0,0,0.025)";

type SubmitStatus = "idle" | "submitting" | "submitted" | "error";

const SSFORM_URL = process.env.NEXT_PUBLIC_SSFORM_URL ?? "";
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

export default function ContactPage() {
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;
    if (!SSFORM_URL) {
      setErrorMsg(
        "送信先が設定されていません。管理者にお問い合わせください。",
      );
      setStatus("error");
      return;
    }

    // reCAPTCHA ウィジェットが注入する hidden textarea からトークン取得
    const recaptchaResponse =
      (document.getElementById("g-recaptcha-response") as
        | HTMLTextAreaElement
        | null)?.value ?? "";

    if (!recaptchaResponse) {
      setErrorMsg("「私はロボットではありません」にチェックを入れてください。");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setErrorMsg(null);

    const fd = new FormData();
    fd.append("name", name);
    fd.append("email", email);
    fd.append("message", message);
    fd.append("g-recaptcha-response", recaptchaResponse);

    try {
      // SSForm はクロスオリジン応答ヘッダを返さないため no-cors で投げる。
      // 結果のステータスは取得できないが、ネットワーク失敗のみ catch できる。
      await fetch(SSFORM_URL, {
        method: "POST",
        mode: "no-cors",
        body: fd,
      });
      setStatus("submitted");
    } catch (err) {
      console.error("[contact] submit failed", err);
      setErrorMsg(
        "送信に失敗しました。通信状態をご確認のうえ、もう一度お試しください。",
      );
      setStatus("error");
      // 失敗時はトークン使い回せないので reCAPTCHA をリセット
      const g = (window as { grecaptcha?: { reset?: () => void } }).grecaptcha;
      g?.reset?.();
    }
  };

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
      <Script
        src="https://www.google.com/recaptcha/api.js"
        strategy="afterInteractive"
        async
        defer
      />
      <div
        style={{
          maxWidth: 520,
          margin: "0 auto",
          padding:
            "calc(env(safe-area-inset-top, 0px) + 40px) 24px 80px",
        }}
      >
        <Header />

        {status === "submitted" ? (
          <ThanksView />
        ) : (
          <ContactForm
            name={name}
            email={email}
            message={message}
            onName={setName}
            onEmail={setEmail}
            onMessage={setMessage}
            onSubmit={handleSubmit}
            status={status}
            errorMsg={errorMsg}
          />
        )}
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
        marginBottom: 36,
      }}
    >
      <Link
        href="/lp"
        aria-label="LPに戻る"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          textDecoration: "none",
          color: TEXT,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: ACCENT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 12px ${ACCENT}33`,
          }}
          aria-hidden="true"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "-0.01em",
          }}
        >
          time-manegur
        </span>
      </Link>
    </div>
  );
}

type ContactFormProps = {
  name: string;
  email: string;
  message: string;
  onName: (v: string) => void;
  onEmail: (v: string) => void;
  onMessage: (v: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  status: SubmitStatus;
  errorMsg: string | null;
};

function ContactForm({
  name,
  email,
  message,
  onName,
  onEmail,
  onMessage,
  onSubmit,
  status,
  errorMsg,
}: ContactFormProps) {
  const submitting = status === "submitting";
  return (
    <>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          margin: 0,
          marginBottom: 10,
        }}
      >
        お問い合わせ
      </h1>
      <p
        style={{
          fontSize: 13.5,
          color: "rgba(28,28,30,0.65)",
          lineHeight: 1.7,
          margin: 0,
          marginBottom: 28,
        }}
      >
        ご感想・不具合のご報告・機能のご要望など、お気軽にお寄せください。
        通常 3 営業日以内に確認いたします。
      </p>

      <form
        onSubmit={onSubmit}
        method="post"
        style={{
          background: SURFACE,
          borderRadius: 18,
          padding: "24px 22px",
          boxShadow:
            "0 1px 3px rgba(0,0,0,0.04), 0 1px 0 rgba(0,0,0,0.02)",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <Field
          id="contact-name"
          label="お名前"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={onName}
          placeholder="山田 太郎"
        />
        <Field
          id="contact-email"
          label="メールアドレス"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={onEmail}
          placeholder="you@example.com"
        />
        <TextAreaField
          id="contact-message"
          label="お問い合わせ内容"
          name="message"
          required
          value={message}
          onChange={onMessage}
          placeholder="ご質問やフィードバックをお書きください"
        />

        {errorMsg && (
          <div
            role="alert"
            style={{
              fontSize: 12.5,
              color: "#C45045",
              lineHeight: 1.6,
              padding: "10px 12px",
              borderRadius: 10,
              background: "rgba(196,80,69,0.08)",
              border: "1px solid rgba(196,80,69,0.2)",
            }}
          >
            {errorMsg}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "6px 0",
            // reCAPTCHA は 304x78 固定。狭幅端末ではスケール調整
            transformOrigin: "center",
          }}
        >
          <div
            className="g-recaptcha"
            data-sitekey={RECAPTCHA_SITE_KEY}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          style={{
            appearance: "none",
            border: 0,
            background: ACCENT,
            color: "#FFFFFF",
            fontSize: 15,
            fontWeight: 700,
            fontFamily: "inherit",
            padding: "14px 22px",
            borderRadius: 14,
            cursor: submitting ? "default" : "pointer",
            opacity: submitting ? 0.6 : 1,
            boxShadow: `0 6px 16px ${ACCENT}40`,
            marginTop: 6,
            transition: "opacity 0.18s ease",
          }}
        >
          {submitting ? "送信中…" : "送信する"}
        </button>
      </form>

      <div
        style={{
          marginTop: 24,
          textAlign: "center",
          fontSize: 12.5,
          color: MUTED,
        }}
      >
        <Link
          href="/lp"
          style={{ color: MUTED, textDecoration: "underline" }}
        >
          LPに戻る
        </Link>
      </div>
    </>
  );
}

type FieldProps = {
  id: string;
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

function Field({
  id,
  label,
  name,
  type = "text",
  autoComplete,
  required,
  value,
  onChange,
  placeholder,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 700,
          color: MUTED,
          marginBottom: 8,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "12px 14px",
          fontSize: 15,
          fontFamily: "inherit",
          color: TEXT,
          background: FIELD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

type TextAreaProps = Omit<FieldProps, "type" | "autoComplete">;

function TextAreaField({
  id,
  label,
  name,
  required,
  value,
  onChange,
  placeholder,
}: TextAreaProps) {
  return (
    <div>
      <label
        htmlFor={id}
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 700,
          color: MUTED,
          marginBottom: 8,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={6}
        style={{
          width: "100%",
          padding: "12px 14px",
          fontSize: 15,
          fontFamily: "inherit",
          color: TEXT,
          background: FIELD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          outline: "none",
          boxSizing: "border-box",
          resize: "vertical",
          minHeight: 140,
          lineHeight: 1.7,
        }}
      />
    </div>
  );
}

function ThanksView() {
  return (
    <div
      style={{
        background: SURFACE,
        borderRadius: 20,
        padding: "40px 28px",
        textAlign: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: `${ACCENT}14`,
          color: ACCENT,
          margin: "0 auto 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 12.5l5 5 11-11"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 800,
          letterSpacing: "-0.01em",
          margin: 0,
          marginBottom: 10,
        }}
      >
        お問い合わせを受け付けました。
      </h2>
      <p
        style={{
          fontSize: 13.5,
          color: "rgba(28,28,30,0.65)",
          lineHeight: 1.8,
          margin: 0,
          marginBottom: 24,
        }}
      >
        自動返信メールをご確認ください。
        <br />
        内容を確認のうえ、必要に応じてご連絡いたします。
      </p>
      <Link
        href="/lp"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: ACCENT,
          color: "#FFFFFF",
          fontSize: 14.5,
          fontWeight: 700,
          padding: "12px 22px",
          borderRadius: 999,
          textDecoration: "none",
          boxShadow: `0 6px 16px ${ACCENT}40`,
        }}
      >
        LPに戻る
      </Link>
    </div>
  );
}
