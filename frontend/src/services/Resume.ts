import { apiClient } from './apiClient';

export interface ApiResponse<T> {
    success: boolean;
    status: number;
    message: string;
    data: T;
}

export interface ResumeCreateRequest {
    name: string;
    email: string;

    age: number;
    gender?: string;

    phone: string;
    address?: string;

    summary?: string;
    selfIntro?: string;

    career?: string;
    projectIntro?: string;

    skills?: string;
    education?: string;
}

export interface ResumeResponse {
    id: number;

    name: string;
    email: string;

    age: number;
    gender?: string;

    phone: string;
    address?: string;

    summary?: string;
    selfIntro?: string;

    career?: string;
    projectIntro?: string;

    skills?: string;
    education?: string;

    createdAt: string;
    updatedAt: string;
}

export const ResumeApi = {

    /**
     * [Resume] 이력서 생성
     */
    create: async (params: ResumeCreateRequest): Promise<ResumeResponse> => {
        const response = await apiClient.post<ApiResponse<ResumeResponse>>(
            "/api/resumes",
            params
        );
        return response.data.data;
    },

    /**
     * [Resume] 전체 조회
     */
    findAll: async (): Promise<ResumeResponse[]> => {
        const response = await apiClient.get<ApiResponse<ResumeResponse[]>>(
            "/api/resumes"
        );
        return response.data.data;
    },

    /**
     * [Resume] 단일 조회
     */
    findById: async (id: number): Promise<ResumeResponse> => {
        const response = await apiClient.get<ApiResponse<ResumeResponse>>(
            `/api/resumes/${id}`
        );
        return response.data.data;
    },

    /**
     * [Resume] 수정
     */
    update: async (
        id: number,
        params: ResumeCreateRequest
    ): Promise<ResumeResponse> => {
        const response = await apiClient.put<ApiResponse<ResumeResponse>>(
            `/api/resumes/${id}`,
            params
        );
        return response.data.data;
    },

    /**
     * [Resume] 삭제
     */
    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/resumes/${id}`);
    }
};