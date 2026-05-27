"use client";

import { useSyncExternalStore } from "react";
import { IOSDevice } from "../_components/ios-frame";
import {
  MobileScreen,
  type MobileScreenStyle,
} from "../_components/MobileScreen";
import {
  TweakColor,
  TweakRadio,
  TweakSection,
  TweakToggle,
  TweaksPanel,
  useTweaks,
} from "../_components/tweaks-panel";

const PHONE_W = 393;
const PHONE_H = 852;
const PAD = 40;

const TWEAK_DEFAULTS = {
  accent: "#C4634E",
  dark: false,
  style: "card" as MobileScreenStyle,
};

const ACCENT_OPTIONS = ["#C4634E", "#3A7CA5", "#5B8A72", "#7C6BAE"] as const;
const STYLE_OPTIONS: ReadonlyArray<MobileScreenStyle> = ["minimal", "card"];

function computeScale(): number {
  return Math.min(
    1,
    (window.innerWidth - PAD) / PHONE_W,
    (window.innerHeight - PAD) / PHONE_H,
  );
}

function subscribeResize(callback: () => void): () => void {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

function getServerScale(): number {
  return 1;
}

export default function Preview() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const scale = useSyncExternalStore(
    subscribeResize,
    computeScale,
    getServerScale,
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "#1a1a1a",
      }}
    >
      <div
        suppressHydrationWarning
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          flexShrink: 0,
        }}
      >
        <IOSDevice width={PHONE_W} height={PHONE_H} dark={t.dark}>
          <MobileScreen
            accent={t.accent}
            dark={t.dark}
            layoutStyle={t.style}
            topInset={58}
          />
        </IOSDevice>
      </div>

      <TweaksPanel>
        <TweakSection label="テーマ" />
        <TweakColor
          label="アクセントカラー"
          value={t.accent}
          options={ACCENT_OPTIONS}
          onChange={(v) => setTweak("accent", v)}
        />
        <TweakToggle
          label="ダークモード"
          value={t.dark}
          onChange={(v) => setTweak("dark", v)}
        />
        <TweakSection label="レイアウト" />
        <TweakRadio<MobileScreenStyle>
          label="スタイル"
          value={t.style}
          options={STYLE_OPTIONS}
          onChange={(v) => setTweak("style", v)}
        />
      </TweaksPanel>
    </div>
  );
}
