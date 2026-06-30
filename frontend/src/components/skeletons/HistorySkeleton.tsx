'use client';

import React from 'react';

export default function HistorySkeleton() {
    return (
        <>
            {/* 헤더 영역 애니메이션 */}
            <header className="w-full px-12 py-10 shrink-0 flex justify-between items-end animate-pulse">
                <div className="space-y-3">
                    <div className="h-9 w-48 bg-slate-200 rounded-xl"></div>
                    <div className="h-4 w-72 bg-slate-100 rounded-lg"></div>
                </div>
                <div className="h-6 w-16 bg-slate-200 rounded-md"></div>
            </header>

            {/* 리스트 아이템 4개 반복 생성 */}
            <main className="flex-1 w-full px-12 pb-12 max-w-[1200px] animate-pulse">
                <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="bg-white rounded-[20px] p-6 border border-slate-200 flex items-center justify-between h-[106px]"
                        >
                            <div className="flex items-center gap-6 w-full max-w-[70%]">
                                <div className="w-14 h-14 bg-slate-200 rounded-xl shrink-0"></div>
                                <div className="space-y-2.5 w-full">
                                    <div className="h-5 bg-slate-200 rounded-md w-3/4"></div>
                                    <div className="h-3 bg-slate-100 rounded-md w-1/4"></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 shrink-0">
                                <div className="space-y-1 text-right">
                                    <div className="h-3 w-10 bg-slate-100 rounded-sm ml-auto"></div>
                                    <div className="h-7 w-16 bg-slate-200 rounded-md"></div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-slate-100"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </>
    );
}
