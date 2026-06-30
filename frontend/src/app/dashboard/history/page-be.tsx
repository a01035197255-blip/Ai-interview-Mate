'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, History } from 'lucide-react';
import { HistoryApi, HistoryDto } from '@/services/history';
import HistorySkeleton from '@/components/skeletons/HistorySkeleton';

/**
 * 🚀 유지보수 핵심: 점수에 따라 이모지를 결정하는 로직을 한 곳에서 관리
 * 백엔드 변경 없이도 UI 정책을 바로 바꿀 수 있습니다.
 */
const getEmojiByScore = (score: number) => {
    if (score >= 90) return '🔥'; // 열정적인 고득점
    if (score >= 80) return '🚀'; // 성장 중
    if (score >= 70) return '💡'; // 준수한 실력
    return '🎯'; // 도약이 필요한 단계
};

export default function HistoryPage() {
    const [historyData, setHistoryData] = useState<HistoryDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const data = await HistoryApi.getHistoryList();
                setHistoryData(data);
            } catch (error) {
                console.error("연습 기록 데이터를 가져오는 중 오류가 발생했습니다:", error);
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, []);

    if (loading) {
        return <HistorySkeleton />;
    }

    return (
        <>
            {/* 상단 타이틀 헤더 */}
            <header className="w-full px-12 py-10 shrink-0 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-black tracking-tight mb-1">연습 기록 📝</h1>
                    <p className="text-slate-400 font-bold text-sm tracking-wide">과거의 면접 결과와 피드백을 다시 확인하세요.</p>
                </div>
                <p className="text-slate-900 font-black text-lg">
                    총 <span className="text-indigo-600">{historyData.length}</span>건
                </p>
            </header>

            {/* 메인 콘텐츠 (기록 리스트) */}
            <main className="flex-1 w-full px-12 pb-12 overflow-y-auto max-w-[1200px]">
                {historyData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-[24px] border border-slate-200 border-dashed">
                        <History className="w-8 h-8 text-slate-300 mb-3" />
                        <p className="text-slate-500 font-bold">아직 연습 기록이 없습니다.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {historyData.map((item) => (
                            <Link
                                key={item.id}
                                href={`/interview/result/${item.id}`}
                                className="bg-white rounded-[20px] p-6 border border-slate-200 shadow-sm hover:border-black transition-all cursor-pointer flex items-center justify-between group block"
                            >
                                <div className="flex items-center gap-6">
                                    {/* 🚀 이모지 매핑 함수 적용: item.emo가 있다면 사용하고, 없으면 점수 기준 자동 할당 */}
                                    <div className="w-14 h-14 bg-slate-50 border border-slate-200 text-2xl rounded-xl flex items-center justify-center shadow-sm">
                                        {item.emo || getEmojiByScore(item.score)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-black group-hover:underline underline-offset-4">{item.title}</h3>
                                        <div className="flex items-center gap-3 text-sm font-bold text-slate-400 mt-1">
                                            <span>{item.date}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <span>{item.duration} 소요</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Score</span>
                                        <span className="text-2xl font-black text-black">
                                            {item.score}<span className="text-sm text-slate-400 ml-1">점</span>
                                        </span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-black group-hover:border-black transition-colors">
                                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}
