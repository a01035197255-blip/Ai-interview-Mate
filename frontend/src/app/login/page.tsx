'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, ChevronLeft, Lock } from "lucide-react";
import {AuthApi} from "@/services/AuthApi";
import {useAuthStore} from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const setToken = useAuthStore((state) => state.setToken);

  const [isLoading, setIsLoading] = useState(false);

  // 일반 로그인 처리
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await AuthApi.login({ email, password });
      const token = response.accessToken;

      if (token) {
        // ⭐️ 2. 위에서 미리 뽑아둔 외부 함수를 여기선 그냥 실행만 합니다! (리액트 규칙 준수)
        setToken(token);

        alert("로그인에 성공했습니다! 🎉");
        router.push('/dashboard');
      } else {
        alert("토큰을 받아오지 못했습니다.");
      }
    } catch (error) {
      console.error("로그인 실패 에러 로깅:", error);
      alert("이메일 또는 비밀번호가 일치하지 않습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🚀 구글 / 네이버 소셜 로그인 연동 핵심 로직
  const handleSocialLogin = (provider: 'google' | 'naver') => {
    // 백엔드(Spring Boot) 서버 주소 (로컬 개발 환경 기준)
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

    // Spring Security OAuth2 Client가 제공하는 기본 규격 주소로 유저를 리다이렉트합니다.
    window.location.href = `${BACKEND_URL}/oauth2/authorization/${provider}`;
  };

  return (
      // 모눈종이(Grid) 패턴 배경
      <div className="min-h-screen bg-[#F8FAFC] relative flex flex-col items-center justify-center p-8 md:p-12 w-full antialiased font-sans"
           style={{
             backgroundImage: 'linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }}>

        {/* 상단 좌측 '홈으로' 뒤로가기 버튼 */}
        <div className="absolute top-6 left-6 z-10">
          <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1 text-sm font-bold text-slate-800 hover:opacity-70 transition-opacity"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>홈으로</span>
          </button>
        </div>

        <div className="w-full max-w-[1200px] grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 items-center z-10 mt-8">

          {/* [좌측] 브랜드 및 문구 + 🚀 새로운 디자인의 AI 로봇! */}
          <div className="flex flex-col justify-between h-full py-4 text-center md:text-left w-full">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-black font-black text-xl mb-8">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                  <MessageSquare className="w-4 h-4 fill-white" />
                </div>
                <span className="tracking-tight">InterviewMate</span>
              </div>
              <h1 className="inline-block mt-2 border-b-4 border-black pb-1 text-3xl md:text-4xl lg:text-5xl font-black text-black tracking-tight mb-4 leading-tight">
                안녕하세요, 반가워요! 😊<br />
              </h1>
              <p className="text-slate-500 font-bold text-sm mt-4">AI 면접관이 당신의 접속을 기다리고 있습니다.</p>
            </div>

            {/* 새로운 모니터 형태의 보안 로봇 디자인 */}
            <div className="relative w-56 h-56 lg:w-64 lg:h-64 mx-auto md:mx-0 mt-10 flex flex-col items-center justify-center">
              <div className="absolute bottom-4 w-32 h-3 bg-slate-200 rounded-full blur-md animate-pulse"></div>
              <div className="animate-bounce relative flex flex-col items-center" style={{ animationDuration: '3.5s' }}>

                {/* 자물쇠 뱃지 */}
                <div className="absolute -top-4 -right-6 bg-indigo-500 text-white p-2.5 rounded-2xl shadow-lg z-30 transform rotate-12 flex items-center justify-center">
                  <Lock className="w-5 h-5 fill-indigo-400" />
                </div>

                {/* 안테나 */}
                <div className="flex w-24 justify-between absolute -top-2 z-0">
                  <div className="w-2.5 h-6 bg-slate-300 rounded-t-md"></div>
                  <div className="w-2.5 h-6 bg-slate-300 rounded-t-md"></div>
                </div>

                {/* 모니터 얼굴 본체 */}
                <div className="w-48 h-36 lg:w-56 lg:h-40 bg-white rounded-[32px] border-4 border-slate-200 shadow-xl flex flex-col items-center justify-center relative z-10 p-2.5">
                  <div className="w-full h-full bg-[#0F172A] rounded-2xl relative overflow-hidden flex flex-col items-center justify-center shadow-inner">
                    <div className="flex gap-6 mb-2">
                      <div className="w-2.5 h-8 bg-cyan-400 rounded-full shadow-[0_0_15px_#22d3ee] animate-pulse"></div>
                      <div className="w-2.5 h-8 bg-cyan-400 rounded-full shadow-[0_0_15px_#22d3ee] animate-pulse"></div>
                    </div>
                    <div className="w-10 h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden flex justify-center">
                      <div className="w-1/2 h-full bg-cyan-400 animate-pulse"></div>
                    </div>
                  </div>
                </div>

                <div className="w-16 h-3 bg-slate-300 rounded-b-xl relative z-0"></div>
              </div>
            </div>
          </div>

          {/* [우측] 로그인 카드 폼 */}
          <div className="bg-white p-8 md:p-12 rounded-[24px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-200 w-full overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-2 bg-black"></div>

            <div className="text-center mb-8 pt-2">
              <h2 className="text-3xl font-black text-black tracking-tight mb-2">Sign In</h2>
              <p className="text-xs font-bold text-slate-400 tracking-wide">차세대 AI 모의 면접 플랫폼, InterviewMate</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-slate-700 tracking-wider mb-1.5 uppercase">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm placeholder-slate-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 tracking-wider mb-1.5 uppercase">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm placeholder-slate-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-black focus:ring-black"
                  />
                  <span className="text-[11px] text-slate-500 font-bold group-hover:text-black transition-colors">로그인 상태 유지</span>
                </label>
                <button type="button" onClick={() => router.push('/reset-password')} className="text-[11px] text-slate-400 hover:text-black font-bold transition-colors">
                  비밀번호 찾기
                </button>
              </div>

              <button type="submit" className="w-full bg-black hover:bg-slate-900 text-white font-black py-3.5 rounded-xl text-sm transition-all active:scale-[0.98] mt-2">
                로그인
              </button>
            </form>

            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <span className="relative bg-white px-3 text-[10px] font-black text-slate-400 tracking-wider uppercase">or continue with</span>
            </div>

            {/* 소셜 로그인 버튼 구역 */}
            <div className="space-y-2">
              <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-lg text-xs transition-all active:scale-[0.99]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.96 1 12 1 7.37 1 3.4 3.65 1.45 7.5l3.8 2.95C6.17 7.02 8.87 5.04 12 5.04z"/>
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.43h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.39-4.87 3.39-8.48z"/>
                  <path fill="#FBBC05" d="M5.25 14.5c-.25-.75-.39-1.55-.39-2.38s.14-1.63.39-2.38L1.45 6.8C.53 8.65 0 10.74 0 13s.53 4.35 1.45 6.2l3.8-2.7z"/>
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-4.3 1.09-3.13 0-5.83-1.98-6.78-4.41L1.45 16.8C3.4 20.35 7.37 23 12 23z"/>
                </svg>
                <span>Google 계정으로 로그인</span>
              </button>

              <button
                  type="button"
                  onClick={() => handleSocialLogin('naver')}
                  className="w-full flex items-center justify-center gap-3 bg-[#03C75A] hover:bg-[#02b350] text-white font-bold py-2.5 rounded-lg text-xs transition-all active:scale-[0.99]"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.2 2H22v20h-5.8L7.8 8.7V22H2V2h5.8l8.4 13.3V2z"/>
                </svg>
                <span>Naver 계정으로 로그인</span>
              </button>
            </div>

            <div className="mt-8 text-center border-t border-slate-100 pt-5">
              <p className="text-xs text-slate-400 font-bold">
                아직 계정이 없으신가요?{' '}
                <button type="button" onClick={() => router.push('/signup')} className="text-black underline font-black ml-1">
                  회원가입하기
                </button>
              </p>
            </div>
          </div>

        </div>
      </div>
  );
}
