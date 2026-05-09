// ─── 테마 정의 ────────────────────────────────────────────────────
export type Theme = 'dark' | 'light';

export const THEME_KEY = 'imby_theme';

export function loadTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {}
  return 'light'; // 기본값: 라이트
}

export function saveTheme(theme: Theme) {
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
}

// ─── 테마별 토큰 ──────────────────────────────────────────────────
export const POINT = '#00BE00'; // 포인트 컬러

export const T = {
  dark: {
    bg: 'bg-black',
    bgColor: '#000000',
    surface: 'bg-white/5',
    surfaceBorder: 'border border-white/10',
    card: 'bg-white/5 border border-white/10',
    text: 'text-white',
    textMuted: 'text-white/40',
    textFaint: 'text-white/20',
    input: 'bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-white/30',
    navBg: 'bg-black border-t border-white/5',
    navActive: 'text-white',
    navInactive: 'text-white/20',
    navMainActive: 'border-white bg-white text-black',
    navMainInactive: 'border-white/10 bg-white/5 text-white',
    btnPrimary: 'bg-white text-black',
    btnSecondary: 'bg-white/10 border border-white/10 text-white',
    progressBg: 'rgba(255,255,255,0.05)',
    progressStroke: '#ffffff',
    barActive: 'bg-white',
    barInactive: 'bg-white/15',
    dayActive: 'text-white',
    dayInactive: 'text-white/20',
    tagBg: 'bg-black text-white',
    dialogueBg: 'bg-white/95',
    dialogueText: 'text-black',
    nextBtn: 'bg-black text-white',
    nextBtnDisabled: 'bg-black/10 text-black/20',
    quizCorrect: 'bg-black text-white border-black',
    quizWrong: 'bg-red-100 text-red-500 border-red-200',
    quizDefault: 'bg-black/5 text-black border-black/10 hover:bg-black/10',
    quizFaded: 'bg-black/5 text-black/30 border-black/5',
    adBadge: 'bg-white/10 border-white/20 text-white/60',
    exitBtn: 'bg-black/40 border-white/10 text-white hover:bg-black/60',
  },
  light: {
    bg: 'bg-[#F5F6FA]',
    bgColor: '#F5F6FA',
    surface: 'bg-white',
    surfaceBorder: 'border border-gray-100',
    card: 'bg-white border border-gray-100 shadow-sm',
    text: 'text-gray-900',
    textMuted: 'text-gray-400',
    textFaint: 'text-gray-300',
    input: 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-300 focus:border-gray-400',
    navBg: 'bg-white border-t border-gray-100',
    navActive: 'text-gray-900',
    navInactive: 'text-gray-300',
    navMainActive: `border-[${POINT}] bg-[${POINT}] text-white`,
    navMainInactive: 'border-gray-200 bg-gray-50 text-gray-400',
    btnPrimary: `bg-[${POINT}] text-white`,
    btnSecondary: 'bg-gray-100 border border-gray-200 text-gray-600',
    progressBg: '#E8E8E8',
    progressStroke: POINT,
    barActive: `bg-[${POINT}]`,
    barInactive: 'bg-gray-200',
    dayActive: 'text-gray-900',
    dayInactive: 'text-gray-300',
    tagBg: 'bg-gray-900 text-white',
    dialogueBg: 'bg-white',
    dialogueText: 'text-gray-900',
    nextBtn: `bg-[${POINT}] text-white`,
    nextBtnDisabled: 'bg-gray-100 text-gray-300',
    quizCorrect: `bg-[${POINT}] text-white border-[${POINT}]`,
    quizWrong: 'bg-red-50 text-red-400 border-red-200',
    quizDefault: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
    quizFaded: 'bg-gray-50 text-gray-300 border-gray-100',
    adBadge: 'bg-gray-100 border-gray-200 text-gray-400',
    exitBtn: 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white',
  },
} as const;

export type ThemeTokens = typeof T.dark;
