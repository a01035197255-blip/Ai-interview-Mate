import { apiClient } from './apiClient';

// 1. 백엔드 공통 응답 규격인 ApiResponse 인터페이스 정의
export interface ApiResponse<T> {
    success: boolean;
    status: number;
    message: string;
    data: T; // 👈 백엔드가 진짜 데이터를 담아주는 방
}

// 프로필 수정 요청 스펙
export interface UpdateProfileRequest {
    userName: string;
}

// 백엔드가 주는 실제 데이터 알맹이 인터페이스
export interface UserProfileResponse {
    userName: string;
    email: string;
    profileImgUrl: string | null;
    provider: string;
}

export interface AvatarUploadResponse {
    avatarUrl: string;
}

export const UserApi = {
    /**
     * 1. 프로필 정보 가져오기
     */
    getProfile: async (): Promise<UserProfileResponse> => {
        // 🚀 <ApiResponse<UserProfileResponse>> 형태로 주입하면 타입스크립트가 구조를 완벽히 이해합니다.
        const response = await apiClient.get<ApiResponse<UserProfileResponse>>('/api/users');
        return response.data.data;
    },

    /**
     * 2. 프로필 정보 수정
     */
    updateProfile: async (request: UpdateProfileRequest): Promise<string> => {
        const response = await apiClient.put<ApiResponse<string>>('/api/users/update', request);
        return response.data.data;
    },

    /**
     * 3. 아바타 업로드
     */
    updateAvatar: async (formData: FormData): Promise<string> => {
        // ApiResponse 구조에 따라 response.data.data 또는 response.data 로 알맹이만 타겟팅
        const response = await apiClient.post('/api/users/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        // ⭐️ 백엔드가 준 공통 포맷 객체 안에서 진짜 "문자열 경로"만 쏙 빼서 토스!
        return response.data.data;
    }
};
