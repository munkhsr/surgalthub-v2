import { supabase } from "./supabase";
import { courses, centers, type Course, type Center } from "./data";
export async function getCatalog(): Promise<{ courses: Course[]; centers: Center[]; demo: boolean; error?: string }> {
  if (!supabase) return { courses, centers, demo: true };
  const [courseResult, centerResult] = await Promise.all([
    supabase.from("courses").select("*").eq("status", "approved").order("created_at", { ascending: false }),
    supabase.from("centers").select("*"),
  ]);
  if (courseResult.error || centerResult.error) return { courses: [], centers: [], demo: false, error: "Мэдээллийг ачаалж чадсангүй. Дахин оролдоно уу." };
  return { courses: courseResult.data as Course[], centers: centerResult.data as Center[], demo: false };
}
