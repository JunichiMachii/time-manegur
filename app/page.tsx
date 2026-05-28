import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MobileScreen } from "./_components/MobileScreen";
import type { ScheduleItem, Task, UserProfile } from "./_components/types";
import { isValidDateStr, todayLocal } from "./_components/dateUtils";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ date?: string | string[] }>;

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");
  // Defense-in-Depth: RLSに加えてアプリ層でもユーザーIDで絞り込む
  const userId =
    typeof data.claims.sub === "string" ? data.claims.sub : null;
  if (!userId) redirect("/login");

  const { data: userData } = await supabase.auth.getUser();
  const meta = (userData.user?.user_metadata ?? {}) as Record<string, unknown>;
  const userProfile: UserProfile = {
    email: userData.user?.email ?? null,
    name:
      (typeof meta.name === "string" && meta.name) ||
      (typeof meta.full_name === "string" && meta.full_name) ||
      null,
    avatarUrl:
      (typeof meta.avatar_url === "string" && meta.avatar_url) ||
      (typeof meta.picture === "string" && meta.picture) ||
      null,
  };

  const params = await searchParams;
  const rawDate = Array.isArray(params.date) ? params.date[0] : params.date;
  // dateパラメータの形式が壊れていたら今日にフォールバック
  const selectedDate =
    rawDate && isValidDateStr(rawDate) ? rawDate : todayLocal();

  const [tasksRes, scheduleRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title, tag, done, scheduled_date")
      .eq("user_id", userId)
      .eq("scheduled_date", selectedDate)
      .order("id", { ascending: true }),
    // 毎日固定（is_recurring=true）+ 選択日のその他の予定を時間順で取得
    supabase
      .from("schedule_items")
      .select(
        "id, time, title, duration_minutes, notify_minutes_before, is_recurring, scheduled_date",
      )
      .eq("user_id", userId)
      .or(`is_recurring.eq.true,scheduled_date.eq.${selectedDate}`)
      .order("time", { ascending: true }),
  ]);

  if (tasksRes.error) {
    throw new Error(`tasks fetch failed: ${tasksRes.error.message}`);
  }
  if (scheduleRes.error) {
    throw new Error(`schedule fetch failed: ${scheduleRes.error.message}`);
  }

  const initialTasks = (tasksRes.data ?? []) as Task[];
  const initialItems = (scheduleRes.data ?? []) as ScheduleItem[];

  return (
    <main
      style={{
        height: "100dvh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      <MobileScreen
        accent="#C4634E"
        initialTasks={initialTasks}
        initialItems={initialItems}
        userProfile={userProfile}
        selectedDate={selectedDate}
        userId={userId}
      />
    </main>
  );
}
