'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Award, CheckCircle2, RefreshCw, LayoutDashboard, Clock, ThumbsUp, Lightbulb, Bot, BarChart3, Edit2, MessageSquare } from 'lucide-react';
import { InterviewApi, ResultResponse, ReportResponse, QuestionResponse } from "@/services/interview";

interface Props {
    params: Promise<{ id: string }>;
}

export default function InterviewResultPage({ params }: Props) {
    const router = useRouter();
    const resolvedParams = use(params);
    const sessionId = Number(resolvedParams.id);

    // ==========================================
    // 상태 관리 (State)
    // ==========================================
    const [result, setResult] = useState<ResultResponse | null>(null);
    const [report, setReport] = useState<ReportResponse | null>(null);
    const [questionsPool, setQuestionsPool] = useState<QuestionResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [title, setTitle] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // ==========================================
    // 데이터 Fetch 로직
    // ==========================================
    useEffect(() => {
        const fetchResultData = async () => {
            try {
                setIsLoading(true);

                // 병렬 데이터 페칭(Promise.all)으로 성능 최적화 🚀
                const [resultData, reportData, poolData] = await Promise.all([
                    InterviewApi.getInterviewResult(sessionId),
                    InterviewApi.getDetailedReport(sessionId),
                    InterviewApi.getQuestionsBySession(sessionId)
                ]);

                setResult(resultData);
                setReport(reportData);
                setQuestionsPool(Array.isArray(poolData) ? poolData : []);

                setTitle(reportData?.title || `AI 면접 연습 리포트 #${sessionId}`);
            } catch (error) {
                console.error("결과 레포트 로드 실패:", error);
                alert("리포트 데이터를 가져오지 못했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        if (sessionId && !isNaN(sessionId)) fetchResultData();
    }, [sessionId]);

    // ==========================================
    // 타이틀 수정 저장 이벤트 핸들러
    // ==========================================
    const handleSaveTitle = async () => {
        if (!title.trim()) {
            alert("면접 이름을 입력해 주세요.");
            return;
        }

        try {
            setIsSaving(true);
            if (typeof (InterviewApi as any).updateReportTitle === 'function') {
                await (InterviewApi as any).updateReportTitle(sessionId, title);
            }
            setIsEditing(false);
        } catch (error) {
            console.error("이름 저장 실패:", error);
            alert("이름을 저장하는 중 오류가 발생했습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-bold text-black gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                <span>AI가 생성한 심층 리포트를 불러오는 중...</span>
            </div>
        );
    }

    // ==========================================
    // 연산 및 데이터 가공
    // ==========================================
    const scoreMetrics = [
        { label: '기술 정확성 (Technical Accuracy)', score: (result as any)?.technicalAccuracy ?? 0, color: 'bg-indigo-600' },
        { label: '논리성 (Logic)', score: (result as any)?.logic ?? 0, color: 'bg-blue-600' },
        { label: '구성력 (Structure)', score: (result as any)?.structure ?? 0, color: 'bg-emerald-600' },
        { label: '의사소통 (Communication)', score: (result as any)?.communication ?? 0, color: 'bg-amber-600' },
        { label: '문제 해결 능력 (Problem Solving)', score: (result as any)?.problemSolving ?? 0, color: 'bg-rose-600' },
    ];

    const actualAnsweredCount = questionsPool.length > 0
        ? questionsPool.filter(q => {
            const answerText = (q as any).answerContent || (q as any).content || '';
            if (!answerText || answerText.includes('중도 종료') || answerText.includes('Pass')) {
                return false;
            }
            return true;
        }).length
        : (result?.passedCount !== undefined ? (10 - result.passedCount) : 0);

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-12 antialiased font-sans"
             style={{
                 backgroundImage: 'linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)',
                 backgroundSize: '40px 40px'
             }}>

            <div className="max-w-4xl mx-auto flex flex-col gap-8">

                {/* 🛠️ 상단 헤더 영역 */}
                <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-black"></div>
                    <div className="w-full md:w-auto flex-1">
                        <span className="text-xs font-black uppercase tracking-widest px-2.5 py-1 bg-slate-100 text-slate-500 rounded-md">
                          Session {sessionId} Result
                        </span>

                        {isEditing ? (
                            <div className="flex items-center gap-2 mt-2 w-full max-w-md animate-in fade-in duration-200">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    disabled={isSaving}
                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-black font-bold text-lg focus:outline-none focus:border-black transition-all"
                                    placeholder="면접 연습 이름을 지정해 주세요"
                                />
                                <button
                                    onClick={handleSaveTitle}
                                    disabled={isSaving}
                                    className="px-4 py-2.5 bg-black hover:bg-slate-900 text-white font-black rounded-xl text-sm transition-all shrink-0 disabled:opacity-40"
                                >
                                    {isSaving ? '저장 중' : '저장'}
                                </button>
                                <button
                                    onClick={() => {
                                        setTitle(report?.title || `AI 면접 연습 리포트 #${sessionId}`);
                                        setIsEditing(false);
                                    }}
                                    disabled={isSaving}
                                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-all"
                                >
                                    취소
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 mt-2 group">
                                <h1 className="text-2xl md:text-3xl font-black text-black tracking-tight break-all">
                                    {title}
                                </h1>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-black transition-colors shrink-0"
                                    title="면접 이름 변경하기"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 우측 상단 액션 네비게이션 버튼 그룹 */}
                    <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                        {/* 🚀 [경로 교정 완료] 문항별 상세 피드백 화면 리다이렉트 단추 */}
                        <button
                            onClick={() => router.push(`/interview/feedback/${sessionId}`)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl text-sm transition-all border border-slate-200"
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span>AI 상세 피드백</span>
                        </button>

                        <button
                            onClick={() => router.push('/dashboard/practice')}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3.5 bg-black hover:bg-slate-900 text-white font-black rounded-xl text-sm transition-all shadow-sm"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>연습실 메인으로</span>
                        </button>
                    </div>
                </header>

                {/* 대시보드 스코어 카드 영역 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DashboardCard
                        icon={<Award className="w-7 h-7" />}
                        label="종합 평가 등급"
                        value={result?.grade || "D"}
                        subValue={`(${result?.score ?? 0}점)`}
                    />
                    <DashboardCard
                        icon={<Clock className="w-7 h-7" />}
                        label="총 면접 진행 시간"
                        value={result?.totalTime || "00:00"}
                    />
                    <DashboardCard
                        icon={<CheckCircle2 className="w-7 h-7" />}
                        label="답변 완료 문항"
                        value={`${actualAnsweredCount} / 10 문항`}
                    />
                </div>

                {/* 세부 역량 진단 지표 */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-col gap-6 relative">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-slate-800"></div>
                    <div className="flex items-center gap-2 text-slate-800">
                        <BarChart3 className="w-5 h-5" />
                        <h2 className="text-lg font-black tracking-tight">면접 역량 다차원 진단 지표</h2>
                    </div>
                    <div className="flex flex-col gap-5">
                        {scoreMetrics.map((metric, idx) => (
                            <MetricProgressBar key={idx} {...metric} />
                        ))}
                    </div>
                </div>

                {/* AI 종합 평가 의견 */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-col gap-4 relative">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-indigo-600"></div>
                    <div className="flex items-center gap-2 text-indigo-600">
                        <Bot className="w-5 h-5" />
                        <h2 className="text-lg font-black tracking-tight">AI 면접관 종합 분석 의견</h2>
                    </div>
                    <p className="text-base font-bold text-slate-700 leading-relaxed break-keep bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        {report?.summary || "등록된 종합 의견이 없습니다."}
                    </p>
                </div>

                {/* 강점 및 개선 피드백 영역 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FeedbackCard
                        title="발굴된 지원자 강점"
                        items={result?.strengths}
                        type="strength"
                    />
                    <FeedbackCard
                        title="핵심 집중 피드백 & 개선 요구사항"
                        items={result?.improvements}
                        type="improvement"
                    />
                </div>

            </div>
        </div>
    );
}

// ==========================================
// 하위 컴포넌트 재사용 분리
// ==========================================

interface DashboardCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    subValue?: string;
}
function DashboardCard({ icon, label, value, subValue }: DashboardCardProps) {
    return (
        <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-5 relative">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-black shrink-0">
                {icon}
            </div>
            <div>
                <span className="text-xs font-bold text-slate-400">{label}</span>
                <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xl md:text-2xl font-black text-black">{value}</span>
                    {subValue && <span className="text-sm font-bold text-slate-400">{subValue}</span>}
                </div>
            </div>
        </div>
    );
}

interface MetricProgressBarProps {
    label: string;
    score: number;
    color: string;
}
function MetricProgressBar({ label, score, color }: MetricProgressBarProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm font-bold text-slate-600 sm:w-1/3">{label}</span>
            <div className="flex-1 flex items-center gap-4 w-full">
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${score}%` }}></div>
                </div>
                <span className="text-sm font-black text-black w-12 text-right">{score}점</span>
            </div>
        </div>
    );
}

interface FeedbackCardProps {
    title: string;
    items?: string[];
    type: 'strength' | 'improvement';
}
function FeedbackCard({ title, items, type }: FeedbackCardProps) {
    const isStrength = type === 'strength';
    const iconColorClass = isStrength ? 'text-emerald-600' : 'text-amber-600';
    const bgColorClass = isStrength ? 'bg-emerald-50/50 border-emerald-100' : 'bg-amber-50/50 border-amber-100';
    const numColorClass = isStrength ? 'bg-emerald-500' : 'bg-amber-500';
    const emptyText = isStrength ? '이번 세션에서 발견된 뚜렷한 강점이 기록되지 않았습니다.' : '개선 피드백 데이터가 비어 있습니다.';

    const validItems = items?.filter(item => item.trim().length > 0) || [];

    return (
        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className={`flex items-center gap-2 ${iconColorClass}`}>
                {isStrength ? <ThumbsUp className="w-5 h-5" /> : <Lightbulb className="w-5 h-5" />}
                <h2 className="text-lg font-black tracking-tight">{title}</h2>
            </div>
            <div className="flex flex-col gap-3">
                {validItems.length > 0 ? (
                    validItems.map((item, index) => (
                        <div key={index} className={`flex items-start gap-3 p-4 rounded-xl border text-sm font-bold text-slate-700 ${bgColorClass}`}>
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs shrink-0 ${numColorClass}`}>
                                {index + 1}
                            </span>
                            <span className="break-keep">{item}</span>
                        </div>
                    ))
                ) : (
                    <div className="text-sm font-bold text-slate-400 text-center py-6">{emptyText}</div>
                )}
            </div>
        </div>
    );
}