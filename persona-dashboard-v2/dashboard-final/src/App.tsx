import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  Users, MessageSquare, Plus, Search, LayoutDashboard,
  ChevronRight, Trash2, Save, CheckCircle2,
  HelpCircle, Megaphone, GripVertical, RefreshCw, X, AlertTriangle,
  Edit3, UserPlus, Layers, Settings, Tag, ChevronDown, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  supabase,
  fetchAllCharacters,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  createSession,
  deleteSession,
  createDialogue,
  updateDialogue,
  deleteDialogue,
  type Character,
  type Session,
  type Dialogue,
  type DialogueType,
} from './lib/supabase';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: number; message: string; type: ToastType; }

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);
  const show = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++counter.current;
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }, []);
  return { toasts, show };
}

type ActiveTab = 'characters' | 'brands' | 'settings';

// ─── 광고 브랜드 목록 (Supabase dialogues에서 추출) ─────────────
function extractBrands(characters: Character[]): string[] {
  const brands = new Set<string>();
  characters.forEach(c =>
    c.sessions.forEach(s =>
      s.dialogues.forEach(d => {
        if (d.type === 'ad' && d.ad_brand) brands.add(d.ad_brand);
      })
    )
  );
  return Array.from(brands).sort();
}

export default function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('characters');
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedDialogueId, setSelectedDialogueId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionSearch, setSessionSearch] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [showNewCharModal, setShowNewCharModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showSessionDropdown, setShowSessionDropdown] = useState(false);
  const { toasts, show: showToast } = useToast();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    const data = await fetchAllCharacters();
    setCharacters(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'characters' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, loadData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dialogues' }, loadData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadData]);

  // 드롭다운 외부 클릭 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSessionDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── 파생 상태 ─────────────────────────────────────────────────
  const filteredChars = useMemo(() =>
    characters.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [characters, searchQuery]
  );

  const selectedChar = useMemo(() =>
    characters.find(c => c.id === selectedCharId) ?? null,
    [characters, selectedCharId]
  );

  const filteredSessions = useMemo(() => {
    if (!selectedChar) return [];
    if (!sessionSearch) return selectedChar.sessions;
    return selectedChar.sessions.filter((_, i) =>
      `세션 ${i + 1}`.includes(sessionSearch)
    );
  }, [selectedChar, sessionSearch]);

  const selectedSession = useMemo(() =>
    selectedChar?.sessions.find(s => s.id === selectedSessionId) ?? null,
    [selectedChar, selectedSessionId]
  );

  const selectedSessionIdx = useMemo(() =>
    selectedChar?.sessions.findIndex(s => s.id === selectedSessionId) ?? -1,
    [selectedChar, selectedSessionId]
  );

  const selectedDialogue = useMemo(() =>
    selectedSession?.dialogues.find(d => d.id === selectedDialogueId) ?? null,
    [selectedSession, selectedDialogueId]
  );

  const brands = useMemo(() => extractBrands(characters), [characters]);

  // ── 대화 추가 ─────────────────────────────────────────────────
  const handleAddDialogue = async () => {
    if (!selectedSession) return;
    const order = selectedSession.dialogues.length + 1;
    const newDlg = await createDialogue(selectedSession.id, order);
    if (newDlg) {
      setSelectedDialogueId(newDlg.id);
      showToast('대화 블록 추가됨', 'success');
      await loadData();
    } else {
      showToast('추가 실패', 'error');
    }
  };

  // ── 대화 수정 (낙관적 + 디바운스 저장) ───────────────────────
  const handleUpdateDialogue = useCallback((updates: Partial<Dialogue>) => {
    if (!selectedDialogueId) return;
    setCharacters(prev => prev.map(c => ({
      ...c,
      sessions: c.sessions.map(s => ({
        ...s,
        dialogues: s.dialogues.map(d =>
          d.id === selectedDialogueId ? { ...d, ...updates } : d
        ),
      })),
    })));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSavingId(selectedDialogueId);
    saveTimer.current = setTimeout(async () => {
      const ok = await updateDialogue(selectedDialogueId, updates);
      setSavingId(null);
      if (!ok) showToast('저장 실패', 'error');
    }, 500);
  }, [selectedDialogueId, showToast]);

  // ── 대화 삭제 ─────────────────────────────────────────────────
  const handleDeleteDialogue = async (id: string) => {
    const ok = await deleteDialogue(id);
    if (ok) {
      if (selectedDialogueId === id) setSelectedDialogueId(null);
      showToast('삭제됨', 'info');
      await loadData();
    } else showToast('삭제 실패', 'error');
  };

  // ── 세션 추가 ─────────────────────────────────────────────────
  const handleAddSession = async () => {
    if (!selectedChar) return;
    const order = selectedChar.sessions.length + 1;
    const sess = await createSession(selectedChar.id, order);
    if (sess) {
      showToast(`Session ${order} 추가됨`, 'success');
      await loadData();
      setSelectedSessionId(sess.id);
      setShowSessionDropdown(false);
    } else showToast('세션 추가 실패', 'error');
  };

  // ── 세션 삭제 ─────────────────────────────────────────────────
  const handleDeleteSession = async (sessId: string) => {
    const ok = await deleteSession(sessId);
    if (ok) {
      if (selectedSessionId === sessId) {
        const remaining = selectedChar?.sessions.filter(s => s.id !== sessId) ?? [];
        setSelectedSessionId(remaining[0]?.id ?? null);
      }
      setSelectedDialogueId(null);
      showToast('세션 삭제됨', 'info');
      await loadData();
    }
  };

  // ── 캐릭터 삭제 ───────────────────────────────────────────────
  const handleDeleteCharacter = async (id: string) => {
    const ok = await deleteCharacter(id);
    if (ok) {
      if (selectedCharId === id) {
        setSelectedCharId(null);
        setSelectedSessionId(null);
        setSelectedDialogueId(null);
      }
      setShowDeleteConfirm(null);
      showToast('캐릭터 삭제됨', 'info');
      await loadData();
    }
  };

  // ── 캐릭터 필드 수정 ──────────────────────────────────────────
  const handleUpdateCharField = async (field: string, value: string | number) => {
    if (!selectedCharId) return;
    await updateCharacter(selectedCharId, { [field]: value });
    await loadData();
    showToast('저장됨', 'success');
  };

  // ── JSON 내보내기 ─────────────────────────────────────────────
  const handleExport = () => {
    if (!selectedChar) return;
    const blob = new Blob([JSON.stringify(selectedChar, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedChar.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON 파일 다운로드됨', 'success');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-[#F8F9FA] gap-4">
        <RefreshCw className="animate-spin text-gray-400" size={24} />
        <span className="text-gray-400 font-medium">Supabase에서 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8F9FA]">
      {/* 토스트 */}
      <div className="fixed top-6 right-6 z-[999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
              className={cn("px-5 py-3 rounded-2xl text-sm font-bold shadow-xl",
                t.type === 'success' && "bg-black text-white",
                t.type === 'error' && "bg-red-500 text-white",
                t.type === 'info' && "bg-gray-600 text-white"
              )}>
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 삭제 확인 모달 */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[900] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[32px] p-8 max-w-sm w-full mx-4 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="text-red-500" size={24} />
                </div>
                <div>
                  <h3 className="font-black text-black">캐릭터 삭제</h3>
                  <p className="text-xs text-gray-400 mt-1">모든 세션과 대화도 함께 삭제됩니다.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 h-12 rounded-2xl border-2 border-black/5 text-sm font-bold text-gray-500 hover:bg-black/5 cursor-pointer">취소</button>
                <button onClick={() => handleDeleteCharacter(showDeleteConfirm)} className="flex-1 h-12 rounded-2xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 cursor-pointer">삭제</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 새 캐릭터 모달 */}
      <AnimatePresence>
        {showNewCharModal && (
          <NewCharacterModal
            onClose={() => setShowNewCharModal(false)}
            onCreate={async (data) => {
              const order = characters.length + 1;
              const char = await createCharacter({ ...data, order });
              if (char) {
                showToast(`${char.name} 생성됨!`, 'success');
                await loadData();
                setSelectedCharId(char.id);
                setSelectedSessionId(null);
                setActiveTab('characters');
              } else showToast('생성 실패', 'error');
              setShowNewCharModal(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* ── 메인 사이드바 ── */}
      <aside className="w-20 bg-[#121212] m-3 mr-0 rounded-[32px] flex flex-col items-center py-8 gap-6 shrink-0 shadow-2xl shadow-black/20">
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-black shadow-lg">
          <LayoutDashboard size={24} strokeWidth={2.5} />
        </div>
        <nav className="flex flex-col gap-4 flex-1 w-full px-3">
          <SidebarIcon icon={Users} label="캐릭터" active={activeTab === 'characters'} onClick={() => setActiveTab('characters')} />
          <SidebarIcon icon={Tag} label="브랜드" active={activeTab === 'brands'} onClick={() => setActiveTab('brands')} />
          <SidebarIcon icon={Settings} label="설정" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>
        <button
          onClick={() => setShowNewCharModal(true)}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/40 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
          title="새 캐릭터"
        >
          <UserPlus size={18} />
        </button>
      </aside>

      {/* ── 왼쪽 패널 (탭별) ── */}
      <aside className="w-80 flex flex-col shrink-0">
        {activeTab === 'characters' && (
          <>
            <div className="p-8 pb-4">
              <h1 className="text-2xl font-bold text-black mb-1">캐릭터</h1>
              <p className="text-xs text-gray-400 mb-5">{characters.length}명</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input type="text" placeholder="검색..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl text-sm bg-black/[0.04] border border-black/[0.05] outline-none focus:border-black/20 transition-all" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
              {filteredChars.map(char => (
                <motion.div layout key={char.id}
                  onClick={() => { setSelectedCharId(char.id); setSelectedSessionId(char.sessions[0]?.id ?? null); setSelectedDialogueId(null); }}
                  className={cn("group p-3.5 rounded-2xl cursor-pointer transition-all border",
                    selectedCharId === char.id ? "bg-white border-black/[0.08] shadow-lg" : "bg-transparent border-transparent hover:bg-black/[0.02]"
                  )}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-black text-base shrink-0">
                      {char.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={cn("font-bold text-sm truncate", selectedCharId === char.id ? "text-black" : "text-gray-500")}>
                        {char.name} <span className="font-normal text-gray-400 text-xs">({char.age}세)</span>
                      </h3>
                      <p className="text-[11px] text-gray-400 truncate">{char.sessions.length}세션 · {char.sessions.reduce((a, s) => a + s.dialogues.length, 0)}대화</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setShowDeleteConfirm(char.id); }}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
              <button onClick={() => setShowNewCharModal(true)}
                className="w-full h-11 rounded-2xl border-2 border-dashed border-black/[0.05] flex items-center justify-center gap-2 text-gray-400 hover:border-black/20 hover:text-black hover:bg-black/[0.02] transition-all cursor-pointer">
                <Plus size={16} /><span className="text-sm font-bold">새 캐릭터</span>
              </button>
            </div>
          </>
        )}

        {activeTab === 'brands' && (
          <>
            <div className="p-8 pb-4">
              <h1 className="text-2xl font-bold text-black mb-1">광고 브랜드</h1>
              <p className="text-xs text-gray-400 mb-2">현재 사용 중인 브랜드 목록</p>
              <p className="text-[11px] text-gray-300">* 유저 화면에는 표시되지 않습니다</p>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
              {brands.length === 0 ? (
                <p className="text-sm text-gray-300 text-center pt-8">등록된 브랜드 없음</p>
              ) : brands.map(brand => {
                const count = characters.flatMap(c => c.sessions.flatMap(s => s.dialogues))
                  .filter(d => d.ad_brand === brand).length;
                return (
                  <div key={brand} className="p-4 rounded-2xl bg-white border border-black/[0.05] flex items-center justify-between">
                    <div>
                      <p className="font-black text-sm text-black">{brand}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">광고 대화 {count}개</p>
                    </div>
                    <span className="text-[10px] font-bold bg-black text-white px-2.5 py-1 rounded-full">AD</span>
                  </div>
                );
              })}
              <div className="mt-4 p-4 rounded-2xl bg-black/[0.02] border border-dashed border-black/[0.06]">
                <p className="text-[11px] text-gray-400 leading-relaxed">브랜드는 대화 블록의 <strong>광고 타입</strong>에서 직접 입력하면 자동으로 여기에 나타납니다.</p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'settings' && (
          <>
            <div className="p-8 pb-4">
              <h1 className="text-2xl font-bold text-black mb-1">설정</h1>
              <p className="text-xs text-gray-400">시스템 관리</p>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
              <div className="p-5 rounded-2xl bg-white border border-black/[0.05] space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">데이터베이스</p>
                <button onClick={loadData}
                  className="w-full h-10 rounded-xl bg-black/[0.04] text-sm font-bold text-gray-600 flex items-center justify-center gap-2 hover:bg-black/[0.08] cursor-pointer transition-all">
                  <RefreshCw size={14} /> 데이터 새로고침
                </button>
              </div>
              <div className="p-5 rounded-2xl bg-white border border-black/[0.05] space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">통계</p>
                <div className="grid grid-cols-2 gap-2">
                  <StatCard label="캐릭터" value={characters.length} />
                  <StatCard label="총 세션" value={characters.reduce((a, c) => a + c.sessions.length, 0)} />
                  <StatCard label="총 대화" value={characters.flatMap(c => c.sessions.flatMap(s => s.dialogues)).length} />
                  <StatCard label="광고" value={characters.flatMap(c => c.sessions.flatMap(s => s.dialogues)).filter(d => d.type === 'ad').length} />
                </div>
              </div>
            </div>
          </>
        )}
      </aside>

      {/* ── 에디터 메인 ── */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <AnimatePresence mode="wait">
          {selectedChar ? (
            <motion.div key={selectedChar.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex-1 flex flex-col h-full">

              {/* 툴바 */}
              <header className="h-16 px-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-300">
                  <Users size={13} /><span>캐릭터</span>
                  <ChevronRight size={13} />
                  <span className="text-black font-extrabold">{selectedChar.name}</span>
                  {selectedSession && <>
                    <ChevronRight size={13} />
                    <span className="text-gray-500">Session {selectedSessionIdx + 1}</span>
                  </>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={loadData} title="새로고침"
                    className="h-9 w-9 rounded-xl border border-black/[0.05] flex items-center justify-center text-gray-400 hover:bg-black/[0.04] hover:text-black transition-all cursor-pointer">
                    <RefreshCw size={14} />
                  </button>
                  <button onClick={handleExport} title="JSON 내보내기"
                    className="h-9 px-4 rounded-xl border border-black/[0.05] text-xs font-bold text-gray-500 flex items-center gap-1.5 hover:bg-black/[0.04] hover:text-black transition-all cursor-pointer">
                    <Download size={13} /> 내보내기
                  </button>
                  <div className="h-9 px-3 rounded-xl border border-green-200 bg-green-50 text-xs font-bold text-green-600 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />실시간 연동
                  </div>
                </div>
              </header>

              {/* 세션 선택 드롭다운 */}
              <div className="px-8 pb-3" ref={dropdownRef}>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 max-w-xs">
                    <button
                      onClick={() => setShowSessionDropdown(p => !p)}
                      className="w-full h-10 px-4 rounded-xl border-2 border-black/[0.08] bg-white flex items-center justify-between text-sm font-bold cursor-pointer hover:border-black/20 transition-all"
                    >
                      <span>{selectedSession ? `Session ${selectedSessionIdx + 1}` : '세션 선택'}</span>
                      <div className="flex items-center gap-2">
                        {selectedSession && (
                          <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">
                            {selectedSession.dialogues.length}개
                          </span>
                        )}
                        <ChevronDown size={14} className={cn("text-gray-400 transition-transform", showSessionDropdown && "rotate-180")} />
                      </div>
                    </button>

                    {/* 드롭다운 패널 */}
                    <AnimatePresence>
                      {showSessionDropdown && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                          className="absolute top-12 left-0 w-72 bg-white rounded-2xl shadow-2xl border border-black/[0.06] z-50 overflow-hidden">
                          <div className="p-3 border-b border-black/[0.05]">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={13} />
                              <input type="text" placeholder="세션 검색..." value={sessionSearch}
                                onChange={e => setSessionSearch(e.target.value)}
                                className="w-full h-8 pl-8 pr-3 rounded-lg text-xs bg-black/[0.04] outline-none" />
                            </div>
                          </div>
                          <div className="max-h-64 overflow-y-auto p-2">
                            {filteredSessions.map((sess, idx) => {
                              const realIdx = selectedChar.sessions.findIndex(s => s.id === sess.id);
                              return (
                                <button key={sess.id}
                                  onClick={() => { setSelectedSessionId(sess.id); setSelectedDialogueId(null); setShowSessionDropdown(false); }}
                                  className={cn("w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer",
                                    selectedSessionId === sess.id ? "bg-black text-white" : "hover:bg-black/[0.04] text-gray-700"
                                  )}>
                                  <span className="text-sm font-bold">Session {realIdx + 1}</span>
                                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md",
                                    selectedSessionId === sess.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                                  )}>{sess.dialogues.length}개</span>
                                </button>
                              );
                            })}
                          </div>
                          <div className="p-2 border-t border-black/[0.05]">
                            <button onClick={handleAddSession}
                              className="w-full h-9 rounded-xl border-2 border-dashed border-black/[0.08] flex items-center justify-center gap-2 text-gray-400 hover:text-black hover:border-black/20 text-xs font-bold cursor-pointer transition-all">
                              <Plus size={14} /> 새 세션 추가
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 현재 세션 삭제 */}
                  {selectedSession && (
                    <button onClick={() => handleDeleteSession(selectedSession.id)}
                      className="h-10 w-10 rounded-xl border border-black/[0.05] flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer"
                      title="현재 세션 삭제">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* 대화 목록 */}
              <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-3">
                {!selectedSession ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-300 gap-3">
                    <Layers size={40} strokeWidth={1} />
                    <p className="text-sm font-bold">세션을 선택하거나 새로 추가하세요</p>
                    <button onClick={handleAddSession}
                      className="h-10 px-6 rounded-2xl bg-black text-white text-xs font-bold cursor-pointer hover:bg-gray-800 transition-all">
                      + 첫 세션 추가
                    </button>
                  </div>
                ) : (
                  <>
                    {selectedSession.dialogues.map(dlg => (
                      <DialogueCard key={dlg.id} dlg={dlg}
                        active={selectedDialogueId === dlg.id}
                        saving={savingId === dlg.id}
                        onSelect={() => setSelectedDialogueId(dlg.id)}
                        onDelete={() => handleDeleteDialogue(dlg.id)}
                      />
                    ))}
                    <button onClick={handleAddDialogue}
                      className="w-full p-6 rounded-[28px] border-2 border-dashed border-black/[0.05] flex items-center justify-center gap-3 text-gray-300 hover:bg-black/[0.02] hover:border-black/[0.1] hover:text-gray-500 transition-all cursor-pointer group">
                      <div className="w-10 h-10 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus size={18} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest">대화 블록 추가</span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-12 text-center">
              <div className="w-24 h-24 rounded-[40px] bg-black/[0.03] flex items-center justify-center mb-6 text-gray-200">
                <Users size={48} strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">캐릭터를 선택하세요</h2>
              <p className="text-sm text-gray-400 max-w-xs">왼쪽에서 캐릭터를 선택하면 대화를 편집할 수 있어요.</p>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* ── 오른쪽 속성 패널 ── */}
      <aside className="w-96 bg-white shrink-0 flex flex-col h-full border-l border-black/[0.04]">
        <header className="h-16 px-8 flex items-center shrink-0">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            {selectedDialogue ? '대화 편집' : selectedChar ? '캐릭터 정보' : '상세 보기'}
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {selectedDialogue ? (
              <motion.div key={selectedDialogue.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-7">

                {/* 타입 */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">타입</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['normal', 'ad', 'quiz'] as DialogueType[]).map(t => (
                      <TypeButton key={t} type={t} active={selectedDialogue.type === t} onClick={() => handleUpdateDialogue({ type: t })} />
                    ))}
                  </div>
                </div>

                {/* 텍스트 */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">대화 텍스트</label>
                  <textarea
                    className="w-full rounded-2xl p-4 text-sm leading-relaxed h-36 resize-none text-black bg-black/[0.03] border border-black/[0.06] outline-none focus:border-black/20 transition-all"
                    value={selectedDialogue.text}
                    onChange={e => handleUpdateDialogue({ text: e.target.value })}
                    placeholder="캐릭터가 말할 내용..."
                  />
                </div>

                {/* 광고 브랜드 */}
                {selectedDialogue.type === 'ad' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">광고 브랜드</label>
                      <span className="text-[9px] font-bold bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">유저에게 비공개</span>
                    </div>
                    <input type="text"
                      className="w-full h-11 px-4 rounded-xl text-sm font-black uppercase tracking-widest bg-black/[0.03] border border-black/[0.06] outline-none focus:border-black/20 transition-all"
                      value={selectedDialogue.ad_brand || ''}
                      onChange={e => handleUpdateDialogue({ ad_brand: e.target.value })}
                      placeholder="e.g. ROUNDLAB"
                    />
                    {/* 기존 브랜드 빠른 선택 */}
                    {brands.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {brands.map(b => (
                          <button key={b} onClick={() => handleUpdateDialogue({ ad_brand: b })}
                            className={cn("text-[10px] font-black px-2.5 py-1 rounded-full cursor-pointer transition-all",
                              selectedDialogue.ad_brand === b ? "bg-black text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            )}>
                            {b}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 퀴즈 옵션 */}
                {selectedDialogue.type === 'quiz' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">퀴즈 선택지 (정답 클릭)</label>
                    <div className="space-y-2">
                      {(selectedDialogue.quiz_options || ['', '', '', '']).map((opt, idx) => (
                        <div key={idx} className="relative flex items-center">
                          <input
                            className={cn("w-full h-11 pl-12 pr-4 rounded-xl text-sm font-bold border outline-none transition-all",
                              selectedDialogue.quiz_answer === idx ? "border-black bg-black text-white" : "bg-black/[0.03] border-black/[0.06] focus:border-black/20"
                            )}
                            value={opt}
                            placeholder={`선택지 ${idx + 1}`}
                            onChange={e => {
                              const opts = [...(selectedDialogue.quiz_options || ['', '', '', ''])];
                              opts[idx] = e.target.value;
                              handleUpdateDialogue({ quiz_options: opts });
                            }}
                          />
                          <button
                            className={cn("absolute left-3 w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                              selectedDialogue.quiz_answer === idx ? "text-white" : "bg-black/[0.05] text-gray-400 hover:text-black"
                            )}
                            onClick={() => handleUpdateDialogue({ quiz_answer: idx })}>
                            <CheckCircle2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* 저장 상태 */}
                <div className="flex items-center gap-2 text-xs text-gray-300 pt-2">
                  {savingId === selectedDialogue.id
                    ? <><RefreshCw size={11} className="animate-spin" /> 저장 중...</>
                    : <><Save size={11} /> 자동 저장됨</>}
                </div>
              </motion.div>

            ) : selectedChar ? (
              <motion.div key="char-edit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                <CharFieldEditor label="이름" value={selectedChar.name} onSave={v => handleUpdateCharField('name', v)} />
                <CharFieldEditor label="나이" value={String(selectedChar.age)} onSave={v => handleUpdateCharField('age', Number(v))} type="number" />
                <CharFieldEditor label="소개" value={selectedChar.bio} onSave={v => handleUpdateCharField('bio', v)} multiline />
                <CharFieldEditor label="이미지 URL" value={selectedChar.image_url} onSave={v => handleUpdateCharField('image_url', v)} />
                <CharFieldEditor label="배경 이미지 URL" value={selectedChar.bg_image_url} onSave={v => handleUpdateCharField('bg_image_url', v)} />

                <div className="pt-4 border-t border-black/[0.05]">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">통계</p>
                  <div className="grid grid-cols-2 gap-2">
                    <StatCard label="세션" value={selectedChar.sessions.length} />
                    <StatCard label="총 대화" value={selectedChar.sessions.reduce((a, s) => a + s.dialogues.length, 0)} />
                    <StatCard label="광고" value={selectedChar.sessions.flatMap(s => s.dialogues).filter(d => d.type === 'ad').length} />
                    <StatCard label="퀴즈" value={selectedChar.sessions.flatMap(s => s.dialogues).filter(d => d.type === 'quiz').length} />
                  </div>
                </div>

                <div className="pt-2">
                  <button onClick={handleExport}
                    className="w-full h-11 rounded-2xl border-2 border-black/[0.06] text-sm font-bold text-gray-500 flex items-center justify-center gap-2 hover:bg-black/[0.03] hover:text-black cursor-pointer transition-all">
                    <Download size={14} /> JSON 내보내기
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 pt-12">
                <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-200">
                  <Layers size={40} strokeWidth={1} />
                </div>
                <p className="text-xs font-bold text-gray-300 uppercase tracking-widest leading-loose">
                  캐릭터 선택 후<br />대화 블록을 클릭하세요
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </aside>
    </div>
  );
}

// ─── 서브 컴포넌트 ────────────────────────────────────────────────

function SidebarIcon({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={cn("relative w-full h-12 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer",
        active ? "bg-white/10 text-white" : "text-white/30 hover:text-white hover:bg-white/5"
      )}>
      <Icon size={20} strokeWidth={2} />
      <span className="text-[8px] font-bold uppercase tracking-wider">{label}</span>
      {active && <motion.div layoutId="sidebarActive" className="absolute -right-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-l-full" />}
    </button>
  );
}

function DialogueCard({ dlg, active, saving, onSelect, onDelete }: {
  dlg: Dialogue; active: boolean; saving: boolean; onSelect: () => void; onDelete: () => void;
}) {
  const typeStyles = {
    normal: { icon: MessageSquare, color: "text-gray-400", bg: "bg-gray-100", label: "일반" },
    ad: { icon: Megaphone, color: "text-black", bg: "bg-gray-200", label: "광고" },
    quiz: { icon: HelpCircle, color: "text-black", bg: "bg-gray-300", label: "퀴즈" },
  };
  const config = typeStyles[dlg.type];
  return (
    <motion.div layout onClick={onSelect}
      className={cn("group min-h-[80px] rounded-[24px] p-5 flex items-center gap-4 cursor-pointer transition-all border-2",
        active ? "bg-white border-black/[0.08] shadow-xl -translate-y-0.5" : "bg-white/50 border-transparent hover:border-black/[0.05] hover:bg-white/80"
      )}>
      <div className="w-4 text-gray-200 group-hover:text-gray-400 shrink-0"><GripVertical size={16} /></div>
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", config.bg, config.color)}>
        <config.icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-gray-300 font-mono">#{String(dlg.order).padStart(2, '0')}</span>
          <span className={cn("text-[10px] font-black uppercase tracking-widest", config.color)}>{config.label}</span>
          {dlg.type === 'ad' && dlg.ad_brand && (
            <span className="text-[9px] font-black bg-black text-white px-2 py-0.5 rounded-full">{dlg.ad_brand}</span>
          )}
          {saving && <RefreshCw size={10} className="text-gray-300 animate-spin ml-auto" />}
        </div>
        <p className={cn("text-sm font-bold truncate", active ? "text-black" : "text-gray-500")}>{dlg.text}</p>
      </div>
      <button onClick={e => { e.stopPropagation(); onDelete(); }}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-200 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shrink-0">
        <Trash2 size={14} />
      </button>
    </motion.div>
  );
}

function TypeButton({ type, active, onClick }: { type: DialogueType; active: boolean; onClick: () => void }) {
  const labels: Record<DialogueType, string> = { normal: '일반', ad: '광고', quiz: '퀴즈' };
  const icons: Record<DialogueType, any> = { normal: MessageSquare, ad: Megaphone, quiz: HelpCircle };
  const Icon = icons[type];
  return (
    <button onClick={onClick}
      className={cn("flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl transition-all border-2 cursor-pointer",
        active ? "bg-black border-black text-white shadow-lg" : "border-transparent bg-black/[0.02] text-gray-400 hover:bg-black/[0.05]"
      )}>
      <Icon size={16} />
      <span className="text-[10px] font-bold uppercase tracking-widest">{labels[type]}</span>
    </button>
  );
}

function CharFieldEditor({ label, value, onSave, multiline, type }: {
  label: string; value: string; onSave: (v: string) => void; multiline?: boolean; type?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  useEffect(() => { setVal(value); }, [value]);
  if (editing) return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{label}</label>
      {multiline
        ? <textarea autoFocus className="w-full rounded-xl p-3 text-sm bg-black/[0.03] border border-black/20 outline-none resize-none h-20" value={val} onChange={e => setVal(e.target.value)} />
        : <input autoFocus type={type || 'text'} className="w-full h-10 px-3 rounded-xl text-sm bg-black/[0.03] border border-black/20 outline-none" value={val} onChange={e => setVal(e.target.value)} />
      }
      <div className="flex gap-2">
        <button onClick={() => { onSave(val); setEditing(false); }} className="flex-1 h-9 rounded-xl bg-black text-white text-xs font-bold cursor-pointer">저장</button>
        <button onClick={() => { setVal(value); setEditing(false); }} className="flex-1 h-9 rounded-xl bg-gray-100 text-xs font-bold cursor-pointer">취소</button>
      </div>
    </div>
  );
  return (
    <div className="group flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-medium text-black truncate">{value || <span className="text-gray-300">없음</span>}</p>
      </div>
      <button onClick={() => setEditing(true)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-black hover:bg-black/[0.05] cursor-pointer opacity-0 group-hover:opacity-100 shrink-0">
        <Edit3 size={13} />
      </button>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-black/[0.03] rounded-xl p-3">
      <p className="text-xl font-black text-black">{value}</p>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{label}</p>
    </div>
  );
}

function NewCharacterModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (data: Omit<Character, 'sessions' | 'created_at' | 'updated_at' | 'order'>) => void;
}) {
  const [form, setForm] = useState({ id: '', name: '', age: 20, bio: '', image_url: '/char.png', bg_image_url: '/back.png' });
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[900] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[32px] p-8 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-black text-lg">새 캐릭터</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-300 hover:text-black hover:bg-black/[0.05] cursor-pointer"><X size={16} /></button>
        </div>
        <div className="space-y-4">
          {[
            { key: 'id', label: 'ID (영문 고유값)', placeholder: 'e.g. jisoo' },
            { key: 'name', label: '이름', placeholder: '지수' },
            { key: 'bio', label: '소개', placeholder: '한 줄 소개...' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{label}</label>
              <input className="w-full h-10 px-3 rounded-xl text-sm bg-black/[0.03] border border-black/[0.05] outline-none focus:border-black/20 transition-all"
                placeholder={placeholder} value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">나이</label>
            <input type="number" className="w-full h-10 px-3 rounded-xl text-sm bg-black/[0.03] border border-black/[0.05] outline-none focus:border-black/20"
              value={form.age} onChange={e => setForm(p => ({ ...p, age: Number(e.target.value) }))} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 h-12 rounded-2xl border-2 border-black/5 text-sm font-bold text-gray-500 hover:bg-black/5 cursor-pointer">취소</button>
          <button onClick={() => { if (form.id && form.name) onCreate(form); }}
            disabled={!form.id || !form.name}
            className="flex-1 h-12 rounded-2xl bg-black text-white text-sm font-bold hover:bg-gray-800 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
            생성
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
