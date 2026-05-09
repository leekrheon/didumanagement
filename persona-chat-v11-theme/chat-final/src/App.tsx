import { useState, useEffect, useCallback, useRef } from 'react';
import Home from './components/Home';
import SwipeSelection from './components/SwipeSelection';
import Chatroom from './components/Chatroom';
import Credit from './components/Credit';
import Scrap from './components/Scrap';
import Profile from './components/Profile';
import Navigation from './components/Navigation';
import Login from './components/Login';
import AuthCallback, { KakaoUser } from './components/AuthCallback';
import { fetchCharacters, subscribeToCharacters } from './lib/characters';
import { loadTheme, saveTheme, type Theme } from './lib/theme';
import { Character, View, ScrapItem } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { loadUserProgress, saveUserProgress, UserProgress, ScrapRow } from './lib/supabase';

// localStorage — user 정보만 캐시 (빠른 로그인 유지용)
function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function saveLocal(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

const today = new Date().toDateString();

// ScrapRow ↔ ScrapItem 변환
function rowToItem(r: ScrapRow): ScrapItem {
  return { id: r.id, characterId: r.character_id, characterName: r.character_name, characterAge: r.character_age, text: r.text, date: r.date };
}
function itemToRow(s: ScrapItem): ScrapRow {
  return { id: s.id, character_id: s.characterId, character_name: s.characterName, character_age: s.characterAge, text: s.text, date: s.date };
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(loadTheme);

  const handleThemeChange = (t: Theme) => { setTheme(t); saveTheme(t); };

  const [user, setUser] = useState<KakaoUser | null>(() => loadLocal('imby_user', null));
  const [activeView, setActiveView] = useState<View>('home');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [dbLoaded, setDbLoaded] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);

  // 진행 데이터
  const [credits, setCredits] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [weekCounts, setWeekCounts] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [scraps, setScraps] = useState<ScrapItem[]>([]);
  const [scrappedIds, setScrappedIds] = useState<Set<string>>(new Set());
  const [sessionIndices, setSessionIndices] = useState<Record<string, number>>({});

  // DB 저장 디바운스용
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── DB 저장 (디바운스 500ms) ──────────────────────────────────
  const scheduleSave = useCallback((progress: UserProgress) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveUserProgress(progress);
    }, 500);
  }, []);

  // ── body 배경색 동기화 ─────────────────────────────────────────
  useEffect(() => {
    document.body.style.backgroundColor = theme === 'light' ? '#F5F6FA' : '#000000';
    document.body.style.color = theme === 'light' ? '#111111' : '#ffffff';
  }, [theme]);

  // ── 캐릭터 데이터 실시간 구독 (Dashboard 연동) ───────────────
  useEffect(() => {
    fetchCharacters().then(setCharacters);
    const unsubscribe = subscribeToCharacters(setCharacters);
    return unsubscribe;
  }, []);

  // ── 로그인 후 DB에서 데이터 불러오기 ─────────────────────────
  useEffect(() => {
    if (!user) { setDbLoaded(false); return; }

    loadUserProgress(String(user.id)).then((data) => {
      if (data) {
        const isNewDay = data.today_date !== today;
        setCredits(data.credits);
        setTodayCount(isNewDay ? 0 : data.today_count);
        setTotalCount(data.total_count);
        setWeekCounts(data.week_counts ?? [0, 0, 0, 0, 0, 0, 0]);
        setSessionIndices(data.session_indices ?? {});
        const items = (data.scraps ?? []).map(rowToItem);
        setScraps(items);
        setScrappedIds(new Set(items.map((s) => s.id)));
      }
      setDbLoaded(true);
    });
  }, [user]);

  // ── 데이터 변경 시 DB 저장 ────────────────────────────────────
  useEffect(() => {
    if (!user || !dbLoaded) return;
    scheduleSave({
      user_id: String(user.id),
      credits,
      today_count: todayCount,
      today_date: today,
      total_count: totalCount,
      week_counts: weekCounts,
      session_indices: sessionIndices,
      scraps: scraps.map(itemToRow),
    });
  }, [user, dbLoaded, credits, todayCount, totalCount, weekCounts, sessionIndices, scraps, scheduleSave]);

  // ── 콜백 URL ─────────────────────────────────────────────────
  const isCallback = window.location.pathname === '/auth/callback';

  const handleLoginSuccess = useCallback((kakaoUser: KakaoUser) => {
    saveLocal('imby_user', kakaoUser);
    setUser(kakaoUser);
  }, []);

  const handleLoginError = useCallback(() => {
    window.history.replaceState({}, '', '/');
  }, []);

  const handleLogout = useCallback(() => {
    saveLocal('imby_user', null);
    setUser(null);
    setDbLoaded(false);
  }, []);

  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setActiveView('chat');
  };

  const handleExitChat = () => {
    setActiveView('select');
    setSelectedCharacter(null);
  };

  const handleAdvanceCount = () => {
    if (!selectedCharacter) return;
    setTodayCount((p) => Math.min(p + 1, 5));
    setTotalCount((p) => p + 1);
    setCredits((p) => p + 100);
    const dayIdx = (new Date().getDay() + 6) % 7;
    setWeekCounts((prev) => {
      const next = [...prev];
      next[dayIdx] = (next[dayIdx] || 0) + 1;
      return next;
    });
    setSessionIndices((prev) => {
      const cur = prev[selectedCharacter.id] ?? 0;
      const max = selectedCharacter.sessions.length - 1;
      return { ...prev, [selectedCharacter.id]: Math.min(cur + 1, max) };
    });
  };

  const handleScrap = (item: ScrapItem) => {
    if (scrappedIds.has(item.id)) {
      setScrappedIds((prev) => { const s = new Set(prev); s.delete(item.id); return s; });
      setScraps((prev) => prev.filter((s) => s.id !== item.id));
    } else {
      setScrappedIds((prev) => new Set(prev).add(item.id));
      setScraps((prev) => [item, ...prev]);
    }
  };

  const handleDeleteScrap = (id: string) => {
    setScrappedIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
    setScraps((prev) => prev.filter((s) => s.id !== id));
  };

  // 콜백 처리 중
  if (isCallback) {
    return (
      <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-black overflow-hidden">
        <AuthCallback onSuccess={handleLoginSuccess} onError={handleLoginError} />
      </div>
    );
  }

  // 비로그인
  if (!user) {
    return (
      <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-black overflow-hidden shadow-2xl border-x border-white/5">
        <Login />
      </div>
    );
  }

  // DB 로딩 중
  if (!dbLoaded) {
    return (
      <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-black overflow-hidden items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-white/40 text-sm">불러오는 중...</p>
      </div>
    );
  }

  // 메인 앱
  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-black overflow-hidden shadow-2xl relative border-x border-white/5">
      <main className="flex-1 relative overflow-hidden">
        {activeView === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
            <Home count={todayCount} totalCount={totalCount} weekCounts={weekCounts} onStart={() => setActiveView('select')} theme={theme} />
          </motion.div>
        )}
        {activeView === 'select' && (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-10">
            <SwipeSelection characters={characters} onSelect={handleSelectCharacter} theme={theme} />
          </motion.div>
        )}
        {activeView === 'credit' && (
          <motion.div key="credit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-20">
            <Credit credits={credits} todayCount={todayCount} user={user} theme={theme} />
          </motion.div>
        )}
        {activeView === 'scrap' && (
          <motion.div key="scrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-20">
            <Scrap items={scraps} onDelete={handleDeleteScrap} theme={theme} />
          </motion.div>
        )}
        {activeView === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-20">
            <Profile totalCount={totalCount} credits={credits} user={user} onLogout={handleLogout} theme={theme} onThemeChange={handleThemeChange} />
          </motion.div>
        )}
        <AnimatePresence>
          {activeView === 'chat' && selectedCharacter && (
            <motion.div
              key="chat"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute inset-0 z-[100] bg-black"
            >
              <Chatroom
                character={selectedCharacter}
                currentSessionIndex={sessionIndices[selectedCharacter.id] ?? 0}
                todayCount={todayCount}
                onExit={handleExitChat}
                onAdvanceCount={handleAdvanceCount}
                onScrap={handleScrap}
                scrappedIds={scrappedIds} theme={theme}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      {activeView !== 'chat' && (
        <div className="z-50">
          <Navigation activeView={activeView} onViewChange={setActiveView} theme={theme} />
        </div>
      )}
    </div>
  );
}

