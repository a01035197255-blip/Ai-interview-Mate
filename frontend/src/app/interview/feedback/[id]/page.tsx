'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Home, Lightbulb, ChevronDown, ChevronUp, AlertTriangle, CheckSquare, Sparkles } from 'lucide-react';
import { InterviewApi, ReportResponse, QnaSnapshotResponse } from "@/services/interview";

interface Props {
    params: Promise<{ id: string }>;
}

export default function InterviewResultPage({ params }: Props) {
    const router = useRouter();
    const resolvedParams = use(params);
    const sessionId = Number(resolvedParams.id);

    const [feedback, setFeedback] = useState<ReportResponse | null>(null);
    const [qnaSnapshots, setQnaSnapshots] = useState<QnaSnapshotResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openItems, setOpenItems] = useState<number[]>([]);

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                setIsLoading(true);
                const reportData = await InterviewApi.getDetailedReport(sessionId);
                setFeedback(reportData);
                setQnaSnapshots(reportData.qnaSnapshots || []);
            } catch (error) {
                console.error("리포트 조회 실패:", error);
                alert("면접 분석 리포트를 불러오는데 실패했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        if (sessionId && !isNaN(sessionId)) fetchReportData();
    }, [sessionId]);

    const toggleItem = (stepOrder: number) => {
        setOpenItems(prev =>
            prev.includes(stepOrder)
                ? prev.filter(item => item !== stepOrder)
                : [...prev, stepOrder]
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-black">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mr-3"></div>
                리포트 데이터를 심층 분석 중입니다...
            </div>
        );
    }

    const competencyMetrics = [
        { subject: '기술 정확성 (Technical Accuracy)', score: feedback?.technicalAccuracy ?? 0 },
        { subject: '논리성 (Logic)', score: feedback?.logic ?? 0 },
        { subject: '구성력 (Structure)', score: feedback?.structure ?? 0 },
        { subject: '의사소통 (Communication)', score: feedback?.communication ?? 0 },
        { subject: '문제 해결 (Problem Solving)', score: feedback?.problemSolving ?? 0 },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased font-sans w-full"
             style={{
                 backgroundImage: 'linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)',
                 backgroundSize: '40px 40px'
             }}>

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

                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 text-slate-500 hover:text-black font-bold text-sm transition-colors"
                >
                    <Home className="w-5 h-5" />
                    <span>대시보드로 돌아가기</span>
                </button>
            </header>

            <main className="flex-1 w-full max-w-[1200px] mx-auto p-6 md:p-10 space-y-8">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-black tracking-tight mb-1">
                        면접 분석 리포트 📊
                    </h1>
                    <p className="text-slate-500 font-bold text-sm tracking-wide">
                        수고하셨습니다! AI 면접관이 분석한 피드백을 확인해보세요.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-28">
                        <div className="bg-white rounded-[24px] p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-2 bg-black"></div>
                            <div className="text-center pb-6 border-b border-slate-100">
                                <span className="block text-xs font-black text-slate-400 tracking-wider uppercase mb-2 pt-2">Overall Score</span>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-6xl font-black text-black">{feedback?.totalScore ?? 0}</span>
                                    <span className="text-xl font-bold text-slate-400">/ 100</span>
                                </div>
                                {feedback?.tier && (
                                    <span className="inline-block mt-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black">
                                        Tier: {feedback.tier}
                                    </span>
                                )}
                            </div>
                            <div className="pt-6">
                                <p className="text-slate-700 text-sm font-medium leading-relaxed break-keep">
                                    {feedback?.summary || "종합 피드백 의견이 존재하지 않습니다."}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-[24px] p-8 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col">
                            <div className="absolute top-0 left-0 right-0 h-2 bg-black"></div>
                            <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase mb-6 pt-2">역량 차트</h3>
                            <div className="space-y-5">
                                {competencyMetrics.map((data) => (
                                    <div key={data.subject} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-black text-black">{data.subject}</span>
                                            <span className="text-xs font-bold text-slate-400">
                                                <span className="text-sm font-black text-black">{data.score}</span> / 100
                                            </span>
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
                            <h2 className="text-xl font-black text-black">문항별 복기 내역</h2>
                            <span className="text-sm font-bold text-slate-400">총 {qnaSnapshots.length}문항</span>
                        </div>

                        {qnaSnapshots.map((item) => {
                            const isOpen = openItems.includes(item.stepOrder);
                            const isSkipped = !item.answerText ||
                                item.answerText === '미응답' ||
                                item.answerText.includes('중도 종료') ||
                                item.answerText.includes('Pass');

                            return (
                                <div key={item.stepOrder} className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden relative">
                                    <button
                                        onClick={() => toggleItem(item.stepOrder)}
                                        className={`w-full p-8 text-left flex items-start justify-between gap-4 transition-colors ${isOpen ? 'bg-white' : 'hover:bg-slate-50'}`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${isSkipped ? 'bg-slate-200 text-slate-500' : 'bg-black text-white'}`}>
                                                Q {item.stepOrder}
                                            </span>
                                            <div>
                                                {isSkipped ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 text-rose-600 font-black text-[10px] rounded-md mb-2 uppercase tracking-widest border border-rose-100">
                                                        <AlertTriangle className="w-3 h-3" /> Skipped / Terminated
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-600 font-black text-[10px] rounded-md mb-2 uppercase tracking-widest border border-emerald-100">
                                                        <CheckSquare className="w-3 h-3" /> 답변 완료
                                                    </span>
                                                )}
                                                <h3 className="text-lg font-black text-black leading-snug break-keep">
                                                    {item.questionText}
                                                </h3>
                                            </div>
                                        </div>
                                        <div className="pt-1">
                                            {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                        </div>
                                    </button>

                                    {isOpen && (
                                        <div className="px-8 pb-8 animate-in fade-in slide-in-from-top-2 duration-300 space-y-6">
                                            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 relative">
                                                <span className="absolute -top-3 left-6 bg-white border border-slate-200 px-3 py-1 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
                                                    My Answer
                                                </span>
                                                <p className={`font-medium text-sm md:text-base leading-relaxed mt-2 break-keep ${isSkipped ? 'text-rose-600 font-bold italic' : 'text-slate-700'}`}>
                                                    {item.answerText}
                                                </p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="bg-amber-50/60 p-6 rounded-2xl border border-amber-100/80">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                                                            <Lightbulb className="w-4 h-4 text-white fill-amber-100" />
                                                        </div>
                                                        <h4 className="text-sm md:text-base font-black text-amber-900 tracking-tight">
                                                            AI 답변 가이드 — 출제 의도 및 개선점 🎯
                                                        </h4>
                                                    </div>
                                                    <p className="text-slate-700 font-medium text-sm md:text-base leading-relaxed break-keep">
                                                        {item.aiRecommendation ? (
                                                            item.aiRecommendation
                                                        ) : (
                                                            <>
                                                                해당 문항의 맞춤형 실전 모범 답변 가이드 스크립트를 로드하는 중이거나 제공되지 않는 상태입니다.
                                                            </>
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="bg-indigo-50/40 p-6 rounded-2xl border border-indigo-100/60">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                                                            <Sparkles className="w-4 h-4 text-white fill-indigo-100" />
                                                        </div>
                                                        <h4 className="text-sm md:text-base font-black text-indigo-900 tracking-tight">
                                                            AI 모범 답변 예시 — 면접관을 설득하는 실전 스피치 🎤
                                                        </h4>
                                                    </div>
                                                    <div className="bg-white border border-indigo-100/80 p-5 rounded-xl text-slate-700 font-medium text-sm md:text-base leading-relaxed break-keep shadow-inner">
                                                        {item.aiModelAnswer ? (
                                                            item.aiModelAnswer
                                                        ) : (
                                                            <span className="text-slate-400 italic">
                                                                해당 문항의 맞춤형 실전 모범 답변 스크립트를 로드하는 중이거나 제공되지 않는 상태입니다.
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <div className="flex items-center gap-4 pt-8 pb-12">
                            <button
                                onClick={() => router.push('/dashboard/practice')}
                                className="flex-1 py-4 bg-white hover:bg-slate-50 text-black border border-slate-200 font-black rounded-xl text-sm transition-all"
                            >
                                다시 연습하기
                            </button>
                            <button
                                onClick={() => router.push('/dashboard/history')}
                                className="flex-1 py-4 bg-black hover:bg-slate-900 text-white font-black rounded-xl text-sm transition-all shadow-sm"
                            >
                                전체 기록 보기
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}