'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, Shield, Mail, Trash2, KeyRound, Camera } from 'lucide-react';

import SettingsSkeleton from '@/components/skeletons/SettingsSkeleton';
import PasswordModal from '@/components/settings/PasswordModal';
import DeleteAccountModal from '@/components/settings/DeleteAccountModal';
import { UserApi } from "@/services/UserApi";

const RealFloppyDiskIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M4 3H16.5L20 6.5V20C20 20.5523 19.5523 21 19 21H5C4.44772 21 4 20.5523 4 20V4C4 3.44772 4.44772 3 5 3Z" fill="currentColor" />
        <path d="M7 3H15V9H7V3Z" fill="#CBD5E1" />
        <rect x="11" y="4.5" width="2" height="3" rx="0.5" fill="#0F172A" />
        <path d="M6 13H18V21H6V13Z" fill="#F8FAFC" />
        <rect x="7.5" y="15" width="9" height="1" rx="0.5" fill="#E2E8F0" />
        <rect x="7.5" y="17" width="9" height="1" rx="0.5" fill="#E2E8F0" />
        <rect x="7.5" y="19" width="6" height="1" rx="0.5" fill="#E2E8F0" />
        <rect x="16.5" y="18.5" width="2" height="2" rx="0.3" fill="#0F172A" />
    </svg>
);

