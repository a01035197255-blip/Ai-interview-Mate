'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, UserSquare2, History, BarChart3, Bot,
    Settings, LogOut, MessageSquare, FileText,
} from 'lucide-react'; 
import { useAuthStore } from '@/store/authStore';

const MAIN_MENUS = [
    { name: '대시보드', path: '/dashboard', icon: LayoutDashboard },
    { name: '면접 연습', path: '/dashboard/practice', icon: UserSquare2 },
    { name: '연습 기록', path: '/dashboard/history', icon: History },
    { name: 'AI 질문', path: '/dashboard/aiQuestion', icon: Bot },
    { name: '지원서 작성', path: '/dashboard/resume', icon: FileText }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    // Zustand 스토어에서 로그아웃 함수 추출
    const logout = useAuthStore((state) => state.logout);

    // 전역 상태와 스토리지가 한 번에 비워지는 로그아웃 핸들러
    const handleLogout = async () => {
        if (!window.confirm("정말 로그아웃 하시겠습니까?")) return;

        try {
            // Zustand 로그아웃 호출 (전역 State 초기화 + 로컬스토리지 삭제 연동)
            logout();

            alert("로그아웃 되었습니다. 다음에 또 만나요! 👋");
            router.push('/');
        } catch (error) {
            console.error("로그아웃 오류:", error);
            alert("로그아웃 처리 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="min-h-screen h-screen bg-[#F8FAFC] flex antialiased font-sans w-full overflow-hidden"
             style={{
                 backgroundImage: 'linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)',
                 backgroundSize: '40px 40px'
             }}>

            {/* 고정 공통 사이드바 */}
            <aside className="w-[280px] bg-white border-r border-slate-200 flex flex-col justify-between p-8 shrink-0 hidden md:flex h-full z-10">
                <div className="space-y-10">
                    <Link href="/dashboard" className="flex items-center gap-3 text-black font-black text-2xl px-2">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                            <MessageSquare className="w-4 h-4 fill-white" />
                        </div>
                        <span className="tracking-tighter">InterviewMate</span>
                    </Link>
                    <nav className="space-y-1">
                        {MAIN_MENUS.map((menu, i) => {
                            const Icon = menu.icon;
                            const isActive = pathname === menu.path;
                            return (
                                <Link key={i} href={menu.path} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm transition-all ${isActive ? 'bg-black text-white font-black' : 'text-slate-400 hover:text-black hover:bg-slate-50 font-bold'}`}>
                                    <Icon className="w-4 h-4" />
                                    <span>{menu.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="space-y-1 border-t border-slate-200 pt-6">
                    <Link href="/dashboard/settings" className="w-full flex items-center gap-4 px-4 py-3.5 text-slate-400 hover:text-black hover:bg-slate-50 rounded-xl text-sm font-bold transition-all">
                        <Settings className="w-4 h-4" />
                        <span>설정</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-3.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>로그아웃</span>
                    </button>
                </div>
            </aside>

            {/* 각각의 page.tsx 알맹이들이 렌더링되는 가변 영역 */}
            <div className="flex-1 flex flex-col h-full w-full overflow-hidden z-10">
                {children}
            </div>
        </div>
    );
}
