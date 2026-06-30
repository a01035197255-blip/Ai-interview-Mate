'use client';

import React from 'react';

export default function SettingsSkeleton() {
    return (
        <div className="flex-1 w-full flex flex-col overflow-y-auto min-h-screen bg-transparent animate-pulse">

            {/* 1. 상단 헤더 스켈레튼 */}
            <header className="w-full px-12 py-10 shrink-0">
                <div className="h-9 w-48 bg-slate-200 rounded-lg mb-2"></div>
                <div className="h-4 w-72 bg-slate-200 rounded-md"></div>
            </header>

            {/* 2. 메인 콘텐츠 영역 스켈레튼 */}
            <main className="flex-1 w-full px-12 pb-12 max-w-[800px] space-y-8">

                {/* 프로필 정보 카드 스켈레튼 */}
                <section className="bg-white rounded-[24px] p-8 md:p-10 border border-slate-200/60 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 bottom-0 w-2 bg-slate-200"></div>
                    <div className="pl-4 space-y-8">
                        {/* 섹션 타이틀 */}
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
                            <div className="h-6 w-32 bg-slate-200 rounded-md"></div>
                        </div>

                        {/* 대형 아바타 영역 스켈레튼 */}
                        <div className="flex flex-col sm:flex-row sm:items-start gap-8 border-b border-slate-50 pb-8">
                            <div className="w-32 h-32 rounded-full bg-slate-200 shrink-0"></div>
                            <div className="flex-1 space-y-3 pt-2">
                                <div className="h-5 w-24 bg-slate-200 rounded-md"></div>
                                <div className="h-4 w-64 bg-slate-200 rounded-md"></div>
                                <div className="h-8 w-28 bg-slate-100 rounded-lg pt-1"></div>
                            </div>
                        </div>

                        {/* 입력창 2개 */}
                        <div className="space-y-6">
                            <div>
                                <div className="h-4 w-32 bg-slate-200 rounded-md mb-2"></div>
                                <div className="w-full h-14 bg-slate-50 border border-slate-100 rounded-xl"></div>
                            </div>
                            <div>
                                <div className="h-4 w-40 bg-slate-200 rounded-md mb-2"></div>
                                <div className="w-full h-14 bg-slate-50 border border-slate-100 rounded-xl"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 비밀번호 변경 바 스켈레튼 */}
                <section className="bg-white rounded-[24px] p-8 md:p-10 border border-slate-200/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
                            <div className="h-6 w-36 bg-slate-200 rounded-md"></div>
                        </div>
                        <div className="h-4 w-80 bg-slate-200 rounded-md"></div>
                    </div>
                    <div className="w-40 h-14 bg-slate-100 rounded-xl shrink-0"></div>
                </section>

                {/* 저장 버튼 스켈레튼 */}
                <div className="flex justify-end pt-2">
                    <div className="w-44 h-14 bg-slate-200 rounded-xl"></div>
                </div>

            </main>
        </div>
    );
}
