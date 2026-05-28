import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MobileScreen } from "./_components/MobileScreen";
import type { ScheduleItem, Task, UserProfile } from "./_components/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

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

  const [tasksRes, scheduleRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title, tag, done")
      .order("id", { ascending: true }),
    // 毎日固定（is_recurring=true）+ その他の予定を時間順で取得
    supabase
      .from("schedule_items")
      .select(
        "id, time, title, duration_minutes, notify_minutes_before, is_recurring",
      )
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
      />
    </main>
  );
}
