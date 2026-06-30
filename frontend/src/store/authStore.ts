import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios'; 

interface AuthState {
    accessToken: string | null;
    setToken: (token: string) => void;
    logout: () => Promise<void>; 
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || '/';

export const useAuthStore = create(
    persist<AuthState>(
        (set, get) => ({
            accessToken: null,

            setToken: (token) => set({ accessToken: token }),

            // ⭐️ 로그아웃 시 백엔드 호출 + 로컬 스토리지 비우기를 한 방에 처리
            logout: async () => {
                const currentToken = get().accessToken;

                try {
                    // 1. 백엔드 로그아웃 API 호출 (백엔드가 이 요청을 받고 쿠키 maxAge(0)을 뿜어냅니다)
                    await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, {
                        headers: {
                            'Authorization': `Bearer ${currentToken}`
                        },
                        withCredentials: true // 👈 [필수] 이 옵션이 있어야 백엔드가 주는 쿠키 삭제 명령을 브라우저가 승인함
                    });
                } catch (error) {
                    // 백엔드가 이미 만료되었거나 에러를 뱉어도 프론트 창고는 무조건 청소해야 하므로
                    // 에러 로그만 찍고 넘어갑니다.
                    console.error("백엔드 세션 만료 처리 중 오류가 발생했으나 로그아웃을 계속 진행합니다.", error);
                } finally {
                    // 2. 백엔드 작업이 끝나면 프론트엔드 Access Token도 안전하게 날려버림
                    set({ accessToken: null });
                }
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
