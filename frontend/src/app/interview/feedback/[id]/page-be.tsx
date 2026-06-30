'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Home, Lightbulb, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { InterviewApi } from '@/services/interview';
import FeedbackSkeleton from '@/components/skeletons/FeedbackSkeleton';

interface FeedbackDetail {
    id: number;
    type: string;
    question: string;
    myAnswer: string;
    aiFeedback: string;
    goodPoint: string;
    improvePoint: string;
    isGood: boolean;
}

interface RadarData {
    subject: string;
    score: number;
}

interface DetailedReport {
    title?: string; // 🚀 [추가] 서버에서 받아올 면접 제목 필드
    score: number;
    summary: string;
    radarData: RadarData[];
    details: FeedbackDetail[];
}

export default function InterviewResultPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id: sessionId } = use(params);

    const [reportData, setReportData] = useState<DetailedReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [openItems, setOpenItems] = useState<number[]>([]);

    const toggleItem = (id: number) => {
        setOpenItems(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    useEffect(() => {
        const fetchDetailedReport = async () => {
            try {
                const data = await InterviewApi.getInterviewResult(sessionId);
                setReportData(data.detailedReport);
            } catch (error) {
                console.error("상세 리포트 로드 실패:", error);
                alert("상세 피드백 데이터를 불러올 수 없습니다.");
                router.push('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchDetailedReport();
    }, [sessionId, router]);

    if (loading || !reportData) {
        return <FeedbackSkeleton />;
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased font-sans w-full"
             style={{
                 backgroundImage: 'linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)',
                 backgroundSize: '40px 40px'
             }}>

            <style jsx global>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .accordion-content { animation: slideDown 0.2s ease-out; }
            `}</style>

            <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10 sticky top-0">
                <div className="flex items-center gap-3 text-black font-black text-xl">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                        <MessageSquare className="w-4 h-4 fill-white" />
                    </div>
                    <span className="tracking-tighter">InterviewMate</span>
                    <span className="ml-4 px-2.5 py-1 bg-slate-100 text-slate-500 rounded-md text-[10px] font-black uppercase tracking-widest hidden md:block">
                        Report: {sessionId}
                    </span>
                </div>

                <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-black font-bold text-sm transition-colors">
                    <Home className="w-5 h-5" />
                    <span>대시보드로 돌아가기</span>
                </button>
            </header>

            <main className="flex-1 w-full max-w-[1200px] mx-auto p-6 md:p-10 space-y-8">
                <div>
                    {/* 🚀 [수정] 고정 텍스트 대신 서버에서 전달받은 title 출력 (데이터가 없을 경우 대비 폴백 텍스트 적용) */}
                    <h1 className="text-3xl lg:text-4xl font-black text-black tracking-tight mb-1">
                        {reportData.title || '면접 분석 리포트 📊'}
                    </h1>
                    <p className="text-slate-500 font-bold text-sm tracking-wide">수고하셨습니다! AI 면접관이 분석한 피드백을 확인해보세요.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-28">
                        <div className="bg-white rounded-[24px] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-2 bg-black"></div>
                            <div className="text-center pb-6 border-b border-slate-100">
                                <span className="block text-xs font-black text-slate-400 tracking-wider uppercase mb-2 pt-2">Overall Score</span>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-6xl font-black text-black">{reportData.score}</span>
                                    <span className="text-xl font-bold text-slate-400">/ 100</span>
                                </div>
                            </div>
                            <div className="pt-6">
                                <p className="text-slate-700 text-sm font-medium leading-relaxed break-keep">{reportData.summary}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-[24px] p-8 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col">
                            <div className="absolute top-0 left-0 right-0 h-2 bg-black"></div>
                            <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase mb-6 pt-2">역량 분석</h3>
                            <div className="space-y-5">
                                {reportData.radarData?.map((data) => (
                                    <div key={data.subject} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-black text-black">{data.subject}</span>
                                            <span className="text-xs font-bold text-slate-400"><span className="text-sm font-black text-black">{data.score}</span> / 100</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-black rounded-full transition-all duration-500" style={{ width: `${data.score}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between pb-2">
                            <h2 className="text-xl font-black text-black">문항별 상세 피드백</h2>
                            <span className="text-sm font-bold text-slate-400">총 {reportData.details?.length || 0}문항</span>
                        </div>

                        {reportData.details?.map((item, idx) => {
                            const isOpen = openItems.includes(item.id);
                            return (
                                <div key={item.id} className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden relative">
                                    <button
                                        onClick={() => toggleItem(item.id)}
                                        className={`w-full p-8 text-left flex items-start justify-between gap-4 transition-colors ${isOpen ? 'bg-white' : 'hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${item.isGood ? 'bg-black text-white' : 'bg-slate-200 text-slate-600'}`}>
                                                Q {idx + 1}
                                            </span>
                                            <div>
                                                <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-500 font-black text-[10px] rounded-md mb-2 uppercase tracking-widest">{item.type}</span>
                                                <h3 className="text-lg font-black text-black leading-snug break-keep">{item.question}</h3>
                                            </div>
                                        </div>
                                        <div className="pt-1">
                                            {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                        </div>
                                    </button>

                                    {isOpen && (
                                        <div className="px-8 pb-8 accordion-content border-t border-slate-100">
                                            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 relative mt-6">
                                                <span className="absolute -top-3 left-6 bg-white border border-slate-200 px-3 py-1 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">My Answer</span>
                                                <p className="text-slate-700 font-medium text-sm md:text-base leading-relaxed mt-2 break-keep">{item.myAnswer}</p>
                                            </div>

                                            <div className="mt-8">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center shrink-0"><Lightbulb className="w-3.5 h-3.5 text-white" /></div>
                                                    <h4 className="text-sm font-black text-black">AI 피드백</h4>
                                                </div>
                                                <p className="text-black font-medium text-sm md:text-base leading-relaxed break-keep">{item.aiFeedback}</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                                <div className="flex gap-3 items-start bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                                    <div>
                                                        <span className="block text-[11px] font-black text-emerald-600 uppercase tracking-wider mb-1">Good Point</span>
                                                        <p className="text-sm font-bold text-slate-800 break-keep">{item.goodPoint}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3 items-start bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                                                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                                                    <div>
                                                        <span className="block text-[11px] font-black text-rose-600 uppercase tracking-wider mb-1">Improvement</span>
                                                        <p className="text-sm font-bold text-slate-800 break-keep">{item.improvePoint}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <div className="flex items-center gap-4 pt-8 pb-12">
                            <button onClick={() => router.push('/dashboard/practice')} className="flex-1 py-4 bg-white hover:bg-slate-50 text-black border border-slate-200 font-black rounded-xl text-sm transition-all">다시 연습하기</button>
                            <button onClick={() => router.push('/dashboard/history')} className="flex-1 py-4 bg-black hover:bg-slate-900 text-white font-black rounded-xl text-sm transition-all shadow-sm">전체 기록 보기</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
