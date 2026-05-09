import { Bell, ChevronRight, Wallet, History, Gift, Ticket, Phone, X, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { submitLuckyDraw, hasEnteredThisWeek, getCurrentWeek } from '../lib/supabase';
import { T, POINT } from '../lib/theme';
import type { Theme } from '../lib/theme';
import { KakaoUser } from './AuthCallback';

interface CreditProps {
  credits: number;
  todayCount: number;
  user: KakaoUser;
  theme: Theme;
}

const DAILY_GOAL = 5;

type DrawStep = 'idle' | 'phone' | 'confirm' | 'done' | 'already';

export default function Credit({ credits, todayCount, user, theme }: CreditProps) {
  const tk = T[theme];
  const [showDraw, setShowDraw] = useState(false);
  const [drawStep, setDrawStep] = useState<DrawStep>('idle');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alreadyEntered, setAlreadyEntered] = useState(false);
  const isEligible = todayCount >= DAILY_GOAL;

  // 이번 주 응모 여부 확인
  useEffect(() => {
    if (user?.id) {
      hasEnteredThisWeek(String(user.id)).then(setAlreadyEntered);
    }
  }, [user]);

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  };

  const handleOpen = async () => {
    if (!isEligible) return;
    const entered = await hasEnteredThisWeek(String(user.id));
    setAlreadyEntered(entered);
    setDrawStep(entered ? 'already' : 'idle');
    setShowDraw(true);
  };

  const handlePhoneNext = () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 11 || !digits.startsWith('01')) {
      setPhoneError('올바른 휴대폰 번호를 입력해주세요');
      return;
    }
    setPhoneError('');
    setDrawStep('confirm');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitLuckyDraw({
        user_id: String(user.id),
        nickname: user.nickname,
        phone: phone.replace(/\D/g, ''),
        week: getCurrentWeek(),
      });
      setAlreadyEntered(true);
      setDrawStep('done');
    } catch {
      setPhoneError('이미 응모하셨거나 오류가 발생했어요.');
      setDrawStep('phone');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowDraw(false);
    setTimeout(() => {
      setDrawStep('idle');
      setPhone('');
      setPhoneError('');
    }, 400);
  };

  return (
    <div className={`flex flex-col h-full ${tk.bg} ${tk.text} p-6 overflow-y-auto pb-24 font-sans`}>
      <header className="flex items-center justify-between mb-10">
        <div className="relative">
          <Bell size={24} className={tk.text} />
          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ backgroundColor: POINT }} />
        </div>
      </header>

      {/* 포인트 */}
      <div className="mb-10 px-2 group cursor-pointer">
        <p className={`text-sm font-bold ${tk.textMuted} uppercase tracking-[0.1em] mb-2`}>대화 포인트</p>
        <div className="flex items-baseline space-x-2">
          <h2 className="text-6xl font-black tracking-tighter">
            {credits.toLocaleString()} <span className="text-2xl text-white/30 font-medium">P</span>
          </h2>
          <ChevronRight size={24} className={`${tk.textFaint} group-hover:translate-x-1 transition-transform`} />
        </div>
        <div className="mt-4 flex items-center space-x-2 text-white/40">
          <span className={`text-xs font-bold border-b ${theme === "light" ? "border-gray-200" : "border-white/10"} pb-0.5`}>대화당 100P 추가 적립 중</span>
          <ChevronRight size={14} />
        </div>
      </div>

      {/* Savings */}
      <div className="bg-white rounded-[2.5rem] p-8 mb-8 text-black shadow-2xl">
        <div className="flex justify-between items-start mb-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Savings</p>
            <h3 className="text-3xl font-black tracking-tighter">
              {(credits * 0.1).toFixed(2)} <span className="text-lg font-medium opacity-30">P</span>
            </h3>
          </div>
          <div className="bg-black/5 p-3 rounded-2xl">
            <Wallet size={20} className="text-black" />
          </div>
        </div>
        <p className="text-[10px] font-bold py-2 px-3 bg-black/5 inline-block rounded-lg opacity-60">
          Bonus: 10.00% APY
        </p>
      </div>

      {/* 포인트 관리 */}
      <div className="mb-6">
        <h3 className={`text-xl font-black tracking-tight mb-6 px-2 ${tk.text}`}>포인트 관리</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white hover:bg-gray-100 transition-colors p-6 rounded-[2rem] text-black shadow-xl cursor-pointer">
            <div className="bg-black p-2.5 rounded-xl inline-block mb-4 shadow-lg shadow-black/20">
              <Gift size={20} className="text-white" />
            </div>
            <p className="font-bold text-sm">기프트 샵</p>
          </div>
          <div className={`${tk.card} p-6 rounded-[2rem] ${tk.text} hover:opacity-80 transition-colors cursor-pointer`}>
            <div className={`${tk.surface} p-2.5 rounded-xl inline-block mb-4`}>
              <History size={20} className={tk.text} />
            </div>
            <p className="font-bold text-sm">적립 내역</p>
          </div>
        </div>
      </div>

      {/* 럭키드로우 */}
      <div className="mb-4">
        <h3 className={`text-xl font-black tracking-tight mb-4 px-2 ${tk.text}`}>럭키드로우</h3>

        {/* 진행도 */}
        <div className={`${tk.card} rounded-[2rem] p-5 mb-4`}>
          <div className="flex justify-between items-center mb-3">
            <span className={`text-xs font-bold ${tk.textMuted} uppercase tracking-widest`}>오늘 대화</span>
            <span className={`text-xs font-black ${tk.text}`}>
              {todayCount} <span className={tk.textMuted}>/ {DAILY_GOAL}</span>
            </span>
          </div>
          <div className={`h-1.5 ${theme === "light" ? "bg-gray-100" : "bg-white/10"} rounded-full overflow-hidden`}>
            <motion.div
              className="h-full rounded-full" style={{ backgroundColor: POINT }}
              animate={{ width: `${Math.min((todayCount / DAILY_GOAL) * 100, 100)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <p className={`text-[11px] ${tk.textFaint} mt-2 font-medium`}>
            {isEligible
              ? alreadyEntered
                ? '✅ 이번 주 응모 완료! 결과는 SMS로 안내드려요.'
                : '🎉 오늘 목표 달성! 럭키드로우에 응모할 수 있어요.'
              : `${DAILY_GOAL - todayCount}개 더 대화하면 응모 가능`}
          </p>
        </div>

        {/* 드로우 카드 */}
        <motion.div
          onClick={handleOpen}
          whileTap={isEligible && !alreadyEntered ? { scale: 0.97 } : {}}
          className={`relative rounded-[2rem] p-7 overflow-hidden transition-all ${
            alreadyEntered
              ? 'bg-white/5 border border-white/10 cursor-default'
              : isEligible
              ? 'bg-white cursor-pointer hover:scale-[1.01]'
              : 'bg-white/5 border border-white/10 cursor-not-allowed'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${isEligible && !alreadyEntered ? 'text-black/40' : 'text-white/20'}`}>
                Lucky Draw
              </p>
              <h4 className={`text-xl font-black tracking-tight leading-tight ${isEligible && !alreadyEntered ? 'text-black' : 'text-white/30'}`}>
                {alreadyEntered ? '이번 주 응모 완료' : '이번 주 경품에\n응모해보세요'}
              </h4>
              <p className={`text-xs font-bold mt-3 ${isEligible && !alreadyEntered ? 'text-black/40' : 'text-white/20'}`}>
                {alreadyEntered
                  ? '매주 금요일 추첨 · SMS 발표'
                  : isEligible
                  ? '탭해서 응모하기 →'
                  : `일일 대화 ${DAILY_GOAL}개 달성 후 응모 가능`}
              </p>
            </div>
            <div className={`p-4 rounded-2xl ${isEligible && !alreadyEntered ? 'bg-black' : 'bg-white/10'}`}>
              {alreadyEntered
                ? <Check size={28} className="text-white/40" />
                : <Ticket size={28} className={isEligible ? 'text-white' : 'text-white/20'} />}
            </div>
          </div>
        </motion.div>
      </div>

      {/* 럭키드로우 바텀시트 모달 */}
      <AnimatePresence>
        {showDraw && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.85)' }}
            onClick={handleClose}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-t-[2.5rem] p-8 pb-12"
            >
              {/* 핸들 + 닫기 */}
              <div className="flex items-center justify-between mb-8">
                <div className="w-10 h-1 bg-black/10 rounded-full mx-auto" />
                <button onClick={handleClose} className="absolute right-8 top-8 p-2 bg-black/5 rounded-full">
                  <X size={16} className="text-black/40" />
                </button>
              </div>

              <AnimatePresence mode="wait">

                {/* 이미 응모 */}
                {drawStep === 'already' && (
                  <motion.div key="already" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <div className="text-5xl mb-4">✅</div>
                    <h3 className="text-2xl font-black text-black tracking-tight mb-2">이번 주 응모 완료!</h3>
                    <p className="text-black/40 text-sm font-medium mb-8">
                      매주 금요일 추첨 후<br />등록하신 번호로 SMS를 발송해드려요.
                    </p>
                    <button onClick={handleClose} className="w-full bg-black text-white py-5 rounded-2xl font-black text-base active:scale-[0.98] transition-transform">
                      확인
                    </button>
                  </motion.div>
                )}

                {/* 전화번호 입력 */}
                {drawStep === 'idle' && (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <div className="text-5xl mb-4">🎟️</div>
                    <h3 className="text-2xl font-black text-black tracking-tight mb-2">럭키드로우 응모</h3>
                    <p className="text-black/40 text-sm font-medium mb-8">
                      매주 금요일 추첨 후<br />당첨자에게 SMS로 안내드려요.
                    </p>
                    <div className="text-left mb-3">
                      <label className="text-xs font-black text-black/40 uppercase tracking-widest mb-2 block">
                        SMS 수신 번호
                      </label>
                      <div className="flex items-center gap-3 bg-black/5 rounded-2xl px-5 py-4">
                        <Phone size={18} className="text-black/30 flex-shrink-0" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            setPhone(formatPhone(e.target.value));
                            setPhoneError('');
                          }}
                          placeholder="010-0000-0000"
                          className="flex-1 bg-transparent text-black font-bold text-base outline-none placeholder-black/20"
                        />
                      </div>
                      {phoneError && (
                        <p className="text-red-500 text-xs font-bold mt-2">{phoneError}</p>
                      )}
                    </div>
                    <p className="text-black/25 text-xs font-medium mb-6 text-left">
                      번호는 추첨 결과 안내에만 사용되며 이후 즉시 삭제됩니다.
                    </p>
                    <button
                      onClick={handlePhoneNext}
                      className="w-full bg-black text-white py-5 rounded-2xl font-black text-base active:scale-[0.98] transition-transform"
                    >
                      다음
                    </button>
                  </motion.div>
                )}

                {/* 확인 */}
                {drawStep === 'confirm' && (
                  <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
                    <div className="text-5xl mb-4">📱</div>
                    <h3 className="text-2xl font-black text-black tracking-tight mb-2">응모 확인</h3>
                    <p className="text-black/40 text-sm font-medium mb-8">아래 정보로 응모할게요.</p>
                    <div className="bg-black/5 rounded-2xl p-5 mb-6 text-left space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-black/30 uppercase tracking-widest">이름</span>
                        <span className="font-black text-black text-sm">{user.nickname}</span>
                      </div>
                      <div className="h-px bg-black/5" />
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-black/30 uppercase tracking-widest">연락처</span>
                        <span className="font-black text-black text-sm">{phone}</span>
                      </div>
                      <div className="h-px bg-black/5" />
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-black/30 uppercase tracking-widest">추첨일</span>
                        <span className="font-black text-black text-sm">매주 금요일</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setDrawStep('idle')}
                        className="flex-1 py-4 rounded-2xl border border-black/10 font-black text-sm text-black/40 active:scale-[0.98] transition-transform"
                      >
                        수정
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-2 flex-grow py-4 rounded-2xl bg-black text-white font-black text-sm active:scale-[0.98] transition-transform disabled:opacity-50"
                      >
                        {submitting ? '응모 중...' : '응모하기 🎲'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 완료 */}
                {drawStep === 'done' && (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                    <div className="text-5xl mb-4">🎉</div>
                    <h3 className="text-2xl font-black text-black tracking-tight mb-2">응모 완료!</h3>
                    <p className="text-black/40 text-sm font-medium mb-8">
                      매주 금요일 추첨 후<br /><span className="font-black text-black">{phone}</span>으로<br />결과를 안내드릴게요.
                    </p>
                    <button onClick={handleClose} className="w-full bg-black text-white py-5 rounded-2xl font-black text-base active:scale-[0.98] transition-transform">
                      확인
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
