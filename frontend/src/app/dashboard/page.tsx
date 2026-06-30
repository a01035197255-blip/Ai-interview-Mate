'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, TrendingUp, History, ArrowRight, Target, Bot, Sparkles } from 'lucide-react';
import { DashboardApi, DashboardDto } from '@/services/dashboard';
import { HistoryApi, HistoryResponse, HistoryDto } from '@/services/history';
import { UserApi } from '@/services/UserApi';
import { useAuthStore } from '@/store/authStore';

export default function DashboardMainPage() {
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);

  const [dashboardData, setDashboardData] = useState<DashboardDto | null>(null);
  const [recentHistory, setRecentHistory] = useState<HistoryDto[]>([]);
  const [userName, setUserName] = useState<string>('');

  const token = useAuthStore((state) => state.accessToken);

  const convertToHistoryDto = (item: HistoryResponse): HistoryDto => {
    const formattedDate = item.createdAt ? item.createdAt.split('T')[0].replace(/-/g, '.') : '';

    let emo = '👑';
    if (item.score < 60) emo = '🌱';
    else if (item.score < 80) emo = '🏃';
    else if (item.score < 90) emo = '🔥';

    return {
      id: item.id,
      title: item.title || 'AI 면접 연습 리포트',
      date: formattedDate,
      duration: item.duration || '00:00',
      score: item.score || 0,
      emo: emo
    };
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [profileRes, dashboardRes, historyRes] = await Promise.all([
          UserApi.getProfile(),
          DashboardApi.getDashboardSummary(),
          HistoryApi.getHistoryList()
        ]);

        if (isMounted) {
          setUserName(profileRes?.userName || '유저');
          setDashboardData(dashboardRes);

          if (historyRes && Array.isArray(historyRes)) {
            const mapped = historyRes.map(convertToHistoryDto);
            setRecentHistory(mapped);
          }
        }
      } catch (err) {
        console.error("대시보드 데이터를 불러오는 중 오류가 발생했습니다:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [isClient, token]);

  if (!isClient || loading) {
    return (
        <>
          <header className="w-full px-12 py-10 shrink-0 flex flex-col md:flex-row md:justify-between md:items-end gap-6 animate-pulse">
            <div className="space-y-3">
              <div className="h-9 w-64 bg-slate-200 rounded-xl"></div>
              <div className="h-4 w-80 bg-slate-100 rounded-lg"></div>
            </div>
            <div className="h-14 w-48 bg-slate-200 rounded-xl shrink-0"></div>
          </header>

          <main className="flex-1 w-full px-12 pb-12 max-w-[1200px] space-y-8 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {[1, 2].map((i) => (
                  <div key={i} className="bg-white p-8 rounded-[24px] border border-slate-200 h-[164px] flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="h-4 w-24 bg-slate-100 rounded-md"></div>
                      <div className="w-8 h-8 rounded-full bg-slate-50"></div>
                    </div>
                    <div className="h-10 w-20 bg-slate-200 rounded-xl"></div>
                  </div>
              ))}
            </div>
            <div className="w-full h-24 bg-white rounded-[24px] border border-slate-200"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
              <div className="bg-white rounded-[24px] border border-slate-200 p-8 h-[380px]"></div>
              <div className="bg-white rounded-[24px] border border-slate-200 p-8 h-[380px]"></div>
            </div>
          </main>
        </>
    );
  }

  return (
      <>
        <style dangerouslySetInnerHTML={{__html: `
        @keyframes robotTrackWalk {
          0% { left: 0%; transform: translateX(-100%); }
          100% { left: 100%; transform: translateX(0%); }
        }
        .animate-mascot-walk {
          position: absolute;
          animation: robotTrackWalk 14s linear infinite;
        }
      `}} />

        <header className="w-full px-12 py-10 shrink-0 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-black tracking-tight mb-2 flex items-center gap-2">
              안녕하세요, {userName}님! 👋
            </h1>
            <p className="text-slate-400 font-bold text-sm tracking-wide">오늘도 목표를 향해 한 걸음 더 나아가보세요.</p>
          </div>
          <Link
              href="/dashboard/practice"
              className="px-8 py-4 bg-black text-white font-black rounded-xl text-sm hover:bg-slate-900 transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 shrink-0"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>새 모의면접 시작하기</span>
          </Link>
        </header>

        <main className="flex-1 w-full px-12 pb-12 overflow-y-auto max-w-[1200px] space-y-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-black transition-colors relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-black"></div>
              <div className="flex justify-between items-start mb-4 pt-2">
                <span className="block text-xs font-black text-slate-400 uppercase tracking-wider">누적 면접 횟수</span>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center"><History className="w-4 h-4 text-slate-400" /></div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-black">{dashboardData?.interviewCount ?? 0}</span>
                <span className="text-sm font-bold text-slate-400">회</span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[24px] border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-black transition-colors relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-black"></div>
              <div className="flex justify-between items-start mb-4 pt-2">
                <span className="block text-xs font-black text-slate-400 uppercase tracking-wider">평균 종합 점수</span>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-black" /></div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-black">
                {dashboardData?.avgScore ? dashboardData.avgScore.toFixed(1) : '0.0'}
              </span>
                <span className="text-sm font-bold text-slate-400">점</span>
              </div>
            </div>
          </div>

          <div className="w-full bg-white border border-slate-200 rounded-[24px] p-6 relative overflow-hidden h-24 flex items-center shadow-sm select-none">
            <div className="border-b border-dashed border-slate-200/80 absolute bottom-6 left-6 right-6 z-0"></div>
            <div className="animate-mascot-walk bottom-[14px] flex items-center gap-2 z-10">
              <div className="bg-black text-white p-2 rounded-xl shadow-md flex items-center justify-center animate-bounce" style={{ animationDuration: '0.7s' }}>
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-black text-slate-500 shadow-sm whitespace-nowrap flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
                <span>열심히 질문 생성 중...</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-start">
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8 flex flex-col relative overflow-hidden h-[380px]">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-black"></div>
              <div className="flex items-end justify-between mb-6 pt-2 shrink-0">
                <div>
                  <h2 className="text-lg font-black text-black mb-1">최근 연습 기록</h2>
                  <p className="text-xs font-bold text-slate-400">가장 최근에 진행한 면접 결과입니다.</p>
                </div>
                <Link href="/dashboard/history" className="text-xs font-bold text-slate-400 hover:text-black hover:underline underline-offset-4 transition-colors">전체보기 &rarr;</Link>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
                {recentHistory.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                      <p className="text-sm font-bold text-slate-400 mb-2">아직 연습 기록이 없네요!</p>
                    </div>
                ) : (
                    recentHistory.map((item) => (
                        <Link key={item.id} href={`/interview/result/${item.id}`} className="p-4 rounded-2xl border border-slate-100 hover:border-black bg-slate-50/50 hover:bg-white transition-all group flex items-center justify-between shrink-0">
                          <div className="flex items-center gap-4">
                            <span className="text-2xl">{item.emo}</span>
                            <div>
                              <h3 className="text-sm font-black text-black group-hover:underline">{item.title}</h3>
                              <span className="text-[10px] font-bold text-slate-400">{item.date} (소요시간: {item.duration})</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-black text-black">{item.score}<span className="text-xs font-bold text-slate-400 ml-0.5">점</span></span>
                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-black transition-colors" />
                          </div>
                        </Link>
                    ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8 flex flex-col relative overflow-hidden h-[380px]">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-black"></div>
              <div className="absolute -top-4 -right-4 p-8 opacity-[0.12] pointer-events-none">
                <Target className="w-40 h-40 text-slate-300" />
              </div>
              <div className="pt-2 relative z-10 shrink-0">
                <h2 className="text-lg font-black text-black mb-1">오늘의 추천 미션 🎯</h2>
                <p className="text-xs font-bold text-slate-400 mb-8">꾸준한 연습이 합격의 지름길입니다.</p>
              </div>
              <div className="flex-1 flex flex-col justify-center space-y-3 relative z-10 overflow-y-auto pr-1">
                <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:border-black transition-all group cursor-default shrink-0">
                  <div className="w-2 h-2 rounded-full bg-black mt-1.5 shrink-0 transition-transform duration-300 group-hover:scale-125"></div>
                  <div>
                    <h4 className="text-sm font-black text-black">{"지난 면접 '약점 키워드' 정복하기"}</h4>
                    <p className="text-xs font-bold text-slate-400 mt-1">AI 피드백에서 지적받은 취약 문항을 보완하세요.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:bg-white hover:border-black transition-all group cursor-default shrink-0">
                  <div className="w-2 h-2 rounded-full bg-slate-300 mt-1.5 shrink-0 transition-all duration-300 group-hover:scale-125 group-hover:bg-black"></div>
                  <div>
                    <h4 className="text-sm font-black text-black">직무 핵심 실전 시뮬레이션</h4>
                    <p className="text-xs font-bold text-slate-400 mt-1">현업에서 자주 묻는 질문들로 실전 감각을 최대치로 끌어올리세요.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
  );
}