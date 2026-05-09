import { Character } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { ChevronRight, ChevronLeft, Heart } from 'lucide-react';
import { T, POINT } from '../lib/theme';
import type { Theme } from '../lib/theme';

interface SwipeSelectionProps {
  characters: Character[];
  onSelect: (character: Character) => void;
  theme: Theme;
}

export default function SwipeSelection({ characters, onSelect, theme }: SwipeSelectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const tk = T[theme];

  if (!characters.length) return (
    <div className={`flex flex-col items-center justify-center h-full ${tk.bg} ${tk.textMuted}`}>
      <p className="text-sm font-bold">캐릭터를 불러오는 중...</p>
    </div>
  );

  const handleNext = () => { setDirection(1); setCurrentIndex(p => (p + 1) % characters.length); };
  const handlePrev = () => { setDirection(-1); setCurrentIndex(p => (p - 1 + characters.length) % characters.length); };
  const current = characters[currentIndex];

  return (
    <div className={`flex flex-col items-center justify-center h-full ${tk.bg} p-4 overflow-hidden`}>
      <h2 className={`mb-6 text-xl font-bold ${tk.text} tracking-tight`}>친구를 선택하세요</h2>

      <div className="relative w-full max-w-[300px] aspect-[3/4.2]">
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={current.id}
            custom={direction}
            initial={{ opacity: 0, scale: 0.9, x: direction * 120 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: direction * -120 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={() => onSelect(current)}
            className={`absolute inset-0 ${theme === 'light' ? 'bg-gray-100' : 'bg-[#111]'} rounded-[2.5rem] overflow-hidden ${tk.surfaceBorder} shadow-2xl cursor-pointer group`}
          >
            <img src={current.image} alt={current.name}
              className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer" />
            <div className={`absolute inset-0 bg-gradient-to-t ${theme === 'light' ? 'from-white/95 via-white/20 to-transparent' : 'from-black via-black/20 to-transparent'}`} />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h3 className={`text-3xl font-bold ${tk.text}`}>
                {current.name} <span className={`text-lg font-normal ${tk.textMuted} ml-1`}>{current.age}</span>
              </h3>
              <p className={`mt-2 text-sm ${tk.textMuted} line-clamp-2 leading-relaxed`}>{current.bio}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 인디케이터 */}
      <div className="flex gap-1.5 mt-6">
        {characters.map((_, i) => (
          <div key={i} className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === currentIndex ? 20 : 6,
              backgroundColor: i === currentIndex ? POINT : (theme === 'light' ? '#D1D5DB' : 'rgba(255,255,255,0.2)')
            }} />
        ))}
      </div>

      <div className="flex items-center mt-6 space-x-4">
        <button onClick={handlePrev}
          className={`p-5 transition-all ${tk.card} rounded-full hover:opacity-80 ${tk.text}`}>
          <ChevronLeft size={20} />
        </button>
        <button onClick={() => onSelect(current)}
          className="flex items-center px-10 py-5 space-x-3 transition-all rounded-full hover:scale-105 active:scale-95 font-bold shadow-xl z-50 text-white"
          style={{ backgroundColor: POINT }}>
          <Heart size={20} fill="white" />
          <span>선택하기</span>
        </button>
        <button onClick={handleNext}
          className={`p-5 transition-all ${tk.card} rounded-full hover:opacity-80 ${tk.text}`}>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
