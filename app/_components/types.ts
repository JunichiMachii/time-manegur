export type Task = {
  id: number;
  title: string;
  tag: string | null;
  done: boolean;
};

export type ScheduleItem = {
  id: number;
  time: string;
  title: string;
  duration_minutes: number;
  notify_minutes_before: number;
  is_recurring: boolean;
};

export type UserProfile = {
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
};

export type ScheduleItemDraft = {
  time: string;
  title: string;
  duration_minutes: number;
  notify_minutes_before: number;
  is_recurring: boolean;
};
