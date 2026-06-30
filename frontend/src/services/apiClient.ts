import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore'; 

// 🚀 [수정] Axios 요청 설정에 _retry 플래그를 안전하게 심기 위해 타입 확장
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

// 🚀 [수정] 대기열 failedQueue에 들어갈 내부 구조 객체의 정밀 타입 정의
interface FailedRequest {
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // ⭐️ [필수] 브라우저 쿠키(Refresh Token)를 백엔드에 자동으로 실어보내기 위함
});

/**
 * 🔒 Zustand 가 로컬 스토리지에 박아둔 오리지널 엑세스 토큰 직접 추출기
 */
const getLocalStorageToken = (): string | null => {
    if (typeof window !== 'undefined') {
        const rawStorage = localStorage.getItem('auth-storage');
        if (rawStorage) {
            const parsed = JSON.parse(rawStorage);
            return parsed.state?.accessToken || null;
        }
    }
    return null;
};

/**
 * 🚀 1. Request Interceptor: 모든 요청 직전에 최신 Access Token 헤더 주입
 */
apiClient.interceptors.request.use((config) => {
    const token = getLocalStorageToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});


/**
 * 🔄 토큰 동시 재발급 레이싱 컨디션 방어벽 리소스
 */
let isRefreshing = false;
// 🚀 [수정] any[] 대신 엄격한 FailedRequest[] 타입 적용
let failedQueue: FailedRequest[] = [];

// 🚀 [수정] error 파라미터 타입을 any에서 unknown으로 안전하게 변경
const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (token) {
            prom.resolve(token);
        } else {
            prom.reject(error);
        }
    });
    failedQueue = [];
};

/**
 * 🛸 2. Response Interceptor: 백엔드 응답을 감시하다가 401(만료) 감지 시 자동 갱신 공정 작동
 */
apiClient.interceptors.response.use(
    (response) => response, // 200번대 정상 응답은 그대로 프론트 컴포넌트로 통과
    async (error: AxiosError) => {
        // 🚀 [수정] error.config를 확장 타입인 CustomAxiosRequestConfig로 안전하게 단언
        const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

        // ⭐️ [버그 박멸 핵심] 현재 요청이 로그인 엔드포인트인지 주소 검사 플래그 생성
        const isLoginRequest = originalRequest?.url?.includes('/api/auth/login');

        // 🚨 시큐리티가 '401'을 뱉었고 + 재시도 루프가 아니며 + 🔥 '로그인 요청'이 아닐 때만 자동 갱신 작동!
        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !isLoginRequest
        ) {

            // ① 이미 다른 요청 때문에 토큰 재발급이 진행 중이라면 대기열에 줄 세우기
            if (isRefreshing) {
                // 🚀 [수정] Promise에 명확한 string 타입을 부여하여 안정성 확보
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return apiClient(originalRequest); // 새 토큰으로 장착하고 다시 출발!
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // 백엔드 리프레시 엔드포인트 호출 (withCredentials 옵션 덕분에 쿠키 자동 배달)
                const response = await axios.post(
                    `${apiClient.defaults.baseURL}/api/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                // 공통 응답 규격 ApiResponse<LoginResponse> 구조에서 accessToken 추출
                const newAccessToken = response.data.data.accessToken;

                // Zustand 스토어에 새로 태어난 엑세스 토큰 업데이트
                useAuthStore.getState().setToken(newAccessToken);

                // 줄 서서 대기하고 있던 동생 API 요청들에게 새 토큰 보급하며 해방
                processQueue(null, newAccessToken);
                isRefreshing = false;

                // 총대 맸던 원래 요청도 새 토큰 헤더로 교체해서 백엔드에 재요청
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }
                return apiClient(originalRequest);

            } catch (refreshError) {
                // 리프레시 토큰마저 만료된 완전 만료 상황 (다시 로그인해야 함)
                processQueue(refreshError, null);
                isRefreshing = false;

                // Zustand 정보 및 로컬스토리지 폭파
                useAuthStore.getState().logout();

                if (typeof window !== 'undefined') {
                    alert('세션이 만료되어 자동으로 로그아웃되었습니다. 다시 로그인해 주세요. 🔒');
                    window.location.href = '/login'; // 강제 워프
                }
                return Promise.reject(refreshError);
            }
        }

        // ⭐️ 로그인 실패로 터진 401이나 400, 500 에러들은 위 if문을 건너뛰고 곧바로 원래 에러만 뱉습니다.
        return Promise.reject(error);
    }
);
