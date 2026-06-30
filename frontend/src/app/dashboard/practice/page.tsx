'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, ChevronDown, Loader2, Bot } from 'lucide-react';
import { InterviewApi } from '@/services/interview';

export default function PracticePage() {
    const router = useRouter();

    // 💡 백엔드 Enum 파일에 정의된 실제 영문 대문자 상수명으로 초기값을 세팅합니다.
    const [jobRole, setJobRole] = useState('BACKEND_DEVELOPER');
    const [experience, setExperience] = useState('NEWCOMER');
    const [companyType, setCompanyType] = useState('LARGE_COMPANY');

    const [isGenerating, setIsGenerating] = useState(false);

    const handleStartInterview = async () => {
        setIsGenerating(true);
        try {
            // 1️⃣ [Setting] 면접 세팅 생성
            const settingResponse = await InterviewApi.createSetting({
                jobType: jobRole,
                experienceLevel: experience,
                companyType: companyType
            });

            // ApiResponse 구조에서 data 필드를 안전하게 파싱합니다.
            const targetSettingId = settingResponse.id;

            console.log("생성된 세팅 ID:", targetSettingId);

            if (!targetSettingId) {
                throw new Error("면접 설정을 생성하지 못했거나 세팅 ID를 읽을 수 없습니다.");
            }

            // 2️⃣ [Session] 세션 생성
            // 🚀 [타입 에러 해결] 숫자 대신 타입스크립트 스펙(SessionCreateRequest)에 맞춰 객체로 감싸서 보냅니다.
            const sessionResponse = await InterviewApi.createSession({
                settingId: targetSettingId
            });

            // 세션 응답에서도 데이터를 안전하게 추출합니다.
            const targetSessionId = sessionResponse.id;

            console.log("생성된 세션 ID:", targetSessionId);

            if (!targetSessionId) {
                throw new Error("면접 세션을 활성화하지 못했거나 세션 ID를 읽을 수 없습니다.");
            }

            // 3️⃣ [Question] AI 질문 10문항 생성 대기 및 호출
            const questionsResponse = await InterviewApi.generateQuestions(targetSessionId);
            const actualQuestions = questionsResponse;

            console.log("생성된 질문 풀 리스트:", actualQuestions);

            if (!actualQuestions || !actualQuestions.length) {
                throw new Error("AI 맞춤형 질문 풀 생성에 실패했습니다.");
            }

            // 4️⃣ 실제 면접 진행(Flow) 화면으로 라우팅
            router.push(`/interview/session/${targetSessionId}`);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("면접 파이프라인 파트별 셋업 실패 로그:", error);
            alert(`면접 준비 실패: ${error.message || "오류가 발생했습니다. 다시 시도해 주세요."}`);
            setIsGenerating(false); // 버튼 로딩/비활성화 해제
        }
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes wave {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(20deg); }
                }
                .robot-wave {
                    animation: wave 1.2s infinite ease-in-out;
                    display: inline-block;
                    transform-origin: bottom center;
                }
            `}} />

            <header className="w-full px-12 py-10 shrink-0">
                <h1 className="text-3xl lg:text-4xl font-black text-black tracking-tight mb-1">면접 연습 설정 🎯</h1>
                <p className="text-slate-400 font-bold text-sm tracking-wide">실전처럼 연습할 직무와 환경을 세팅해보세요.</p>
            </header>

            <main className="flex-1 w-full px-12 pb-12 overflow-y-auto max-w-[1000px]">
                <div className="bg-white rounded-[24px] p-8 md:p-12 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-black"></div>

                    <div className="space-y-8 pt-4">
                        {/* 1. 직무 선택 */}
                        <div>
                            <label className="block text-xs font-black text-slate-400 tracking-wider uppercase mb-3">직무 (Position)</label>
                            <div className="relative">
                                <select value={jobRole} onChange={(e) => setJobRole(e.target.value)} disabled={isGenerating} className="w-full appearance-none bg-slate-50 border border-slate-200 text-black font-bold text-base px-5 py-4 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all cursor-pointer disabled:opacity-60">
                                    <option value="BACKEND_DEVELOPER">백엔드 개발자</option>
                                    <option value="FRONTEND_DEVELOPER">프론트엔드 개발자</option>
                                    <option value="UI_UX_DESIGNER">UI/UX 디자이너</option>
                                    <option value="SERVICE_PLANNER">서비스 기획자</option>
                                </select>
                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* 2. 경력 선택 */}
                        <div>
                            <label className="block text-xs font-black text-slate-400 tracking-wider uppercase mb-3">경력 (Experience)</label>
                            <div className="relative">
                                <select value={experience} onChange={(e) => setExperience(e.target.value)} disabled={isGenerating} className="w-full appearance-none bg-slate-50 border border-slate-200 text-black font-bold text-base px-5 py-4 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all cursor-pointer disabled:opacity-60">
                                    <option value="NEWCOMER">신입</option>
                                    <option value="JUNIOR">주니어 (1~3년차)</option>
                                    <option value="MID_LEVEL">미드레벨 (4~6년차)</option>
                                    <option value="SENIOR">시니어 (7년차 이상)</option>
                                </select>
                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* 3. 회사 유형 선택 */}
                        <div>
                            <label className="block text-xs font-black text-slate-400 tracking-wider uppercase mb-3">회사 유형 (Company Type)</label>
                            <div className="relative">
                                <select value={companyType} onChange={(e) => setCompanyType(e.target.value)} disabled={isGenerating} className="w-full appearance-none bg-slate-50 border border-slate-200 text-black font-bold text-base px-5 py-4 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all cursor-pointer disabled:opacity-60">
                                    <option value="LARGE_COMPANY">대기업</option>
                                    <option value="MID_COMPANY">중견기업</option>
                                    <option value="STARTUP">스타트업</option>
                                </select>
                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="pt-8 mt-8 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={handleStartInterview}
                                disabled={isGenerating}
                                className={`w-full md:w-auto bg-black text-white font-black px-10 py-4 rounded-xl text-base transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 shrink-0 ${isGenerating ? 'opacity-90 cursor-wait' : 'hover:bg-slate-900'}`}
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                                        <span>AI가 맞춤형 질문을 생성중입니다...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="robot-wave mr-1">
                                            <Bot className="w-6 h-6 text-white" />
                                        </span>
                                        <Play className="w-5 h-5 fill-white" />
                                        <span>AI 면접 시작하기</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}
