"use server";

import { createClient } from "@/lib/supabase/server";

type GoogleEvent = {
  id: string;
  summary?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
};

export type SyncResult = { synced: number } | { error: string };

export async function syncGoogleCalendar(): Promise<SyncResult> {
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) return { error: "未ログインです" };
  const userId =
    typeof claimsData.claims.sub === "string" ? claimsData.claims.sub : null;
  if (!userId) return { error: "ユーザーIDを取得できませんでした" };

  // provider_token は getSession() からのみ取得可能
  const { data: sessionData } = await supabase.auth.getSession();
  const providerToken = sessionData?.session?.provider_token;
  if (!providerToken) {
    return {
      error:
        "Googleの認証トークンがありません。一度ログアウトして再ログインしてください。",
    };
  }

  const now = new Date();
  const timeMin = now.toISOString();
  const timeMax = new Date(
    now.getTime() + 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const url = new URL(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
  );
  url.searchParams.set("timeMin", timeMin);
  url.searchParams.set("timeMax", timeMax);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", "250");

  const calRes = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${providerToken}` },
  });

  if (!calRes.ok) {
    const errText = await calRes.text();
    return {
      error: `Google Calendar API エラー (${calRes.status}): ${errText.slice(0, 200)}`,
    };
  }

  const calData = (await calRes.json()) as { items?: GoogleEvent[] };
  const events = calData.items ?? [];

  const rows = events
    .filter((ev) => Boolean(ev.start.dateTime)) // 終日イベントを除外
    .map((ev) => {
      const startStr = ev.start.dateTime!;
      const endStr = ev.end.dateTime ?? startStr;

      // "2026-05-29T14:30:00+09:00" → "14:30"（ローカル時刻をそのまま抽出）
      const timeMatch = startStr.match(/T(\d{2}):(\d{2})/);
      const time = timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : "00:00";

      // "2026-05-29T14:30:00+09:00" → "2026-05-29"
      const scheduledDate = startStr.substring(0, 10);

      // 所要時間（ミリ秒差から分換算、日またぎも正確に計算）
      const durationMs =
        new Date(endStr).getTime() - new Date(startStr).getTime();
      const durationMinutes = Math.max(0, Math.round(durationMs / 60_000));

      return {
        user_id: userId,
        time,
        title: ev.summary ?? "（タイトルなし）",
        duration_minutes: durationMinutes,
        notify_minutes_before: 0,
        is_recurring: false,
        scheduled_date: scheduledDate,
        google_event_id: ev.id,
      };
    });

  if (rows.length === 0) return { synced: 0 };

  const { error: upsertError } = await supabase
    .from("schedule_items")
    .upsert(rows, { onConflict: "user_id,google_event_id" });

  if (upsertError) {
    return { error: `同期に失敗しました: ${upsertError.message}` };
  }

  return { synced: rows.length };
}
