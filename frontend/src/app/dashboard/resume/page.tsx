'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ResumeApi, ResumeResponse } from '@/services/Resume';
import { FileText, ArrowRight, Trash2 } from 'lucide-react';

export default function ResumePage() {
    const [list, setList] = useState<ResumeResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await ResumeApi.findAll();
                setList(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="p-10 animate-pulse space-y-4">
                <div className="h-10 w-64 bg-slate-200 rounded-xl" />
                <div className="h-40 bg-slate-100 rounded-2xl" />
            </div>
        );
    }

    return (
        <>
            {/* HEADER */}
            <header className="w-full px-12 py-10 shrink-0 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-black">
                        지원서 리스트 📄
                    </h1>
                    <p className="text-slate-400 font-bold text-sm">
                        작성된 이력서를 관리하세요.
                    </p>
                </div>

                <Link
                    href="/dashboard/resume/create"
                    className="px-6 py-3 bg-black text-white rounded-xl font-black text-sm hover:bg-slate-900"
                >
                    + 새 지원서
                </Link>
            </header>

            {/* CONTENT */}
            <main className="flex-1 w-full px-12 pb-12 overflow-y-auto">

                {list.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-[24px] border border-slate-200 border-dashed">
                        <FileText className="w-8 h-8 text-slate-300 mb-3" />
                        <p className="text-slate-500 font-bold">
                            아직 작성된 이력서가 없습니다.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">

                        {list.map((item) => (
                            <Link
                                key={item.id}
                                href={`/dashboard/resume/${item.id}`}
                                className="bg-white rounded-[20px] p-6 border border-slate-200 shadow-sm hover:border-black transition-all cursor-pointer flex items-center justify-between group"
                            >
                                {/* LEFT */}
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-slate-50 border border-slate-200 text-2xl rounded-xl flex items-center justify-center">
                                        📄
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-black text-black group-hover:underline">
                                            {item.name}
                                        </h3>

                                        <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                                            <span>{item.email}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <span>{item.phone}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT */}
                                <div className="flex items-center gap-6">

                                    <div className="text-right">
                                        <span className="text-sm font-bold text-slate-400">
                                            {item.education || '학력 없음'}
                                        </span>
                                    </div>

                                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-black" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

            </main>
        </>
    );
}