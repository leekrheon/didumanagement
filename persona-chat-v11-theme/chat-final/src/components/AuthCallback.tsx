import { useEffect, useState } from 'react';

interface AuthCallbackProps {
  onSuccess: (user: KakaoUser) => void;
  onError: () => void;
}

export interface KakaoUser {
  id: number;
  nickname: string;
  profileImage?: string;
}

export default function AuthCallback({ onSuccess, onError }: AuthCallbackProps) {
  const [status, setStatus] = useState<'loading' | 'error'>('loading');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error || !code) {
      setStatus('error');
      setTimeout(onError, 1500);
      return;
    }

    // 카카오 토큰 교환 — 서버리스 함수 경유
    fetch(`/api/kakao-token?code=${code}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        onSuccess(data.user);
        // URL 정리
        window.history.replaceState({}, '', '/');
      })
      .catch(() => {
        setStatus('error');
        setTimeout(onError, 1500);
      });
  }, [onSuccess, onError]);

  return (
    <div className="flex flex-col h-full bg-black text-white items-center justify-center gap-6">
      {status === 'loading' ? (
        <>
          <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/50 text-sm font-medium">카카오 로그인 중...</p>
        </>
      ) : (
        <>
          <div className="text-4xl">⚠️</div>
          <p className="text-white/50 text-sm font-medium">로그인에 실패했어요</p>
        </>
      )}
    </div>
  );
}
