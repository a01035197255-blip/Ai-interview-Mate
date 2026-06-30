'use client';

import {useEffect, useState} from 'react';
import { useParams } from 'next/navigation';
import { AxiosError } from 'axios';
import { ResumeFeedbackApi, ResumeFeedbackResponse } from '@/services/ResumeFeedback';
import { Sparkles, Trophy, MessageSquareText, Mic } from "lucide-react";

export default function ResumeFeedbackPage() {
    const params = useParams();

    const resumeId = Number(params?.id ?? 0);

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<ResumeFeedbackResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!params?.id) return;

        let cancelled = false;

        const sleep = (ms: number) =>
            new Promise(resolve => setTimeout(resolve, ms));

        const run = async () => {
            setLoading(true);
            setError(null);
            setData(null);

            try {
                const id = Number(params.id);

                let result: ResumeFeedbackResponse | null = null;

                try {
                    // 1️⃣ 기존 데이터 조회
                    result = await ResumeFeedbackApi.getFeedback(id);

                } catch (err: unknown) {

                    const error = err as AxiosError;

                    // 2️⃣ 없으면 생성
                    if (error.response?.status === 404) {
                        await ResumeFeedbackApi.create(id);

                        // 3️⃣ 충분히 긴 polling (핵심 수정)
                        for (let i = 0; i < 30; i++) {
                            if (cancelled) return;

                            await sleep(2000);

                            try {
                                const res = await ResumeFeedbackApi.getFeedback(id);

                                if (res) {
                                    result = res;
                                    break;
                                }

                            } catch (e: any) {
                                const retryErr = e as AxiosError;

                                // 404는 아직 생성 중 → 계속 대기
                                if (retryErr.response?.status !== 404) {
                                    throw e;
                                }
                            }
                        }
                    } else {
                        throw err;
                    }
                }

                if (cancelled) return;

                if (!result) {
                    // ❗ 실패가 아니라 "타임아웃"
                    throw new Error("생성 시간이 너무 오래 걸림");
                }

                setData(result);

            } catch (e) {
                if (!cancelled) {
                    setError("이력서 조회 실패");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [params?.id]);

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-10 flex justify-center">
            <div className="w-full max-w-5xl space-y-6">

                {/* HEADER */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-black rounded-xl">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>

                        <h1 className="text-2xl font-black text-black">
                            AI 이력서 피드백
                        </h1>
                    </div>

                    <p className="text-sm text-slate-500 mt-1">
                        Resume ID: {resumeId}
                    </p>
                </div>

                {/* LOADING */}
                {loading && (
                    <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center">
                        <div className="animate-spin w-6 h-6 border-2 border-black border-t-transparent rounded-full mx-auto mb-3"></div>
                        <p className="text-sm font-bold text-slate-500">
                            AI가 이력서를 분석 중입니다...
                        </p>
                    </div>
                )}

                {/* ERROR */}
                {error && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-red-600 font-bold">
                        {error}
                    </div>
                )}

                {/* RESULT */}
                {data && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[80vh] overflow-y-auto pr-2">

                        {/* SCORE */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-1">
                                <h2 className="text-sm text-slate-500 font-bold">총점</h2>
                                <Trophy className="w-4 h-4 text-slate-400" />
                            </div>

                            <p className="text-4xl font-black text-black mt-2">
                                {data.totalScore}
                                <span className="text-base text-slate-400 ml-1">점</span>
                            </p>
                        </div>

                        {/* OVERALL */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-2">
                            <div className="flex items-center gap-1 mb-2">
                                <h3 className="text-sm font-bold text-slate-500">
                                    전체 피드백
                                </h3>
                                <MessageSquareText className="w-4 h-4 text-slate-400" />
                            </div>

                            <p className="text-sm text-slate-700 leading-relaxed">
                                {data.overallFeedback}
                            </p>
                        </div>

                        {/* SELF INTRO */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-black text-black mb-2">자기소개 강점</h3>
                            <p className="text-sm text-slate-600">
                                {data.selfIntroStrength}
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-black text-black mb-2">자기소개 약점</h3>
                            <p className="text-sm text-slate-600">
                                {data.selfIntroWeakness}
                            </p>
                        </div>

                        {/* PROJECT */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-black text-black mb-2">프로젝트 강점</h3>
                            <p className="text-sm text-slate-600">
                                {data.projectStrength}
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-black text-black mb-2">프로젝트 약점</h3>
                            <p className="text-sm text-slate-600">
                                {data.projectWeakness}
                            </p>
                        </div>

                        {/* INTERVIEW QUESTIONS */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-2">
                            <h3 className="font-black text-black mb-3 flex items-center gap-2">
                                <Mic className="w-4 h-4 text-slate-400" />
                                예상 면접 질문
                            </h3>

                            <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                {data.interviewQuestions?.length ? (
                                    data.interviewQuestions.map((q, i) => (
                                        <li
                                            key={i}
                                            className="text-sm bg-slate-50 border border-slate-100 p-3 rounded-xl"
                                        >
                                            {q}
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-400">
                                        생성된 질문이 없습니다
                                    </p>
                                )}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}