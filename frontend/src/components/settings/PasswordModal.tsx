'use client';

import React, { useState } from 'react';
import { X, KeyRound } from 'lucide-react';
import { AuthApi } from '@/services/AuthApi';
import { useAuthStore } from "@/store/authStore";
import { useRouter } from 'next/navigation'; 

interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PasswordModal({ isOpen, onClose }: PasswordModalProps) {
    const router = useRouter(); // ⭐️ [수정] 함수형 컴포넌트 최상단에 훅 선언 가동

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const logout = useAuthStore((state) => state.logout);
    const [isLoading, setIsLoading] = useState(false);

    const handlePasswordChange = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            alert("모든 비밀번호 입력란을 채워주세요.");
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("새 비밀번호가 서로 일치하지 않습니다.");
            return;
        }

        setIsLoading(true);

        try {
            // 백엔드 자바 PasswordRequest DTO 객체와 1:1 조립 매핑
            const requestBody = {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
                confirmPassword: passwordData.confirmPassword
            };

            await AuthApi.changePassword(requestBody);

            alert("비밀번호가 성공적으로 변경되었습니다. 🎉");

            // 폼 입력 데이터 초기화
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });

            // ⭐️ Zustand 스토어 청소 (프론트 세션 폭파)
            logout();

            // ⭐️ [수정] 정석 훅 객체를 통해 메인(/)으로 안전하게 리다이렉트
            router.push('/login');

            // 모달 닫기
            onClose();
        } catch (error) {
            console.error("비밀번호 변경 통신 에러:", error);
            alert("현재 비밀번호가 일치하지 않거나 에러가 발생했습니다. 다시 시도해 주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    // 입력란 유효성 검증 플래그
    const isFormValid = passwordData.currentPassword && passwordData.newPassword && passwordData.confirmPassword;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-[24px] border border-slate-200 p-6 md:p-8 w-full max-w-md relative z-10 shadow-2xl flex flex-col">
                <button onClick={onClose} className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-black hover:bg-slate-100 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center text-center mt-2 mb-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-black mb-4"><KeyRound className="w-6 h-6" /></div>
                    <h3 className="text-xl font-black text-black tracking-tight mb-2">비밀번호 변경</h3>
                    <p className="text-[13px] font-bold text-slate-400 px-2">안전한 service 이용을 위해 새로운 비밀번호를 설정해주세요.</p>
                </div>
                <div className="space-y-4">
                    <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData(prev => ({...prev, currentPassword: e.target.value}))} placeholder="현재 비밀번호 입력" className="w-full bg-slate-50 border border-slate-200 text-black font-bold text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-black" />
                    <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))} placeholder="새 비밀번호 입력" className="w-full bg-slate-50 border border-slate-200 text-black font-bold text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-black" />
                    <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))} placeholder="새 비밀번호 다시 입력" className="w-full bg-slate-50 border border-slate-200 text-black font-bold text-sm px-4 py-3 rounded-lg focus:outline-none focus:border-black" />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-8">
                    <button onClick={onClose} disabled={isLoading} className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-sm">취소</button>
                    <button
                        onClick={handlePasswordChange}
                        disabled={!isFormValid || isLoading}
                        className={`py-3 rounded-lg font-black text-sm flex items-center justify-center transition-all ${isFormValid && !isLoading ? 'bg-black text-white hover:bg-slate-800 shadow-md active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                    >
                        <span>{isLoading ? '변경 중...' : '변경 확정'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
