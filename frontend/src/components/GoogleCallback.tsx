'use client'; // 클라이언트 사이드 컴포넌트로 지정 (localStorage와 redirect를 사용하기 위함)

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface CallbackProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default function GoogleCallbackPage({ searchParams }: CallbackProps) {
    const router = useRouter();
    // Next.js가 주소창에서 code 값을 자동으로 추출해서 넘겨줍니다.
    const code = searchParams.code;

    useEffect(() => {
        if (!code || typeof code !== 'string') {
            alert('올바르지 않은 접근입니다.');
            router.push('/login');
            return;
        }

        // 백엔드 API로 인가 코드(code) 전송
        axios.post(process.env.NEXT_PUBLIC_API_URL+'/oauth2/authorization/google', { code })
            .then((response) => {
                const jwtToken = response.data.token;

                // 아까 만든 Axios 인터셉터가 읽을 수 있도록 동일한 Key 이름으로 저장
                localStorage.setItem('accessToken', jwtToken);

                // Next.js 전용 라우터로 페이지 부드럽게 이동 (새로고침 X)
                router.push('/dashboard');
            })
            .catch((error) => {
                console.error('구글 로그인 실패:', error);
                alert('로그인 처리 중 오류가 발생했습니다.');
                router.push('/login');
            });
    }, [code, router]);

    // 백엔드와 통신하는 동안 유저에게 보여줄 UI
    return (
        <div className="flex flex-col justify-content-center items-center h-screen gap-4">
            {/* 뱅글뱅글 도는 구글 파란색 스피너 */}
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>

            <h2 className="text-xl font-semibold text-gray-900">
                구글 로그인 처리 중입니다...
            </h2>
            <p className="text-gray-500">
                잠시만 기다려주세요.
            </p>
        </div>
    );
}