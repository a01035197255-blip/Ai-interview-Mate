'use client'; // Next.js 클라이언트 컴포넌트 지정

import { useEffect, Suspense } from 'react'; 
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useAuthStore } from "@/store/authStore"; 

/**
 * 🚀 1. useSearchParams() 및 인증 로직을 전담할 내부 컴포넌트
 */
function OAuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const setToken = useAuthStore((state) => state.setToken);

    useEffect(() => {
        const tempCode = searchParams.get('code'); // 백엔드 핸들러가 넘겨준 임시 코드 추출

        if (tempCode) {
            // 백엔드 컨트롤러 엔드포인트로 POST 요청
            axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/oauth2/callback?code=${tempCode}`,
                {},
                { withCredentials: true } // HTTP-Only 쿠키(Refresh Token) 수신을 위해 필수
            )
                .then((response) => {
                    // 공통 응답 포맷(ApiResponse) 구조에 맞춰 accessToken 추출
                    const accessToken = response.data.data.accessToken;

                    // Zustand 스토어에 Access Token 저장
                    setToken(accessToken);

                    // 로그인 완료된 '대시보드' 화면으로 워프
                    router.push('/dashboard');
                })
                .catch((error) => {
                    console.error("로그인 처리 중 에러 발생:", error);
                    router.push('/login');
                });
        } else {
            // URL에 code 자체가 없다면 로그인 페이지로 리다이렉트
            router.push('/login');
        }
    }, [searchParams, router, setToken]);

    return null;
}

/**
 * 🚀 2. Next.js 빌드 에러 방어를 위해 Suspense Boundary로 감싼 기본 내보내기 컴포넌트
 */
export default function OAuthCallbackPage() {
    return (
        <Suspense fallback={null}>
            <OAuthCallbackContent />
        </Suspense>
    );
}
