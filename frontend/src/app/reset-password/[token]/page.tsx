'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; // 🚀 [수정] useSearchParams 대신 useParams 임포트
import { MessageSquare, ChevronLeft, Loader2, CheckCircle2 } from "lucide-react";
import { AuthApi } from '@/services/AuthApi';
import axios from 'axios';

export default function PasswordResetSubmitPage() {
    const router = useRouter();
    const params = useParams(); // 🚀 [수정] 다이내믹 경로 변수 가로채기 엔진 가동

    // 🔗 URL 경로인 /reset-password/[token] 구조에서 폴더명인 'token' 값을 그대로 추출합니다.
    // 예: /reset-password/cfb29b03... 일 때 'cfb29b03...' 문자열이 박힙니다.
    const token = params.token as string;

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // 만약 메일 토큰 없이 비정상적인 경로로 접근하면 가드 처리
    useEffect(() => {
        if (!token) {
            alert('잘못된 접근이거나 만료된 인증 토큰입니다. 메일 링크를 다시 확인해 주세요.');
            router.push('/login');
        }
    }, [token, router]);

    /**
     * 💾 새 비밀번호 최종 변경 처리 요청 핸들러
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return alert('인증 토큰이 누락되었습니다.');
        if (isLoading) return;

        if (newPassword !== confirmPassword) {
            return alert('비밀번호가 일치하지 않습니다. 다시 확인해 주세요.');
        }

        setIsLoading(true);
        try {
            // ⭕ 자바 백엔드가 요구하는 객체 리터럴 DTO 스펙에 맞게 데이터 패킹
            await AuthApi.resetPasswordSubmit({
                token: token, // useParams로 훔쳐온 대시보드 UUID 세팅
                newPassword: newPassword,
                confirmPassword: confirmPassword
            });

            setIsSuccess(true);
            alert('비밀번호가 안전하게 변경되었습니다. 🎉 새로운 비밀번호로 로그인해 주세요.');
            router.push('/login');
        } catch (error) {
            console.error('비밀번호 최종 변경 실패:', error);

            let errorMsg = '링크 유효 시간(5분)이 만료되었거나 비정상적인 토큰입니다.';
            if (axios.isAxiosError(error)) {
                errorMsg = error.response?.data?.message || errorMsg;
            }

            alert(`변경 실패: ${errorMsg}`);
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

            {/* 상단 좌측 '로그인으로' 뒤로가기 버튼 */}
            <div className="absolute top-6 left-6 z-10">
                <button
                    onClick={() => router.push('/login')}
                    disabled={isLoading}
                    className="flex items-center gap-1 text-sm font-bold text-slate-800 hover:opacity-70 transition-opacity disabled:opacity-50"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span>로그인으로</span>
                </button>
            </div>

            {/* 2단 레이아웃 */}
            <div className="w-full max-w-[1200px] grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 items-center z-10 mt-8">

                {/* [좌측] 브랜드 및 타이포그래피 */}
                <div className="flex flex-col justify-center h-full py-4 text-center md:text-left w-full">
                    <div>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-black font-black text-xl mb-8">
                            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                                <MessageSquare className="w-4 h-4 fill-white" />
                            </div>
                            <span className="tracking-tight">InterviewMate</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-black tracking-tight mb-4 leading-none">
                            새로운 암호를<br />
                            <span className="inline-block mt-2 border-b-4 border-black pb-1">설정하세요 🔐</span>
                        </h1>
                        <p className="text-slate-500 font-bold text-sm mt-4">
                            다른 가공 사이트에서 사용하지 않는<br className="hidden md:block" />
                            안전한 비밀번호로 변경하는 것을 권장합니다.
                        </p>
                    </div>
                </div>

                {/* [우측] 변경 폼 레이아웃 카드 */}
                <div className="bg-white p-8 md:p-12 rounded-[24px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-200 w-full overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-black"></div>

                    {!isSuccess ? (
                        <>
                            <div className="text-center mb-8 pt-2">
                                <h2 className="text-3xl font-black text-black tracking-tight mb-2">New Password</h2>
                                <p className="text-xs font-bold text-slate-400 tracking-wide">차세대 AI 모의 면접 플랫폼, InterviewMate</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* New Password 입력 */}
                                <div>
                                    <label className="block text-[11px] font-black text-slate-700 tracking-wider mb-1.5 uppercase">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        disabled={isLoading || !token}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm placeholder-slate-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all disabled:opacity-50"
                                    />
                                </div>

                                {/* Confirm Password 입력 */}
                                <div>
                                    <label className="block text-[11px] font-black text-slate-700 tracking-wider mb-1.5 uppercase">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        disabled={isLoading || !token}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm placeholder-slate-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all disabled:opacity-50"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || !newPassword || !confirmPassword || !token}
                                    className="w-full bg-black hover:bg-slate-900 text-white font-black py-3.5 rounded-xl text-sm transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                                            <span>비밀번호 변경 중...</span>
                                        </>
                                    ) : (
                                        <span>비밀번호 재설정 완료</span>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        // 변경 성공 완료 시 렌더링 화면
                        <div className="text-center py-6 animate-fadeIn">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h2 className="text-2xl font-black text-black tracking-tight mb-3">변경 완료!</h2>
                            <p className="text-sm font-bold text-slate-500 mb-8">
                                비밀번호가 정상 업데이트되었습니다.<br />잠시 후 로그인 페이지로 순간 이동합니다.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}