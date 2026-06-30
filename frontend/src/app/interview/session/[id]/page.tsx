'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Timer, ArrowRight, ArrowLeft, CheckCircle2, Circle, X, Bot, Sparkles, SkipForward, AlertTriangle, CheckSquare } from 'lucide-react';
import { InterviewApi, QuestionResponse } from "@/services/interview";

interface Props {
  params: Promise<{ id: string }>;
}

export default function InterviewSessionPage({ params }: Props) {
  const router = useRouter();
  const resolvedParams = use(params);
  const sessionId = Number(resolvedParams.id);

  const [currentQuestion, setCurrentQuestion] = useState<QuestionResponse | null>(null);
  const [questionsPool, setQuestionsPool] = useState<QuestionResponse[]>([]);
  const [displayedQuestion, setDisplayedQuestion] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [aiState, setAiState] = useState<'speaking' | 'listening' | 'analyzing'>('speaking');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasWarned1Min, setHasWarned1Min] = useState(false);

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const currentIdx = Array.isArray(questionsPool)
      ? questionsPool.findIndex(q => q.id === currentQuestion?.id)
      : -1;

  const totalQuestionsCount = Array.isArray(questionsPool) ? questionsPool.length : 10;
  const currentAnswerText = currentQuestion ? (answers[currentQuestion.id] || '') : '';
  const isLastQuestion = currentIdx === totalQuestionsCount - 1;

  const handleInputChange = (text: string) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: text
    }));
  };

  const handleNextSubmit = async (forcedText?: string) => {
    if (!currentQuestion) return;
    setAiState('analyzing');

    let submissionText = typeof forcedText === 'string' ? forcedText : currentAnswerText;

    if (isLastQuestion && (!submissionText || submissionText.trim() === '')) {
      submissionText = '미응답';
    }

    try {
      await InterviewApi.submitAnswerAndNext({
        sessionId,
        questionId: currentQuestion.id,
        content: submissionText
      });

      if (!isLastQuestion) {
        const nextQuestion = await InterviewApi.nextQuestion(sessionId, currentQuestion.stepOrder);
        if (nextQuestion) {
          setHasWarned1Min(false);
          setCurrentQuestion(nextQuestion);
          setTimeLeft(5 * 60);
        }
      } else {
        router.push(`/interview/analyzing/${sessionId}`);
      }
    } catch (error) {
      console.error(error);
      alert("답변 기록 중 오류가 발생했습니다.");
      setAiState('listening');
    }
  };

  const handlePass = async () => {
    if (!currentQuestion || isLastQuestion) return;
    if (!confirm('이 질문을 패스하시겠습니까? (답변 기록 없이 다음 질문으로 넘어갑니다.)')) return;

    setAiState('analyzing');
    try {
      await InterviewApi.passQuestion(sessionId, currentQuestion.stepOrder);
      const nextQuestion = await InterviewApi.nextQuestion(sessionId, currentQuestion.stepOrder);
      if (nextQuestion) {
        setHasWarned1Min(false);
        setCurrentQuestion(nextQuestion);
        setTimeLeft(5 * 60);
      }
    } catch (error) {
      console.error(error);
      alert("다음 질문을 불러오는 과정에서 오류가 발생했습니다.");
      setAiState('listening');
    }
  };

  const handlePrev = async () => {
    if (!currentQuestion || currentIdx === 0) return;
    setAiState('analyzing');
    try {
      const prevQuestion = await InterviewApi.prevQuestion(sessionId, currentQuestion.stepOrder);
      if (prevQuestion) {
        setHasWarned1Min(false);
        setCurrentQuestion(prevQuestion);
        setTimeLeft(5 * 60);
      }
    } catch (error) {
      console.error(error);
      alert("이전 질문을 불러오는 데 실패했습니다.");
      setAiState('listening');
    }
  };

  const handleTerminateInterview = async () => {
    setAiState('analyzing');
    setIsCancelModalOpen(false);
    try {
      await InterviewApi.terminateInterview(sessionId);
    } catch (error) {
      console.error(error);
    } finally {
      router.push(`/interview/analyzing/${sessionId}?mode=terminate`);
    }
  };

  useEffect(() => {
    const initInterview = async () => {
      if (!sessionId || isNaN(sessionId)) return;
      try {
        setIsLoading(true);
        let actualQuestions = await InterviewApi.getQuestionsBySession(sessionId);
        if (!actualQuestions || actualQuestions.length === 0) {
          actualQuestions = await InterviewApi.generateQuestions(sessionId);
        }
        setQuestionsPool(Array.isArray(actualQuestions) ? actualQuestions : []);

        const actualFirstQuestion = await InterviewApi.startInterview(sessionId);
        const firstQ = Array.isArray(actualFirstQuestion) ? actualFirstQuestion[0] : actualFirstQuestion;
        setCurrentQuestion(firstQ);
      } catch (error) {
        console.error(error);
        alert("면접 데이터를 가져오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    initInterview();
  }, [sessionId]);

  useEffect(() => {
    const targetText = currentQuestion?.aiQuestion;
    if (!targetText) return;

    let currentIndex = 0;
    setDisplayedQuestion('');
    setAiState('speaking');

    const typingInterval = setInterval(() => {
      currentIndex++;
      setDisplayedQuestion(targetText.substring(0, currentIndex));

      if (currentIndex >= targetText.length) {
        clearInterval(typingInterval);
        setTimeout(() => setAiState('listening'), 300);
      }
    }, 30);

    return () => clearInterval(typingInterval);
  }, [currentQuestion?.id, currentQuestion?.aiQuestion]);

  useEffect(() => {
    if (isLoading || !currentQuestion) return;

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);

          setTimeout(() => {
            alert("🚨 제한 시간 5분이 초과되었습니다! 현재 문항 자동 마감 후 다음 문항으로 강제 전송됩니다.");
            const latestText = answersRef.current[currentQuestion.id] || '';
            const finalActiveAnswer = latestText.trim().length >= 10
                ? latestText
                : `${latestText} (제한 시간 초과로 인한 자동 제출)`;
            handleNextSubmit(finalActiveAnswer);
          }, 10);

          return 0;
        }

        if (prev === 61 && !hasWarned1Min) {
          setHasWarned1Min(true);
          setTimeout(() => alert("⏳ 답변 제한 시간이 1분 남았습니다! 답변을 마무리해 주세요."), 10);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isLoading, currentQuestion?.id, hasWarned1Min]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isLoading || !currentQuestion) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-black">
          <Bot className="w-6 h-6 animate-spin mr-2" /> 면접 세션을 안전하게 활성화하는 중...
        </div>
    );
  }

  return (
      <div className="min-h-screen h-screen bg-[#F8FAFC] flex flex-col antialiased font-sans w-full overflow-hidden relative"
           style={{
             backgroundImage: 'linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }}>

        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center gap-3 text-black font-black text-xl">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
              <MessageSquare className="w-4 h-4 fill-white" />
            </div>
            <span className="tracking-tighter">InterviewMate</span>
            <span className="ml-4 px-2.5 py-1 bg-slate-100 text-slate-500 rounded-md text-[10px] font-black uppercase tracking-widest hidden md:block">
                Session: {sessionId}
            </span>
          </div>

          <button
              onClick={() => setIsCancelModalOpen(true)}
              className="flex items-center gap-2 text-slate-400 hover:text-black font-bold text-sm transition-colors"
          >
            <X className="w-5 h-5" />
            <span>면접 중단하기</span>
          </button>
        </header>

        <div className="flex-1 flex overflow-hidden w-full max-w-[1400px] mx-auto p-6 md:p-10 gap-8 relative z-0">
          <aside className="w-[300px] bg-white rounded-[24px] border border-slate-200 shadow-sm flex flex-col overflow-hidden shrink-0 hidden lg:flex relative">
            <div className="absolute top-0 left-0 right-0 h-2 bg-black"></div>
            <div className="p-6 border-b border-slate-100 pt-8">
              <h2 className="text-lg font-black text-black">질문 목록</h2>
              <p className="text-xs font-bold text-slate-400 mt-1">총 {totalQuestionsCount}개의 질문이 준비되어 있습니다.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
              {Array.isArray(questionsPool) && questionsPool.map((q, idx) => {
                const isCompleted = idx < currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                    <div key={q.id}
                         className={`flex items-center justify-between p-3.5 rounded-xl transition-all ${
                             isCurrent
                                 ? 'bg-black text-white shadow-md scale-105 my-2'
                                 : isCompleted
                                     ? 'bg-transparent text-slate-400'
                                     : 'bg-transparent text-slate-600'
                         }`}>
                      <div className="flex items-center gap-3 overflow-hidden">
                        {isCompleted ? (
                            <CheckCircle2 className={`w-5 h-5 shrink-0 ${isCurrent ? 'text-white' : 'text-slate-300'}`} />
                        ) : (
                            <Circle className={`w-5 h-5 shrink-0 ${isCurrent ? 'text-white' : 'text-slate-300'}`} />
                        )}
                        <span className={`text-sm font-bold truncate ${isCompleted && !isCurrent ? 'line-through decoration-slate-300' : ''}`}>
                            {idx + 1}. {q.aiQuestion}
                        </span>
                      </div>
                    </div>
                );
              })}
            </div>
          </aside>

          <main className="flex-1 flex flex-col h-full overflow-hidden relative">
            <div className="flex justify-between items-end mb-6 px-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-black">{currentIdx + 1}</span>
                <span className="text-xl font-bold text-slate-400">/ {totalQuestionsCount}</span>
              </div>

              <div className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm border shadow-sm transition-colors ${
                  timeLeft <= 60 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-white text-black border-slate-200'
              }`}>
                <Timer className="w-5 h-5" />
                <span className="text-base tracking-widest">{formatTime(timeLeft)}</span>
              </div>
            </div>

            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm flex-1 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-black"></div>

              <div className="p-8 md:p-12 flex-1 flex flex-col relative">
                <div className="flex items-start justify-between mb-6">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                        aiState === 'speaking' ? 'bg-indigo-600' : aiState === 'analyzing' ? 'bg-black' : 'bg-slate-800'
                    }`}>
                      <Bot className={`w-6 h-6 text-white ${aiState === 'speaking' ? 'animate-bounce' : ''}`} style={{ animationDuration: '2s' }} />
                    </div>
                    {aiState === 'speaking' && <div className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-ping opacity-75"></div>}
                    {aiState === 'analyzing' && <div className="absolute inset-0 rounded-full border-2 border-slate-400 animate-spin border-t-transparent"></div>}
                  </div>
                  <div className="flex flex-col ml-4">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-emerald-500" />
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">AI Interviewer</span>
                    </div>
                    <span className="text-sm font-bold text-black mt-0.5">
                      {aiState === 'speaking' && '질문을 전달하고 있습니다...'}
                      {aiState === 'listening' && '답변을 기다리고 있습니다.'}
                      {aiState === 'analyzing' && '답변을 기록 중입니다...'}
                    </span>
                  </div>
                </div>

                <div className="mb-8 pl-16 pr-2">
                    <span className="inline-block px-3 py-1.5 bg-slate-100 text-slate-600 font-black text-xs rounded-lg mb-4">
                        Question {currentQuestion.stepOrder}
                    </span>
                  <h2 className="text-2xl md:text-3xl font-black text-black leading-snug break-keep min-h-[80px]">
                    Q{currentIdx + 1}. {displayedQuestion}
                    {aiState === 'speaking' && <span className="inline-block w-2 h-6 bg-indigo-500 ml-1 animate-pulse align-middle"></span>}
                  </h2>
                </div>

                <div className="flex-1 flex flex-col relative group">
                    <textarea
                        value={currentAnswerText}
                        onChange={(e) => handleInputChange(e.target.value)}
                        disabled={aiState === 'speaking' || aiState === 'analyzing' || timeLeft === 0}
                        placeholder={
                          aiState === 'speaking'
                              ? "AI가 질문을 마칠 때까지 잠시 대기해주세요..."
                              : aiState === 'analyzing'
                                  ? "답변을 서버에 기록하고 있습니다..."
                                  : "질문에 대한 답변을 입력해주세요... (최소 10자 이상)"
                        }
                        className="w-full flex-1 p-6 pb-12 bg-[#F8FAFC] border border-slate-200 rounded-2xl resize-none text-black font-medium text-lg leading-relaxed focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder:text-slate-400 disabled:opacity-50 disabled:bg-slate-100"
                    />

                  <div className="absolute bottom-6 right-6">
                        <span className="text-xs font-bold text-slate-400 bg-transparent px-1">
                            {currentAnswerText.length} / 2000
                        </span>
                  </div>
                </div>
              </div>

              <div className="p-6 md:px-12 md:py-8 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                    onClick={handlePrev}
                    disabled={currentIdx === 0 || aiState === 'analyzing'}
                    className="w-full sm:w-auto px-6 py-4 bg-white text-black font-black rounded-xl text-sm border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>이전 질문</span>
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {!isLastQuestion && (
                      <button
                          onClick={handlePass}
                          disabled={aiState === 'speaking' || aiState === 'analyzing'}
                          className="w-full sm:w-auto px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-xl text-sm transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="모르겠다면 넘어가기"
                      >
                        <SkipForward className="w-4 h-4" />
                        <span>패스하기</span>
                      </button>
                  )}

                  <button
                      onClick={() => handleNextSubmit()}
                      disabled={aiState === 'speaking' || aiState === 'analyzing' || (!isLastQuestion && currentAnswerText.length < 10)}
                      className={`w-full sm:w-auto px-10 py-4 font-black rounded-xl text-sm transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed shrink-0 ${
                          isLastQuestion
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-black hover:bg-slate-900 text-white'
                      }`}
                  >
                    {aiState === 'analyzing' ? (
                        <span>기록 중...</span>
                    ) : (
                        <span>{isLastQuestion ? '최종 면접 종료 및 분석하기' : '답변 제출 및 다음'}</span>
                    )}
                    {aiState !== 'analyzing' && (isLastQuestion ? <CheckSquare className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />)}
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>

        {isCancelModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md p-8 relative">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-6">
                  <AlertTriangle className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-xl font-black text-black mb-2 tracking-tight">면접을 중단하시겠습니까?</h3>
                <p className="text-sm font-bold text-slate-500 mb-8 break-keep leading-relaxed">
                  지금 중단하시면 현재 질문까지 진행된 내역을 토대로<br/>마감 처리가 진행되며, AI 분석 리포트 화면으로 이동합니다.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                      onClick={() => setIsCancelModalOpen(false)}
                      disabled={aiState === 'analyzing'}
                      className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl text-sm transition-all disabled:opacity-50"
                  >
                    계속 진행하기
                  </button>
                  <button
                      onClick={handleTerminateInterview}
                      disabled={aiState === 'analyzing'}
                      className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-black rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {aiState === 'analyzing' ? '중단 처리 중...' : '네, 중단할게요'}
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}