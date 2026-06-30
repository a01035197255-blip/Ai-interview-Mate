'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ResumeApi } from '@/services/Resume';
import { ResumeCreateRequest } from '@/services/Resume';

import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ResumeCreatePage() {
    const router = useRouter();

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

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const onSubmit = async () => {
        try {
            setLoading(true);

            await ResumeApi.create(form);

            alert('지원서가 성공적으로 생성되었습니다 🚀');
            router.push('/dashboard/resume');
        } catch (err) {
            console.error(err);
            alert('생성 실패');
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
                    className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-black"
                >
                    ← 뒤로가기
                </Link>

                <h1 className="text-2xl font-black text-black">
                    지원서 작성
                </h1>

                <button
                    onClick={onSubmit}
                    disabled={loading}
                    className="px-6 py-3 bg-black text-white font-black rounded-xl text-sm hover:bg-slate-900 transition"
                >
                    {loading ? '저장중...' : '저장'}
                </button>
            </div>

            {/* FORM CARD */}
            <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm max-h-[calc(100vh-200px)] overflow-y-auto">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <input name="name" placeholder="이름"
                           className="p-4 border border-slate-200 rounded-xl bg-white focus:border-black outline-none"
                           onChange={onChange}
                    />

                    <input name="email" placeholder="이메일"
                           className="p-4 border border-slate-200 rounded-xl bg-white focus:border-black outline-none"
                           onChange={onChange}
                    />

                    <input name="age" placeholder="나이" type="number"
                           className="p-4 border border-slate-200 rounded-xl bg-white focus:border-black outline-none"
                           onChange={onChange}
                    />

                    <input name="gender" placeholder="성별"
                           className="p-4 border border-slate-200 rounded-xl bg-white focus:border-black outline-none"
                           onChange={onChange}
                    />

                    <input name="phone" placeholder="전화번호"
                           className="p-4 border border-slate-200 rounded-xl bg-white focus:border-black outline-none"
                           onChange={onChange}
                    />

                    <input name="address" placeholder="주소"
                           className="p-4 border border-slate-200 rounded-xl bg-white focus:border-black outline-none"
                           onChange={onChange}
                    />

                    <textarea name="summary" placeholder="간단 소개"
                              className="p-4 border border-slate-200 rounded-xl md:col-span-2 h-28 bg-white focus:border-black outline-none"
                              onChange={onChange}
                    />

                    <textarea name="selfIntro" placeholder="자기소개서"
                              className="p-4 border border-slate-200 rounded-xl md:col-span-2 h-40 bg-white focus:border-black outline-none"
                              onChange={onChange}
                    />

                    <input name="career" placeholder="경력"
                           className="p-4 border border-slate-200 rounded-xl bg-white focus:border-black outline-none"
                           onChange={onChange}
                    />

                    <input name="skills" placeholder="스킬"
                           className="p-4 border border-slate-200 rounded-xl bg-white focus:border-black outline-none"
                           onChange={onChange}
                    />

                    <input name="education" placeholder="학력"
                           className="p-4 border border-slate-200 rounded-xl bg-white focus:border-black outline-none"
                           onChange={onChange}
                    />

                    <textarea name="projectIntro" placeholder="프로젝트 / 성과"
                              className="p-4 border border-slate-200 rounded-xl md:col-span-2 h-40 bg-white focus:border-black outline-none"
                              onChange={onChange}
                    />

                </div>
            </div>
        </div>
    );
}