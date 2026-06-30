'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ResumeApi, ResumeCreateRequest } from '@/services/Resume';
import { ResumeFeedbackApi, ResumeFeedbackResponse } from '@/services/ResumeFeedback';
import Link from 'next/link';

export default function ResumeUpdatePage() {
    const router = useRouter();
    const params = useParams();

    const resumeId = Number(params?.id);

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState<ResumeCreateRequest>({
        name: '',
        email: '',
        age: 0,
        gender: '',
        phone: '',
        address: '',
        summary: '',
        selfIntro: '',
        career: '',
        projectIntro: '',
        skills: '',
        education: ''
    });

    // ✔️ 1. 기존 데이터 불러오기
    useEffect(() => {
        const load = async () => {
            try {
                const data = await ResumeApi.findById(resumeId);
                setForm(data);
            } catch (err) {
                console.error('불러오기 실패', err);
            }
        };

        if (resumeId) load();
    }, [resumeId]);

    const onChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    // ✔️ 2. update API 호출
    const onSubmit = async () => {
        try {
            setLoading(true);

            // 1️⃣ 이력서 수정
            await ResumeApi.update(resumeId, form);

            // 2️⃣ 기존 AI 피드백 삭제 (핵심)
            try {
                await ResumeFeedbackApi.delete(resumeId);
            } catch (e) {
                // 이미 없으면 무시 (404 등)
                console.warn('피드백 없음 또는 삭제 실패:', e);
            }

            alert('지원서가 성공적으로 수정되었습니다 🚀');

            router.push('/dashboard/resume');

        } catch (err) {
            console.error(err);
            alert('수정 실패');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full px-12 py-10 max-w-[1200px] mx-auto bg-white">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-10">

                <Link
                    href="/dashboard/resume"
                    className="text-sm font-bold text-slate-400 hover:text-black"
                >
                    ← 목록으로
                </Link>

                <h1 className="text-2xl font-black text-black flex items-center gap-2">
                    <span>✏️</span>
                    지원서 수정
                </h1>

                <button
                    onClick={onSubmit}
                    disabled={loading}
                    className="px-6 py-3 bg-black text-white font-black rounded-xl text-sm hover:bg-slate-900 transition"
                >
                    {loading ? '수정중...' : '수정'}
                </button>
            </div>

            {/* FORM */}
            <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm max-h-[calc(100vh-200px)] overflow-y-auto">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <Input name="name" value={form.name} placeholder="이름" onChange={onChange} />
                    <Input name="email" value={form.email} placeholder="이메일" onChange={onChange} />
                    <Input name="age" value={form.age} placeholder="나이" onChange={onChange} />
                    <Input name="gender" value={form.gender} placeholder="성별" onChange={onChange} />
                    <Input name="phone" value={form.phone} placeholder="전화번호" onChange={onChange} />
                    <Input name="address" value={form.address} placeholder="주소" onChange={onChange} />

                    <Textarea name="summary" value={form.summary} placeholder="간단 소개" onChange={onChange} />
                    <Textarea name="selfIntro" value={form.selfIntro} placeholder="자기소개서" onChange={onChange} />

                    <Input name="career" value={form.career} placeholder="경력" onChange={onChange} />
                    <Input name="skills" value={form.skills} placeholder="기술 스택" onChange={onChange} />
                    <Input name="education" value={form.education} placeholder="학력" onChange={onChange} />

                    <Textarea name="projectIntro" value={form.projectIntro} placeholder="프로젝트 / 성과" onChange={onChange} />

                </div>
            </div>
        </div>
    );
}

/* ===================== */
/* UI COMPONENTS */
/* ===================== */

function Input(props: any) {
    return (
        <input
            {...props}
            className="p-4 border border-slate-200 rounded-xl bg-white focus:border-black outline-none"
        />
    );
}

function Textarea(props: any) {
    return (
        <textarea
            {...props}
            className="p-4 border border-slate-200 rounded-xl bg-white focus:border-black outline-none md:col-span-2 h-32"
        />
    );
}