import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MobileScreen } from "./_components/MobileScreen";
import type { ScheduleItem, Task } from "./_components/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const [tasksRes, scheduleRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, title, tag, done")
      .order("id", { ascending: true }),
    supabase
      .from("schedule_items")
      .select("id, time, title, duration_minutes, notify_minutes_before")
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
      />
    </main>
  );
}
