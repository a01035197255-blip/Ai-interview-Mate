'use client';

import React from 'react';

export default function FeedbackSkeleton() {
    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col w-full animate-pulse">
            {/* 상단 상주 헤더 스켈레튼 */}
            <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                    <div className="h-5 w-32 bg-slate-200 rounded-md"></div>
                    <div className="h-5 w-40 bg-slate-100 rounded-md hidden md:block"></div>
                </div>
                <div className="h-5 w-32 bg-slate-200 rounded-md"></div>
            </header>

            {/* 메인 2분할 콘텐츠 레이아웃 스켈레튼 */}
            <main className="flex-1 w-full max-w-[1200px] mx-auto p-6 md:p-10 space-y-8">
                <div className="space-y-2">
                    <div className="h-9 w-56 bg-slate-200 rounded-xl"></div>
                    <div className="h-4 w-96 bg-slate-100 rounded-lg"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* 좌측 사이드 고정 카드 영역 */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white rounded-[24px] p-8 border border-slate-200 h-[240px] flex flex-col justify-between">
                            <div className="space-y-3 flex flex-col items-center pt-2">
                                <div className="h-3 w-20 bg-slate-100 rounded-md"></div>
                                <div className="h-14 w-32 bg-slate-200 rounded-xl"></div>
                                <div className="h-6 w-16 bg-slate-100 rounded-full mt-1"></div>
                            </div>
                            <div className="h-4 w-full bg-slate-100 rounded-md"></div>
                        </div>

                        <div className="bg-white rounded-[24px] p-8 border border-slate-200 h-[340px] flex flex-col">
                            <div className="h-3 w-20 bg-slate-100 rounded-md mb-8 pt-2"></div>
                            <div className="w-48 h-48 rounded-full bg-slate-100 mx-auto flex items-center justify-center">
                                <div className="w-32 h-32 rounded-full bg-white"></div>
                            </div>
                        </div>
                    </div>

                    {/* 우측 피드백 카드 리스트 영역 */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="h-5 w-36 bg-slate-200 rounded-md"></div>
                            <div className="h-4 w-12 bg-slate-100 rounded-md"></div>
                        </div>

                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white rounded-[24px] border border-slate-200 p-8 md:p-10 space-y-6 h-[420px]">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-3 w-full max-w-[80%]">
                                        <div className="flex gap-2">
                                            <div className="h-6 w-12 bg-slate-200 rounded-md"></div>
                                            <div className="h-6 w-16 bg-slate-200 rounded-md"></div>
                                        </div>
                                        <div className="h-6 bg-slate-200 rounded-md w-full"></div>
                                    </div>
                                    <div className="w-6 h-8 bg-slate-100 rounded-md shrink-0"></div>
                                </div>
                                <div className="h-24 bg-slate-50 border border-slate-100 rounded-2xl"></div>
                                <div className="space-y-2">
                                    <div className="h-4 w-16 bg-slate-200 rounded-md"></div>
                                    <div className="h-4 w-3/4 bg-slate-100 rounded-md"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                    <div className="h-16 bg-slate-50/50 rounded-xl border border-slate-100"></div>
                                    <div className="h-16 bg-slate-50/50 rounded-xl border border-slate-100"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
