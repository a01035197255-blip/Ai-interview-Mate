'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, ChevronLeft, MailCheck, Loader2 } from "lucide-react";
import { AuthApi } from '@/services/AuthApi'; // 🚀 AuthApi 임포트
import axios from 'axios';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // 🚀 API 발송 중 로딩 상태 추가

    /**
     * 🔑 비밀번호 재설정 링크 이메일 발송 요청 핸들러
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return alert('이메일을 입력해 주세요.');
        if (isLoading) return;

        setIsLoading(true);
        try {
            // ⭕ [원자성 교정]: 쌩 문자열이 아닌 백엔드가 원하는 { email } 객체 규격으로 포장하여 요청
            await AuthApi.requestPasswordReset({ email });

            // 발송이 백엔드 레이어(네이버 SMTP)에서 성공적으로 완수되면 완료 화면으로 전환
            setIsSubmitted(true);
        } catch (error) {
            console.error('비밀번호 재설정 요청 실패:', error);

            let errorMsg = '존재하지 않는 회원 이메일이거나 서버 오류가 발생했습니다.';
            if (axios.isAxiosError(error)) {
                // 백엔드 ErrorCode에 명세된 실제 메시지가 있다면 적용
                errorMsg = error.response?.data?.message || errorMsg;
            }

            alert(`요청 실패: ${errorMsg}`);
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
                    onClick={() => router.back()}
                    disabled={isLoading}
                    className="flex items-center gap-1 text-sm font-bold text-slate-800 hover:opacity-70 transition-opacity disabled:opacity-50"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span>뒤로가기</span>
                </button>
            </div>

            {/* 2단 레이아웃 */}
            <div className="w-full max-w-[1200px] grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 items-center z-10 mt-8">

                {/* [좌측] 브랜드 및 문구 */}
                <div className="flex flex-col justify-center h-full py-4 text-center md:text-left w-full">
                    <div>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-black font-black text-xl mb-8">
                            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                                <MessageSquare className="w-4 h-4 fill-white" />
                            </div>
                            <span className="tracking-tight">InterviewMate</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-black tracking-tight mb-4 leading-none">
                            비밀번호를<br />
                            <span className="inline-block mt-2 border-b-4 border-black pb-1">잊으셨나요? 🧐</span>
                        </h1>
                        <p className="text-slate-500 font-bold text-sm mt-4">
                            걱정 마세요! 가입하신 이메일로<br className="hidden md:block" />
                            비밀번호 재설정 링크를 보내드립니다.
                        </p>
                    </div>
                </div>

                {/* [우측] 비밀번호 찾기 폼 카드 */}
                <div className="bg-white p-8 md:p-12 rounded-[24px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-200 w-full overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-black"></div>

                    {!isSubmitted ? (
                        <>
                            <div className="text-center mb-8 pt-2">
                                <h2 className="text-3xl font-black text-black tracking-tight mb-2">Reset Password</h2>
                                <p className="text-xs font-bold text-slate-400 tracking-wide">차세대 AI 모의 면접 플랫폼, InterviewMate</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-black text-slate-700 tracking-wider mb-1.5 uppercase">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="가입하신 이메일을 입력해주세요."
                                        required
                                        disabled={isLoading}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm placeholder-slate-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all disabled:opacity-50"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || !email}
                                    className="w-full bg-black hover:bg-slate-900 text-white font-black py-3.5 rounded-xl text-sm transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                                            <span>링크 전송 중...</span>
                                        </>
                                    ) : (
                                        <span>재설정 링크 받기</span>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        // 이메일 발송 완료 후 화면
                        <div className="text-center py-6 animate-fadeIn">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MailCheck className="w-8 h-8 text-black" />
                            </div>
                            <h2 className="text-2xl font-black text-black tracking-tight mb-3">메일 발송 완료!</h2>
                            <p className="text-sm font-bold text-slate-500 mb-8 leading-relaxed">
                                <span className="text-black underline">{email}</span> 주소로<br />비밀번호 재설정 링크를 보냈습니다.
                            </p>

                            <button
                                onClick={() => setIsSubmitted(false)}
                                className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl text-sm transition-all active:scale-[0.98]"
                            >
                                이메일 다시 입력하기
                            </button>
                        </div>
                    )}

                    {/* 하단 로그인 이동 링크 */}
                    <div className="mt-8 text-center border-t border-slate-100 pt-5">
                        <p className="text-xs text-slate-400 font-bold">
                            비밀번호가 기억나셨나요?{' '}
                            <button
                                type="button"
                                onClick={() => router.push('/login')}
                                disabled={isLoading}
                                className="text-black underline font-black ml-1 disabled:opacity-50"
                            >
                                로그인하러 가기
                            </button>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}