export default function SettingsPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [profile, setProfile] = useState({
        name: '',
        email: '',
        profileImgUrl: '',
        provider: 'local'
    });

    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isImageUploading, setIsImageUploading] = useState(false);

    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const convertProfileUrl = (data: any) => {
        if (!data || typeof data !== 'string' || data.trim() === '') {
            return '';
        }

        if (data.startsWith('http://') || data.startsWith('https://')) {
            return data;
        }

        if (data.startsWith('data:image/')) {
            return data;
        }

        return `data:image/jpeg;base64,${data}`;
    };

    useEffect(() => {
        let isMounted = true;

        UserApi.getProfile()
            .then((userData) => {
                if (isMounted && userData) {
                    setProfile({
                        name: userData.userName || '',
                        email: userData.email || '',
                        profileImgUrl: userData.profileImgUrl || '',
                        provider: userData.provider ? userData.provider.toLowerCase() : 'local'
                    });
                    setIsInitialLoading(false);
                }
            })
            .catch((error) => {
                console.error(error);
                if (isMounted) {
                    setIsInitialLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("파일 크기는 5MB를 초과할 수 없습니다.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setIsImageUploading(true);

            await UserApi.updateAvatar(formData);

            alert("프로필 사진이 실시간 반영되었습니다! 📸");
            window.location.reload();

        } catch (error) {
            console.error(error);
            alert("이미지 업로드 중 오류가 발생했습니다.");
        } finally {
            setIsImageUploading(false);
        }
    };

    const handleSave = async () => {
        if (!profile.name.trim()) {
            alert("이름을 입력해주세요.");
            return;
        }

        if (window.confirm("변경사항을 저장하시겠습니까?")) {
            try {
                await UserApi.updateProfile({
                    userName: profile.name
                });

                alert("저장되었습니다. ✨");
            } catch (error) {
                console.error(error);
                alert("수정사항을 저장하지 못했습니다. 다시 시도해주세요.");
            }
        }
    };

    if (isInitialLoading) {
        return <SettingsSkeleton />;
    }

    const finalImgSrc = convertProfileUrl(profile.profileImgUrl);

    return (
        <div className="w-full h-full flex flex-col overflow-y-auto">

            <header className="w-full px-12 py-10 shrink-0 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-black tracking-tight mb-1">환경 설정 ⚙️</h1>
                    <p className="text-slate-400 font-bold text-sm tracking-wide">계정 정보와 서비스 이용 환경을 관리하세요.</p>
                </div>
            </header>

            <main className="flex-1 w-full px-12 pb-12 max-w-[800px] space-y-8 relative z-0">
                <section className="bg-white rounded-[24px] p-8 md:p-10 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 bottom-0 w-2 bg-black"></div>
                    <div className="pl-4 space-y-10">

                        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                                    <User className="w-5 h-5 text-black" />
                                </div>
                                <h2 className="text-xl font-black text-black">프로필 정보</h2>
                            </div>

                            {profile.provider === 'google' && (
                                <span className="px-3 py-1.5 bg-neutral-100 text-neutral-800 border border-neutral-200 rounded-full text-xs font-black tracking-tight">
                                    Google 계정 연동됨 🌐
                                </span>
                            )}
                            {profile.provider === 'naver' && (
                                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-xs font-black tracking-tight">
                                    Naver 계정 연동됨 🟢
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8 border-b border-slate-100 pb-10">
                            <div className="shrink-0">
                                <div
                                    onClick={() => profile.provider === 'local' ? fileInputRef.current?.click() : null}
                                    className={`w-32 h-32 rounded-full border-4 border-slate-50 shadow-inner bg-slate-100 flex items-center justify-center overflow-hidden relative group ${profile.provider === 'local' ? 'cursor-pointer' : 'cursor-default'}`}
                                >
                                    {finalImgSrc ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={finalImgSrc}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-16 h-16 text-slate-300 animate-in fade-in duration-300" />
                                    )}

                                    {profile.provider === 'local' ? (
                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white select-none">
                                            <Camera className="w-5 h-5" />
                                            <span className="text-[11px] font-black tracking-tighter">사진 변경</span>
                                        </div>
                                    ) : null}

                                    {isImageUploading && (
                                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-xs font-bold text-black animate-pulse">
                                            업로드 중..
                                        </div>
                                    )}
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>

                            <div className="flex-1 space-y-3 pt-4 text-center sm:text-left">
                                <h3 className="text-lg font-black text-black">프로필 사진</h3>
                                <p className="text-sm font-bold text-slate-400 break-keep leading-relaxed max-w-sm">
                                    {profile.provider !== 'local'
                                        ? "소셜 계정(구글/네이버) 연동을 통해 동기화된 회원 이미지 화면입니다. 소셜 계정 사진은 수정할 수 없습니다."
                                        : "이미지를 클릭하여 나만의 프로필 사진을 직접 변경 및 업로드할 수 있습니다."}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-slate-400 tracking-wider uppercase mb-2">이름 (Nickname)</label>
                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full bg-[#F8FAFC] border border-slate-200 text-black font-bold text-base px-5 py-4 rounded-xl focus:outline-none focus:border-black transition-all placeholder:text-slate-300"
                                    placeholder="사용하실 이름을 입력해주세요."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 tracking-wider uppercase mb-2">이메일 계정 (Read-only)</label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        value={profile.email}
                                        disabled
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-500 font-bold text-base px-5 py-4 pl-12 rounded-xl cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white rounded-[24px] p-8 md:p-10 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                                <KeyRound className="w-5 h-5 text-black" />
                            </div>
                            <h2 className="text-xl font-black text-black">비밀번호 변경</h2>
                        </div>
                        <p className="text-sm font-bold text-slate-400">
                            {profile.provider !== 'local'
                                ? "간편 가입 소셜 계정은 비밀번호 변경 기능을 제공하지 않으며 간편 로그인을 통해 관리됩니다."
                                : "주기적으로 비밀번호를 변경하여 계정을 안전하게 보호하세요."}
                        </p>
                    </div>

                    <button
                        onClick={() => setIsPasswordOpen(true)}
                        disabled={profile.provider !== 'local'}
                        className="shrink-0 px-6 py-4 bg-slate-50 border border-slate-200 text-black font-black rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-50"
                    >
                        <KeyRound className="w-4 h-4" />
                        <span>비밀번호 변경하기</span>
                    </button>
                </section>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        className="w-full sm:w-auto px-7 py-3.5 bg-black text-white font-black rounded-xl text-base transition-all transform hover:bg-neutral-900 hover:shadow-[0_12px_30px_rgba(0,0,0,0.16)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-3 group shrink-0 select-none"
                    >
                        <div className="bg-neutral-800 p-1.5 rounded-md text-white group-hover:bg-neutral-700 transition-colors shadow-sm flex items-center justify-center">
                            <RealFloppyDiskIcon className="w-5 h-5" />
                        </div>
                        <span className="tracking-tight pr-1 font-extrabold">변경사항 저장하기</span>
                    </button>
                </div>

                <section className="mt-12 pt-12 border-t border-slate-200">
                    <div className="bg-red-50 rounded-[24px] border border-red-100 p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-5 h-5 text-red-600" />
                                <span className="text-sm font-black text-red-600 uppercase tracking-wider">Danger Zone</span>
                            </div>
                            <p className="text-sm font-bold text-red-400">계정을 삭제하면 모든 면접 기록과 분석 데이터가 영구적으로 삭제됩니다.</p>
                        </div>
                        <button
                            onClick={() => setIsDeleteOpen(true)}
                            className="shrink-0 px-6 py-4 bg-white border border-red-200 text-red-600 font-black rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                        >
                            <Trash2 className="w-4 h-4 shrink-0" />
                            <span>계정 탈퇴하기</span>
                        </button>
                    </div>
                </section>
            </main>

            <PasswordModal isOpen={isPasswordOpen} onClose={() => setIsPasswordOpen(false)} />

            <DeleteAccountModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                provider={profile.provider}
            />
        </div>
    );
}