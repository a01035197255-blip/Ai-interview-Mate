'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MessageSquare, RefreshCcw, FileText, Clock, SkipForward, Home, Bot, Trophy } from 'lucide-react';
import { InterviewApi, ResultSummary } from '@/services/interview';

export default function InterviewResultSummaryPage() {
    const router = useRouter();
    const params = useParams();
    const sessionId = params.id as string;

    const [resultData, setResultData] = useState<ResultSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                // 백엔드 API 호출 (세션 ID 기반 결과 요약 데이터 패치)
                const data = await InterviewApi.getInterviewResult(sessionId);
                setResultData(data.summary);
            } catch (error) {
                console.error("결과 데이터를 불러오는데 실패했습니다.", error);
                router.push('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [sessionId, router]);

    if (loading || !resultData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen h-screen bg-[#F8FAFC] flex flex-col antialiased font-sans w-full overflow-hidden"
             style={{
                 backgroundImage: 'linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)',
                 backgroundSize: '40px 40px'
             }}>

            {/* 애니메이션 정의 */}
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes robotFestival {
                0%, 100% { transform: translateY(0) scale(1); }
                40% { transform: translateY(-14px) scale(1.05) rotate(-3deg); }
                50% { transform: translateY(-14px) scale(1.05) rotate(3deg); }
                85% { transform: translateY(2px) scaleY(0.95); }
              }
              .animate-robot-festival { animation: robotFestival 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite; }
            `}} />

            <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10">
                <div className="flex items-center gap-3 text-black font-black text-xl">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                        <MessageSquare className="w-4 h-4 fill-white" />
                    </div>
                    <span className="tracking-tighter">InterviewMate</span>
                </div>
                <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-black font-bold text-sm transition-colors">
                    <Home className="w-5 h-5" /> <span>대시보드로 돌아가기</span>
                </button>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
                <div className="w-full max-w-[840px] space-y-8 py-4">

                    {/* 면접 완료 문구 및 점수 서클 */}
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="space-y-1">
                            <h1 className="text-3xl md:text-4xl font-black text-black tracking-tight">면접이 완료되었습니다! 🎉</h1>
                            <p className="text-slate-500 font-bold text-base">고생하셨습니다. 방금 진행한 면접의 종합 스코어입니다.</p>
                        </div>
                        <div className="bg-white border-2 border-black rounded-[28px] px-10 py-5 shadow-sm flex items-center gap-6 animate-in fade-in zoom-in-95 duration-500">
                            <div className="bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center border border-slate-100">
                                <Trophy className="w-6 h-6 text-black fill-black/10" />
                            </div>
                            <div className="text-left">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overall Score</span>
                                <div className="flex items-baseline">
                                    <span className="text-4xl font-black text-black">{resultData.score}</span>
                                    <span className="text-sm font-bold text-slate-400 ml-0.5">/ 100</span>
                                    <span className="ml-3 px-2.5 py-0.5 bg-black text-white font-black text-xs rounded-md uppercase">{resultData.grade}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI 평가 요약 카드 */}
                    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 left-0 right-0 h-2 bg-black"></div>
                        <div className="p-8 md:p-10 space-y-6">
                            <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase border-b border-slate-100 pb-3">AI 핵심 평가 요약</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-emerald-50/30 border border-emerald-100/70 p-5 rounded-2xl">
                                    <h4 className="text-sm font-black text-emerald-700 mb-2">🟢 나의 강점</h4>
                                    <ul className="text-sm font-bold text-slate-700 list-disc list-inside space-y-1.5 leading-relaxed">
                                        {resultData.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                                <div className="bg-rose-50/30 border border-rose-100/70 p-5 rounded-2xl">
                                    <h4 className="text-sm font-black text-rose-700 mb-2">🔴 개선이 필요한 영역</h4>
                                    <ul className="text-sm font-bold text-slate-700 list-disc list-inside space-y-1.5 leading-relaxed">
                                        {resultData.improvements.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-1 h-24">
                            <div className="flex items-center gap-1.5 text-slate-400"><Clock className="w-4 h-4" /> <span className="text-[10px] font-black uppercase tracking-widest">소요 시간</span></div>
                            <span className="text-xl font-black text-black">{resultData.totalTime}</span>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-1 h-24">
                            <div className="flex items-center gap-1.5 text-slate-400"><SkipForward className="w-4 h-4" /> <span className="text-[10px] font-black uppercase tracking-widest">패스한 질문</span></div>
                            <span className="text-xl font-black text-black">{resultData.passedCount}개</span>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center gap-4 h-24 relative overflow-hidden">
                            <div className="bg-black text-white p-3 rounded-2xl shadow-md animate-robot-festival z-10"><Bot className="w-5 h-5" /></div>
                            <div className="flex flex-col"><span className="text-xs font-black text-black">완주 성공!</span><span className="text-[10px] font-bold text-slate-400">축하합니다</span></div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <button onClick={() => router.push('/dashboard/practice')} className="flex-1 py-5 bg-white border border-slate-200 hover:border-black text-black font-black rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-[0.99] text-sm shadow-sm">
                            <RefreshCcw className="w-5 h-5" /> 다시 연습하기
                        </button>
                        <button onClick={() => router.push(`/interview/feedback/${sessionId}`)} className="flex-1 py-5 bg-black hover:bg-slate-900 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.99] text-sm">
                            <FileText className="w-5 h-5" /> 상세 피드백 보기
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
