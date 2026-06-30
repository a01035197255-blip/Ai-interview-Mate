'use client';

import React, { useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { QuestionApi } from '@/services/aiQuestionApi';

export default function AiQuestionPage() {

    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAsk = async () => {

        if (!question.trim()) {
            alert('질문을 입력해주세요.');
            return;
        }

        try {
            setLoading(true);

            const response = await QuestionApi.askQuestion({
                question
            });

            setAnswer(response.answer);

        } catch (error) {
            console.error(error);
            alert('AI 답변 생성에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <header className="w-full px-12 py-10 shrink-0">
                <h1 className="text-3xl lg:text-4xl font-black text-black tracking-tight mb-1">
                    AI에게 질문하기 🤖
                </h1>

                <p className="text-slate-400 font-bold text-sm tracking-wide">
                    궁금한 내용을 자유롭게 질문해보세요.
                </p>
            </header>

            <main className="flex-1 w-full px-12 pb-12 max-w-[1200px]">

                <div className="bg-white rounded-[24px] border border-slate-200 border-t-6 border-t-black p-8 shadow-sm overflow-hidde">

                    <div className="mb-6 mt-2">
                        <label className="block text-lg font-bold mb-2">
                            AI 질의 제출
                        </label>

                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="AI에게 질문해보세요..."
                            className="w-full h-40 border border-slate-200 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>

                    <button
                        onClick={handleAsk}
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-3 bg-black text-white rounded-xl font-bold hover:bg-slate-800 transition"
                    >
                        <Send className="w-4 h-4" />
                        {loading ? '답변 생성 중...' : '질문하기'}
                    </button>
                </div>

                {answer && (
                    <div className="mt-6 bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm">

                        <div className="flex items-center gap-2 mb-4">
                            <Bot className="w-5 h-5" />
                            <h2 className="font-black text-lg">
                                AI 답변
                            </h2>
                        </div>

                        <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {answer}
                        </div>

                    </div>
                )}
            </main>
        </>
    );
}