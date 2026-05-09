import { Calendar } from 'lucide-react';
import RingProgress from './RingProgress';
import { motion } from 'motion/react';
import { T, POINT } from '../lib/theme';
import type { Theme } from '../lib/theme';

interface HomeProps {
  count: number;
  totalCount: number;
  weekCounts: number[];
  onStart: () => void;
  theme: Theme;
}

export default function Home({ count, totalCount, weekCounts, onStart, theme }: HomeProps) {
  const tk = T[theme];
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const todayIndex = (new Date().getDay() + 6) % 7;
  const maxWeek = Math.max(...weekCounts, 1);

  return (
    <div className={`flex flex-col h-full ${tk.bg} ${tk.text} p-6 overflow-y-auto pb-24`}>
      {/* 헤더 */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="IMBY" className="w-[50px] h-[50px] object-contain" />
          <div>
            <h1 className={`text-[10px] font-bold ${tk.textMuted} uppercase tracking-[0.2em] mb-1`}>
              {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
            </h1>
            <h2 className="text-3xl font-extrabold tracking-tight">활동 요약</h2>
          </div>
        </div>
        <button className={`${tk.card} p-3 rounded-2xl`}>
          <Calendar className={tk.textMuted.replace('text-', 'text-')} size={20} />
        </button>
      </header>

      {/* 주간 막대 그래프 */}
      <div className={`flex justify-between items-end mb-6 ${tk.card} p-6 rounded-[2.5rem] gap-2`}>
        {days.map((day, i) => {
          const h = weekCounts[i] ? Math.max((weekCounts[i] / maxWeek) * 48, 8) : 4;
          const isToday = i === todayIndex;
          return (
            <div key={day} className="flex flex-col items-center flex-1">
              <motion.div
                className={`w-full rounded-full mb-2 ${isToday ? tk.barActive : tk.barInactive}`}
                style={isToday && theme === 'light' ? { height: h, backgroundColor: POINT } : { height: h }}
                animate={{ height: h }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
              <span className={`text-[10px] font-bold ${isToday ? tk.dayActive : tk.dayInactive}`}>{day}</span>
            </div>
          );
        })}
      </div>

      {/* 메인 링 */}
      <div className={`flex flex-col items-center justify-center py-10 ${tk.card} rounded-[3rem] mb-6 shadow-sm`}>
        <RingProgress current={count} total={5} size={200} strokeWidth={24} theme={theme} />
        <div className="mt-8 text-center">
          <p className={`${tk.textMuted} text-[10px] font-bold uppercase tracking-[0.25em] mb-2`}>오늘의 대화</p>
          <p className="text-5xl font-black tracking-tighter">
            {count} <span className={`text-xl ${tk.textFaint} font-medium`}>/ 5</span>
          </p>
          <p className={`${tk.textFaint} text-xs mt-2 font-medium`}>
            {count >= 5 ? '🎉 오늘 목표 달성!' : `${5 - count}개 남았어요`}
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`p-7 ${tk.card} rounded-[2.5rem]`}>
          <p className={`${tk.textMuted} text-[10px] font-bold uppercase tracking-[0.1em]`}>누적 대화</p>
          <p className="text-2xl font-bold mt-2 tracking-tight">
            {totalCount} <span className={`text-xs font-normal ${tk.textFaint} italic ml-1 font-mono`}>Total</span>
          </p>
        </div>
        <div className={`p-7 ${tk.card} rounded-[2.5rem]`}>
          <p className={`${tk.textMuted} text-[10px] font-bold uppercase tracking-[0.1em]`}>주간 합계</p>
          <p className="text-2xl font-bold mt-2 tracking-tight">
            {weekCounts.reduce((a, b) => a + b, 0)}{' '}
            <span className={`text-xs font-normal ${tk.textFaint} italic ml-1 font-mono`}>This week</span>
          </p>
        </div>
      </div>

      {/* 대화 시작 버튼 */}
      <button
        onClick={onStart}
        className="w-full py-5 rounded-[2rem] font-black text-base tracking-tight transition-all active:scale-[0.98] shadow-lg"
        style={{ backgroundColor: POINT, color: 'white' }}
      >
        대화 시작하기
      </button>
    </div>
  );
}
