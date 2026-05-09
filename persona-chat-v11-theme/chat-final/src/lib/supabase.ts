import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type LuckyDrawEntry = {
  user_id: string;
  nickname: string;
  phone: string;
  week: string;
};

// 이번 주 식별자 (예: "2026-W19")
export function getCurrentWeek(): string {
  const now = new Date();
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const week = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

// 응모 등록
export async function submitLuckyDraw(entry: LuckyDrawEntry) {
  const { error } = await supabase
    .from('lucky_draw_entries')
    .insert(entry);
  if (error) throw error;
}

// 이번 주 이미 응모했는지 확인
export async function hasEnteredThisWeek(userId: string): Promise<boolean> {
  const week = getCurrentWeek();
  const { data, error } = await supabase
    .from('lucky_draw_entries')
    .select('id')
    .eq('user_id', userId)
    .eq('week', week)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

// ─── 유저 진행 데이터 ───────────────────────────────────────────

export interface UserProgress {
  user_id: string;
  credits: number;
  today_count: number;
  today_date: string;
  total_count: number;
  week_counts: number[];           // [월,화,수,목,금,토,일]
  session_indices: Record<string, number>; // { characterId: sessionIndex }
  scraps: ScrapRow[];
}

export interface ScrapRow {
  id: string;
  character_id: string;
  character_name: string;
  character_age: number;
  text: string;
  date: string;
}

// DB에서 유저 데이터 불러오기
export async function loadUserProgress(userId: string): Promise<UserProgress | null> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as UserProgress;
}

// DB에 유저 데이터 저장 (upsert)
export async function saveUserProgress(progress: UserProgress): Promise<void> {
  const { error } = await supabase
    .from('user_progress')
    .upsert(progress, { onConflict: 'user_id' });
  if (error) console.error('saveUserProgress error:', error);
}
