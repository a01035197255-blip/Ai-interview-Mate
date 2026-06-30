'use client';

import React, { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Sparkles, ShieldAlert } from 'lucide-react';
import { InterviewApi } from '@/services/interview';

interface Props {
  params: Promise<{ id: string }>;
}

export default function AnalyzingPage({ params }: Props) {
  const router = useRouter();
  const resolvedParams = use(params);
  const sessionId = Number(resolvedParams.id);

  const [statusMessage, setStatusMessage] = useState('면접 세션을 마감하고 AI 분석 리포트를 구성하는 중입니다...');
  const [isError, setIsError] = useState(false);
  const hasCalledRef = useRef(false);

  useEffect(() => {
    if (!sessionId || isNaN(sessionId)) return;
    if (hasCalledRef.current) return;

    hasCalledRef.current = true;

    const executeFinishAndAnalysisPipeline = async () => {
      try {
        setStatusMessage('면접을 안전하게 마감 처리하는 중입니다...');
        await InterviewApi.finishInterview(sessionId);

        setStatusMessage('AI 면접관이 답변 내용을 정밀 채점하는 중입니다... (시간이 걸릴 수 있습니다)');
        const feedbackData = await InterviewApi.generateAiFeedback(sessionId);

        console.log("AI 분석 피드백 생성 전과정 완료:", feedbackData);

        router.push(`/interview/result/${sessionId}`);

      } catch (error) {
        console.error("면접 마감 및 AI 분석 파이프라인 실패 로그:", error);
        setIsError(true);
        setStatusMessage('면접 마감 처리 또는 AI 리포트 생성 중 지연이 발생했습니다. 대시보드 마이페이지에서 결과를 확인해 주세요.');
      }
    };

    executeFinishAndAnalysisPipeline();
  }, [sessionId, router]);

  return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-8 antialiased font-sans w-full"
           style={{
             backgroundImage: 'linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }}>

        <div className="w-full max-w-md bg-white rounded-[32px] border border-slate-200 shadow-xl p-8 md:p-10 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-black"></div>

          {isError ? (
              <>
                <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mb-6 animate-pulse">
                  <ShieldAlert className="w-10 h-10" />
                </div>
                <h1 className="text-xl font-black text-black tracking-tight mb-2">분석 지연 안내</h1>
                <p className="text-sm font-bold text-slate-400 break-keep leading-relaxed mb-6">{statusMessage}</p>
                <button
                    onClick={() => router.push('/dashboard/practice')}
                    className="w-full py-4 bg-black text-white font-black rounded-xl text-sm hover:bg-slate-900 transition-all"
                >
                  연습실로 돌아가기
                </button>
              </>
          ) : (
              <>
                <div className="relative mb-8 mt-4">
                  <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center text-white relative z-10 shadow-lg">
                    <Bot className="w-10 h-10 animate-bounce" style={{ animationDuration: '2.5s' }} />
                  </div>
                  <div className="absolute inset-0 rounded-3xl border-4 border-slate-900/10 animate-ping opacity-25"></div>
                  <div className="absolute -top-2 -right-2 bg-indigo-500 text-white p-1.5 rounded-xl shadow-md z-20">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                </div>

                <h1 className="text-2xl font-black text-black tracking-tight mb-2">AI 정밀 분석 중</h1>
                <p className="text-sm font-bold text-slate-400 break-keep leading-relaxed mb-6">{statusMessage}</p>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative">
                  <div className="h-full bg-black rounded-full w-1/2 absolute top-0 left-0"
                       style={{
                         backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                         width: '100%',
                         animation: 'loading 2s infinite ease-in-out'
                       }}
                  ></div>
                </div>

                <style jsx global>{`
                  @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                  }
                `}</style>
              </>
          )}
        </div>
      </div>
  );
}