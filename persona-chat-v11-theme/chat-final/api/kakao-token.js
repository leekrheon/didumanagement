export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  const KAKAO_CLIENT_ID = process.env.VITE_KAKAO_REST_API_KEY;
  const REDIRECT_URI = process.env.VITE_REDIRECT_URI;

  try {
    // 1. 인가 코드로 액세스 토큰 교환
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KAKAO_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) throw new Error(tokenData.error_description);

    // 2. 액세스 토큰으로 사용자 정보 조회
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await userRes.json();

    const user = {
      id: userData.id,
      nickname: userData.kakao_account?.profile?.nickname || '사용자',
      profileImage: userData.kakao_account?.profile?.profile_image_url || null,
    };

    return res.status(200).json({ user });
  } catch (err) {
    console.error('Kakao token error:', err);
    return res.status(500).json({ error: err.message });
  }
}
