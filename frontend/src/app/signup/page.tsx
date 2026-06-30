'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, ChevronLeft, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { AuthApi } from '@/services/AuthApi';
import axios from 'axios';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUserName] = useState('');

  // ✉️ 이메일 인증 관련 신규 상태값
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false); // 인증번호 입력창 활성화 여부
  const [isVerified, setIsVerified] = useState(false); // 최종 인증 성공 여부
  const [isSendingCode, setIsSendingCode] = useState(false); // 이메일 발송 로딩
  const [isVerifyingCode, setIsVerifyingCode] = useState(false); // 코드 검증 로딩
  const [timer, setTimer] = useState(180); // 3분 타이머 (초 단위)

  const [isLoading, setIsLoading] = useState(false);

  // ⏳ 인증번호 3분 제한 타이머 이펙트
  useEffect(() => {
    if (!isCodeSent || isVerified || timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isCodeSent, isVerified, timer]);

  // 🕒 초 단위를 MM:SS 포맷으로 변환
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  /**
   * 1-1. 이메일 인증번호 발송 요청 (백엔드 /verify-request 매핑)
   */
  const handleRequestCode = async () => {
    if (!email) return alert('이메일을 입력해 주세요.');
    if (isSendingCode) return;

    setIsSendingCode(true);
    try {
      // 🚀 백엔드 /api/email/verify-request 호출 시그널
      await AuthApi.requestEmailCode({ email });

      alert('인증번호가 네이버 메일로 발송되었습니다. 3분 안에 입력해 주세요! 📩');
      setIsCodeSent(true);
      setTimer(180); // 타이머 리셋
    } catch (error) {
      console.error('인증번호 발송 실패:', error);
      let errorMsg = '인증번호 발송에 실패했습니다.';
      if (axios.isAxiosError(error)) {
        errorMsg = error.response?.data?.message || errorMsg;
      }
      alert(errorMsg);
    } finally {
      setIsSendingCode(false);
    }
  };

  /**
   * 1-2. 인증번호 대조 확인 검증 (백엔드 /verify-check 매핑)
   */
  const handleVerifyCode = async () => {
    if (!verificationCode) return alert('인증번호를 입력해 주세요.');
    if (timer <= 0) return alert('인증 시간이 만료되었습니다. 다시 요청해 주세요.');
    if (isVerifyingCode) return;

    setIsVerifyingCode(true);
    try {
      // 🚀 백엔드 /api/email/verify-check 호출 시그널
      await AuthApi.verifyEmailCode({ email, verificationCode });

      alert('이메일 인증에 성공했습니다! 회원가입을 마저 진행해 주세요. ✅');
      setIsVerified(true);
    } catch (error) {
      console.error('인증번호 검증 실패:', error);
      let errorMsg = '인증번호가 일치하지 않습니다.';
      if (axios.isAxiosError(error)) {
        errorMsg = error.response?.data?.message || errorMsg;
      }
      alert(errorMsg);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  /**
   * 1-3. 최종 회원 가입 처리 (백엔드 register 매핑)
   */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!isVerified) {
      return alert('이메일 인증을 먼저 완료해 주세요.');
    }

    if (password !== confirmPassword) {
      return alert('비밀번호가 일치하지 않습니다. 다시 확인해주세요.');
    }

    setIsLoading(true);
    try {
      await AuthApi.register({
        username: username,
        email: email,
        password: password
      });

      alert('InterviewMate 회원가입을 축하합니다! 🎉 로그인 후 이용해주세요.');
      router.push('/login');
    } catch (error) {
      console.error('회원가입 실패:', error);
      let errorMsg = '회원가입 도중 서버 오류가 발생했습니다.';
      if (axios.isAxiosError(error)) {
        errorMsg = error.response?.data?.message || errorMsg;
      }
      alert(`회원가입 실패: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-[#F8FAFC] relative flex flex-col items-center justify-center p-8 md:p-12 w-full antialiased font-sans"
           style={{
             backgroundImage: 'linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }}>

        {/* 상단 좌측 '홈으로' 뒤로가기 버튼 */}
        <div className="absolute top-6 left-6 z-10">
          <button
              onClick={() => router.push('/')}
              disabled={isLoading || isSendingCode || isVerifyingCode}
              className="flex items-center gap-1 text-sm font-bold text-slate-800 hover:opacity-70 transition-opacity disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>홈으로</span>
          </button>
        </div>

        <div className="w-full max-w-[1200px] grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 items-center z-10 mt-8">

          {/* [좌측] 안내 섹션 + 로봇 캐릭터 */}
          <div className="flex flex-col justify-between h-full py-4 text-center md:text-left w-full">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-black font-black text-xl mb-12">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                  <MessageSquare className="w-4 h-4 fill-white" />
                </div>
                <span className="tracking-tight">InterviewMate</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-black tracking-tight mb-6 leading-none">
                <span className="inline-block mt-2 border-b-4 border-black pb-1">합격을 향한 첫걸음! 🚀</span>
              </h1>
              <p className="text-slate-500 font-bold text-sm tracking-wide">AI와 함께 면접을 준비하고 합격의 기회를 높여보세요.</p>
            </div>

            {/* 로봇 디자인 영역 (기존 애니메이션 그대로 보존) */}
            <div className="relative w-56 h-56 lg:w-64 lg:h-64 mx-auto md:mx-0 mt-10 flex flex-col items-center justify-center">
              <div className="absolute bottom-2 w-36 h-4 bg-slate-200 rounded-full blur-md animate-pulse"></div>
              <div className="animate-bounce relative flex flex-col items-center" style={{ animationDuration: '4s' }}>
                <div className="absolute -top-6 -left-4 bg-amber-400 text-white p-2 rounded-xl shadow-lg z-30 transform -rotate-12 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-5 h-5 fill-amber-200" />
                </div>
                <div className="w-48 h-48 lg:w-56 lg:h-56 bg-slate-50/80 backdrop-blur-sm rounded-full border-4 border-white shadow-2xl flex flex-col items-center justify-center relative z-10 overflow-hidden">
                  <div className="absolute top-4 left-6 w-16 h-6 bg-white/40 rounded-full rotate-[-30deg] z-30"></div>
                  <div className="w-36 h-28 bg-[#0F172A] rounded-[40px] relative overflow-hidden flex flex-col items-center justify-center shadow-inner z-20 border-4 border-slate-200">
                    <div className="flex gap-8 mb-3">
                      <div className="w-6 h-7 bg-[#38BDF8] rounded-t-full rounded-b-md shadow-[0_0_15px_#38bdf8] animate-pulse"></div>
                      <div className="w-6 h-7 bg-[#38BDF8] rounded-t-full rounded-b-md shadow-[0_0_15px_#38bdf8] animate-pulse"></div>
                    </div>
                    <div className="w-4 h-2.5 bg-[#38BDF8] rounded-b-full opacity-80 mt-1"></div>
                  </div>
                </div>
                <div className="w-32 h-8 bg-white border-x-4 border-b-4 border-slate-200 rounded-b-[24px] relative z-20 -mt-2 flex justify-center items-center shadow-md">
                  <div className="w-4 h-4 bg-slate-300 rounded-full border-2 border-slate-400"></div>
                </div>
                <div className="absolute -top-2 -right-8 bg-black text-white p-2.5 rounded-2xl rounded-bl-none shadow-lg z-30">
                  <div className="flex gap-1.5 p-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full inline-block animate-bounce" style={{ animationDelay: '0s' }}></span>
                    <span className="w-1.5 h-1.5 bg-white rounded-full inline-block animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-white rounded-full inline-block animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* [우측] 회원가입 폼 카드 (이메일 인증 인터랙션 포함) */}
          <div className="bg-white p-8 md:p-12 rounded-[24px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-200 w-full overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-2 bg-black"></div>

            <div className="text-center mb-8 pt-2">
              <h2 className="text-3xl font-black text-black tracking-tight mb-2">Create Account</h2>
              <p className="text-xs font-bold text-slate-400 tracking-wide">차세대 AI 모의 면접 플랫폼, InterviewMate</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              {/* 1. Name 입력 */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 tracking-wider mb-1.5 uppercase">Name</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="홍길동"
                    required
                    disabled={isLoading || isVerified}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm placeholder-slate-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all disabled:bg-slate-50 disabled:opacity-70"
                />
              </div>

              {/* 2. Email 입력 + 인증 코드 요청 버튼 통합 */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 tracking-wider mb-1.5 uppercase">Email</label>
                <div className="flex gap-2">
                  <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      disabled={isLoading || isVerified || isCodeSent}
                      className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm placeholder-slate-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all disabled:bg-slate-50 disabled:opacity-70"
                  />
                  <button
                      type="button"
                      onClick={handleRequestCode}
                      disabled={isLoading || isSendingCode || isVerified || isCodeSent || !email}
                      className="px-4 bg-slate-900 hover:bg-black text-white font-black text-xs rounded-lg transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap min-w-[90px] flex items-center justify-center"
                  >
                    {isSendingCode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>인증요청</span>}
                  </button>
                </div>
              </div>

              {/* ✨ 3. [신규 추가 조건부 컴포넌트] 인증코드 입력 창 및 검증 */}
              {isCodeSent && (
                  <div className="bg-slate-50/50 p-3.5 rounded-xl border border-dashed border-slate-200 animate-fadeIn">
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[11px] font-black text-slate-800 tracking-wider uppercase">Verification Code</label>
                      {!isVerified && (
                          <span className={`text-xs font-black ${timer <= 30 ? 'text-rose-500 animate-pulse' : 'text-slate-500'}`}>
                            {formatTime(timer)}
                          </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                            type="text"
                            maxLength={6}
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))} // 숫자만 입력 허용
                            placeholder="6자리 인증번호 입력"
                            disabled={isLoading || isVerified || timer <= 0}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm placeholder-slate-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black tracking-widest font-bold disabled:bg-slate-50 disabled:opacity-70"
                        />
                        {isVerified && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-3.5 fill-emerald-50" />
                        )}
                      </div>
                      {!isVerified ? (
                          <button
                              type="button"
                              onClick={handleVerifyCode}
                              disabled={isVerifyingCode || timer <= 0 || verificationCode.length !== 6}
                              className="px-4 bg-black text-white font-black text-xs rounded-lg transition-all active:scale-[0.97] disabled:opacity-40"
                          >
                            {isVerifyingCode ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>인증확인</span>}
                          </button>
                      ) : (
                          <div className="px-3 flex items-center justify-center bg-emerald-50 border border-emerald-200 text-emerald-600 font-black text-xs rounded-lg select-none">
                            인증완료
                          </div>
                      )}
                    </div>
                    {timer <= 0 && !isVerified && (
                        <p className="text-[11px] text-rose-500 font-bold mt-1.5">
                          시간이 만료되었습니다.{' '}
                          <button type="button" onClick={() => { setIsCodeSent(false); handleRequestCode(); }} className="underline ml-1">재발송하기</button>
                        </p>
                    )}
                  </div>
              )}

              {/* 4. Password 입력 */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 tracking-wider mb-1.5 uppercase">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading || !isVerified}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm placeholder-slate-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all disabled:opacity-40"
                />
              </div>

              {/* 5. Confirm Password 입력 */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 tracking-wider mb-1.5 uppercase">Confirm Password</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading || !isVerified}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm placeholder-slate-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all disabled:opacity-40"
                />
              </div>

              {/* 6. 최종 서브밋 버튼 (이메일 최종 인증 성공 전까지 disabled 세팅) */}
              <button
                  type="submit"
                  disabled={isLoading || !isVerified}
                  className="w-full bg-black hover:bg-slate-900 text-white font-black py-3.5 rounded-xl text-sm transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                      <span>가입 처리 중...</span>
                    </>
                ) : (
                    <span>회원가입</span>
                )}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-slate-100 pt-6">
              <p className="text-xs text-slate-400 font-bold">
                이미 계정이 있으신가요?{' '}
                <button type="button" onClick={() => router.push('/login')} disabled={isLoading} className="text-black underline font-black ml-1 disabled:opacity-50">
                  로그인하기
                </button>
              </p>
            </div>
          </div>

        </div>
      </div>
  );
}