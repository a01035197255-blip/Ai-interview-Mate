'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";

const RealFloppyDiskIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M4 3H16.5L20 6.5V20C20 20.5523 19.5523 21 19 21H5C4.44772 21 4 20.5523 4 20V4C4 3.44772 4.44772 3 5 3Z" fill="currentColor" />
        <path d="M7 3H15V9H7V3Z" fill="#CBD5E1" />
        <rect x="11" y="4.5" width="2" height="3" rx="0.5" fill="#0F172A" />
        <path d="M6 13H18V21H6V13Z" fill="#F8FAFC" />
        <rect x="7.5" y="15" width="9" height="1" rx="0.5" fill="#E2E8F0" />
        <rect x="7.5" y="17" width="9" height="1" rx="0.5" fill="#E2E8F0" />
        <rect x="7.5" y="19" width="6" height="1" rx="0.5" fill="#E2E8F0" />
        <rect x="16.5" y="18.5" width="2" height="2" rx="0.3" fill="#0F172A" />
    </svg>
);

export default function Home() {
    const router = useRouter();

    /**
     * 🔐 둘러보기 클릭 시 로그인 상태를 검사하는 핸들러 (Zustand 문자열 함정 완벽 격파)
     */
    const handleExploreClick = () => {
        let hasToken = false;

        try {
            // 1. 로컬스토리지에서 Zustand 통 데이터를 가져옴
            const authStorage = localStorage.getItem('auth-storage');
            
            if (authStorage) {
                // 2. 문자열을 진짜 객체로 파싱
                const parsed = JSON.parse(authStorage);
                
                // 3. state 내부에 진짜 토큰(token 또는 accessToken) 값이 살아있는지 정밀 검사
                const actualToken = parsed?.state?.token || parsed?.state?.accessToken;
                
                if (actualToken) {
                    hasToken = true;
                }
            }
        } catch (error) {
            console.error("인증 토큰 파싱 에러:", error);
        }

        // 4. 만약 쿠키 기반 인증도 사용 중이라면 교차 체크
        if (document.cookie.includes('accessToken')) {
            hasToken = true;
        }

        // 5. 최종 조건 판정
        if (!hasToken) {
            alert("로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다! 🔒");
            router.push('/login');
        } else {
            router.push('/dashboard');
        }
    };

    return (
        // 🚀 공통 모눈종이 격자 패턴 배경
        <div className="min-h-screen bg-[#F8FAFC] relative flex flex-col items-center overflow-hidden antialiased font-sans w-full"
             style={{
                 backgroundImage: 'linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)',
                 backgroundSize: '40px 40px'
             }}>

            {/* 상단 네비게이션 바 */}
            <header className="w-full max-w-[1200px] mx-auto px-8 py-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-2 text-black font-black text-xl">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                        <MessageSquare className="w-4 h-4 fill-white" />
                    </div>
                    <span className="tracking-tighter">InterviewMate</span>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-black transition-colors">
                        로그인
                    </Link>
                    <Link href="/signup" className="px-5 py-2.5 bg-black text-white text-sm font-black rounded-xl hover:bg-slate-900 transition-all shadow-sm active:scale-95">
                        무료로 시작하기
                    </Link>
                </div>
            </header>

            {/* 메인 히어로 섹션 */}
            <main className="flex-1 w-full max-w-[1200px] mx-auto px-8 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 z-10 pb-20 mt-10 lg:mt-0">

                {/* [좌측] 메인 카피 및 버튼 */}
                <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left w-full">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 mb-6">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Next-Gen AI Interview</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-black tracking-tight leading-[1.1] mb-6">
                        합격을 결정짓는<br />
                        <span className="inline-block mt-2 border-b-8 border-black pb-1">단 하나의 AI 면접관</span>
                    </h1>

                    <p className="text-base md:text-lg text-slate-500 font-bold mb-10 max-w-[500px] break-keep leading-relaxed">
                        원하는 직무와 기술 스택을 선택하세요. 실제 면접관처럼 질문하고, 내 답변의 강점과 약점을 정확하게 분석해 드립니다.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-black text-white font-black rounded-xl text-base hover:bg-slate-900 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95">
                            <span>지금 바로 시작하기</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        
                        {/* 🚀 안전한 방어벽 함수(onClick)를 장착한 둘러보기 버튼 */}
                        <button 
                            onClick={handleExploreClick}
                            className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-black font-black rounded-xl text-base hover:border-black transition-all flex items-center justify-center active:scale-95 cursor-pointer"
                        >
                            둘러보기
                        </button>
                    </div>

                    {/* 체크포인트 */}
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 mt-12">
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-bold text-slate-600">무제한 면접 연습</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-bold text-slate-600">상세한 피드백 리포트</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-bold text-slate-600">나만의 오답 노트</span>
                        </div>
                    </div>
                </div>

                {/* [우측] AI 로봇 마스코트 및 장식 */}
                <div className="flex-1 w-full flex justify-center relative">
                    <div className="absolute -top-10 -left-10 bg-white p-4 rounded-2xl border border-slate-200 shadow-xl z-20 animate-bounce hidden md:block" style={{ animationDuration: '4s' }}>
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Feedback</span>
                        <p className="text-sm font-bold text-slate-800">&quot;핵심을 아주 잘 짚어주셨네요!&quot;</p>
                    </div>

                    <div className="absolute bottom-10 -right-4 bg-black p-4 rounded-2xl shadow-xl z-20 animate-bounce hidden md:block" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Score</span>
                        <p className="text-lg font-black text-white">95점 / 100점</p>
                    </div>

                    <div className="relative w-64 h-64 lg:w-80 lg:h-80 flex flex-col items-center justify-center">
                        <div className="absolute bottom-0 w-40 h-4 bg-slate-200 rounded-full blur-md animate-pulse"></div>

                        <div className="animate-bounce relative flex flex-col items-center" style={{ animationDuration: '3s' }}>
                            <div className="w-2 h-8 bg-slate-300 rounded-t-full relative z-0">
                                <div className="absolute -top-3 -left-1 w-4 h-4 bg-indigo-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.8)] animate-pulse"></div>
                            </div>

                            <div className="w-48 h-48 lg:w-56 lg:h-56 bg-white rounded-full border-4 border-slate-200 shadow-xl flex flex-col items-center justify-center relative z-10 overflow-hidden">
                                <div className="absolute -left-1.5 w-4 h-16 bg-slate-200 rounded-r-xl top-1/2 -translate-y-1/2"></div>
                                <div className="absolute -right-1.5 w-4 h-16 bg-slate-200 rounded-l-xl top-1/2 -translate-y-1/2"></div>

                                <div className="w-32 h-20 bg-[#0F172A] rounded-[36px] flex items-center justify-center gap-5 relative overflow-hidden shadow-inner z-20">
                                    <div className="w-7 h-3 bg-emerald-400 rounded-full shadow-[0_0_15px_#34d399] animate-pulse"></div>
                                    <div className="w-7 h-3 bg-emerald-400 rounded-full shadow-[0_0_15px_#34d399] animate-pulse"></div>
                                </div>

                                <div className="flex gap-20 mt-4 z-20">
                                    <span className="w-5 h-2 bg-rose-200/70 rounded-full blur-[2px]"></span>
                                    <span className="w-5 h-2 bg-rose-200/70 rounded-full blur-[2px]"></span>
                                </div>
                            </div>

                            <div className="absolute -top-2 -right-8 bg-black text-white p-3 rounded-2xl rounded-bl-none shadow-lg z-20">
                                <div className="flex gap-2 p-1">
                                    <span className="w-2 h-2 bg-white rounded-full inline-block animate-bounce" style={{ animationDelay: '0s' }}></span>
                                    <span className="w-2 h-2 bg-white rounded-full inline-block animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                    <span className="w-2 h-2 bg-white rounded-full inline-block animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
