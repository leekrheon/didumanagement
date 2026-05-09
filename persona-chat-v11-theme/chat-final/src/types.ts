export interface Dialogue {
  type: 'normal' | 'ad' | 'quiz';
  text: string;
  adBrand?: string;
  quizOptions?: string[];
  quizAnswer?: number;
}

export interface Session {
  dialogues: Dialogue[]; // 세션당 8개
}

export interface Character {
  id: string;
  name: string;
  age: number;
  bio: string;
  image: string;
  bgImage: string;
  sessions: Session[]; // 세션 목록
}

export interface ScrapItem {
  id: string;
  characterId: string;
  characterName: string;
  characterAge: number;
  text: string;
  date: string;
}

export type View = 'home' | 'select' | 'chat' | 'credit' | 'scrap' | 'profile';
