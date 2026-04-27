import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export type UserRole = "admin" | "student" | "parent";

export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
}

export interface Student {
  id: string;
  profile_id: string;
  name: string;
  grade?: string;
  seat_number?: number;
  status: "study" | "outing" | "sleep" | "away";
  parent_id?: string;
  memo?: string;
  created_at: string;
}

export interface StudySession {
  id: string;
  student_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  total_seconds: number;
  created_at: string;
}

export interface DailyPlan {
  id: string;
  student_id: string;
  date: string;
  tasks: PlanTask[];
  reflection: string;
  created_at: string;
}

export interface PlanTask {
  id: string;
  text: string;
  category: string;
  completed: boolean;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
  pinned: boolean;
}

export interface Report {
  id: string;
  student_id: string;
  date: string;
  study_seconds: number;
  completed_tasks: number;
  total_tasks: number;
  reflection: string;
  teacher_comment: string;
  created_at: string;
}
