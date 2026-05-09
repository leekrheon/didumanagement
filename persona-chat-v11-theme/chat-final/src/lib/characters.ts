/**
 * Supabase에서 캐릭터 데이터를 실시간으로 불러옵니다.
 * Dashboard에서 수정하면 자동 반영됩니다.
 */

import { createClient } from '@supabase/supabase-js';
import { Character, Session, Dialogue } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseChars = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Supabase 행 → Chat App 타입 변환 ────────────────────────────

function mapDialogue(row: any): Dialogue {
  return {
    type: row.type as 'normal' | 'ad' | 'quiz',
    text: row.text,
    adBrand: row.ad_brand ?? undefined,
    quizOptions: row.quiz_options ?? undefined,
    quizAnswer: row.quiz_answer ?? undefined,
  };
}

function mapSession(row: any): Session {
  return {
    dialogues: (row.dialogues ?? [])
      .sort((a: any, b: any) => a.order - b.order)
      .map(mapDialogue),
  };
}

export function mapCharacter(row: any): Character {
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    bio: row.bio,
    image: row.image_url || '/char.png',
    bgImage: row.bg_image_url || '/back.png',
    sessions: (row.sessions ?? [])
      .sort((a: any, b: any) => a.order - b.order)
      .map(mapSession),
  };
}

// ─── 전체 캐릭터 1회 조회 ────────────────────────────────────────

export async function fetchCharacters(): Promise<Character[]> {
  const { data, error } = await supabaseChars
    .from('characters')
    .select(`
      *,
      sessions (
        *,
        dialogues (*)
      )
    `)
    .order('order', { ascending: true });

  if (error) {
    console.error('fetchCharacters error:', error);
    return [];
  }

  return (data ?? []).map(mapCharacter);
}

// ─── 실시간 구독 ──────────────────────────────────────────────────

export function subscribeToCharacters(
  onUpdate: (characters: Character[]) => void
) {
  const reload = async () => {
    const chars = await fetchCharacters();
    onUpdate(chars);
  };

  const channel = supabaseChars
    .channel('chat-characters-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'characters' }, reload)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, reload)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'dialogues' }, reload)
    .subscribe();

  return () => { supabaseChars.removeChannel(channel); };
}
