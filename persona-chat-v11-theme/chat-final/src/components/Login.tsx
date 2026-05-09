import { motion } from 'motion/react';

const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_REST_API_KEY;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;

export default function Login() {
  const handleKakaoLogin = () => {
    const kakaoAuthUrl =
      `https://kauth.kakao.com/oauth/authorize` +
      `?client_id=${KAKAO_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=code`;
    window.location.href = kakaoAuthUrl;
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F6FA] text-gray-900 relative overflow-hidden">
      {/* 배경 — 로고 색상 기반 은은한 글로우 */}
      <div className="absolute inset-0 bg-[#F5F6FA]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)' }} />

      {/* 로고 + 브랜드 */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          {/* 로고 이미지 — 크고 선명하게 */}
          <div className="relative mb-10">
            <img
              src="/logo.png"
              alt="IMBY"
              className="w-36 h-36 object-contain drop-shadow-2xl"
            />
          </div>

          {/* 브랜드명 + 슬로건 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-5xl font-black tracking-tight mb-4 text-white">IMBY</h1>
            <p className="text-white/35 text-[15px] font-medium leading-relaxed tracking-wide">
              친구처럼 대화하고<br />자연스럽게 정보를 얻어요
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* 하단 버튼 영역 */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative px-6 pb-14 space-y-3"
      >
        <button
          onClick={handleKakaoLogin}
          className="w-full flex items-center justify-center gap-3 py-[18px] rounded-2xl font-bold text-[15px] transition-transform active:scale-[0.97] shadow-lg"
          style={{ backgroundColor: '#FEE500', color: '#191919' }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 2C5.582 2 2 4.896 2 8.444c0 2.283 1.52 4.283 3.817 5.417L4.9 17.1c-.08.287.22.52.47.35l4.03-2.69c.196.016.394.024.6.024 4.418 0 8-2.896 8-6.444C18 4.896 14.418 2 10 2z"
              fill="#191919"
            />
          </svg>
          카카오로 시작하기
        </button>

        <p className="text-center text-white/15 text-[11px] pt-1">
          로그인 시 서비스 이용약관 및 개인정보처리방침에 동의합니다
        </p>
      </motion.div>
    </div>
  );
}
