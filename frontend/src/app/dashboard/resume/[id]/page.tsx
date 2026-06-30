'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ResumeApi, ResumeResponse } from '@/services/Resume';
import { Pencil, Trash2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ResumeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);

    const [data, setData] = useState<ResumeResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchDetail = async () => {
            try {
                setLoading(true);

                const res = await ResumeApi.findById(id);

                setData(res);
            } catch (err) {
                console.error('이력서 상세 조회 실패:', err);
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id]);

    const handleDelete = async () => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        try {
            await ResumeApi.delete(id);

            alert('삭제 완료');

            // 리스트 페이지로 이동
            router.push('/dashboard/resume');
        } catch (err) {
            console.error('삭제 실패:', err);
            alert('삭제 실패');
        }
    };

    if (loading) {
        return (
            <div className="p-10 animate-pulse space-y-4">
                <div className="h-10 w-64 bg-slate-200 rounded-xl" />
                <div className="h-40 bg-slate-100 rounded-2xl" />
            </div>
        );
    }

    if (!data) {
        return <div className="p-10 text-slate-400">데이터 없음</div>;
    }

    return (
        <div className="w-full px-12 py-10 max-w-[1100px] mx-auto space-y-8">

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <Link
                    href="/dashboard/resume"
                    className="text-sm font-bold text-slate-400 hover:text-black"
                >
                    ← 목록으로
                </Link>

                <div className="flex gap-2">
                    <Link
                        href={`/dashboard/resume/${id}/feedback`}
                        className="px-4 py-2 bg-black text-white rounded-xl text-sm font-black hover:bg-slate-800 flex items-center gap-2"
                    >
                        <Sparkles className="w-4 h-4" />
                        AI 피드백
                    </Link>

                    <Link
                        href={`/dashboard/resume/${id}/edit`}
                        className="px-4 py-2 bg-black text-white rounded-xl text-sm font-black hover:bg-slate-900 flex items-center gap-2"
                    >
                        <Pencil className="w-4 h-4" />
                        수정
                    </Link>

                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-sm font-black hover:bg-rose-100 flex items-center gap-2 cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4" />
                        삭제
                    </button>
                </div>
            </div>

            {/* PROFILE CARD */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                <h1 className="text-3xl font-black text-black">
                    {data.name}
                </h1>

                <p className="text-slate-400 mt-1">{data.email}</p>

                <div className="flex gap-6 mt-6 text-sm text-slate-500">
                    <span>📞 {data.phone}</span>
                    <span>📍 {data.address || '-'}</span>
                    <span>🎓 {data.education || '-'}</span>
                </div>
            </div>

            {/* INFO GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card label="나이" value={data.age} />
                <Card label="성별" value={data.gender} />
                <Card label="경력" value={data.career} />
                <Card label="스킬" value={data.skills} />
            </div>

            {/* SECTION */}
            <Section title="✨ 간단 소개">
                {data.summary || '간단 소개 없음'}
            </Section>
            <Section title="📌 자기소개">
                {data.selfIntro}
            </Section>

            <Section title="🚀 프로젝트 / 성과">
                {data.projectIntro}
            </Section>

        </div>
    );
}

/* ================= UI ================= */

function Card({ label, value }: any) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-black transition">
            <p className="text-xs text-slate-400 font-bold">{label}</p>
            <p className="font-black text-black mt-1">{value || '-'}</p>
        </div>
    );
}

function Section({ title, children }: any) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-lg font-black text-black mb-3">{title}</h2>
            <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                {children || '내용 없음'}
            </div>
        </div>
    );
}