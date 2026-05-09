import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 환경변수가 없습니다. .env 파일을 확인하세요.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

export type DialogueType = 'normal' | 'ad' | 'quiz';

export interface Dialogue {
  id: string;
  session_id: string;
  order: number;
  type: DialogueType;
  text: string;
  ad_brand?: string | null;
  quiz_options?: string[] | null;
  quiz_answer?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface Session {
  id: string;
  character_id: string;
  order: number;
  dialogues: Dialogue[];
  created_at?: string;
}

export interface Character {
  id: string;
  name: string;
  age: number;
  bio: string;
  image_url: string;
  bg_image_url: string;
  order: number;
  sessions: Session[];
  created_at?: string;
  updated_at?: string;
}

export async function fetchAllCharacters(): Promise<Character[]> {
  const { data, error } = await supabase
    .from('characters')
    .select(`*, sessions (*, dialogues (*))`)
    .order('order', { ascending: true });
  if (error) { console.error('fetchAllCharacters error:', error); return []; }
  return (data ?? []).map((char: any) => ({
    ...char,
    sessions: (char.sessions ?? [])
      .sort((a: Session, b: Session) => a.order - b.order)
      .map((sess: any) => ({
        ...sess,
        dialogues: (sess.dialogues ?? []).sort((a: Dialogue, b: Dialogue) => a.order - b.order),
      })),
  })) as Character[];
}

export async function createCharacter(
  data: Omit<Character, 'sessions' | 'created_at' | 'updated_at'>
): Promise<Character | null> {
  const { data: row, error } = await supabase.from('characters').insert(data).select().single();
  if (error) { console.error('createCharacter:', error); return null; }
  return { ...row, sessions: [] } as Character;
}

export async function updateCharacter(
  id: string,
  updates: Partial<Omit<Character, 'sessions' | 'created_at' | 'updated_at'>>
): Promise<boolean> {
  const { error } = await supabase.from('characters').update(updates).eq('id', id);
  if (error) { console.error('updateCharacter:', error); return false; }
  return true;
}

export async function deleteCharacter(id: string): Promise<boolean> {
  const { error } = await supabase.from('characters').delete().eq('id', id);
  if (error) { console.error('deleteCharacter:', error); return false; }
  return true;
}

export async function createSession(characterId: string, order: number): Promise<Session | null> {
  const id = `${characterId}-s${Date.now()}`;
  const { data: row, error } = await supabase
    .from('sessions').insert({ id, character_id: characterId, order }).select().single();
  if (error) { console.error('createSession:', error); return null; }
  return { ...row, dialogues: [] } as Session;
}

export async function deleteSession(id: string): Promise<boolean> {
  const { error } = await supabase.from('sessions').delete().eq('id', id);
  if (error) { console.error('deleteSession:', error); return false; }
  return true;
}

export async function createDialogue(sessionId: string, order: number): Promise<Dialogue | null> {
  const id = `dlg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const row: Dialogue = { id, session_id: sessionId, order, type: 'normal', text: '새 대화를 입력하세요...' };
  const { data, error } = await supabase.from('dialogues').insert(row).select().single();
  if (error) { console.error('createDialogue:', error); return null; }
  return data as Dialogue;
}

export async function updateDialogue(
  id: string,
  updates: Partial<Omit<Dialogue, 'id' | 'session_id' | 'created_at' | 'updated_at'>>
): Promise<boolean> {
  const { error } = await supabase.from('dialogues').update(updates).eq('id', id);
  if (error) { console.error('updateDialogue:', error); return false; }
  return true;
}

export async function deleteDialogue(id: string): Promise<boolean> {
  const { error } = await supabase.from('dialogues').delete().eq('id', id);
  if (error) { console.error('deleteDialogue:', error); return false; }
  return true;
}
