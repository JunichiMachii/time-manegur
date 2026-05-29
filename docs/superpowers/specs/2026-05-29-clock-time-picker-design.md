# ClockTimePicker 設計仕様

**日付**: 2026-05-29  
**対象**: `app/_components/ClockTimePicker.tsx`（新規）、`ScheduleEditor.tsx`（変更）

---

## 概要

`ScheduleEditor` のスクロール式 `TimeSlotPicker`（時・分×2セット）を、アナログ時計UIの `ClockTimePicker` 1コンポーネントに置き換える。開始時刻と終了時刻をタップ×2で設定し、所要時間を自動計算する。

---

## コンポーネント設計

### ClockTimePicker

**ファイル**: `app/_components/ClockTimePicker.tsx`

**Props**:
```ts
type Props = {
  startH: number;   // 0-23
  startM: number;   // 0-55 (5分単位)
  endH: number;     // 0-23
  endM: number;     // 0-55
  onChange: (startH: number, startM: number, endH: number, endM: number) => void;
  dark: boolean;
  accent: string;
};
```

**内部 state**:
- `mode: "start" | "end"` — 現在どちらを設定中か

**レイアウト**（ダイアログ内インライン）:
1. AM/PM トグル（開始用）＋ 時刻バー（始・終・所要時間表示）
2. SVG 時計フェイス（200×200px）
3. 終了時刻 AM/PM トグル（終了用、終了モード時のみ表示）

---

## 時計フェイス仕様

| 要素 | 仕様 |
|---|---|
| サイズ | 200×200px SVG |
| 外周 | 円形フェイス（ライト: #F9F9F9 / ダーク: #2C2C2E） |
| 時刻数字 | 1〜12、フォント 13px、bold |
| 5分ドット | 外周に12個（時刻位置）の小円 r=2 |
| 開始針 | 青（accent色）、太さ 5px、先端バッジ「始」 |
| 終了針 | オレンジ (#FF9500)、破線 5-3、太さ 3.5px、先端バッジ「終」 |
| 弧 | 開始→終了間、オレンジ 18% 不透明度、幅 8px |
| 中心点 | 半径 5px、ダーク #1C1C1E |

---

## 操作モデル

### タップ処理

```
タップ座標 (x, y) → クロック中心からの角度 θ
θ (0°=12時、時計回り) → 最近傍 5分単位に丸め → 時・分を確定
```

具体的な計算:
```ts
const dx = x - cx;
const dy = y - cy;
const angle = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
const totalMinutes = Math.round(angle / (360 / 60) / 5) * 5; // 5分スナップ
const hour12 = Math.floor(totalMinutes / 60) % 12 || 12;
const minute = totalMinutes % 60;
```

### モード遷移

```
初期: mode = "start"
  → タップ: 開始時刻確定 → mode = "end" に自動切替
  → タップ: 終了時刻確定 → mode = "start" に戻る（再設定可能）

「始」バッジタップ → mode = "start" に戻って再設定
「終」バッジタップ → mode = "end" に戻って再設定
```

### AM/PM

- 開始・終了それぞれ独立した AM/PM トグル
- 内部では 0-23 時で管理（12h 表示は UI のみ）
- 変換: `hour24 = ampm === "AM" ? hour12 % 12 : (hour12 % 12) + 12`

---

## ScheduleEditor 変更

### 削除する state
```ts
// 削除
const [hour, setHour] = useState<number>(...)
const [minute, setMinute] = useState<number>(...)
const [durHours, setDurHours] = useState<number>(...)
const [durMinutes, setDurMinutes] = useState<number>(...)
```

### 追加する state
```ts
const [startH, setStartH] = useState<number>(initialTime.h);
const [startM, setStartM] = useState<number>(initialTime.m);
const initialEnd = { h: initialTime.h + 1, m: initialTime.m }; // デフォルト1時間後
const [endH, setEndH] = useState<number>(initialEnd.h % 24);
const [endM, setEndM] = useState<number>(initialEnd.m);
```

### 所要時間計算（保存時）
```ts
let durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
if (durationMinutes < 0) durationMinutes += 24 * 60; // 日またぎ対応
const totalDuration = Math.max(0, durationMinutes);
```

### 「所要時間」セクション
削除（ClockTimePicker 内で自動計算・表示）。

---

## ファイル変更一覧

| ファイル | 変更種別 |
|---|---|
| `app/_components/ClockTimePicker.tsx` | **新規作成** |
| `app/_components/ScheduleEditor.tsx` | **変更**（state 整理、TimeSlotPicker 削除、ClockTimePicker 追加） |
| `app/_components/TimeSlotPicker.tsx` | **削除**（他コンポーネントで未使用のため） |

---

## エッジケース

| ケース | 挙動 |
|---|---|
| 終了 < 開始 | 日またぎとして duration を計算（+24h） |
| 終了 = 開始 | duration = 0（未設定扱い） |
| 終了未設定のまま保存 | duration = 0 で保存（許容） |
| タップ中心付近 | 中心から r < 20px のタップは無視 |

---

## 削除しないもの

- `notifyText`（通知）、`isRecurring`（毎日固定）、`title` — 変更なし
- `ScheduleItem` 型の `duration_minutes` フィールド — 保存時に計算して渡す
