'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { AuthApi } from '@/services/AuthApi';


interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    provider: string; 
}

export default function DeleteAccountModal({ isOpen, onClose, provider }: DeleteAccountModalProps) {

    const [confirmText, setConfirmText] = useState('');
    const [withdrawPassword, setWithdrawPassword] = useState('');

    // 💡 소셜 로그인(OAuth) 유저인지 체크 (대소문자 무관하게 GOOGLE, NAVER 등 판별)
    const isOAuthUser = provider?.toLowerCase() === 'google' || provider?.toLowerCase() === 'naver';

    /**
     * 🎯 [핵심 설정] 버튼 활성화 조건 (disabled 조건)
     * - 소셜 로그인: '탈퇴하기' 텍스트만 치면 활성화
     * - 로컬 로그인: '탈퇴하기' 텍스트도 치고 + 비밀번호도 입력해야 활성화
     */
    const isSubmitDisabled = isOAuthUser
        ? confirmText !== '탈퇴하기'
        : confirmText !== '탈퇴하기' || !withdrawPassword.trim();

    const handleDeleteAccount = async () => {
        // 1. 기본 문구 검증 (공통)
        if (confirmText !== '탈퇴하기') {
            alert("'탈퇴하기'를 정확하게 입력해주세요.");
            return;
        }

        // 2. 로컬 유저인데 비밀번호가 빈 값인 경우 차단
        if (!isOAuthUser && !withdrawPassword.trim()) {
            alert("본인 확인을 위해 비밀번호를 입력해주세요.");
            return;
        }

        try {
            // ⭐️ [핵심] 소셜 유저와 로컬 유저의 API 분기 처리 구역
            if (isOAuthUser) {
                // 🌐 소셜 가입 사용자 탈퇴 파이프라인 가동 (비밀번호 불필요)
                // 메서드명은 실제 정의하신 API 이름에 맞게 세팅해 주세요. (예: deleteSocialUser)
                await AuthApi.deleteOAuthUser();
            } else {
                // 🔐 일반 로컬 가입 사용자 탈퇴 파이프라인 가동 (입력한 비번 전송)
                // 메서드명은 실제 정의하신 API 이름에 맞게 세팅해 주세요. (예: deleteLocalUser)
                await AuthApi.deleteUser({
                    password: withdrawPassword
                });
            }

            // 3. 탈퇴 성공 사후 공통 처리 공정
            alert("회원 탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.");
            if (typeof window !== 'undefined') {
                localStorage.removeItem('auth-storage'); // Zustand 저장소 강제 소거
                window.location.href = '/'; // 3. 메인 화면으로 리다이렉트 및 새로고침 효과로 세션 완전 깔끔 청소
            }
            onClose(); // 탈퇴 모달 닫기

        } catch (error) {
            console.error("탈퇴 처리 중 에러 발생:", error);

            // 에러 메시지도 분기 처리
            if (isOAuthUser) {
                alert("소셜 계정 탈퇴 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
            } else {
                alert("탈퇴 처리 중 오류가 발생했습니다. 비밀번호를 다시 확인해주세요.");
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* 배경 블러 어둡게 */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

            {/* 모달 본체 */}
            <div className="bg-white rounded-[24px] border border-slate-200 p-6 md:p-8 w-full max-w-md relative z-10 shadow-2xl flex flex-col">
                {/* 닫기 버튼 */}
                <button onClick={onClose} className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-black hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                </button>

                {/* 경고 아이콘 및 헤더 */}
                <div className="flex flex-col items-center text-center mt-2">
                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-4">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-black tracking-tight mb-2">정말 탈퇴하시겠습니까?</h3>
                    <p className="text-[13px] font-bold text-slate-400 break-keep leading-relaxed px-2">
                        모든 모의 면접 데이터가 영구 파기되며, 절대 복구할 수 없습니다.
                    </p>
                </div>

                {/* 인풋 영역 구역 */}
                <div className="mt-6 space-y-3">
                    {/* 공통 가이드 텍스트 인풋 */}
                    <label className="block text-xs font-black text-slate-400 tracking-wider uppercase pl-1">
                        아래에 &apos;탈퇴하기&apos;를 입력해주세요.
                    </label>
                    <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="탈퇴하기"
                        className="w-full bg-slate-50 border border-slate-200 text-black font-bold text-sm px-4 py-3 rounded-lg text-center focus:outline-none focus:border-rose-500"
                    />

                    {/* ⭐️ [핵심] 로컬 로그인 유저(credentials)일 때만 비밀번호 입력창을 보여줍니다. */}
                    {!isOAuthUser && (
                        <div className="space-y-2 pt-1">
                            <label className="block text-xs font-black text-slate-400 tracking-wider uppercase pl-1">
                                본인 확인 비밀번호
                            </label>
                            <input
                                type="password"
                                value={withdrawPassword}
                                onChange={(e) => setWithdrawPassword(e.target.value)}
                                placeholder="비밀번호 입력"
                                className="w-full bg-slate-50 border border-slate-200 text-black font-bold text-sm px-4 py-3 rounded-lg text-center focus:outline-none focus:border-rose-500"
                            />
                        </div>
                    )}
                </div>

                {/* 하단 버튼 제어 구역 */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                    <button onClick={onClose} className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-sm">
                        취소
                    </button>
                    <button
                        onClick={handleDeleteAccount}
                        disabled={isSubmitDisabled}
                        className={`py-3 rounded-lg font-black text-sm flex items-center justify-center gap-2 transition-all ${
                            !isSubmitDisabled
                                ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-md active:scale-95'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        <Trash2 className="w-4 h-4 shrink-0" />
                        <span>탈퇴 확정</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
