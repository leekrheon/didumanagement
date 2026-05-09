import { Bookmark, Search, X, Share2 } from 'lucide-react';
import { ScrapItem } from '../types';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { T, POINT } from '../lib/theme';
import type { Theme } from '../lib/theme';

interface ScrapProps {
  items: ScrapItem[];
  onDelete: (id: string) => void;
  theme: Theme;
}

export default function Scrap({ items, onDelete, theme }: ScrapProps) {
  const [query, setQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const tk = T[theme];

  const filtered = items.filter(item => item.text.includes(query) || item.characterName.includes(query));

  return (
    <div className={`flex flex-col h-full ${tk.bg} ${tk.text} p-6 overflow-y-auto pb-24 font-sans`}>
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-black tracking-tight">스크랩</h2>
        <button onClick={() => setShowSearch(v => !v)}
          className={`${tk.card} p-3 rounded-2xl ${tk.textMuted} hover:opacity-80 transition-colors`}>
          <Search size={20} />
        </button>
      </header>

      <AnimatePresence>
        {showSearch && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4">
            <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
              placeholder="대화 내용 검색..."
              className={`w-full ${tk.input} rounded-2xl px-5 py-3 text-sm font-medium outline-none transition-colors`} />
          </motion.div>
        )}
      </AnimatePresence>

      {items.length > 0 && (
        <p className={`${tk.textMuted} text-xs font-bold uppercase tracking-widest mb-4`}>{filtered.length}개의 대화</p>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 pb-20">
          <div className={`w-20 h-20 ${tk.card} rounded-[2.5rem] flex items-center justify-center mb-4`}>
            <Bookmark size={32} className={tk.textFaint} />
          </div>
          <p className={`${tk.textMuted} text-sm font-bold`}>저장된 대화가 없어요</p>
          <p className={`${tk.textFaint} text-xs mt-1`}>대화 중 북마크 버튼을 눌러보세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <motion.div key={item.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`${tk.card} rounded-[2rem] p-5 relative group`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-black"
                      style={{ backgroundColor: POINT }}>
                      {item.characterName[0]}
                    </div>
                    <span className={`text-xs font-bold ${tk.textMuted}`}>{item.characterName} · {item.date}</span>
                  </div>
                  <p className={`text-sm font-bold leading-relaxed ${tk.text}`}>{item.text}</p>
                </div>
                <button onClick={() => onDelete(item.id)}
                  className={`opacity-0 group-hover:opacity-100 p-2 ${tk.surface} rounded-xl ${tk.textMuted} hover:text-red-500 transition-all shrink-0`}>
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
