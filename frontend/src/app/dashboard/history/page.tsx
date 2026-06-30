'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { History, ArrowRight, Trash2 } from 'lucide-react'; // 🚀 Trash2 아이콘 추가
import HistorySkeleton from '@/components/skeletons/HistorySkeleton';
import { HistoryApi, HistoryDto } from "@/services/history";
import { InterviewApi } from "@/services/interview"; // 🚀 삭제 API 호출용 추가

const formatDate = (dateStr: string) => {
    if (!dateStr) return '날짜 미상';
    return dateStr.substring(0, 10).replace(/-/g, '.');
};

export default function HistoryPage() {
    const [historyData, setHistoryData] = useState<HistoryDto[]>([]);
    const [loading, setLoading] = useState(true);

    // 목록 불러오기 로직 분리
    const loadHistory = async () => {
        try {
            setLoading(true);
            const rawHistory = await HistoryApi.getHistoryList();

            const formattedList = (Array.isArray(rawHistory) ? rawHistory : []).map((item) => {
                const fixedEmojis = ['🚀', '🔥', '💡', '🎯', '⚙️', '💻'];
                const mappedEmoji = fixedEmojis[item.id % fixedEmojis.length];

                return {
                    id: item.id,
                    title: item.title || `AI 면접 연습 리포트 #${item.id}`,
                    emo: mappedEmoji,
                    date: formatDate(item.createdAt),
                    duration: item.duration ? `${item.duration} 소요` : '기록 없음',
                    score: item.score ?? 0
                };
            });

            setHistoryData(formattedList);
        } catch (error) {
            console.error("연습 기록 데이터 연동 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    // 🚀 [추가] 연습 기록 개별 삭제 핸들러
    const handleDeleteHistory = async (e: React.MouseEvent, sessionId: number, title: string) => {
        // 1. 이벤트 버블링 완벽 방어 (부모 Link 컴포넌트의 리다이렉트 차단)
        e.preventDefault();
        e.stopPropagation();

        if (!confirm(`[${title}]\n해당 면접 연습 기록을 정말 완전히 삭제하시겠습니까?\n삭제 후에는 복구가 불가능합니다.`)) {
            return;
        }

        try {
            // 2. 🚀 명시적으로 정의된 세션 파기 API 호출 (DELETE /api/feedback/{sessionId})
            await HistoryApi.deleteInterviewReport(sessionId);

            // 3. 백엔드 벌크 SQL 삭제 성공 시 프론트 State 반영하여 즉시 리스트에서 드롭
            setHistoryData(prev => prev.filter(item => item.id !== sessionId));
            alert("연습 기록이 안전하게 파기되었습니다.");
        } catch (error) {
            console.error("기록 삭제 실패:", error);
            alert("기록을 삭제하는 중 오류가 발생했습니다. 백엔드 콘솔 에러를 확인해 주세요.");
        }
    };

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
                                    <div className="w-14 h-14 bg-slate-50 border border-slate-200 text-2xl rounded-xl flex items-center justify-center shadow-sm">
                                        {item.emo}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-black group-hover:underline underline-offset-4">
                                            {item.title}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm font-bold text-slate-400 mt-1">
                                            <span>{item.date}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <span>{item.duration}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 우측 스코어 및 제어 버튼 그룹 */}
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Score</span>
                                        <span className="text-2xl font-black text-black">
                                            {item.score}<span className="text-sm text-slate-400 ml-1">점</span>
                                        </span>
                                    </div>

                                    {/* 🚀 [추가] 마우스 호버 시 빨갛게 활성화되는 완전 파기 버튼 구역 */}
                                    <button
                                        onClick={(e) => handleDeleteHistory(e, item.id, item.title)}
                                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all"
                                        title="기록 완전히 삭제"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

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